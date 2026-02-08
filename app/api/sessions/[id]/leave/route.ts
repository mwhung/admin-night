// Leave Session API
// POST /api/sessions/[id]/leave - Leave a work session

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: sessionId } = await params
        const userId = user.id

        // Get body for optional tasks worked on
        let tasksWorkedOn: string[] = []
        try {
            const body = await request.json() as { tasksWorkedOn?: unknown }
            if (Array.isArray(body.tasksWorkedOn)) {
                tasksWorkedOn = body.tasksWorkedOn.filter(
                    (taskId: unknown): taskId is string => typeof taskId === 'string'
                )
            }
        } catch {
            // Body is optional
        }

        // Get the work session
        const workSession = await prisma.workSession.findUnique({
            where: { id: sessionId },
        })

        if (!workSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Find user's participation
        const participation = await prisma.workSessionParticipant.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
        })

        if (!participation) {
            return NextResponse.json(
                { error: 'Not participating in this session' },
                { status: 400 }
            )
        }

        const { remainingCount, alreadyLeft } = await prisma.$transaction(async (tx) => {
            const leaveUpdate = await tx.workSessionParticipant.updateMany({
                where: {
                    id: participation.id,
                    leftAt: null,
                },
                data: {
                    leftAt: new Date(),
                    tasksWorkedOn: tasksWorkedOn.length > 0 ? tasksWorkedOn : undefined,
                },
            })

            const count = await tx.workSessionParticipant.count({
                where: {
                    sessionId,
                    leftAt: null,
                },
            })

            // Transition to completed only when this was the final active participant.
            if (count === 0) {
                await tx.workSession.updateMany({
                    where: {
                        id: sessionId,
                        status: 'ACTIVE',
                    },
                    data: { status: 'COMPLETED' },
                })
            }

            return {
                remainingCount: count,
                alreadyLeft: leaveUpdate.count === 0,
            }
        })

        return NextResponse.json({
            success: true,
            participantCount: remainingCount,
            alreadyLeft,
            message: alreadyLeft
                ? 'Leave already recorded for this session'
                : 'Successfully left the session',
        })
    } catch (error) {
        console.error('Error leaving session:', error)
        return NextResponse.json(
            { error: 'Failed to leave session' },
            { status: 500 }
        )
    }
}
