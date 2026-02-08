export const MOCK_AUTH_COOKIE_NAME = 'e2e-mock-user'

export interface MockAuthUser {
    id: string
    email: string
    name?: string
}

function isNonProductionEnv() {
    return process.env.NODE_ENV !== 'production' && process.env.VERCEL_ENV !== 'production'
}

function isE2ETestingEnabled() {
    return isNonProductionEnv() && process.env.NEXT_PUBLIC_E2E_TESTING === 'true'
}

function isDevMockAuthEnabled() {
    return isNonProductionEnv() && process.env.NEXT_PUBLIC_MOCK_AUTH === 'true'
}

export function isMockAuthEnabled() {
    return isE2ETestingEnabled() || isDevMockAuthEnabled()
}

export function getDefaultMockAuthUser(): MockAuthUser {
    return {
        id: process.env.NEXT_PUBLIC_MOCK_AUTH_USER_ID || 'mock-user-id',
        email: process.env.NEXT_PUBLIC_MOCK_AUTH_USER_EMAIL || 'mock@example.com',
        name: process.env.NEXT_PUBLIC_MOCK_AUTH_USER_NAME || 'Mock User',
    }
}

export function parseMockAuthUser(rawValue?: string | null): MockAuthUser | null {
    if (!rawValue) return null

    try {
        const parsed = JSON.parse(rawValue) as Partial<MockAuthUser>

        if (typeof parsed.id !== 'string' || parsed.id.trim().length === 0) return null
        if (typeof parsed.email !== 'string' || parsed.email.trim().length === 0) return null

        return {
            id: parsed.id.trim(),
            email: parsed.email.trim(),
            name: typeof parsed.name === 'string' ? parsed.name.trim() : undefined,
        }
    } catch {
        return null
    }
}

export function resolveMockAuthUser(rawCookieValue?: string | null): MockAuthUser | null {
    if (!isMockAuthEnabled()) return null

    const cookieUser = parseMockAuthUser(rawCookieValue)
    if (cookieUser) return cookieUser

    // E2E should only bypass auth when a test explicitly sets the mock cookie.
    if (isE2ETestingEnabled()) return null

    return getDefaultMockAuthUser()
}

export function getMockAuthUserForClient() {
    // Client-side user fallback should only exist for local dev mock mode.
    if (!isDevMockAuthEnabled()) return null
    return getDefaultMockAuthUser()
}
