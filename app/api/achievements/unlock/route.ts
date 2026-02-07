
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { getAchievement, getRandomHumor } from '@/lib/achievements/definitions'
import { z } from 'zod'

const unlockSchema = z.object({
    achievementId: z.string(),
    evidence: z.string().optional(),
    sessionId: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const json = await request.json()
        const { achievementId, evidence, sessionId } = unlockSchema.parse(json)

        // Validate achievement exists
        const definition = getAchievement(achievementId)
        if (!definition) {
            return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 })
        }

        // Check if already unlocked (Optimization: check before try/catch insert)
        const existing = await prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId: user.id,
                    achievementId: achievementId,
                },
            },
        })

        if (existing) {
            return NextResponse.json({
                message: 'Already unlocked',
                achievement: existing
            }, { status: 200 })
        }

        // Pick random humor line
        const humorLine = getRandomHumor(achievementId)

        // Verify session if provided
        let verifiedSessionId = null
        if (sessionId) {
            const session = await prisma.workSession.findUnique({
                where: { id: sessionId },
            })
            if (session) {
                verifiedSessionId = session.id
            }
        }

        // Create record
        const unlocked = await prisma.userAchievement.create({
            data: {
                userId: user.id,
                achievementId,
                unlockedSource: definition.triggerType,
                evidenceSnapshot: evidence || definition.description,
                humorSnapshot: humorLine,
                sessionId: verifiedSessionId,
            },
        })

        return NextResponse.json({ achievement: unlocked }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }
        console.error('Error unlocking achievement:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
