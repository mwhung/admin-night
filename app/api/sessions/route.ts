
// Sessions API - List and Create Sessions
// GET  /api/sessions - List upcoming/active sessions
// POST /api/sessions - Create new session (admin only in future)

import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// Validation schema for creating a session
const createSessionSchema = z.object({
    scheduledStart: z.coerce.date(),
    durationMinutes: z.number().min(15).max(60).default(25),
})

// GET /api/sessions - List sessions
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status') // SCHEDULED, ACTIVE, COMPLETED
        const upcoming = searchParams.get('upcoming') === 'true'

        const where: Record<string, unknown> = {}

        if (status) {
            where.status = status
        }

        if (upcoming) {
            where.scheduledStart = { gte: new Date() }
            where.status = { in: ['SCHEDULED', 'ACTIVE'] }
        }

        const sessions = await prisma.workSession.findMany({
            where,
            include: {
                participants: {
                    select: {
                        userId: true,
                        joinedAt: true,
                        leftAt: true,
                    },
                },
                _count: {
                    select: { participants: true },
                },
            },
            orderBy: { scheduledStart: 'asc' },
            take: 20,
        })

        const formatted = sessions.map((s) => ({
            id: s.id,
            scheduledStart: s.scheduledStart.toISOString(),
            scheduledEnd: s.scheduledEnd.toISOString(),
            durationMinutes: s.durationMinutes,
            status: s.status,
            participantCount: s._count.participants,
            isParticipating: s.participants.some(
                (p) => p.userId === user.id && !p.leftAt
            ),
        }))

        return NextResponse.json({ sessions: formatted })
    } catch (error) {
        console.error('Error fetching sessions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch sessions' },
            { status: 500 }
        )
    }
}

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = createSessionSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.flatten() },
                { status: 400 }
            )
        }

        const { scheduledStart, durationMinutes } = result.data
        const scheduledEnd = new Date(
            scheduledStart.getTime() + durationMinutes * 60 * 1000
        )

        // Check for overlapping sessions
        const overlapping = await prisma.workSession.findFirst({
            where: {
                OR: [
                    {
                        scheduledStart: { lte: scheduledStart },
                        scheduledEnd: { gt: scheduledStart },
                    },
                    {
                        scheduledStart: { lt: scheduledEnd },
                        scheduledEnd: { gte: scheduledEnd },
                    },
                    {
                        scheduledStart: { gte: scheduledStart },
                        scheduledEnd: { lte: scheduledEnd },
                    },
                ],
                status: { not: 'COMPLETED' },
            },
        })

        if (overlapping) {
            return NextResponse.json(
                { error: 'Session time overlaps with an existing session' },
                { status: 409 }
            )
        }

        const newSession = await prisma.workSession.create({
            data: {
                scheduledStart,
                scheduledEnd,
                durationMinutes,
                status: 'SCHEDULED',
            },
        })

        return NextResponse.json(
            {
                session: {
                    id: newSession.id,
                    scheduledStart: newSession.scheduledStart.toISOString(),
                    scheduledEnd: newSession.scheduledEnd.toISOString(),
                    durationMinutes: newSession.durationMinutes,
                    status: newSession.status,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error creating session:', error)
        return NextResponse.json(
            { error: 'Failed to create session' },
            { status: 500 }
        )
    }
}
