'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

const PERSIST_DEBOUNCE_MS = 250

const AESTHETIC_MODES = ['light', 'dark', 'adaptive'] as const

type ThemeMode = 'light' | 'dark' | 'system'

export type AestheticMode = (typeof AESTHETIC_MODES)[number]
export type ResolvedAestheticMode = Exclude<AestheticMode, 'adaptive'>

type UserPreferencesResponse = {
    aesthetic_mode?: unknown
}

type SetModeOptions = {
    persist?: boolean
}

type UseAestheticModeOptions = {
    userId?: string | null
    syncFromServer?: boolean
}

function isAestheticMode(value: unknown): value is AestheticMode {
    return typeof value === 'string' && AESTHETIC_MODES.includes(value as AestheticMode)
}

function modeToTheme(mode: AestheticMode): ThemeMode {
    if (mode === 'adaptive') return 'system'
    return mode
}

function themeToMode(theme: string | undefined): AestheticMode {
    if (theme === 'light' || theme === 'dark') return theme
    return 'adaptive'
}

function resolveMode(resolvedTheme: string | undefined): ResolvedAestheticMode {
    return resolvedTheme === 'dark' ? 'dark' : 'light'
}

export function useAestheticMode({
    userId,
    syncFromServer = true,
}: UseAestheticModeOptions = {}) {
    const { theme, resolvedTheme, setTheme } = useTheme()

    const [isHydrated, setIsHydrated] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const queuedModeRef = useRef<AestheticMode | null>(null)
    const syncedUserIdRef = useRef<string | null>(null)

    const mode = useMemo(() => themeToMode(theme), [theme])
    const resolvedMode = useMemo(() => resolveMode(resolvedTheme), [resolvedTheme])

    const persistMode = useCallback(async (nextMode: AestheticMode) => {
        if (!userId) return

        const response = await fetch('/api/user/preferences', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aesthetic_mode: nextMode }),
        })

        if (!response.ok) {
            throw new Error(`Failed to persist aesthetic mode: ${response.status}`)
        }
    }, [userId])

    const flushPersistQueue = useCallback(async () => {
        const modeToPersist = queuedModeRef.current

        if (!modeToPersist || !userId) {
            setIsSaving(false)
            return
        }

        try {
            await persistMode(modeToPersist)
        } catch (error) {
            console.error('[AESTHETIC_MODE_PATCH]', error)
        } finally {
            if (queuedModeRef.current === modeToPersist) {
                queuedModeRef.current = null
                setIsSaving(false)
            }
        }
    }, [persistMode, userId])

    const schedulePersist = useCallback((nextMode: AestheticMode) => {
        if (!userId) return

        queuedModeRef.current = nextMode
        setIsSaving(true)

        if (saveTimerRef.current) {
            clearTimeout(saveTimerRef.current)
        }

        saveTimerRef.current = setTimeout(() => {
            void flushPersistQueue()
        }, PERSIST_DEBOUNCE_MS)
    }, [flushPersistQueue, userId])

    const setMode = useCallback((nextMode: AestheticMode, options?: SetModeOptions) => {
        setTheme(modeToTheme(nextMode))

        const shouldPersist = options?.persist ?? true
        if (shouldPersist) {
            schedulePersist(nextMode)
        }
    }, [schedulePersist, setTheme])

    const toggleLightDark = useCallback(() => {
        const nextMode: AestheticMode = resolvedMode === 'dark' ? 'light' : 'dark'
        setMode(nextMode)
    }, [resolvedMode, setMode])

    useEffect(() => {
        setIsHydrated(true)

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current)
            }
        }
    }, [])

    useEffect(() => {
        if (!userId || !syncFromServer) return
        if (syncedUserIdRef.current === userId) return

        let isCancelled = false

        const syncModeFromServer = async () => {
            try {
                const response = await fetch('/api/user/preferences', { cache: 'no-store' })
                syncedUserIdRef.current = userId
                if (!response.ok) return

                const preferences = (await response.json()) as UserPreferencesResponse
                if (!isAestheticMode(preferences.aesthetic_mode)) return
                if (isCancelled) return

                setMode(preferences.aesthetic_mode, { persist: false })
            } catch (error) {
                syncedUserIdRef.current = null
                console.error('[AESTHETIC_MODE_GET]', error)
            }
        }

        void syncModeFromServer()

        return () => {
            isCancelled = true
        }
    }, [setMode, syncFromServer, userId])

    useEffect(() => {
        if (!userId) {
            syncedUserIdRef.current = null
        }
    }, [userId])

    return {
        mode,
        resolvedMode,
        isHydrated,
        isSaving,
        setMode,
        toggleLightDark,
    }
}
