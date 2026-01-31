// Supabase Realtime Client
// Used for live session presence and participant tracking

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not configured. Realtime features will be disabled.')
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

export type RealtimeSessionPayload = {
    user_id: string
    user_name?: string
    joined_at: string
}

export function createSessionChannel(sessionId: string) {
    return supabase.channel(`session:${sessionId}`, {
        config: {
            presence: {
                key: sessionId,
            },
        },
    })
}
