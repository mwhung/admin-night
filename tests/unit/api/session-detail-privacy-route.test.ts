import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        workSession: {
            findUnique: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
    },
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { DELETE, GET, PATCH } from '@/app/api/sessions/[id]/route'

const ORIGINAL_INTERNAL_API_KEY = process.env.INTERNAL_API_KEY

describe('/api/sessions/[id] privacy behavior', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.workSession.findUnique.mockReset()
        prismaMock.workSession.update.mockReset()
        prismaMock.workSession.delete.mockReset()
        process.env.INTERNAL_API_KEY = 'test-internal-key'
    })

    afterEach(() => {
        process.env.INTERNAL_API_KEY = ORIGINAL_INTERNAL_API_KEY
    })

    it('returns 401 for unauthenticated non-internal requests', async () => {
        getCurrentUserMock.mockResolvedValue(null)

        const request = new NextRequest('http://localhost/api/sessions/session-1')
        const response = await GET(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(401)
    })

    it('returns aggregate-only session detail for authenticated users', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSession.findUnique.mockResolvedValue({
            id: 'session-1',
            scheduledStart: new Date('2026-02-08T10:00:00.000Z'),
            scheduledEnd: new Date('2026-02-08T10:25:00.000Z'),
            durationMinutes: 25,
            status: 'ACTIVE',
            participants: [
                {
                    userId: 'user-1',
                    joinedAt: new Date('2026-02-08T10:00:00.000Z'),
                    leftAt: null,
                },
                {
                    userId: 'user-2',
                    joinedAt: new Date('2026-02-08T10:02:00.000Z'),
                    leftAt: new Date('2026-02-08T10:05:00.000Z'),
                },
            ],
        })

        const request = new NextRequest('http://localhost/api/sessions/session-1')
        const response = await GET(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()

        expect(payload.session.participantCount).toBe(1)
        expect(payload.session.isParticipating).toBe(true)
        expect(payload.session.participants).toBeUndefined()
    })

    it('returns participant identifiers only for internal requests', async () => {
        getCurrentUserMock.mockResolvedValue(null)
        prismaMock.workSession.findUnique.mockResolvedValue({
            id: 'session-1',
            scheduledStart: new Date('2026-02-08T10:00:00.000Z'),
            scheduledEnd: new Date('2026-02-08T10:25:00.000Z'),
            durationMinutes: 25,
            status: 'ACTIVE',
            participants: [
                {
                    userId: 'user-1',
                    joinedAt: new Date('2026-02-08T10:00:00.000Z'),
                    leftAt: null,
                    user: {
                        id: 'user-1',
                        name: 'User One',
                        image: null,
                    },
                },
            ],
        })

        const request = new NextRequest('http://localhost/api/sessions/session-1', {
            headers: {
                'x-internal-api-key': 'test-internal-key',
            },
        })
        const response = await GET(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()

        expect(payload.session.participants).toEqual([
            {
                userId: 'user-1',
                userName: 'User One',
                userImage: null,
                joinedAt: '2026-02-08T10:00:00.000Z',
            },
        ])
    })

    it('rejects PATCH without internal api key', async () => {
        const request = new NextRequest('http://localhost/api/sessions/session-1', {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({ status: 'ACTIVE' }),
        })

        const response = await PATCH(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(403)
        expect(prismaMock.workSession.findUnique).not.toHaveBeenCalled()
        expect(prismaMock.workSession.update).not.toHaveBeenCalled()
    })

    it('rejects DELETE without internal api key', async () => {
        const request = new NextRequest('http://localhost/api/sessions/session-1', {
            method: 'DELETE',
        })

        const response = await DELETE(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(403)
        expect(prismaMock.workSession.findUnique).not.toHaveBeenCalled()
        expect(prismaMock.workSession.delete).not.toHaveBeenCalled()
    })
})
