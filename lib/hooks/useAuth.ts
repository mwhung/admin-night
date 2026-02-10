
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'
import { getMockAuthUserForClient } from '@/lib/mock-auth'

type AuthMeResponse = {
    user?: {
        id?: unknown
        email?: unknown
        name?: unknown
        avatarUrl?: unknown
    }
}

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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function buildFallbackSupabaseUser(payload: unknown): User | null {
    if (!isObjectRecord(payload)) return null

    const rawUser = payload.user
    if (!isObjectRecord(rawUser)) return null
    if (typeof rawUser.id !== 'string' || rawUser.id.length === 0) return null

    const normalizedEmail = typeof rawUser.email === 'string' && rawUser.email.length > 0
        ? rawUser.email
        : undefined
    const normalizedName = typeof rawUser.name === 'string' && rawUser.name.length > 0
        ? rawUser.name
        : undefined
    const avatarUrl = typeof rawUser.avatarUrl === 'string' && rawUser.avatarUrl.length > 0
        ? rawUser.avatarUrl
        : undefined

    return {
        id: rawUser.id,
        email: normalizedEmail,
        aud: 'authenticated',
        created_at: new Date(0).toISOString(),
        app_metadata: { provider: 'server-fallback', providers: ['server-fallback'] },
        user_metadata: {
            ...(normalizedName ? { name: normalizedName } : {}),
            ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        },
    } as User
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

        const fetchFallbackUser = async () => {
            try {
                const response = await fetch('/api/auth/me', { cache: 'no-store' })
                if (!response.ok) return null
                const payload = await response.json() as AuthMeResponse
                return buildFallbackSupabaseUser(payload)
            } catch {
                return null
            }
        }

        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
                setSession(session)
                setUser(session.user)
            } else {
                const fallbackUser = await fetchFallbackUser()
                setSession(buildMockSession(fallbackUser))
                setUser(fallbackUser)
            }
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
