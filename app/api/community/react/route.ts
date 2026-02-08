import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import {
    getUtcDayStart,
    isReactionType,
    toReactionCounts,
    type ReactionType,
} from '@/lib/community/reactions'

const ACTIVE_SESSION_STATUSES = ['SCHEDULED', 'ACTIVE'] as const
const COMMUNITY_REACTION_WRITES_ENABLED =
    process.env.ENABLE_COMMUNITY_REACTION_WRITES === 'true'

async function resolveSessionIdForUser(userId: string, requestedSessionId: string | null) {
    if (requestedSessionId) {
        const explicitMembership = await prisma.workSessionParticipant.findFirst({
            where: {
                userId,
                sessionId: requestedSessionId,
                leftAt: null,
                session: {
                    status: { in: [...ACTIVE_SESSION_STATUSES] },
                },
            },
            select: { sessionId: true },
        })

        if (explicitMembership?.sessionId) {
            return explicitMembership.sessionId
        }
    }

    const activeMembership = await prisma.workSessionParticipant.findFirst({
        where: {
            userId,
            leftAt: null,
            session: {
                status: { in: [...ACTIVE_SESSION_STATUSES] },
            },
        },
        orderBy: { joinedAt: 'desc' },
        select: { sessionId: true },
    })

    return activeMembership?.sessionId ?? null
}

// GET: Retrieve current reaction counts (daily + optional session scope)
export async function GET(req: NextRequest) {
    try {
        const sessionId = req.nextUrl.searchParams.get('sessionId')
        const windowStart = getUtcDayStart()

        const dailyRows = await prisma.communityReaction.findMany({
            where: {
                windowType: 'daily',
                windowStart,
            },
            select: {
                type: true,
                count: true,
            },
        })
        const dailyReactions = toReactionCounts(dailyRows)

        let sessionReactions: Record<ReactionType, number> | null = null
        if (sessionId) {
            const sessionRows = await prisma.communitySessionReaction.findMany({
                where: { sessionId },
                select: {
                    type: true,
                    count: true,
                },
            })
            sessionReactions = toReactionCounts(sessionRows)
        }

        return NextResponse.json({
            reactions: sessionReactions ?? dailyReactions,
            dailyReactions,
            sessionReactions,
            scope: sessionReactions ? 'session' : 'daily',
        })
    } catch (error) {
        console.error('Failed to fetch reactions:', error)
        return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
    }
}

// POST: Increment a reaction
export async function POST(req: NextRequest) {
    try {
        if (!COMMUNITY_REACTION_WRITES_ENABLED) {
            return NextResponse.json(
                {
                    error: 'Community reaction writes are temporarily disabled',
                    code: 'REACTION_WRITES_DISABLED',
                },
                { status: 503 },
            )
        }

        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const type = typeof body?.type === 'string' ? body.type : ''
        const requestedSessionId =
            typeof body?.sessionId === 'string' && body.sessionId.trim().length > 0
                ? body.sessionId
                : null

        if (!isReactionType(type)) {
            return NextResponse.json({ error: 'Valid type is required' }, { status: 400 })
        }

        const resolvedSessionId = await resolveSessionIdForUser(user.id, requestedSessionId)
        const windowStart = getUtcDayStart()

        const result = await prisma.$transaction(async (tx) => {
            await tx.communityReactionEvent.create({
                data: {
                    type,
                    userId: user.id,
                    sessionId: resolvedSessionId,
                },
            })

            await tx.communityReaction.upsert({
                where: {
                    type_windowType_windowStart: {
                        type,
                        windowType: 'daily',
                        windowStart,
                    },
                },
                create: {
                    type,
                    windowType: 'daily',
                    windowStart,
                    count: 1,
                },
                update: {
                    count: {
                        increment: 1,
                    },
                },
            })

            if (resolvedSessionId) {
                await tx.communitySessionReaction.upsert({
                    where: {
                        sessionId_type: {
                            sessionId: resolvedSessionId,
                            type,
                        },
                    },
                    create: {
                        sessionId: resolvedSessionId,
                        type,
                        count: 1,
                    },
                    update: {
                        count: {
                            increment: 1,
                        },
                    },
                })
            }

            const dailyRows = await tx.communityReaction.findMany({
                where: {
                    windowType: 'daily',
                    windowStart,
                },
                select: {
                    type: true,
                    count: true,
                },
            })
            const dailyReactions = toReactionCounts(dailyRows)

            let sessionReactions: Record<ReactionType, number> | null = null
            if (resolvedSessionId) {
                const sessionRows = await tx.communitySessionReaction.findMany({
                    where: { sessionId: resolvedSessionId },
                    select: {
                        type: true,
                        count: true,
                    },
                })
                sessionReactions = toReactionCounts(sessionRows)
            }

            return {
                dailyReactions,
                sessionReactions,
            }
        })

        const scope = result.sessionReactions ? 'session' : 'daily'
        const reactions = result.sessionReactions ?? result.dailyReactions

        return NextResponse.json({
            success: true,
            type,
            scope,
            sessionId: resolvedSessionId,
            count: reactions[type],
            reactions,
            dailyReactions: result.dailyReactions,
            sessionReactions: result.sessionReactions,
        })
    } catch (error) {
        console.error('Failed to increment reaction:', error)
        return NextResponse.json({ error: 'Failed to increment reaction' }, { status: 500 })
    }
}
