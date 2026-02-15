import { describe, expect, it } from 'vitest'
import { getCommunityOverview } from '@/components/features/community/community-view-model'
import type { CommunityStatsResponse } from '@/lib/contracts/community-stats'

describe('community view model', () => {
    it('maps Steps Closed to all-time resolved count and keeps presence board count from daily total steps', () => {
        const stats: CommunityStatsResponse = {
            community: {
                totalTasksCompleted: 999,
                daily: {
                    totalSteps: 12,
                    activeUsers: 5,
                    topCategories: [],
                },
                weekly: {
                    totalSteps: 88,
                    goal: 10000,
                    progress: 88,
                },
                monthly: {
                    totalSteps: 320,
                    fact: 'Monthly fact',
                },
                reactions: {
                    daily: {
                        byType: { clap: 1, fire: 2, leaf: 0 },
                        total: 3,
                    },
                    weekly: {
                        total: 20,
                        reactionDensity: 1.2,
                        sessionParticipationRate: 40,
                        userParticipationRate: 35,
                    },
                    monthly: {
                        total: 120,
                    },
                },
                avgBloomTimeHours: 4.2,
                recentVictories: [],
            },
        }

        const overview = getCommunityOverview(stats)

        expect(overview.totalReleased).toBe(12)
        const stepsClosed = overview.pulseSnapshotMetrics.find((metric) => metric.label === 'Steps Closed')
        const activePeople = overview.pulseSnapshotMetrics.find((metric) => metric.label === 'Active People Today')

        expect(stepsClosed?.value).toBe('999')
        expect(activePeople?.value).toBe('5')
    })
})
