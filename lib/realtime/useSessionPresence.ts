// Session Presence Hook
// Real-time participant tracking using Supabase Presence

'use client'

import { useEffect, useState, useCallback } from 'react'
import { createSessionChannel, RealtimeSessionPayload } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface Participant {
    userId: string
    userName?: string
    joinedAt: Date
}

interface UseSessionPresenceOptions {
    sessionId: string
    userId: string
    userName?: string
    enabled?: boolean
}

interface UseSessionPresenceReturn {
    participants: Participant[]
    participantCount: number
    isConnected: boolean
    error: Error | null
}

export function useSessionPresence({
    sessionId,
    userId,
    userName,
    enabled = true,
}: UseSessionPresenceOptions): UseSessionPresenceReturn {
    const [participants, setParticipants] = useState<Participant[]>([])
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!enabled || !sessionId || !userId) {
            return
        }

        let channel: RealtimeChannel | null = null

        const setupChannel = async () => {
            try {
                channel = createSessionChannel(sessionId)

                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel!.presenceState<RealtimeSessionPayload>()
                        const allParticipants: Participant[] = []

                        Object.values(state).forEach((presences) => {
                            presences.forEach((presence) => {
                                allParticipants.push({
                                    userId: presence.user_id,
                                    userName: presence.user_name,
                                    joinedAt: new Date(presence.joined_at),
                                })
                            })
                        })

                        setParticipants(allParticipants)
                    })
                    .on('presence', { event: 'join' }, ({ newPresences }) => {
                        console.log('User joined session:', newPresences)
                    })
                    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                        console.log('User left session:', leftPresences)
                    })

                const status = await channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnected(true)
                        setError(null)

                        // Track our presence
                        const payload: RealtimeSessionPayload = {
                            user_id: userId,
                            user_name: userName,
                            joined_at: new Date().toISOString(),
                        }
                        await channel!.track(payload)
                    } else if (status === 'CHANNEL_ERROR') {
                        setError(new Error('Failed to connect to session channel'))
                        setIsConnected(false)
                    }
                })
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Unknown error'))
                setIsConnected(false)
            }
        }

        setupChannel()

        return () => {
            if (channel) {
                channel.unsubscribe()
            }
        }
    }, [sessionId, userId, userName, enabled])

    return {
        participants,
        participantCount: participants.length,
        isConnected,
        error,
    }
}
