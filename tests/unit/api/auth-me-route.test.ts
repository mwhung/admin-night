import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

import { GET } from '@/app/api/auth/me/route'

describe('/api/auth/me route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
    })

    it('returns 401 when user is unauthenticated', async () => {
        getCurrentUserMock.mockResolvedValue(null)

        const response = await GET()
        const payload = await response.json()

        expect(response.status).toBe(401)
        expect(payload).toMatchObject({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required.',
            },
        })
    })

    it('returns normalized user profile when authenticated', async () => {
        getCurrentUserMock.mockResolvedValue({
            id: 'user-1',
            email: 'user@example.com',
            name: 'Calm User',
            image: 'https://example.com/avatar.png',
        })

        const response = await GET()
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(payload).toEqual({
            user: {
                id: 'user-1',
                email: 'user@example.com',
                name: 'Calm User',
                avatarUrl: 'https://example.com/avatar.png',
            },
        })
    })
})
