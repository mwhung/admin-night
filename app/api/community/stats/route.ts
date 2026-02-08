import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCommunityReactionMetrics, syncCommunityMilestones } from '@/lib/community/aggregation'

function parseTopCategories(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
}

export async function GET() {
    try {
        const [milestones, reactionMetrics, totalCompleted] = await Promise.all([
            syncCommunityMilestones(),
            getCommunityReactionMetrics(),
            prisma.task.count({
                where: { state: 'RESOLVED' },
            }),
        ])

        const weeklyGoal = 10000
        const weeklyProgress = Math.min(milestones.weekly.totalSteps, weeklyGoal)

        return NextResponse.json({
            community: {
                totalTasksCompleted: totalCompleted,
                daily: {
                    totalSteps: milestones.daily.totalSteps,
                    activeUsers: milestones.daily.activeUsers,
                    topCategories: parseTopCategories(milestones.daily.topCategories),
                },
                weekly: {
                    totalSteps: milestones.weekly.totalSteps,
                    goal: weeklyGoal,
                    progress: weeklyProgress,
                },
                monthly: {
                    totalSteps: milestones.monthly.totalSteps,
                    fact: 'This month, we collectively cleared enough admin to bore a small bureaucracy to tears.',
                },
                reactions: reactionMetrics,
                metrics: {
                    reactionDensity: reactionMetrics.weekly.reactionDensity,
                    sessionParticipationRate: reactionMetrics.weekly.sessionParticipationRate,
                    userParticipationRate: reactionMetrics.weekly.userParticipationRate,
                },
            },
        })

    } catch (error) {
        console.error('Failed to fetch community stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
