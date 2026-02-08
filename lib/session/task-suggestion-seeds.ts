export interface TaskSuggestionSeed {
    id: string
    title: string
    completed: boolean
}

export const QUICK_TASK_SUGGESTION_SEEDS: ReadonlyArray<TaskSuggestionSeed> = [
    { id: 'common-1', title: 'Inbox Zero (Clear Emails)', completed: false },
    { id: 'common-2', title: 'Pay Bills & Invoices', completed: false },
    { id: 'common-3', title: 'Financial Admin & Receipts', completed: false },
    { id: 'common-4', title: 'Update Personal Calendar', completed: false },
    { id: 'common-5', title: 'Weekly Planning & Strategy', completed: false },
    { id: 'common-6', title: 'Review Subscriptions', completed: false },
    { id: 'common-7', title: 'File Reimbursements', completed: false },
    { id: 'common-8', title: 'Organize Documents', completed: false },
    { id: 'common-9', title: 'Book Health Checkups', completed: false },
    { id: 'common-10', title: 'Renew IDs & Memberships', completed: false },
]

export const SETUP_DRAWER_LIMIT = 5
export const SETUP_OTHER_SUGGESTION_LIMIT = 10
