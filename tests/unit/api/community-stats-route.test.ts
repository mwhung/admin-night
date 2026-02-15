import { beforeEach, describe, expect, it, vi } from 'vitest'

const {
    prismaMock,
    syncCommunityMilestonesMock,
    getCommunityReactionMetricsMock,
} = vi.hoisted(() => ({
    prismaMock: {
        task: {
            count: vi.fn(),
            findMany: vi.fn(),
        },
        workSessionParticipant: {
            findMany: vi.fn(),
        },
        communityIntent: {
            groupBy: vi.fn(),
        },
        $queryRaw: vi.fn(),
    },
    syncCommunityMilestonesMock: vi.fn(),
    getCommunityReactionMetricsMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

vi.mock('@/lib/community/aggregation', () => ({
    syncCommunityMilestones: syncCommunityMilestonesMock,
    getCommunityReactionMetrics: getCommunityReactionMetricsMock,
}))

import { GET } from '@/app/api/community/stats/route'

describe('/api/community/stats route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        prismaMock.task.count.mockReset()
        prismaMock.task.findMany.mockReset()
        prismaMock.workSessionParticipant.findMany.mockReset()
        prismaMock.communityIntent.groupBy.mockReset()
        prismaMock.$queryRaw.mockReset()
        syncCommunityMilestonesMock.mockReset()
        getCommunityReactionMetricsMock.mockReset()
    })

    it('returns data-driven metrics and recent victories', async () => {
        syncCommunityMilestonesMock.mockResolvedValue({
            daily: { totalSteps: 10, activeUsers: 3, topCategories: ['bills'] },
            weekly: { totalSteps: 55, activeUsers: 7, topCategories: ['email'] },
            monthly: { totalSteps: 240, activeUsers: 32, topCategories: ['planning'] },
            ranges: {
                weekly: {
                    start: new Date('2026-02-02T00:00:00.000Z'),
                    end: new Date('2026-02-09T00:00:00.000Z'),
                },
            },
        })

        getCommunityReactionMetricsMock.mockResolvedValue({
            daily: { byType: { clap: 2, fire: 1, leaf: 0 }, total: 3 },
            weekly: {
                total: 21,
                reactionDensity: 1.5,
                sessionParticipationRate: 55,
                userParticipationRate: 44,
            },
            monthly: { total: 88 },
        })

        prismaMock.task.count
            .mockResolvedValueOnce(42)
            .mockResolvedValueOnce(11)
        prismaMock.task.findMany.mockResolvedValue([
            { resolvedAt: new Date('2026-02-08T10:00:00.000Z') },
            { resolvedAt: new Date('2026-02-08T09:40:00.000Z') },
        ])
        prismaMock.workSessionParticipant.findMany.mockResolvedValue([
            { userId: 'user-1' },
            { userId: 'user-2' },
            { userId: 'user-3' },
        ])
        prismaMock.communityIntent.groupBy.mockResolvedValue([
            { category: 'bills', _count: { category: 2 } },
            { category: 'email', _count: { category: 1 } },
        ])
        prismaMock.$queryRaw.mockResolvedValue([{ avg_hours: '12.34' }])

        const response = await GET()
        expect(response.status).toBe(200)

        const payload = await response.json()

        expect(payload.community.totalTasksCompleted).toBe(42)
        expect(payload.community.daily).toMatchObject({
            totalSteps: 11,
            activeUsers: 3,
            topCategories: ['bills', 'email'],
        })
        expect(payload.community.avgBloomTimeHours).toBe(12.3)
        expect(payload.community.monthly.fact).toBe(
            'This month, the community closed 240 tasks and logged 88 reactions.',
        )
        expect(payload.community.recentVictories).toHaveLength(2)
        expect(payload.community.recentVictories[0]).toMatchObject({
            message: 'Pending loop filed.',
            resolvedAt: '2026-02-08T10:00:00.000Z',
        })
    })

    it('returns explicit quiet state when no monthly releases exist', async () => {
        syncCommunityMilestonesMock.mockResolvedValue({
            daily: { totalSteps: 0, activeUsers: 0, topCategories: [] },
            weekly: { totalSteps: 0, activeUsers: 0, topCategories: [] },
            monthly: { totalSteps: 0, activeUsers: 0, topCategories: [] },
            ranges: {
                weekly: {
                    start: new Date('2026-02-02T00:00:00.000Z'),
                    end: new Date('2026-02-09T00:00:00.000Z'),
                },
            },
        })

        getCommunityReactionMetricsMock.mockResolvedValue({
            daily: { byType: { clap: 0, fire: 0, leaf: 0 }, total: 0 },
            weekly: {
                total: 0,
                reactionDensity: 0,
                sessionParticipationRate: 0,
                userParticipationRate: 0,
            },
            monthly: { total: 0 },
        })

        prismaMock.task.count
            .mockResolvedValueOnce(0)
            .mockResolvedValueOnce(0)
        prismaMock.task.findMany.mockResolvedValue([])
        prismaMock.workSessionParticipant.findMany.mockResolvedValue([])
        prismaMock.communityIntent.groupBy.mockResolvedValue([])
        prismaMock.$queryRaw.mockResolvedValue([{ avg_hours: null }])

        const response = await GET()
        expect(response.status).toBe(200)

        const payload = await response.json()

        expect(payload.community.avgBloomTimeHours).toBeNull()
        expect(payload.community.daily).toMatchObject({
            totalSteps: 0,
            activeUsers: 0,
            topCategories: [],
        })
        expect(payload.community.recentVictories).toEqual([])
        expect(payload.community.monthly.fact).toBe(
            'No completed tasks recorded this month yet.',
        )
    })
})
