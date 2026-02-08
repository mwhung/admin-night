export const REACTION_TYPES = ['clap', 'fire', 'leaf'] as const

export type ReactionType = (typeof REACTION_TYPES)[number]

export type ReactionCounts = Record<ReactionType, number>

export const EMPTY_REACTION_COUNTS: ReactionCounts = {
    clap: 0,
    fire: 0,
    leaf: 0,
}

export function isReactionType(value: string): value is ReactionType {
    return REACTION_TYPES.includes(value as ReactionType)
}

export function toReactionCounts(
    rows: Array<{ type: string; count: number }>
): ReactionCounts {
    const counts: ReactionCounts = { ...EMPTY_REACTION_COUNTS }
    for (const row of rows) {
        if (isReactionType(row.type)) {
            counts[row.type] = row.count
        }
    }
    return counts
}

export function getUtcDayStart(date = new Date()): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

export function getUtcWeekStart(date = new Date()): Date {
    const dayStart = getUtcDayStart(date)
    const dayOfWeek = dayStart.getUTCDay()
    const daysFromMonday = (dayOfWeek + 6) % 7
    dayStart.setUTCDate(dayStart.getUTCDate() - daysFromMonday)
    return dayStart
}

export function getUtcMonthStart(date = new Date()): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

export function addUtcDays(date: Date, days: number): Date {
    const result = new Date(date)
    result.setUTCDate(result.getUTCDate() + days)
    return result
}

export function addUtcMonths(date: Date, months: number): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))
}
