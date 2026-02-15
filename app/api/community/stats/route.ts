import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCommunityReactionMetrics, syncCommunityMilestones } from '@/lib/community/aggregation'
import type { CommunityStatsResponse } from '@/lib/contracts/community-stats'

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
        return 'No completed tasks recorded this month yet.'
    }

    if (reactionTotal > 0) {
        return `This month, the community closed ${totalSteps.toLocaleString()} tasks and logged ${reactionTotal.toLocaleString()} reactions.`
    }

    return `This month, the community closed ${totalSteps.toLocaleString()} tasks across ${activeUsers.toLocaleString()} active people.`
}

function buildCompletionMessage(index: number): string {
    const templates = [
        'Pending loop filed.',
        'Paperwork moved to done.',
        'One less loose end.',
        'Another admin item closed.',
        'Task marked resolved.',
    ]

    return templates[index % templates.length]
}

export async function GET() {
    try {
        const now = new Date()
        const last24HoursStart = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        const [
            milestones,
            reactionMetrics,
            totalCompleted,
            recentResolvedTasks,
            last24HoursCompleted,
            last24HoursActiveUsersRows,
            last24HoursTopCategoriesRows,
        ] = await Promise.all([
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
            prisma.task.count({
                where: {
                    state: 'RESOLVED',
                    resolvedAt: {
                        gte: last24HoursStart,
                        lt: now,
                    },
                },
            }),
            prisma.workSessionParticipant.findMany({
                where: {
                    joinedAt: {
                        gte: last24HoursStart,
                        lt: now,
                    },
                },
                distinct: ['userId'],
                select: {
                    userId: true,
                },
            }),
            prisma.communityIntent.groupBy({
                by: ['category'],
                where: {
                    createdAt: {
                        gte: last24HoursStart,
                        lt: now,
                    },
                },
                _count: {
                    category: true,
                },
                orderBy: {
                    _count: {
                        category: 'desc',
                    },
                },
                take: 5,
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
                id: `completion-${task.resolvedAt.getTime()}-${index}`,
                message: buildCompletionMessage(index),
                resolvedAt: task.resolvedAt.toISOString(),
            }))

        const response: CommunityStatsResponse = {
            community: {
                totalTasksCompleted: totalCompleted,
                daily: {
                    totalSteps: last24HoursCompleted,
                    activeUsers: last24HoursActiveUsersRows.length,
                    topCategories: parseTopCategories(last24HoursTopCategoriesRows.map((row) => row.category)),
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
        }

        return NextResponse.json(response)

    } catch (error) {
        console.error('Failed to fetch community stats:', error)
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
