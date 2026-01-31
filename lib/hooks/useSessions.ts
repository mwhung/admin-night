// Sessions API Hook
// Provides data fetching and mutations for sessions using React Query

'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export interface Session {
    id: string
    scheduledStart: string
    scheduledEnd: string
    durationMinutes: number
    status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED'
    participantCount: number
    isParticipating: boolean
    participants?: {
        userId: string
        userName: string
        userImage?: string
        joinedAt: string
    }[]
}

interface SessionsResponse {
    sessions: Session[]
}

interface SessionResponse {
    session: Session
}

// Fetch upcoming sessions
export function useSessions(options?: { upcoming?: boolean; status?: string }) {
    const params = new URLSearchParams()
    if (options?.upcoming) params.set('upcoming', 'true')
    if (options?.status) params.set('status', options.status)

    return useQuery<SessionsResponse>({
        queryKey: ['sessions', options],
        queryFn: async () => {
            const url = `/api/sessions${params.toString() ? `?${params.toString()}` : ''}`
            const res = await fetch(url)
            if (!res.ok) {
                throw new Error('Failed to fetch sessions')
            }
            return res.json()
        },
        refetchInterval: 30000, // Refetch every 30 seconds
    })
}

// Fetch single session
export function useSession(sessionId: string) {
    return useQuery<SessionResponse>({
        queryKey: ['session', sessionId],
        queryFn: async () => {
            const res = await fetch(`/api/sessions/${sessionId}`)
            if (!res.ok) {
                throw new Error('Failed to fetch session')
            }
            return res.json()
        },
        enabled: !!sessionId,
        refetchInterval: 10000, // Refetch every 10 seconds for active updates
    })
}

// Create session mutation
export function useCreateSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (data: { scheduledStart: Date; durationMinutes?: number }) => {
            const res = await fetch('/api/sessions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to create session')
            }
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
        },
    })
}

// Join session mutation
export function useJoinSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (sessionId: string) => {
            const res = await fetch(`/api/sessions/${sessionId}/join`, {
                method: 'POST',
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to join session')
            }
            return res.json()
        },
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
            queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
        },
    })
}

// Leave session mutation
export function useLeaveSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            sessionId,
            tasksWorkedOn,
        }: {
            sessionId: string
            tasksWorkedOn?: string[]
        }) => {
            const res = await fetch(`/api/sessions/${sessionId}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasksWorkedOn }),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to leave session')
            }
            return res.json()
        },
        onSuccess: (_, { sessionId }) => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
            queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
        },
    })
}

// Update session status mutation
export function useUpdateSession() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({
            sessionId,
            data,
        }: {
            sessionId: string
            data: { status?: string; scheduledStart?: Date; durationMinutes?: number }
        }) => {
            const res = await fetch(`/api/sessions/${sessionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })
            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to update session')
            }
            return res.json()
        },
        onSuccess: (_, { sessionId }) => {
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
            queryClient.invalidateQueries({ queryKey: ['session', sessionId] })
        },
    })
}
