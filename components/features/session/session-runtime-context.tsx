'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { TaskItem } from './task-checklist'

const SESSION_STORAGE_KEY = 'admin-night:session-runtime'
const SESSION_ROUTE_PREFIX = '/sessions/'

export interface SessionRuntimeState {
    isActive: boolean
    sessionId: string | null
    durationMinutes: number
    totalSeconds: number
    remainingSeconds: number
    selectedTasks: TaskItem[]
    initialTaskCount: number
    pausedByNavigation: boolean
    startedAt: number
}

interface StartSessionPayload {
    sessionId: string
    durationMinutes: number
    selectedTasks: TaskItem[]
}

interface SyncSessionPayload {
    sessionId?: string | null
    durationMinutes?: number
    totalSeconds?: number
    remainingSeconds?: number
    selectedTasks?: TaskItem[]
}

interface SessionRuntimeContextValue {
    session: SessionRuntimeState
    startSession: (payload: StartSessionPayload) => void
    syncSession: (payload: SyncSessionPayload) => void
    clearSession: () => void
}

const SessionRuntimeContext = createContext<SessionRuntimeContextValue | null>(null)

const createEmptySession = (): SessionRuntimeState => ({
    isActive: false,
    sessionId: null,
    durationMinutes: 25,
    totalSeconds: 25 * 60,
    remainingSeconds: 25 * 60,
    selectedTasks: [],
    initialTaskCount: 0,
    pausedByNavigation: false,
    startedAt: 0,
})

const sanitizeTasks = (tasks: unknown): TaskItem[] => {
    if (!Array.isArray(tasks)) return []

    return tasks
        .filter((task): task is TaskItem => {
            return (
                typeof task === 'object'
                && task !== null
                && typeof (task as TaskItem).id === 'string'
                && typeof (task as TaskItem).title === 'string'
                && typeof (task as TaskItem).completed === 'boolean'
            )
        })
        .map((task) => ({
            id: task.id,
            title: task.title,
            completed: task.completed,
            state: task.state,
            isFromLastSession: task.isFromLastSession,
        }))
}

const persistSessionState = (session: SessionRuntimeState) => {
    if (typeof window === 'undefined') return

    if (!session.isActive) {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
        return
    }

    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

const hydrateSessionState = (): SessionRuntimeState => {
    if (typeof window === 'undefined') {
        return createEmptySession()
    }

    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return createEmptySession()

    try {
        const parsed = JSON.parse(raw) as Partial<SessionRuntimeState>
        if (!parsed.isActive || typeof parsed.sessionId !== 'string') {
            return createEmptySession()
        }

        const durationMinutes = Math.max(1, Math.floor(Number(parsed.durationMinutes) || 25))
        const totalSeconds = Math.max(1, Math.floor(Number(parsed.totalSeconds) || durationMinutes * 60))
        const remainingSeconds = Math.max(0, Math.min(
            totalSeconds,
            Math.floor(Number(parsed.remainingSeconds) || totalSeconds),
        ))
        const selectedTasks = sanitizeTasks(parsed.selectedTasks)
        const parsedInitialTaskCount = Number(parsed.initialTaskCount)
        const initialTaskCount = Number.isFinite(parsedInitialTaskCount) && parsedInitialTaskCount >= 0
            ? Math.floor(parsedInitialTaskCount)
            : selectedTasks.length

        return {
            isActive: true,
            sessionId: parsed.sessionId,
            durationMinutes,
            totalSeconds,
            remainingSeconds,
            selectedTasks,
            initialTaskCount,
            pausedByNavigation: Boolean(parsed.pausedByNavigation),
            startedAt: Math.floor(Number(parsed.startedAt) || Date.now()),
        }
    } catch {
        return createEmptySession()
    }
}

export function SessionRuntimeProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [session, setSession] = useState<SessionRuntimeState>(() => hydrateSessionState())

    const startSession = useCallback((payload: StartSessionPayload) => {
        const durationMinutes = Math.max(1, Math.floor(payload.durationMinutes))
        const totalSeconds = durationMinutes * 60
        const selectedTasks = sanitizeTasks(payload.selectedTasks)

        const nextSession: SessionRuntimeState = {
            isActive: true,
            sessionId: payload.sessionId,
            durationMinutes,
            totalSeconds,
            remainingSeconds: totalSeconds,
            selectedTasks,
            initialTaskCount: selectedTasks.length,
            pausedByNavigation: false,
            startedAt: Date.now(),
        }

        persistSessionState(nextSession)
        setSession(nextSession)
    }, [])

    const syncSession = useCallback((payload: SyncSessionPayload) => {
        setSession((prev) => {
            if (!prev.isActive) return prev

            const nextDuration = typeof payload.durationMinutes === 'number'
                ? Math.max(1, Math.floor(payload.durationMinutes))
                : prev.durationMinutes

            const nextTotal = typeof payload.totalSeconds === 'number'
                ? Math.max(1, Math.floor(payload.totalSeconds))
                : prev.totalSeconds

            const nextRemaining = typeof payload.remainingSeconds === 'number'
                ? Math.max(0, Math.min(nextTotal, Math.floor(payload.remainingSeconds)))
                : prev.remainingSeconds

            const nextSelectedTasks = payload.selectedTasks
                ? sanitizeTasks(payload.selectedTasks)
                : prev.selectedTasks

            const nextInitialTaskCount = prev.initialTaskCount > 0
                ? prev.initialTaskCount
                : nextSelectedTasks.length

            const nextSession: SessionRuntimeState = {
                ...prev,
                sessionId: payload.sessionId ?? prev.sessionId,
                durationMinutes: nextDuration,
                totalSeconds: nextTotal,
                remainingSeconds: nextRemaining,
                selectedTasks: nextSelectedTasks,
                initialTaskCount: nextInitialTaskCount,
            }

            persistSessionState(nextSession)
            return nextSession
        })
    }, [])

    const clearSession = useCallback(() => {
        const cleared = createEmptySession()
        persistSessionState(cleared)
        setSession(cleared)
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return

        if (!session.isActive) {
            window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
            return
        }

        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    }, [session])

    const computedSession = useMemo<SessionRuntimeState>(() => {
        const isSessionRoute = pathname.startsWith(SESSION_ROUTE_PREFIX)

        return {
            ...session,
            pausedByNavigation: session.isActive && !isSessionRoute,
        }
    }, [pathname, session])

    const value = useMemo<SessionRuntimeContextValue>(() => ({
        session: computedSession,
        startSession,
        syncSession,
        clearSession,
    }), [computedSession, startSession, syncSession, clearSession])

    return (
        <SessionRuntimeContext.Provider value={value}>
            {children}
        </SessionRuntimeContext.Provider>
    )
}

export function useSessionRuntime() {
    const context = useContext(SessionRuntimeContext)
    if (!context) {
        throw new Error('useSessionRuntime must be used within SessionRuntimeProvider')
    }
    return context
}
