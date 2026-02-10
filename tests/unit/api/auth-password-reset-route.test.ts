import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, createClientMock, resetPasswordForEmailMock } = vi.hoisted(() => {
    const resetPasswordMock = vi.fn()
    return {
        getCurrentUserMock: vi.fn(),
        createClientMock: vi.fn(),
        resetPasswordForEmailMock: resetPasswordMock,
    }
})

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/supabase/server', () => ({
    createClient: createClientMock,
}))

import { POST } from '@/app/api/auth/password-reset/route'

describe('/api/auth/password-reset route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        createClientMock.mockReset()
        resetPasswordForEmailMock.mockReset()
    })

    it('returns 401 when user is not authenticated', async () => {
        getCurrentUserMock.mockResolvedValue(null)

        const response = await POST()
        const payload = await response.json()

        expect(response.status).toBe(401)
        expect(payload).toMatchObject({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required.',
            },
        })
    })

    it('returns 400 when user has no email', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1', email: null })

        const response = await POST()
        const payload = await response.json()

        expect(response.status).toBe(400)
        expect(payload).toMatchObject({
            error: {
                code: 'MISSING_USER_EMAIL',
                message: 'No email is associated with this account.',
            },
        })
    })

    it('returns 400 when Supabase reset request fails', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1', email: 'user@example.com' })
        resetPasswordForEmailMock.mockResolvedValue({
            error: { message: 'Rate limit exceeded' },
        })
        createClientMock.mockResolvedValue({
            auth: {
                resetPasswordForEmail: resetPasswordForEmailMock,
            },
        })

        const response = await POST()
        const payload = await response.json()

        expect(response.status).toBe(400)
        expect(resetPasswordForEmailMock).toHaveBeenCalledWith('user@example.com')
        expect(payload).toMatchObject({
            error: {
                code: 'PASSWORD_RESET_REQUEST_FAILED',
                message: 'Rate limit exceeded',
            },
        })
    })

    it('returns success message when reset email is queued', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1', email: 'user@example.com' })
        resetPasswordForEmailMock.mockResolvedValue({ error: null })
        createClientMock.mockResolvedValue({
            auth: {
                resetPasswordForEmail: resetPasswordForEmailMock,
            },
        })

        const response = await POST()
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(payload).toEqual({
            message: 'Password reset email sent to user@example.com.',
        })
    })
})
