import type {
    FastestTripleReleaseSession,
    HistoryStats,
    PeakSessionWindow,
    TaskTypeBreakdownItem,
} from '@/lib/contracts/user-history'

export const HISTORY_PAGE_SIZE = 10
const HISTORY_CALENDAR_DAYS = 28

export const HISTORY_LABEL_STYLE = 'type-section-label text-[0.76rem] tracking-[0.07em]'

const EMPTY_HISTORY_STATS: HistoryStats = {
    totalResolved: 0,
    totalPending: 0,
    totalFocusMinutes: 0,
    dailyActivity: {},
    totalSessions: 0,
    peakSessionWindow: null,
    resolvedTaskTypeBreakdown: [],
    collaborationEnergy: {
        cumulativeOthersPresent: 0,
        maxParticipantsInSession: 0,
    },
    fastestTripleReleaseSession: null,
}

export function getHistoryStatsData(stats: HistoryStats | null): HistoryStats {
    return stats ?? EMPTY_HISTORY_STATS
}

export function computeResolvedRatio(stats: Pick<HistoryStats, 'totalResolved' | 'totalPending'>): number {
    const totalTaskCount = stats.totalResolved + stats.totalPending
    if (totalTaskCount <= 0) {
        return 100
    }

    return Math.round((stats.totalResolved / totalTaskCount) * 100)
}

export function formatFocusTime(totalFocusMinutes: number): string {
    const hours = Math.floor(totalFocusMinutes / 60)
    const minutes = totalFocusMinutes % 60
    return `${hours}h ${minutes}m`
}

export function buildHistoryCalendarDays(today = new Date()): Date[] {
    return Array.from({ length: HISTORY_CALENDAR_DAYS }, (_, index) => {
        const day = new Date(today)
        day.setDate(today.getDate() - (HISTORY_CALENDAR_DAYS - 1 - index))
        return day
    })
}

function padHour(hour: number): string {
    return hour.toString().padStart(2, '0')
}

export function formatHourRange(startHour: number, endHour: number): string {
    return `${padHour(startHour)}:00-${padHour(endHour)}:00`
}

export function formatPeakSessionWindow(window: PeakSessionWindow | null): string {
    if (!window) {
        return 'No stable opening window yet.'
    }

    return `${window.dayLabel} ${formatHourRange(window.startHour, window.endHour)}`
}

export function getTaskTypeMaxCount(items: TaskTypeBreakdownItem[]): number {
    return items.reduce((max, item) => Math.max(max, item.count), 0)
}

export function getTaskTypeBarWidth(count: number, maxCount: number): number {
    if (maxCount <= 0) {
        return 0
    }

    return Math.max(8, Math.round((count / maxCount) * 100))
}

export function formatFastestTripleRelease(
    fastestTripleReleaseSession: FastestTripleReleaseSession | null
): string {
    if (!fastestTripleReleaseSession) {
        return 'No three-task release sprint recorded yet.'
    }

    return `${fastestTripleReleaseSession.durationMinutes} mins`
}
