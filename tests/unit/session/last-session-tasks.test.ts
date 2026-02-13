import { describe, expect, it } from 'vitest'
import {
    isLastSessionPendingTask,
    selectLastSessionPendingTasks,
} from '@/lib/session/last-session-tasks'

describe('last-session-tasks helpers', () => {
    it('keeps only unfinished tasks from the immediate last session', () => {
        const result = selectLastSessionPendingTasks([
            { id: 'a', title: 'Task A', state: 'IN_PROGRESS', isFromLastSession: true },
            { id: 'b', title: 'Task B', state: 'RESOLVED', isFromLastSession: true },
            { id: 'c', title: 'Task C', state: 'UNCLARIFIED', isFromLastSession: false },
            { id: 'd', title: 'Task D', state: 'CLARIFIED' },
        ])

        expect(result).toEqual([
            { id: 'a', title: 'Task A', state: 'IN_PROGRESS', isFromLastSession: true },
        ])
    })

    it('returns false for non-last-session or resolved tasks', () => {
        expect(isLastSessionPendingTask({
            id: 'a',
            title: 'Done',
            state: 'RESOLVED',
            isFromLastSession: true,
        })).toBe(false)

        expect(isLastSessionPendingTask({
            id: 'b',
            title: 'Not Last Session',
            state: 'IN_PROGRESS',
            isFromLastSession: false,
        })).toBe(false)
    })
})
