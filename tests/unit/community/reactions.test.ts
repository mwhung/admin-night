import { describe, expect, it } from 'vitest'
import {
    getUtcDayStart,
    getUtcMonthStart,
    getUtcWeekStart,
    toReactionCounts,
} from '@/lib/community/reactions'

describe('community reaction helpers', () => {
    it('normalizes day start in UTC', () => {
        const source = new Date('2026-02-07T18:44:10.000Z')
        const dayStart = getUtcDayStart(source)
        expect(dayStart.toISOString()).toBe('2026-02-07T00:00:00.000Z')
    })

    it('normalizes week start to Monday in UTC', () => {
        // Sunday, should roll back to Monday of the same ISO week.
        const source = new Date('2026-02-08T12:00:00.000Z')
        const weekStart = getUtcWeekStart(source)
        expect(weekStart.toISOString()).toBe('2026-02-02T00:00:00.000Z')
    })

    it('normalizes month start in UTC', () => {
        const source = new Date('2026-02-20T01:00:00.000Z')
        const monthStart = getUtcMonthStart(source)
        expect(monthStart.toISOString()).toBe('2026-02-01T00:00:00.000Z')
    })

    it('maps aggregate rows into known reaction buckets only', () => {
        const counts = toReactionCounts([
            { type: 'clap', count: 5 },
            { type: 'fire', count: 3 },
            { type: 'unknown', count: 99 },
        ])

        expect(counts).toEqual({
            clap: 5,
            fire: 3,
            leaf: 0,
        })
    })
})
