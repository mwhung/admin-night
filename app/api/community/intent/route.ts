import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET: Retrieve active intents for the bubble cloud
// Returns aggregated counts by category for the last 24 hours (or current session window)
export async function GET(req: NextRequest) {
    try {
        // Define the window - for now, let's look at the last 24 hours to capture "Today's Swarm"
        const windowStart = new Date(Date.now() - 24 * 60 * 60 * 1000)

        const intents = await prisma.communityIntent.groupBy({
            by: ['category'],
            where: {
                createdAt: {
                    gte: windowStart
                }
            },
            _count: {
                category: true
            },
            orderBy: {
                _count: {
                    category: 'desc'
                }
            }
        })

        const formattedIntents = intents.map(item => ({
            category: item.category,
            count: item._count.category
        }))

        return NextResponse.json({ intents: formattedIntents })
    } catch (error) {
        console.error('Failed to fetch community intents:', error)
        return NextResponse.json({ error: 'Failed to fetch intents' }, { status: 500 })
    }
}

// POST: Submit a new anonymous intent
export async function POST(req: NextRequest) {
    try {
        const { category, difficulty } = await req.json()

        if (!category) {
            return NextResponse.json({ error: 'Category is required' }, { status: 400 })
        }

        const intent = await prisma.communityIntent.create({
            data: {
                category,
                difficulty
            }
        })

        return NextResponse.json({ success: true, intent })
    } catch (error) {
        console.error('Failed to submit community intent:', error)
        return NextResponse.json({ error: 'Failed to submit intent' }, { status: 500 })
    }
}
