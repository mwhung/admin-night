
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const sessionId = searchParams.get('sessionId')

        const where: any = {
            userId: user.id
        }

        if (sessionId) {
            where.sessionId = sessionId
        }

        const achievements = await prisma.userAchievement.findMany({
            where,
            orderBy: { unlockedAt: 'desc' },
            select: {
                id: true,
                achievementId: true,
                unlockedAt: true,
                evidenceSnapshot: true,
                humorSnapshot: true,
                sessionId: true,
            }
        })

        return NextResponse.json({ achievements })
    } catch (error) {
        console.error('Error fetching achievements:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
