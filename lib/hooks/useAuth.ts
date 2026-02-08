
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { getMockAuthUserForClient } from '@/lib/mock-auth'

function buildMockSupabaseUser() {
    const mockUser = getMockAuthUserForClient()
    if (!mockUser) return null

    return {
        id: mockUser.id,
        email: mockUser.email,
        aud: 'authenticated',
        created_at: new Date(0).toISOString(),
        app_metadata: { provider: 'mock', providers: ['mock'] },
        user_metadata: { name: mockUser.name || 'Mock User' },
    } as User
}

function buildMockSession(user: User | null) {
    if (!user) return null

    return {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        expires_in: 60 * 60,
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        user,
    } as Session
}

export function useAuth() {
    const mockSupabaseUser = buildMockSupabaseUser()
    const mockSupabaseSession = buildMockSession(mockSupabaseUser)

    const [user, setUser] = useState<User | null>(() => mockSupabaseUser)
    const [session, setSession] = useState<Session | null>(() => mockSupabaseSession)
    const [loading, setLoading] = useState(() => !mockSupabaseUser)
    const [supabase] = useState(() => createClient())

    useEffect(() => {
        if (mockSupabaseUser) return

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, mockSupabaseUser])

    return { user, session, loading }
}
