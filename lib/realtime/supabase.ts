// Supabase Realtime Client
// Used for live session presence and participant tracking

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _supabase: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient | null {
    if (_supabase) return _supabase

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

    if (!url || !key) {
        console.warn('Supabase credentials not configured. Realtime features will be disabled.')
        return null
    }

    _supabase = createClient(url, key, {
        realtime: { params: { eventsPerSecond: 10 } },
    })
    return _supabase
}

export { getSupabaseClient }

/** @deprecated Use getSupabaseClient() — returns null when credentials are missing */
export const supabase = new Proxy({} as SupabaseClient, {
    get(_, prop) {
        const client = getSupabaseClient()
        if (!client) throw new Error('Supabase client not initialized: missing credentials')
        return Reflect.get(client, prop)
    },
})

export type RealtimeSessionPayload = {
    joined_at: string
    tasks_completed?: number
}

export function createSessionChannel(sessionId: string) {
    const client = getSupabaseClient()
    if (!client) {
        throw new Error('Cannot create session channel: Supabase not configured')
    }
    return client.channel(`session:${sessionId}`, {
        config: {
            presence: {
                key: sessionId,
            },
        },
    })
}
