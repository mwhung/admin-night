import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Helper to get start dates for windows
const getWindowStart = (type: 'daily' | 'weekly' | 'monthly') => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    if (type === 'daily') return now

    if (type === 'weekly') {
        const day = now.getDay()
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
        now.setDate(diff)
        return now
    }

    if (type === 'monthly') {
        now.setDate(1)
        return now
    }

    return now
}

export async function GET(req: NextRequest) {
    try {
        const dailyStart = getWindowStart('daily')
        const weeklyStart = getWindowStart('weekly')
        const monthlyStart = getWindowStart('monthly')

        // Fetch milestones for windows (create if not exist logic handled in aggregator separate job, 
        // but for now we query what exists or return 0s)

        // Parallel queries for speed
        const [dailyStats, weeklyStats, monthlyStats] = await Promise.all([
            prisma.communityMilestone.findUnique({
                where: { windowType_windowStart: { windowType: 'daily', windowStart: dailyStart } }
            }),
            prisma.communityMilestone.findUnique({
                where: { windowType_windowStart: { windowType: 'weekly', windowStart: weeklyStart } }
            }),
            prisma.communityMilestone.findUnique({
                where: { windowType_windowStart: { windowType: 'monthly', windowStart: monthlyStart } }
            })
        ])

        // Get total completed tasks (legacy global stat support)
        const totalCompleted = await prisma.task.count({
            where: { state: 'RESOLVED' }
        })

        return NextResponse.json({
            community: {
                totalTasksCompleted: totalCompleted,
                daily: {
                    totalSteps: dailyStats?.totalSteps || 0,
                    activeUsers: dailyStats?.activeUsers || 0,
                    topCategories: dailyStats?.topCategories || []
                },
                weekly: {
                    totalSteps: weeklyStats?.totalSteps || 0,
                    goal: 10000,
                    progress: weeklyStats?.totalSteps || 0
                },
                monthly: {
                    totalSteps: monthlyStats?.totalSteps || 0,
                    fact: "This month, we collectively cleared enough admin to bore a small bureaucracy to tears."
                }
            }
        })

    } catch (error) {
        console.error('Failed to fetch community stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
