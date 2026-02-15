import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        user: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
    },
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { GET, PATCH } from '@/app/api/user/preferences/route'

function buildPatchRequest(body: unknown) {
    return new Request('http://localhost/api/user/preferences', {
        method: 'PATCH',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(body),
    })
}

describe('/api/user/preferences route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.user.findUnique.mockReset()
        prismaMock.user.update.mockReset()
    })

    it('returns structured unauthorized error for GET', async () => {
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

    it('returns structured validation error for PATCH', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        const response = await PATCH(buildPatchRequest({ session_duration: '45' }))
        const payload = await response.json()

        expect(response.status).toBe(422)
        expect(payload).toMatchObject({
            error: {
                code: 'INVALID_PREFERENCES_PAYLOAD',
                message: 'Invalid preference payload.',
            },
        })
        expect(prismaMock.user.update).not.toHaveBeenCalled()
    })

    it('merges current preferences and updates only requested keys', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        prismaMock.user.findUnique.mockResolvedValue({
            preferences: {
                session_duration: 25,
                ambient_sound: false,
                completion_cues: true,
            },
        })
        prismaMock.user.update.mockResolvedValue({
            preferences: {
                session_duration: 45,
                ambient_sound: false,
                completion_cues: true,
            },
        })

        const response = await PATCH(buildPatchRequest({ session_duration: 45 }))
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: {
                preferences: {
                    session_duration: 45,
                    ambient_sound: false,
                    completion_cues: true,
                },
            },
        })
        expect(payload).toMatchObject({
            session_duration: 45,
            ambient_sound: false,
            completion_cues: true,
        })
    })

    it('accepts and merges soundscape preference fields', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        prismaMock.user.findUnique.mockResolvedValue({
            preferences: {
                soundscape_id: 'ledger-rain',
                soundscape_volume: 0.45,
                soundscape_shuffle: false,
                soundscape_loop_mode: 'all',
            },
        })
        prismaMock.user.update.mockResolvedValue({
            preferences: {
                soundscape_id: 'receipt-lab',
                soundscape_volume: 0.32,
                soundscape_shuffle: true,
                soundscape_loop_mode: 'single',
            },
        })

        const response = await PATCH(buildPatchRequest({
            soundscape_id: 'receipt-lab',
            soundscape_volume: 0.32,
            soundscape_shuffle: true,
            soundscape_loop_mode: 'single',
        }))
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: 'user-1' },
            data: {
                preferences: {
                    soundscape_id: 'receipt-lab',
                    soundscape_volume: 0.32,
                    soundscape_shuffle: true,
                    soundscape_loop_mode: 'single',
                },
            },
        })
        expect(payload).toMatchObject({
            soundscape_id: 'receipt-lab',
            soundscape_volume: 0.32,
            soundscape_shuffle: true,
            soundscape_loop_mode: 'single',
        })
    })
})
