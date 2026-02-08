
'use server'

import { createClient } from '@/lib/supabase/server'
import { MOCK_AUTH_COOKIE_NAME, getDefaultMockAuthUser, isMockAuthEnabled } from '@/lib/mock-auth'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return 'Email and password are required.'
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return error.message
    }

    redirect(ROUTES.HOME)
}

export async function signInWithGoogle() {
    const supabase = await createClient()

    // Get the site URL for the redirect
    // In production, this should be your domain. In development, localhost:3000.
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Google sign-in error:', error)
        throw error
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signInWithMockUser() {
    if (!isMockAuthEnabled()) {
        return 'Mock auth is not enabled.'
    }

    const cookieStore = await cookies()
    const mockUser = getDefaultMockAuthUser()
    const isHttps = (process.env.NEXT_PUBLIC_SITE_URL || '').startsWith('https://')

    cookieStore.set(MOCK_AUTH_COOKIE_NAME, JSON.stringify(mockUser), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: isHttps,
        maxAge: 60 * 60 * 24 * 30,
    })

    redirect(ROUTES.HOME)
}

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()

    const cookieStore = await cookies()
    cookieStore.delete(MOCK_AUTH_COOKIE_NAME)

    redirect(ROUTES.LOGIN)
}
