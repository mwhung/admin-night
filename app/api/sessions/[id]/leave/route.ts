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
            const body = await request.json()
            tasksWorkedOn = body.tasksWorkedOn || []
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

        if (participation.leftAt) {
            return NextResponse.json(
                { error: 'Already left this session' },
                { status: 400 }
            )
        }

        // Update participation with leave time and tasks worked on
        await prisma.workSessionParticipant.update({
            where: { id: participation.id },
            data: {
                leftAt: new Date(),
                tasksWorkedOn: tasksWorkedOn.length > 0 ? tasksWorkedOn : undefined,
            },
        })

        // Get remaining participant count
        const remainingCount = await prisma.workSessionParticipant.count({
            where: {
                sessionId,
                leftAt: null,
            },
        })

        // If no participants left and session is ACTIVE, complete it
        if (remainingCount === 0 && workSession.status === 'ACTIVE') {
            await prisma.workSession.update({
                where: { id: sessionId },
                data: { status: 'COMPLETED' },
            })
        }

        return NextResponse.json({
            success: true,
            participantCount: remainingCount,
            message: 'Successfully left the session',
        })
    } catch (error) {
        console.error('Error leaving session:', error)
        return NextResponse.json(
            { error: 'Failed to leave session' },
            { status: 500 }
        )
    }
}
