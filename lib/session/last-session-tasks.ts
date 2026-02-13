export const LAST_SESSION_TASKS_LIMIT = 20

const RESOLVED_STATE = 'RESOLVED'

export interface LastSessionTaskCandidate {
    id: string
    title: string
    state: string
    isFromLastSession?: boolean
}

export function isLastSessionPendingTask(task: LastSessionTaskCandidate): boolean {
    return task.isFromLastSession === true && task.state !== RESOLVED_STATE
}

export function selectLastSessionPendingTasks<T extends LastSessionTaskCandidate>(tasks: readonly T[]): T[] {
    return tasks.filter(isLastSessionPendingTask)
}
