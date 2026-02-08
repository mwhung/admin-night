import { NextRequest, NextResponse } from 'next/server'
import { TaskState } from '@prisma/client'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { startSessionSchema } from '@/lib/contracts/session'

const AUTO_ACTIVATE_WINDOW_MS = 5 * 60 * 1000

interface StartSessionTaskMapping {
    clientId: string
    taskId: string
    title: string
    state: TaskState
}

const isEphemeralTaskId = (taskId: string) => (
    taskId.startsWith('custom-') || taskId.startsWith('copy-')
)

// POST /api/sessions/start - Start or join an active session in one request.
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = startSessionSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const userId = user.id
        const { durationMinutes, preferredSessionId, selectedTasks } = result.data
        const now = new Date()
        const joinableScheduledUpperBound = new Date(now.getTime() + AUTO_ACTIVATE_WINDOW_MS)

        const startResult = await prisma.$transaction(async (tx) => {
            let session = preferredSessionId
                ? await tx.workSession.findFirst({
                    where: {
                        id: preferredSessionId,
                        status: { not: 'COMPLETED' },
                        scheduledEnd: { gt: now },
                    },
                })
                : null

            if (session?.status === 'SCHEDULED' && session.scheduledStart > joinableScheduledUpperBound) {
                session = null
            }

            if (!session) {
                session = await tx.workSession.findFirst({
                    where: { status: 'ACTIVE' },
                    orderBy: { scheduledStart: 'asc' },
                })
            }

            if (!session) {
                session = await tx.workSession.findFirst({
                    where: {
                        status: 'SCHEDULED',
                        scheduledStart: {
                            lte: joinableScheduledUpperBound,
                        },
                        scheduledEnd: { gt: now },
                    },
                    orderBy: { scheduledStart: 'asc' },
                })
            }

            if (!session) {
                session = await tx.workSession.create({
                    data: {
                        scheduledStart: now,
                        scheduledEnd: new Date(now.getTime() + durationMinutes * 60 * 1000),
                        durationMinutes,
                        status: 'ACTIVE',
                    },
                })
            }

            const existingParticipation = await tx.workSessionParticipant.findUnique({
                where: {
                    sessionId_userId: {
                        sessionId: session.id,
                        userId,
                    },
                },
            })

            if (existingParticipation) {
                if (existingParticipation.leftAt) {
                    await tx.workSessionParticipant.update({
                        where: { id: existingParticipation.id },
                        data: {
                            joinedAt: now,
                            leftAt: null,
                        },
                    })
                }
            } else {
                await tx.workSessionParticipant.create({
                    data: {
                        sessionId: session.id,
                        userId,
                    },
                })
            }

            if (session.status === 'SCHEDULED') {
                const startWindow = new Date(session.scheduledStart.getTime() - AUTO_ACTIVATE_WINDOW_MS)
                if (now >= startWindow) {
                    session = await tx.workSession.update({
                        where: { id: session.id },
                        data: { status: 'ACTIVE' },
                    })
                }
            }

            const participantCount = await tx.workSessionParticipant.count({
                where: {
                    sessionId: session.id,
                    leftAt: null,
                },
            })

            const existingTaskIds = selectedTasks
                .filter((task) => !isEphemeralTaskId(task.id))
                .map((task) => task.id)

            const existingTasks = existingTaskIds.length > 0
                ? await tx.task.findMany({
                    where: {
                        userId,
                        id: { in: existingTaskIds },
                    },
                    select: {
                        id: true,
                        title: true,
                        state: true,
                    },
                })
                : []

            const existingTaskMap = new Map(existingTasks.map((task) => [task.id, task]))
            const taskMappings: StartSessionTaskMapping[] = []

            for (const selectedTask of selectedTasks) {
                const existingTask = !isEphemeralTaskId(selectedTask.id)
                    ? existingTaskMap.get(selectedTask.id)
                    : null

                if (existingTask) {
                    taskMappings.push({
                        clientId: selectedTask.id,
                        taskId: existingTask.id,
                        title: existingTask.title,
                        state: existingTask.state,
                    })
                    continue
                }

                const createdTask = await tx.task.create({
                    data: {
                        title: selectedTask.title,
                        userId,
                        state: 'UNCLARIFIED',
                    },
                })

                taskMappings.push({
                    clientId: selectedTask.id,
                    taskId: createdTask.id,
                    title: createdTask.title,
                    state: createdTask.state,
                })
            }

            return {
                session,
                participantCount,
                taskMappings,
            }
        })

        return NextResponse.json({
            session: {
                id: startResult.session.id,
                scheduledStart: startResult.session.scheduledStart.toISOString(),
                scheduledEnd: startResult.session.scheduledEnd.toISOString(),
                durationMinutes: startResult.session.durationMinutes,
                status: startResult.session.status,
                participantCount: startResult.participantCount,
                isParticipating: true,
            },
            taskMappings: startResult.taskMappings,
        })
    } catch (error) {
        console.error('Error starting session:', error)
        return NextResponse.json(
            { error: 'Failed to start session' },
            { status: 500 }
        )
    }
}
