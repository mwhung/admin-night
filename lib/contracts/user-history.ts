export interface TaskRecord {
    id: string
    title: string
    state: string
    createdAt: string
    resolvedAt: string | null
}

export interface HistoryGroup {
    id: string
    sessionId: string
    date: string
    duration: number
    tasks: TaskRecord[]
    participantCount: number
}

export interface HistoryStats {
    totalResolved: number
    totalPending: number
    totalFocusMinutes: number
    dailyActivity: Record<string, number>
    totalSessions: number
}

export interface HistoryPagination {
    page: number
    limit: number
    hasMore: boolean
    totalSessions: number
}

export interface HistoryResponse {
    stats?: HistoryStats
    historyGroups: HistoryGroup[]
    pendingTasks?: TaskRecord[]
    pagination: HistoryPagination
}
