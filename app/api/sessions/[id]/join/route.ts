// Join Session API
// POST /api/sessions/[id]/join - Join a work session

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

interface RouteParams {
    params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: sessionId } = await params
        const userId = session.user.id

        // Get the work session
        const workSession = await prisma.workSession.findUnique({
            where: { id: sessionId },
        })

        if (!workSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Check if session is joinable
        if (workSession.status === 'COMPLETED') {
            return NextResponse.json(
                { error: 'Cannot join a completed session' },
                { status: 400 }
            )
        }

        // Check if user already joined
        const existingParticipation = await prisma.workSessionParticipant.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId,
                },
            },
        })

        if (existingParticipation && !existingParticipation.leftAt) {
            return NextResponse.json(
                { error: 'Already participating in this session' },
                { status: 400 }
            )
        }

        // If user previously left, update their record
        if (existingParticipation) {
            await prisma.workSessionParticipant.update({
                where: { id: existingParticipation.id },
                data: {
                    joinedAt: new Date(),
                    leftAt: null,
                },
            })
        } else {
            // Create new participation
            await prisma.workSessionParticipant.create({
                data: {
                    sessionId,
                    userId,
                },
            })
        }

        // If this is the first participant and session is SCHEDULED, activate it
        if (workSession.status === 'SCHEDULED') {
            const now = new Date()
            // Only auto-activate if we're within 5 minutes of start time
            const startWindow = new Date(workSession.scheduledStart.getTime() - 5 * 60 * 1000)

            if (now >= startWindow) {
                await prisma.workSession.update({
                    where: { id: sessionId },
                    data: { status: 'ACTIVE' },
                })
            }
        }

        // Get updated participant count
        const participantCount = await prisma.workSessionParticipant.count({
            where: {
                sessionId,
                leftAt: null,
            },
        })

        return NextResponse.json({
            success: true,
            participantCount,
            message: 'Successfully joined the session',
        })
    } catch (error) {
        console.error('Error joining session:', error)
        return NextResponse.json(
            { error: 'Failed to join session' },
            { status: 500 }
        )
    }
}
