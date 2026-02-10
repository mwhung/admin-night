import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCommunityReactionMetrics, syncCommunityMilestones } from '@/lib/community/aggregation'

function parseTopCategories(value: unknown): string[] {
    if (!Array.isArray(value)) return []
    return value.filter((item): item is string => typeof item === 'string')
}

function toFiniteNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string') {
        const parsed = Number(value)
        if (Number.isFinite(parsed)) return parsed
    }
    return null
}

function roundToSingleDecimal(value: number): number {
    return Math.round(value * 10) / 10
}

function buildMonthlyFact(totalSteps: number, reactionTotal: number, activeUsers: number): string {
    if (totalSteps <= 0) {
        return 'This month is quiet so far. No released tasks have been recorded yet.'
    }

    if (reactionTotal > 0) {
        return `This month, the community released ${totalSteps.toLocaleString()} tasks and shared ${reactionTotal.toLocaleString()} supportive reactions.`
    }

    return `This month, the community released ${totalSteps.toLocaleString()} tasks across ${activeUsers.toLocaleString()} active participants.`
}

function buildVictoryMessage(index: number): string {
    const templates = [
        'A pending admin loop was released.',
        'One lingering form reached closure.',
        'A small but heavy task is now off the mind.',
        'Another life-admin item has been settled.',
        'A practical step was completed and filed.',
    ]

    return templates[index % templates.length]
}

export async function GET() {
    try {
        const [milestones, reactionMetrics, totalCompleted, recentResolvedTasks] = await Promise.all([
            syncCommunityMilestones(),
            getCommunityReactionMetrics(),
            prisma.task.count({
                where: { state: 'RESOLVED' },
            }),
            prisma.task.findMany({
                where: {
                    state: 'RESOLVED',
                    resolvedAt: { not: null },
                },
                orderBy: { resolvedAt: 'desc' },
                select: {
                    resolvedAt: true,
                },
                take: 6,
            }),
        ])

        const weeklyGoal = 10000
        const weeklyProgress = Math.min(milestones.weekly.totalSteps, weeklyGoal)
        const monthlyFact = buildMonthlyFact(
            milestones.monthly.totalSteps,
            reactionMetrics.monthly.total,
            milestones.monthly.activeUsers,
        )

        const bloomRows = await prisma.$queryRaw<{ avg_hours: unknown }[]>`
            SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 3600) AS avg_hours
            FROM tasks
            WHERE state = 'RESOLVED'
              AND "resolvedAt" IS NOT NULL
              AND "resolvedAt" >= ${milestones.ranges.weekly.start}
              AND "resolvedAt" < ${milestones.ranges.weekly.end}
        `

        const avgBloomRaw = bloomRows[0]?.avg_hours
        const avgBloomValue = toFiniteNumber(avgBloomRaw)
        const avgBloomTimeHours = avgBloomValue === null ? null : roundToSingleDecimal(avgBloomValue)

        const recentVictories = recentResolvedTasks
            .filter((task): task is { resolvedAt: Date } => task.resolvedAt instanceof Date)
            .map((task, index) => ({
                id: `victory-${task.resolvedAt.getTime()}-${index}`,
                message: buildVictoryMessage(index),
                resolvedAt: task.resolvedAt.toISOString(),
            }))

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
                    fact: monthlyFact,
                },
                reactions: reactionMetrics,
                metrics: {
                    reactionDensity: reactionMetrics.weekly.reactionDensity,
                    sessionParticipationRate: reactionMetrics.weekly.sessionParticipationRate,
                    userParticipationRate: reactionMetrics.weekly.userParticipationRate,
                },
                avgBloomTimeHours,
                recentVictories,
            },
        })

    } catch (error) {
        console.error('Failed to fetch community stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
