import { type ComponentType } from 'react'
import { Orbit, Sparkles, Users, Wind } from 'lucide-react'
import type { CommunityStatsResponse, CommunityVictory } from '@/lib/contracts/community-stats'

export const COMMUNITY_LABEL_STYLE = 'type-section-label text-[0.76rem] tracking-[0.07em]'

export interface PulseSnapshotMetric {
    label: string
    value: string
    meta: string
    icon: ComponentType<{ className?: string }>
}

export interface CommunityOverview {
    totalReleased: number
    weeklyProgress: number
    weeklyGoal: number
    recentVictories: CommunityVictory[]
    monthlyFact?: string
    pulseSnapshotMetrics: PulseSnapshotMetric[]
}

export function getCommunityOverview(stats: CommunityStatsResponse | null): CommunityOverview {
    const totalReleased = stats?.community.daily.totalSteps ?? 0
    const totalResolvedAllTime = stats?.community.totalTasksCompleted ?? 0
    const activeParticipants = stats?.community.daily.activeUsers ?? 0
    const dailyReactions = stats?.community.reactions?.daily.total ?? 0
    const avgBloomTimeHours = stats?.community.avgBloomTimeHours

    const bloomTimeLabel =
        typeof avgBloomTimeHours === 'number'
            ? `${avgBloomTimeHours.toFixed(1)}h`
            : '—'

    const pulseSnapshotMetrics: PulseSnapshotMetric[] = [
        {
            label: 'Steps Closed',
            value: totalResolvedAllTime.toLocaleString(),
            meta: 'All-time tasks marked resolved by the community.',
            icon: Wind,
        },
        {
            label: 'Active People Today',
            value: activeParticipants.toString(),
            meta: 'People who started a session in the past 24 hours.',
            icon: Users,
        },
        {
            label: 'Reactions Today',
            value: dailyReactions.toString(),
            meta: 'Clap, fire, and leaf reactions logged today.',
            icon: Sparkles,
        },
        {
            label: 'Avg Time to Close',
            value: bloomTimeLabel,
            meta: 'Average hours from capture to resolve this week.',
            icon: Orbit,
        },
    ]

    return {
        totalReleased,
        weeklyProgress: stats?.community.weekly.progress ?? 0,
        weeklyGoal: stats?.community.weekly.goal ?? 10000,
        recentVictories: stats?.community.recentVictories ?? [],
        monthlyFact: stats?.community.monthly.fact,
        pulseSnapshotMetrics,
    }
}
