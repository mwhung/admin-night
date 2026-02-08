import { describe, expect, it } from 'vitest'
import { buildSetupTaskSuggestionPools } from '@/lib/session/build-task-suggestions'

describe('buildSetupTaskSuggestionPools', () => {
    it('dedupes history tasks and respects drawer limit', () => {
        const result = buildSetupTaskSuggestionPools({
            historyTasks: [
                { id: 'h-1', title: 'Pay Bills', completed: false },
                { id: 'h-2', title: ' pay bills ', completed: false },
                { id: 'h-3', title: 'Inbox Zero', completed: false },
                { id: 'h-4', title: 'Renew IDs', completed: false },
            ],
            quickSuggestions: [],
            drawerLimit: 2,
        })

        expect(result.drawerPool.map((task) => task.title)).toEqual([
            'Pay Bills',
            'Inbox Zero',
        ])
    })

    it('filters out drawer overlaps and dedupes other suggestions by title', () => {
        const result = buildSetupTaskSuggestionPools({
            historyTasks: [
                { id: 'h-1', title: 'Inbox Zero', completed: false },
            ],
            quickSuggestions: [
                { id: 'q-1', title: 'Inbox Zero', completed: false },
                { id: 'q-2', title: 'File Reimbursements', completed: false },
                { id: 'q-3', title: ' file reimbursements ', completed: false },
                { id: 'q-4', title: 'Organize Documents', completed: false },
                { id: 'q-5', title: 'Book Health Checkups', completed: false },
            ],
            otherSuggestionLimit: 3,
        })

        expect(result.otherSuggestionPool.map((task) => task.title)).toEqual([
            'File Reimbursements',
            'Organize Documents',
            'Book Health Checkups',
        ])
    })
})
