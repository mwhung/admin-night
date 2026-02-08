// Session Presence Hook
// Real-time participant tracking using Supabase Presence

'use client'

import { useEffect, useState } from 'react'
import { createSessionChannel, RealtimeSessionPayload } from './supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseSessionPresenceOptions {
    sessionId: string
    enabled?: boolean
}

interface UseSessionPresenceReturn {
    participantCount: number
    isConnected: boolean
    error: Error | null
}

export function useSessionPresence({
    sessionId,
    enabled = true,
}: UseSessionPresenceOptions): UseSessionPresenceReturn {
    const [participantCount, setParticipantCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        if (!enabled || !sessionId) {
            return
        }

        let channel: RealtimeChannel | null = null

        const setupChannel = async () => {
            try {
                channel = createSessionChannel(sessionId)

                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel!.presenceState<RealtimeSessionPayload>()
                        const total = Object.values(state).reduce(
                            (sum, presences) => sum + presences.length,
                            0
                        )
                        setParticipantCount(total)
                    })
                    .on('presence', { event: 'join' }, ({ newPresences }) => {
                        console.log('User joined session:', newPresences)
                    })
                    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
                        console.log('User left session:', leftPresences)
                    })

                await channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        setIsConnected(true)
                        setError(null)

                        // Track our presence
                        const payload: RealtimeSessionPayload = {
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
    }, [sessionId, enabled])

    return {
        participantCount,
        isConnected,
        error,
    }
}
