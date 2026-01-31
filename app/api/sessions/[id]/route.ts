// Single Session API
// GET    /api/sessions/[id] - Get session details
// PATCH  /api/sessions/[id] - Update session status
// DELETE /api/sessions/[id] - Delete session

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const updateSessionSchema = z.object({
    status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED']).optional(),
    scheduledStart: z.coerce.date().optional(),
    durationMinutes: z.number().min(15).max(60).optional(),
})

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/sessions/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const workSession = await prisma.workSession.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                    },
                },
                _count: {
                    select: { participants: true },
                },
            },
        })

        if (!workSession) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const activeParticipants = workSession.participants.filter((p) => !p.leftAt)

        return NextResponse.json({
            session: {
                id: workSession.id,
                scheduledStart: workSession.scheduledStart.toISOString(),
                scheduledEnd: workSession.scheduledEnd.toISOString(),
                durationMinutes: workSession.durationMinutes,
                status: workSession.status,
                participantCount: activeParticipants.length,
                participants: activeParticipants.map((p) => ({
                    userId: p.user.id,
                    userName: p.user.name,
                    userImage: p.user.image,
                    joinedAt: p.joinedAt.toISOString(),
                })),
                isParticipating: activeParticipants.some(
                    (p) => p.userId === session.user!.id
                ),
            },
        })
    } catch (error) {
        console.error('Error fetching session:', error)
        return NextResponse.json(
            { error: 'Failed to fetch session' },
            { status: 500 }
        )
    }
}

// PATCH /api/sessions/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const result = updateSessionSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const existing = await prisma.workSession.findUnique({
            where: { id },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        const updateData: Record<string, unknown> = {}

        if (result.data.status) {
            updateData.status = result.data.status
        }

        if (result.data.scheduledStart) {
            updateData.scheduledStart = result.data.scheduledStart
            const duration = result.data.durationMinutes || existing.durationMinutes
            updateData.scheduledEnd = new Date(
                result.data.scheduledStart.getTime() + duration * 60 * 1000
            )
        }

        if (result.data.durationMinutes) {
            updateData.durationMinutes = result.data.durationMinutes
            const start = result.data.scheduledStart || existing.scheduledStart
            updateData.scheduledEnd = new Date(
                start.getTime() + result.data.durationMinutes * 60 * 1000
            )
        }

        const updated = await prisma.workSession.update({
            where: { id },
            data: updateData,
        })

        return NextResponse.json({
            session: {
                id: updated.id,
                scheduledStart: updated.scheduledStart.toISOString(),
                scheduledEnd: updated.scheduledEnd.toISOString(),
                durationMinutes: updated.durationMinutes,
                status: updated.status,
            },
        })
    } catch (error) {
        console.error('Error updating session:', error)
        return NextResponse.json(
            { error: 'Failed to update session' },
            { status: 500 }
        )
    }
}

// DELETE /api/sessions/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const existing = await prisma.workSession.findUnique({
            where: { id },
        })

        if (!existing) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 })
        }

        // Don't allow deleting active sessions
        if (existing.status === 'ACTIVE') {
            return NextResponse.json(
                { error: 'Cannot delete an active session' },
                { status: 400 }
            )
        }

        await prisma.workSession.delete({
            where: { id },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting session:', error)
        return NextResponse.json(
            { error: 'Failed to delete session' },
            { status: 500 }
        )
    }
}
