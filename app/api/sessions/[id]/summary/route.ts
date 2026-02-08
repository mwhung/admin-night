import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { TaskState } from '@prisma/client'

interface RouteParams {
    params: Promise<{ id: string }>
}

const isStringArray = (value: unknown): value is string[] => (
    Array.isArray(value) && value.every((item) => typeof item === 'string')
)

export async function GET(_request: Request, { params }: RouteParams) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: sessionId } = await params

        const participant = await prisma.workSessionParticipant.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId: user.id,
                },
            },
            select: {
                sessionId: true,
                joinedAt: true,
                leftAt: true,
                tasksWorkedOn: true,
                achievementSummary: true,
            },
        })

        if (!participant) {
            return NextResponse.json({ error: 'Session summary not found' }, { status: 404 })
        }

        const taskIds = isStringArray(participant.tasksWorkedOn) ? participant.tasksWorkedOn : []
        const tasks = taskIds.length > 0
            ? await prisma.task.findMany({
                where: {
                    userId: user.id,
                    id: { in: taskIds },
                },
                select: {
                    id: true,
                    title: true,
                    state: true,
                },
            })
            : []

        const tasksById = new Map(tasks.map((task) => [task.id, task]))
        const orderedTasks = taskIds
            .map((id) => tasksById.get(id))
            .filter((task): task is NonNullable<typeof task> => Boolean(task))
            .map((task) => ({
                id: task.id,
                title: task.title,
                completed: task.state === TaskState.RESOLVED,
            }))

        const newAchievementCount = await prisma.userAchievement.count({
            where: {
                userId: user.id,
                sessionId,
            },
        })

        const endAt = participant.leftAt ?? new Date()
        const elapsedSeconds = Math.max(
            0,
            Math.floor((endAt.getTime() - participant.joinedAt.getTime()) / 1000),
        )

        return NextResponse.json({
            summary: {
                sessionId: participant.sessionId,
                llmSummary: participant.achievementSummary ?? '',
                newAchievementCount,
                elapsedSeconds,
                tasks: orderedTasks,
            },
        })
    } catch (error) {
        console.error('Error fetching session summary:', error)
        return NextResponse.json({ error: 'Failed to fetch session summary' }, { status: 500 })
    }
}
