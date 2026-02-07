import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Helper to get today's date at 00:00:00
const getTodayStart = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
}

// GET: Retrieve current reaction counts for TODAY
export async function GET(req: NextRequest) {
    try {
        const windowStart = getTodayStart()

        const reactions = await prisma.communityReaction.findMany({
            where: {
                windowType: 'daily',
                windowStart: windowStart
            }
        })

        // Format as a map: { "clap": 12, "fire": 7 }
        const formattedReactions = reactions.reduce((acc, curr) => {
            acc[curr.type] = curr.count
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({ reactions: formattedReactions })
    } catch (error) {
        console.error('Failed to fetch reactions:', error)
        return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
    }
}

// POST: Increment a reaction
export async function POST(req: NextRequest) {
    try {
        const { type } = await req.json()

        if (!type || !['clap', 'fire', 'leaf'].includes(type)) {
            return NextResponse.json({ error: 'Valid type is required' }, { status: 400 })
        }

        const windowStart = getTodayStart()

        // Upsert the reaction count
        const reaction = await prisma.communityReaction.upsert({
            where: {
                type_windowType_windowStart: {
                    type,
                    windowType: 'daily',
                    windowStart
                }
            },
            create: {
                type,
                windowType: 'daily',
                windowStart,
                count: 1
            },
            update: {
                count: {
                    increment: 1
                }
            }
        })

        return NextResponse.json({ success: true, count: reaction.count })
    } catch (error) {
        console.error('Failed to increment reaction:', error)
        return NextResponse.json({ error: 'Failed to increment reaction' }, { status: 500 })
    }
}
