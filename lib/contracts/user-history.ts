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
    peakSessionWindow: PeakSessionWindow | null
    resolvedTaskTypeBreakdown: TaskTypeBreakdownItem[]
    collaborationEnergy: CollaborationEnergy
    fastestTripleReleaseSession: FastestTripleReleaseSession | null
}

export interface PeakSessionWindow {
    dayLabel: string
    startHour: number
    endHour: number
    sessionCount: number
}

export interface TaskTypeBreakdownItem {
    type: string
    count: number
}

export interface CollaborationEnergy {
    cumulativeOthersPresent: number
    maxParticipantsInSession: number
}

export interface FastestTripleReleaseSession {
    sessionId: string
    date: string
    durationMinutes: number
    resolvedTaskCount: number
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
