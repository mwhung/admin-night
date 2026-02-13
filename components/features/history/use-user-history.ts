import { useCallback, useEffect, useState } from 'react'
import type {
    HistoryGroup,
    HistoryPagination,
    HistoryResponse,
    HistoryStats,
    TaskRecord,
} from '@/lib/contracts/user-history'
import { LAST_SESSION_TASKS_LIMIT, selectLastSessionPendingTasks } from '@/lib/session/last-session-tasks'
import { HISTORY_PAGE_SIZE } from './history-view-model'

export interface UserAchievementRecord {
    id: string
    achievementId: string
    unlockedAt: string
    evidenceSnapshot: string
    humorSnapshot: string
}

interface UseUserHistoryParams {
    enabled: boolean
    historyMarkersEnabled: boolean
}

interface AchievementsResponse {
    achievements?: UserAchievementRecord[]
}

interface LastSessionTaskResponse extends TaskRecord {
    isFromLastSession?: boolean
}

export interface UseUserHistoryResult {
    stats: HistoryStats | null
    pendingTasks: TaskRecord[]
    historyGroups: HistoryGroup[]
    historyPagination: HistoryPagination | null
    achievements: UserAchievementRecord[]
    initialLoading: boolean
    loadingMoreHistory: boolean
    loadMoreHistory: () => Promise<void>
}

export function useUserHistory({
    enabled,
    historyMarkersEnabled,
}: UseUserHistoryParams): UseUserHistoryResult {
    const [stats, setStats] = useState<HistoryStats | null>(null)
    const [pendingTasks, setPendingTasks] = useState<TaskRecord[]>([])
    const [historyGroups, setHistoryGroups] = useState<HistoryGroup[]>([])
    const [historyPagination, setHistoryPagination] = useState<HistoryPagination | null>(null)
    const [achievements, setAchievements] = useState<UserAchievementRecord[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false)

    useEffect(() => {
        if (!enabled) {
            setStats(null)
            setPendingTasks([])
            setHistoryGroups([])
            setHistoryPagination(null)
            setAchievements([])
            setInitialLoading(false)
            return
        }

        let isCancelled = false
        const controller = new AbortController()

        const fetchData = async () => {
            setInitialLoading(true)

            try {
                const [historyRes, achievementsRes, lastSessionTasksRes] = await Promise.all([
                    fetch(`/api/user/history?page=1&limit=${HISTORY_PAGE_SIZE}`, {
                        signal: controller.signal,
                    }),
                    historyMarkersEnabled
                        ? fetch('/api/achievements', { signal: controller.signal })
                        : Promise.resolve(null),
                    fetch(`/api/tasks?limit=${LAST_SESSION_TASKS_LIMIT}&includeLastSession=true`, {
                        signal: controller.signal,
                    }),
                ])

                if (!isCancelled && historyRes.ok) {
                    const historyData = (await historyRes.json()) as HistoryResponse
                    setHistoryGroups(historyData.historyGroups)
                    setHistoryPagination(historyData.pagination)
                    setStats(historyData.stats ?? null)
                }

                if (!isCancelled && lastSessionTasksRes.ok) {
                    const tasksData = await lastSessionTasksRes.json()
                    const rawTasks = Array.isArray(tasksData)
                        ? (tasksData as LastSessionTaskResponse[])
                        : []

                    const lastSessionPendingTasks = selectLastSessionPendingTasks(rawTasks).map((task) => ({
                        id: task.id,
                        title: task.title,
                        state: task.state,
                        createdAt: task.createdAt,
                        resolvedAt: task.resolvedAt,
                    }))

                    setPendingTasks(lastSessionPendingTasks)
                } else if (!isCancelled) {
                    setPendingTasks([])
                }

                if (!isCancelled && achievementsRes?.ok) {
                    const achData = (await achievementsRes.json()) as AchievementsResponse
                    setAchievements(achData.achievements ?? [])
                }
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return
                }

                console.error('Failed to fetch history data', err)
            } finally {
                if (!isCancelled) {
                    setInitialLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            isCancelled = true
            controller.abort()
        }
    }, [enabled, historyMarkersEnabled])

    const loadMoreHistory = useCallback(async () => {
        if (!enabled || !historyPagination?.hasMore || loadingMoreHistory) {
            return
        }

        setLoadingMoreHistory(true)

        try {
            const nextPage = historyPagination.page + 1
            const response = await fetch(
                `/api/user/history?page=${nextPage}&limit=${HISTORY_PAGE_SIZE}&includeOverview=false`
            )

            if (!response.ok) {
                return
            }

            const nextPageData = (await response.json()) as HistoryResponse
            setHistoryGroups((prev) => [...prev, ...nextPageData.historyGroups])
            setHistoryPagination(nextPageData.pagination)
        } catch (err) {
            console.error('Failed to load more history', err)
        } finally {
            setLoadingMoreHistory(false)
        }
    }, [enabled, historyPagination, loadingMoreHistory])

    return {
        stats,
        pendingTasks,
        historyGroups,
        historyPagination,
        achievements,
        initialLoading,
        loadingMoreHistory,
        loadMoreHistory,
    }
}
