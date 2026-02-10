import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const {
    useAuthMock,
    createClientMock,
    updateUserMock,
    signOutMock,
} = vi.hoisted(() => {
    const updateMock = vi.fn()
    const signOutAuthMock = vi.fn()
    return {
        useAuthMock: vi.fn(),
        createClientMock: vi.fn(),
        updateUserMock: updateMock,
        signOutMock: signOutAuthMock,
    }
})

vi.mock('@/lib/hooks/useAuth', () => ({
    useAuth: useAuthMock,
}))

vi.mock('@/lib/supabase/client', () => ({
    createClient: createClientMock,
}))

import AccountSettingsPage from '@/app/(app)/settings/account/page'

describe('AccountSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()

        useAuthMock.mockReturnValue({
            loading: false,
            user: {
                id: 'user-1',
                email: 'tester@example.com',
                user_metadata: {
                    name: 'E2E Tester',
                },
            },
        })

        updateUserMock.mockResolvedValue({ error: null })
        signOutMock.mockResolvedValue({ error: { message: 'Sign-out blocked in test.' } })
        createClientMock.mockReturnValue({
            auth: {
                updateUser: updateUserMock,
                signOut: signOutMock,
            },
        })

        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                message: 'Password reset email sent to tester@example.com.',
            }),
        }))
    })

    it('renders guest placeholder when user is not authenticated', () => {
        useAuthMock.mockReturnValue({
            loading: false,
            user: null,
        })

        render(<AccountSettingsPage />)

        expect(screen.getByText(/Account and security controls are available for registered members/i)).toBeTruthy()
    })

    it('updates display name through Supabase auth.updateUser', async () => {
        render(<AccountSettingsPage />)

        const input = screen.getByLabelText(/Display Name/i)
        fireEvent.change(input, { target: { value: '  New Calm Name  ' } })
        fireEvent.click(screen.getByRole('button', { name: /Save Profile/i }))

        await waitFor(() => {
            expect(updateUserMock).toHaveBeenCalledWith({
                data: {
                    name: 'New Calm Name',
                },
            })
        })

        expect(screen.getByText(/Profile updated successfully/i)).toBeTruthy()
    })

    it('requests password reset email via API route', async () => {
        const fetchMock = vi.mocked(fetch)

        render(<AccountSettingsPage />)
        fireEvent.click(screen.getByRole('button', { name: /Send Password Reset Email/i }))

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith('/api/auth/password-reset', { method: 'POST' })
        })

        expect(screen.getByText(/Password reset email sent to tester@example.com/i)).toBeTruthy()
    })

    it('calls global sign-out scope when clicking all-devices sign out', async () => {
        render(<AccountSettingsPage />)

        fireEvent.click(screen.getByRole('button', { name: /Sign Out All Devices/i }))

        await waitFor(() => {
            expect(signOutMock).toHaveBeenCalledWith({ scope: 'global' })
        })
        expect(screen.getByText(/Sign-out blocked in test/i)).toBeTruthy()
    })
})
