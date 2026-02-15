import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import type { TaskState } from "@prisma/client"
import type {
    CollaborationEnergy,
    FastestTripleReleaseSession,
    HistoryGroup,
    HistoryPagination,
    HistoryResponse,
    PeakSessionWindow,
    TaskRecord,
    TaskTypeBreakdownItem,
} from "@/lib/contracts/user-history"
import { NextRequest, NextResponse } from "next/server"

const DEFAULT_HISTORY_PAGE_SIZE = 10
const MAX_HISTORY_PAGE_SIZE = 30
const DAILY_ACTIVITY_DAYS = 28
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const

const TASK_TYPE_RULES: ReadonlyArray<{ type: string; patterns: ReadonlyArray<RegExp> }> = [
    {
        type: "Finance & Bills",
        patterns: [
            /bill/i,
            /invoice/i,
            /payment/i,
            /tax/i,
            /bank/i,
            /refund/i,
            /reimburse/i,
            /budget/i,
            /rent/i,
            /receipt/i,
        ],
    },
    {
        type: "Email & Follow-ups",
        patterns: [/email/i, /inbox/i, /reply/i, /follow.?up/i, /message/i, /slack/i],
    },
    {
        type: "Scheduling & Meetings",
        patterns: [/schedule/i, /meeting/i, /calendar/i, /appointment/i, /book/i, /reschedule/i],
    },
    {
        type: "Documents & Forms",
        patterns: [/form/i, /document/i, /paperwork/i, /contract/i, /application/i, /submit/i, /filing/i],
    },
    {
        type: "Home & Utilities",
        patterns: [/utility/i, /electric/i, /water/i, /internet/i, /maintenance/i, /repair/i, /clean/i],
    },
    {
        type: "Health & Insurance",
        patterns: [/doctor/i, /clinic/i, /medical/i, /health/i, /insurance/i, /prescription/i],
    },
]
const FALLBACK_TASK_TYPE = "General Admin"

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

interface TaskRow {
    id: string
    title: string
    state: TaskState
    createdAt: Date
    resolvedAt: Date | null
}

interface SessionInsightRow {
    sessionId: string
    joinedAt: Date
    leftAt: Date | null
    focusDurationSeconds: number | null
    tasksWorkedOn: unknown
}

interface SessionPresenceRow {
    sessionId: string
    userId: string
    joinedAt: Date
    leftAt: Date | null
}

function toTaskRecord(task: TaskRow): TaskRecord {
    return {
        id: task.id,
        title: task.title,
        state: task.state,
        createdAt: task.createdAt.toISOString(),
        resolvedAt: task.resolvedAt ? task.resolvedAt.toISOString() : null,
    }
}

function inferTaskType(title: string): string {
    for (const rule of TASK_TYPE_RULES) {
        if (rule.patterns.some((pattern) => pattern.test(title))) {
            return rule.type
        }
    }

    return FALLBACK_TASK_TYPE
}

function buildPeakSessionWindow(participations: SessionInsightRow[]): PeakSessionWindow | null {
    if (participations.length === 0) {
        return null
    }

    const bucketCounts = new Map<string, { dayIndex: number; hour: number; count: number }>()

    for (const participation of participations) {
        const dayIndex = participation.joinedAt.getDay()
        const hour = participation.joinedAt.getHours()
        const key = `${dayIndex}-${hour}`
        const current = bucketCounts.get(key)

        if (current) {
            current.count += 1
            continue
        }

        bucketCounts.set(key, { dayIndex, hour, count: 1 })
    }

    const sortedBuckets = [...bucketCounts.values()].sort((a, b) => {
        if (a.count !== b.count) {
            return b.count - a.count
        }
        if (a.dayIndex !== b.dayIndex) {
            return a.dayIndex - b.dayIndex
        }
        return a.hour - b.hour
    })

    const winner = sortedBuckets[0]
    if (!winner) {
        return null
    }

    return {
        dayLabel: WEEKDAY_LABELS[winner.dayIndex] ?? "Sun",
        startHour: winner.hour,
        endHour: (winner.hour + 1) % 24,
        sessionCount: winner.count,
    }
}

function buildResolvedTaskTypeBreakdown(resolvedTaskRows: TaskRow[]): TaskTypeBreakdownItem[] {
    const counts = new Map<string, number>()

    for (const task of resolvedTaskRows) {
        const type = inferTaskType(task.title)
        counts.set(type, (counts.get(type) ?? 0) + 1)
    }

    return [...counts.entries()]
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => {
            if (a.count !== b.count) {
                return b.count - a.count
            }
            return a.type.localeCompare(b.type)
        })
}

function intervalsOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && startB < endA
}

function buildCollaborationEnergy(
    currentUserId: string,
    participations: SessionInsightRow[],
    sessionPresenceBySessionId: Map<string, SessionPresenceRow[]>,
): CollaborationEnergy {
    if (participations.length === 0) {
        return {
            cumulativeOthersPresent: 0,
            maxParticipantsInSession: 0,
        }
    }

    const now = new Date()
    let cumulativeOthersPresent = 0
    let maxParticipantsInSession = 0

    for (const participation of participations) {
        const userWindowStart = participation.joinedAt
        const userWindowEnd = participation.leftAt ?? now
        if (userWindowEnd <= userWindowStart) {
            continue
        }

        const sessionPresence = sessionPresenceBySessionId.get(participation.sessionId) ?? []
        const overlappingOtherUserIds = new Set<string>()

        const events: Array<{ time: number; delta: number }> = []
        for (const presence of sessionPresence) {
            const presenceStart = presence.joinedAt
            const presenceEnd = presence.leftAt ?? now
            if (!intervalsOverlap(userWindowStart, userWindowEnd, presenceStart, presenceEnd)) {
                continue
            }

            if (presence.userId !== currentUserId) {
                overlappingOtherUserIds.add(presence.userId)
            }

            const overlapStart = Math.max(presenceStart.getTime(), userWindowStart.getTime())
            const overlapEnd = Math.min(presenceEnd.getTime(), userWindowEnd.getTime())
            events.push({ time: overlapStart, delta: 1 })
            events.push({ time: overlapEnd, delta: -1 })
        }

        cumulativeOthersPresent += overlappingOtherUserIds.size

        events.sort((a, b) => {
            if (a.time !== b.time) {
                return a.time - b.time
            }
            // Use [start, end) interval semantics: process leave before join at same timestamp.
            return a.delta - b.delta
        })

        let concurrentCount = 0
        let sessionPeak = 0
        for (const event of events) {
            concurrentCount += event.delta
            sessionPeak = Math.max(sessionPeak, concurrentCount)
        }

        if (sessionPeak === 0) {
            sessionPeak = 1
        }
        maxParticipantsInSession = Math.max(maxParticipantsInSession, sessionPeak)
    }

    return {
        cumulativeOthersPresent,
        maxParticipantsInSession,
    }
}

function buildFastestTripleReleaseSession(
    participations: SessionInsightRow[],
    resolvedTaskById: Map<string, Date>,
): FastestTripleReleaseSession | null {
    let fastestSession: FastestTripleReleaseSession | null = null

    for (const participation of participations) {
        if (!participation.leftAt) {
            continue
        }

        const uniqueTaskIds = [...new Set(extractTaskIds(participation.tasksWorkedOn))]
        let resolvedTaskCount = 0

        for (const taskId of uniqueTaskIds) {
            const resolvedAt = resolvedTaskById.get(taskId)
            if (!resolvedAt) {
                continue
            }

            if (resolvedAt >= participation.joinedAt && resolvedAt <= participation.leftAt) {
                resolvedTaskCount += 1
            }
        }

        if (resolvedTaskCount < 3) {
            continue
        }

        const durationMinutes = Math.max(
            0,
            Math.round((participation.leftAt.getTime() - participation.joinedAt.getTime()) / (1000 * 60))
        )

        if (!fastestSession || durationMinutes < fastestSession.durationMinutes) {
            fastestSession = {
                sessionId: participation.sessionId,
                date: participation.joinedAt.toISOString(),
                durationMinutes,
                resolvedTaskCount,
            }
            continue
        }

        if (
            durationMinutes === fastestSession.durationMinutes
            && resolvedTaskCount > fastestSession.resolvedTaskCount
        ) {
            fastestSession = {
                sessionId: participation.sessionId,
                date: participation.joinedAt.toISOString(),
                durationMinutes,
                resolvedTaskCount,
            }
        }
    }

    return fastestSession
}

function buildTotalFocusSeconds(participations: SessionInsightRow[]): number {
    return participations.reduce((total, participation) => {
        if (!participation.leftAt) {
            return total
        }

        const elapsedSeconds = Math.max(
            0,
            Math.round((participation.leftAt.getTime() - participation.joinedAt.getTime()) / 1000)
        )

        const storedFocusSeconds = (
            typeof participation.focusDurationSeconds === "number"
            && Number.isFinite(participation.focusDurationSeconds)
            && participation.focusDurationSeconds >= 0
        )
            ? Math.floor(participation.focusDurationSeconds)
            : null

        if (storedFocusSeconds === null) {
            return total + elapsedSeconds
        }

        if (storedFocusSeconds === 0 && elapsedSeconds > 0) {
            return total + elapsedSeconds
        }

        return total + storedFocusSeconds
    }, 0)
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

        const pageTaskRows = pageTaskIds.length
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

        const pageTasks = pageTaskRows.map(toTaskRecord)

        const participantCountBySession = new Map(
            participantCounts.map((entry) => [entry.sessionId, entry._count._all])
        )
        const pageTasksById = new Map(pageTasks.map((task) => [task.id, task]))

        const historyGroups: HistoryGroup[] = participations.map((p) => {
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
                date: p.joinedAt.toISOString(),
                duration: p.leftAt ? Math.round((p.leftAt.getTime() - p.joinedAt.getTime()) / (1000 * 60)) : 0,
                tasks: sessionTasks,
                participantCount: participantCountBySession.get(p.sessionId) ?? 1,
            }
        })

        const pagination: HistoryPagination = {
            page,
            limit,
            hasMore: skip + participations.length < totalSessions,
            totalSessions,
        }

        if (!includeOverview) {
            const response: HistoryResponse = {
                historyGroups,
                pagination,
            }
            return NextResponse.json(response)
        }

        const activityWindowStart = new Date()
        activityWindowStart.setHours(0, 0, 0, 0)
        activityWindowStart.setDate(activityWindowStart.getDate() - (DAILY_ACTIVITY_DAYS - 1))

        const [
            totalResolved,
            totalPending,
            pendingTaskRows,
            activityRows,
            allInsightParticipations,
            resolvedTaskRows,
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
            prisma.workSessionParticipant.findMany({
                where: {
                    userId: user.id,
                    joinedAt: { gte: activityWindowStart },
                },
                select: {
                    joinedAt: true,
                },
            }),
            prisma.workSessionParticipant.findMany({
                where: { userId: user.id },
                select: {
                    sessionId: true,
                    joinedAt: true,
                    leftAt: true,
                    focusDurationSeconds: true,
                    tasksWorkedOn: true,
                },
            }),
            prisma.task.findMany({
                where: { userId: user.id, state: "RESOLVED" },
                select: {
                    id: true,
                    title: true,
                    state: true,
                    createdAt: true,
                    resolvedAt: true,
                },
            }),
        ])

        const pendingTasks = pendingTaskRows.map(toTaskRecord)

        const totalFocusSeconds = buildTotalFocusSeconds(allInsightParticipations)

        const dailyActivity: Record<string, number> = {}
        activityRows.forEach((row) => {
            const dateStr = row.joinedAt.toISOString().split("T")[0]
            dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1
        })

        const allSessionIds = [...new Set(allInsightParticipations.map((row) => row.sessionId))]
        const sessionPresenceRows = allSessionIds.length
            ? await prisma.workSessionParticipant.findMany({
                where: { sessionId: { in: allSessionIds } },
                select: {
                    sessionId: true,
                    userId: true,
                    joinedAt: true,
                    leftAt: true,
                },
            })
            : []

        const sessionPresenceBySessionId = new Map<string, SessionPresenceRow[]>()
        for (const presence of sessionPresenceRows) {
            const current = sessionPresenceBySessionId.get(presence.sessionId)
            if (current) {
                current.push(presence)
            } else {
                sessionPresenceBySessionId.set(presence.sessionId, [presence])
            }
        }

        const resolvedTaskById = new Map<string, Date>()
        for (const task of resolvedTaskRows) {
            if (task.resolvedAt) {
                resolvedTaskById.set(task.id, task.resolvedAt)
            }
        }

        const response: HistoryResponse = {
            stats: {
                totalResolved,
                totalPending,
                totalFocusMinutes: Math.round(totalFocusSeconds / 60),
                dailyActivity,
                totalSessions,
                peakSessionWindow: buildPeakSessionWindow(allInsightParticipations),
                resolvedTaskTypeBreakdown: buildResolvedTaskTypeBreakdown(resolvedTaskRows),
                collaborationEnergy: buildCollaborationEnergy(
                    user.id,
                    allInsightParticipations,
                    sessionPresenceBySessionId
                ),
                fastestTripleReleaseSession: buildFastestTripleReleaseSession(
                    allInsightParticipations,
                    resolvedTaskById
                ),
            },
            historyGroups,
            pendingTasks,
            pagination,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("[USER_HISTORY_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
