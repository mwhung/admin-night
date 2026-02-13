import type { BrowserContext, TestInfo } from '@playwright/test'

export interface E2EMockUser {
    id: string
    email: string
    name: string
}

const MOCK_AUTH_COOKIE_NAME = 'e2e-mock-user'

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function buildMockUser(base: string, testInfo: TestInfo): E2EMockUser {
    const baseSlug = slugify(base).slice(0, 20) || 'e2e'
    const scenarioSlug = slugify(`${testInfo.project.name}-${testInfo.title}`).slice(0, 36) || 'scenario'
    const identity = `${baseSlug}-${scenarioSlug}`.slice(0, 60)

    return {
        id: identity,
        email: `${identity}@example.com`,
        name: `${baseSlug.replace(/-/g, ' ')} tester`,
    }
}

export async function setMockAuthCookie(context: BrowserContext, mockUser: E2EMockUser) {
    await context.addCookies([{
        name: MOCK_AUTH_COOKIE_NAME,
        value: JSON.stringify(mockUser),
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
    }])
}
