import { prisma } from '@/lib/db'
import {
    addUtcDays,
    addUtcMonths,
    getUtcDayStart,
    getUtcMonthStart,
    getUtcWeekStart,
    toReactionCounts,
    type ReactionCounts,
} from '@/lib/community/reactions'

type WindowType = 'daily' | 'weekly' | 'monthly'

interface MilestoneSnapshot {
    totalSteps: number
    totalFirstSteps: number
    activeUsers: number
    topCategories: string[]
}

function round(value: number): number {
    return Math.round(value * 100) / 100
}

function percent(numerator: number, denominator: number): number {
    if (denominator <= 0) return 0
    return round((numerator / denominator) * 100)
}

function getWindowRange(type: WindowType, now = new Date()) {
    if (type === 'daily') {
        const start = getUtcDayStart(now)
        return { start, end: addUtcDays(start, 1) }
    }

    if (type === 'weekly') {
        const start = getUtcWeekStart(now)
        return { start, end: addUtcDays(start, 7) }
    }

    const start = getUtcMonthStart(now)
    return { start, end: addUtcMonths(start, 1) }
}

async function computeMilestoneSnapshot(windowType: WindowType, now = new Date()): Promise<MilestoneSnapshot> {
    const { start, end } = getWindowRange(windowType, now)

    const [totalSteps, activeUsersRows, topCategoriesRows] = await Promise.all([
        prisma.task.count({
            where: {
                state: 'RESOLVED',
                resolvedAt: {
                    gte: start,
                    lt: end,
                },
            },
        }),
        prisma.workSessionParticipant.findMany({
            where: {
                joinedAt: { lt: end },
                OR: [
                    { leftAt: null },
                    { leftAt: { gte: start } },
                ],
            },
            distinct: ['userId'],
            select: { userId: true },
        }),
        prisma.communityIntent.groupBy({
            by: ['category'],
            where: {
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
            _count: { category: true },
            orderBy: {
                _count: {
                    category: 'desc',
                },
            },
            take: 5,
        }),
    ])

    return {
        totalSteps,
        totalFirstSteps: totalSteps,
        activeUsers: activeUsersRows.length,
        topCategories: topCategoriesRows.map((row) => row.category),
    }
}

export async function syncCommunityMilestones(now = new Date()) {
    const dailyRange = getWindowRange('daily', now)
    const weeklyRange = getWindowRange('weekly', now)
    const monthlyRange = getWindowRange('monthly', now)

    const [daily, weekly, monthly] = await Promise.all([
        computeMilestoneSnapshot('daily', now),
        computeMilestoneSnapshot('weekly', now),
        computeMilestoneSnapshot('monthly', now),
    ])

    const [dailyMilestone, weeklyMilestone, monthlyMilestone] = await Promise.all([
        prisma.communityMilestone.upsert({
            where: {
                windowType_windowStart: {
                    windowType: 'daily',
                    windowStart: dailyRange.start,
                },
            },
            update: daily,
            create: {
                windowType: 'daily',
                windowStart: dailyRange.start,
                ...daily,
            },
        }),
        prisma.communityMilestone.upsert({
            where: {
                windowType_windowStart: {
                    windowType: 'weekly',
                    windowStart: weeklyRange.start,
                },
            },
            update: weekly,
            create: {
                windowType: 'weekly',
                windowStart: weeklyRange.start,
                ...weekly,
            },
        }),
        prisma.communityMilestone.upsert({
            where: {
                windowType_windowStart: {
                    windowType: 'monthly',
                    windowStart: monthlyRange.start,
                },
            },
            update: monthly,
            create: {
                windowType: 'monthly',
                windowStart: monthlyRange.start,
                ...monthly,
            },
        }),
    ])

    return {
        daily: dailyMilestone,
        weekly: weeklyMilestone,
        monthly: monthlyMilestone,
        ranges: {
            daily: dailyRange,
            weekly: weeklyRange,
            monthly: monthlyRange,
        },
    }
}

function sumReactionCounts(counts: ReactionCounts): number {
    return Object.values(counts).reduce((sum, value) => sum + value, 0)
}

export async function getCommunityReactionMetrics(now = new Date()) {
    const daily = getWindowRange('daily', now)
    const weekly = getWindowRange('weekly', now)
    const monthly = getWindowRange('monthly', now)

    const [
        dailyAggregateRows,
        weeklyTotalReactions,
        weeklySessionReactions,
        monthlyTotalReactions,
        weeklyParticipantCount,
        weeklyActiveUsersRows,
        weeklyActiveSessionsRows,
        weeklySessionsWithReactionRows,
        weeklyUsersWithReactionRows,
    ] = await Promise.all([
        prisma.communityReaction.findMany({
            where: {
                windowType: 'daily',
                windowStart: daily.start,
            },
            select: { type: true, count: true },
        }),
        prisma.communityReactionEvent.count({
            where: {
                createdAt: {
                    gte: weekly.start,
                    lt: weekly.end,
                },
            },
        }),
        prisma.communityReactionEvent.count({
            where: {
                createdAt: {
                    gte: weekly.start,
                    lt: weekly.end,
                },
                sessionId: { not: null },
            },
        }),
        prisma.communityReactionEvent.count({
            where: {
                createdAt: {
                    gte: monthly.start,
                    lt: monthly.end,
                },
            },
        }),
        prisma.workSessionParticipant.count({
            where: {
                joinedAt: { lt: weekly.end },
                OR: [
                    { leftAt: null },
                    { leftAt: { gte: weekly.start } },
                ],
            },
        }),
        prisma.workSessionParticipant.findMany({
            where: {
                joinedAt: { lt: weekly.end },
                OR: [
                    { leftAt: null },
                    { leftAt: { gte: weekly.start } },
                ],
            },
            distinct: ['userId'],
            select: { userId: true },
        }),
        prisma.workSessionParticipant.findMany({
            where: {
                joinedAt: { lt: weekly.end },
                OR: [
                    { leftAt: null },
                    { leftAt: { gte: weekly.start } },
                ],
            },
            distinct: ['sessionId'],
            select: { sessionId: true },
        }),
        prisma.communityReactionEvent.findMany({
            where: {
                createdAt: {
                    gte: weekly.start,
                    lt: weekly.end,
                },
                sessionId: { not: null },
            },
            distinct: ['sessionId'],
            select: { sessionId: true },
        }),
        prisma.communityReactionEvent.findMany({
            where: {
                createdAt: {
                    gte: weekly.start,
                    lt: weekly.end,
                },
            },
            distinct: ['userId'],
            select: { userId: true },
        }),
    ])

    const dailyByType = toReactionCounts(dailyAggregateRows)
    const dailyTotal = sumReactionCounts(dailyByType)
    const weeklyActiveUsers = weeklyActiveUsersRows.length
    const weeklyActiveSessions = weeklyActiveSessionsRows.length
    const sessionsWithReaction = weeklySessionsWithReactionRows.length
    const usersWithReaction = weeklyUsersWithReactionRows.length

    return {
        daily: {
            byType: dailyByType,
            total: dailyTotal,
        },
        weekly: {
            total: weeklyTotalReactions,
            sessionLinkedTotal: weeklySessionReactions,
            activeParticipants: weeklyParticipantCount,
            activeUsers: weeklyActiveUsers,
            activeSessions: weeklyActiveSessions,
            sessionsWithReaction,
            usersWithReaction,
            reactionDensity: round(
                weeklyParticipantCount > 0
                    ? weeklySessionReactions / weeklyParticipantCount
                    : 0
            ),
            sessionParticipationRate: percent(sessionsWithReaction, weeklyActiveSessions),
            userParticipationRate: percent(usersWithReaction, weeklyActiveUsers),
        },
        monthly: {
            total: monthlyTotalReactions,
        },
    }
}
