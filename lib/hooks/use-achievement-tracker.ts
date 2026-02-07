
import { useState, useCallback, useRef } from 'react'
import { ACHIEVEMENTS, getRandomHumor, type AchievementDef } from '@/lib/achievements/definitions'

export interface UnlockedAchievement {
    id: string
    title: string
    icon: string
    humorLine: string
    evidence: string
}

interface SessionState {
    pauseCount: number
    tasksCompletedCount: number
    sessionStartTime: Date
    currentSessionId?: string
}

interface UseAchievementTrackerReturn {
    // State
    sessionState: SessionState
    pendingToast: UnlockedAchievement | null
    toastQueue: UnlockedAchievement[]

    // Actions
    trackPause: () => void
    trackTaskComplete: () => void
    initSession: (sessionId: string) => void
    dismissToast: () => void
    checkInSessionAchievements: () => void
}

export function useAchievementTracker(): UseAchievementTrackerReturn {
    const [sessionState, setSessionState] = useState<SessionState>({
        pauseCount: 0,
        tasksCompletedCount: 0,
        sessionStartTime: new Date(),
    })

    const [toastQueue, setToastQueue] = useState<UnlockedAchievement[]>([])
    const [pendingToast, setPendingToast] = useState<UnlockedAchievement | null>(null)

    // Track which achievements have been unlocked this session (to prevent duplicates)
    const unlockedThisSession = useRef<Set<string>>(new Set())
    // Rate limit: max 2 toasts per session
    const toastCountThisSession = useRef(0)
    const MAX_TOASTS_PER_SESSION = 2

    const initSession = useCallback((sessionId: string) => {
        setSessionState({
            pauseCount: 0,
            tasksCompletedCount: 0,
            sessionStartTime: new Date(),
            currentSessionId: sessionId,
        })
        unlockedThisSession.current.clear()
        toastCountThisSession.current = 0
        setToastQueue([])
        setPendingToast(null)
    }, [])

    const trackPause = useCallback(() => {
        setSessionState(prev => ({ ...prev, pauseCount: prev.pauseCount + 1 }))
    }, [])

    const trackTaskComplete = useCallback(() => {
        setSessionState(prev => ({ ...prev, tasksCompletedCount: prev.tasksCompletedCount + 1 }))
    }, [])

    const unlockAchievement = useCallback((achievement: AchievementDef, evidence: string) => {
        // Prevent duplicate unlocks within same session
        if (unlockedThisSession.current.has(achievement.id)) return

        // Rate limiting
        if (toastCountThisSession.current >= MAX_TOASTS_PER_SESSION) return

        unlockedThisSession.current.add(achievement.id)
        toastCountThisSession.current++

        const unlocked: UnlockedAchievement = {
            id: achievement.id,
            title: achievement.title,
            icon: achievement.icon,
            humorLine: getRandomHumor(achievement.id),
            evidence,
        }

        // Add to queue
        setToastQueue(prev => [...prev, unlocked])

        // If no toast is showing, show this one
        setPendingToast(current => current ?? unlocked)

        // Persist to backend (fire and forget for now)
        fetch('/api/achievements/unlock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                achievementId: achievement.id,
                evidence,
                sessionId: sessionState.currentSessionId,
            }),
        }).catch(console.error)
    }, [sessionState.currentSessionId])

    const dismissToast = useCallback(() => {
        setToastQueue(prev => {
            const [, ...rest] = prev
            setPendingToast(rest[0] ?? null)
            return rest
        })
    }, [])

    const checkInSessionAchievements = useCallback(() => {
        const candidates = ACHIEVEMENTS.filter(a => a.triggerType === 'in_session')

        for (const ach of candidates) {
            // Skip if already unlocked this session
            if (unlockedThisSession.current.has(ach.id)) continue

            // Check conditions based on ID
            if (ach.id === 'first_step') {
                if (sessionState.tasksCompletedCount === 1) {
                    unlockAchievement(ach, 'Completed first task of the session.')
                }
            }
            // Add more in_session checks here...
        }
    }, [sessionState, unlockAchievement])

    return {
        sessionState,
        pendingToast,
        toastQueue,
        trackPause,
        trackTaskComplete,
        initSession,
        dismissToast,
        checkInSessionAchievements,
    }
}
