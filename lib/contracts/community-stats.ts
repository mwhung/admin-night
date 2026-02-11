export interface CommunityVictory {
    id: string
    message: string
    resolvedAt: string
}

export interface CommunityReactionTypeBreakdown {
    clap: number
    fire: number
    leaf: number
}

export interface CommunityReactionsDaily {
    byType: CommunityReactionTypeBreakdown
    total: number
}

export interface CommunityReactionsWeekly {
    total: number
    reactionDensity: number
    sessionParticipationRate: number
    userParticipationRate: number
}

export interface CommunityReactionsMonthly {
    total: number
}

export interface CommunityReactions {
    daily: CommunityReactionsDaily
    weekly: CommunityReactionsWeekly
    monthly: CommunityReactionsMonthly
}

export interface CommunityDailyStats {
    totalSteps: number
    activeUsers: number
    topCategories: string[]
}

export interface CommunityWeeklyStats {
    totalSteps: number
    goal: number
    progress: number
}

export interface CommunityMonthlyStats {
    totalSteps: number
    fact: string
}

export interface CommunityMetrics {
    reactionDensity: number
    sessionParticipationRate: number
    userParticipationRate: number
}

export interface CommunityStats {
    totalTasksCompleted: number
    daily: CommunityDailyStats
    weekly: CommunityWeeklyStats
    monthly: CommunityMonthlyStats
    reactions?: CommunityReactions
    metrics?: CommunityMetrics
    avgBloomTimeHours?: number | null
    peakFocusHour?: string
    mostProductiveDay?: string
    recentVictories?: CommunityVictory[]
}

export interface CommunityStatsResponse {
    community: CommunityStats
}
