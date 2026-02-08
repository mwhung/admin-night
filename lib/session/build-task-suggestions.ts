import {
    QUICK_TASK_SUGGESTION_SEEDS,
    SETUP_DRAWER_LIMIT,
    SETUP_OTHER_SUGGESTION_LIMIT,
    type TaskSuggestionSeed,
} from '@/lib/session/task-suggestion-seeds'

interface TaskSuggestionItem {
    id: string
    title: string
    completed: boolean
    state?: string
    isFromLastSession?: boolean
}

interface BuildSetupTaskSuggestionPoolsParams {
    historyTasks: TaskSuggestionItem[]
    quickSuggestions?: ReadonlyArray<TaskSuggestionSeed>
    drawerLimit?: number
    otherSuggestionLimit?: number
}

interface SetupTaskSuggestionPools {
    drawerPool: TaskSuggestionItem[]
    otherSuggestionPool: TaskSuggestionItem[]
}

const normalizeTaskTitle = (title: string): string => title.trim().toLowerCase()

export function buildSetupTaskSuggestionPools({
    historyTasks,
    quickSuggestions = QUICK_TASK_SUGGESTION_SEEDS,
    drawerLimit = SETUP_DRAWER_LIMIT,
    otherSuggestionLimit = SETUP_OTHER_SUGGESTION_LIMIT,
}: BuildSetupTaskSuggestionPoolsParams): SetupTaskSuggestionPools {
    const seenDrawerTitles = new Set<string>()

    const drawerPool = historyTasks.filter((task) => {
        const normalizedTitle = normalizeTaskTitle(task.title)
        if (seenDrawerTitles.has(normalizedTitle)) return false
        seenDrawerTitles.add(normalizedTitle)
        return true
    }).slice(0, drawerLimit)

    const drawerTitleSet = new Set(drawerPool.map((task) => normalizeTaskTitle(task.title)))
    const seenOtherTitles = new Set<string>()

    const otherSuggestionPool = quickSuggestions.filter((task) => {
        const normalizedTitle = normalizeTaskTitle(task.title)
        if (drawerTitleSet.has(normalizedTitle)) return false
        if (seenOtherTitles.has(normalizedTitle)) return false
        seenOtherTitles.add(normalizedTitle)
        return true
    }).slice(0, otherSuggestionLimit)

    return {
        drawerPool,
        otherSuggestionPool,
    }
}
