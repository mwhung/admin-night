import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_HISTORY_PAGE_SIZE = 10
const MAX_HISTORY_PAGE_SIZE = 30
const DAILY_ACTIVITY_DAYS = 28

function parsePositiveInt(value: string | null, fallback: number): number {
    if (!value) {
        return fallback
    }

    const parsed = Number.parseInt(value, 10)
    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback
    }

    return parsed
}

function extractTaskIds(tasksWorkedOn: unknown): string[] {
    if (!Array.isArray(tasksWorkedOn)) {
        return []
    }

    return tasksWorkedOn.filter((taskId): taskId is string => typeof taskId === "string")
}

export async function GET(request: NextRequest) {
    const user = await getCurrentUser()

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { searchParams } = new URL(request.url)
        const page = parsePositiveInt(searchParams.get("page"), 1)
        const requestedLimit = parsePositiveInt(searchParams.get("limit"), DEFAULT_HISTORY_PAGE_SIZE)
        const limit = Math.min(requestedLimit, MAX_HISTORY_PAGE_SIZE)
        const includeOverview = searchParams.get("includeOverview") !== "false"
        const skip = (page - 1) * limit

        const [totalSessions, participations] = await Promise.all([
            prisma.workSessionParticipant.count({
                where: { userId: user.id },
            }),
            prisma.workSessionParticipant.findMany({
                where: { userId: user.id },
                orderBy: [{ joinedAt: "desc" }, { id: "desc" }],
                skip,
                take: limit,
                select: {
                    id: true,
                    sessionId: true,
                    joinedAt: true,
                    leftAt: true,
                    tasksWorkedOn: true,
                },
            }),
        ])

        const pageTaskIds = [...new Set(participations.flatMap((p) => extractTaskIds(p.tasksWorkedOn)))]
        const sessionIds = [...new Set(participations.map((p) => p.sessionId))]

        const participantCounts = sessionIds.length
            ? await prisma.workSessionParticipant.groupBy({
                by: ["sessionId"],
                where: {
                    sessionId: { in: sessionIds },
                },
                _count: {
                    _all: true,
                },
            })
            : []

        const pageTasks = pageTaskIds.length
            ? await prisma.task.findMany({
                where: {
                    userId: user.id,
                    id: { in: pageTaskIds },
                },
                select: {
                    id: true,
                    title: true,
                    state: true,
                    createdAt: true,
                    resolvedAt: true,
                },
            })
            : []

        const participantCountBySession = new Map(
            participantCounts.map((entry) => [entry.sessionId, entry._count._all])
        )
        const pageTasksById = new Map(pageTasks.map((task) => [task.id, task]))

        const historyGroups = participations.map((p) => {
            const taskIds = extractTaskIds(p.tasksWorkedOn)
            const seenTaskIds = new Set<string>()
            const sessionTasks: typeof pageTasks = []

            for (const taskId of taskIds) {
                if (seenTaskIds.has(taskId)) {
                    continue
                }
                seenTaskIds.add(taskId)

                const task = pageTasksById.get(taskId)
                if (task) {
                    sessionTasks.push(task)
                }
            }

            return {
                id: p.id,
                sessionId: p.sessionId,
                date: p.joinedAt,
                duration: p.leftAt ? Math.round((p.leftAt.getTime() - p.joinedAt.getTime()) / (1000 * 60)) : 0,
                tasks: sessionTasks,
                participantCount: participantCountBySession.get(p.sessionId) ?? 1,
            }
        })

        const pagination = {
            page,
            limit,
            hasMore: skip + participations.length < totalSessions,
            totalSessions,
        }

        if (!includeOverview) {
            return NextResponse.json({
                historyGroups,
                pagination,
            })
        }

        const activityWindowStart = new Date()
        activityWindowStart.setHours(0, 0, 0, 0)
        activityWindowStart.setDate(activityWindowStart.getDate() - (DAILY_ACTIVITY_DAYS - 1))

        const [
            totalResolved,
            totalPending,
            pendingTasks,
            focusAggregate,
            activityRows,
        ] = await Promise.all([
            prisma.task.count({
                where: { userId: user.id, state: "RESOLVED" },
            }),
            prisma.task.count({
                where: { userId: user.id, state: { not: "RESOLVED" } },
            }),
            prisma.task.findMany({
                where: { userId: user.id, state: { not: "RESOLVED" } },
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    state: true,
                    createdAt: true,
                    resolvedAt: true,
                },
            }),
            prisma.workSessionParticipant.aggregate({
                where: { userId: user.id },
                _sum: {
                    focusDurationSeconds: true,
                },
                _count: {
                    focusDurationSeconds: true,
                },
            }),
            prisma.workSessionParticipant.findMany({
                where: {
                    userId: user.id,
                    joinedAt: { gte: activityWindowStart },
                },
                select: {
                    joinedAt: true,
                },
            }),
        ])

        let totalFocusSeconds = focusAggregate._sum.focusDurationSeconds ?? 0
        const nonNullFocusCount = focusAggregate._count.focusDurationSeconds ?? 0

        if (nonNullFocusCount < totalSessions) {
            const rowsWithoutStoredFocus = await prisma.workSessionParticipant.findMany({
                where: {
                    userId: user.id,
                    focusDurationSeconds: null,
                    leftAt: { not: null },
                },
                select: {
                    joinedAt: true,
                    leftAt: true,
                },
            })

            totalFocusSeconds += rowsWithoutStoredFocus.reduce((acc, row) => {
                if (!row.leftAt) {
                    return acc
                }

                return acc + Math.max(0, Math.round((row.leftAt.getTime() - row.joinedAt.getTime()) / 1000))
            }, 0)
        }

        const dailyActivity: Record<string, number> = {}
        activityRows.forEach((row) => {
            const dateStr = row.joinedAt.toISOString().split("T")[0]
            dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1
        })

        return NextResponse.json({
            stats: {
                totalResolved,
                totalPending,
                totalFocusMinutes: Math.round(totalFocusSeconds / 60),
                dailyActivity,
                totalSessions,
            },
            historyGroups,
            pendingTasks,
            pagination,
        })
    } catch (error) {
        console.error("[USER_HISTORY_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
