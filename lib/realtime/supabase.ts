// Supabase Realtime Client
// Used for live session presence and participant tracking

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

if (!supabaseUrl || !supabasePublishableKey) {
    console.warn('Supabase credentials not configured. Realtime features will be disabled.')
}

export const supabase = createClient(supabaseUrl || '', supabasePublishableKey || '', {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
})

export type RealtimeSessionPayload = {
    joined_at: string
    tasks_completed?: number
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
