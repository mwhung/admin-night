import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        workSession: {
            findUnique: vi.fn(),
        },
        workSessionParticipant: {
            findUnique: vi.fn(),
        },
        $transaction: vi.fn(),
    },
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { POST } from '@/app/api/sessions/[id]/leave/route'

describe('/api/sessions/[id]/leave route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.workSession.findUnique.mockReset()
        prismaMock.workSessionParticipant.findUnique.mockReset()
        prismaMock.$transaction.mockReset()
    })

    it('returns success when leave was already recorded', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSession.findUnique.mockResolvedValue({ id: 'session-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            leftAt: new Date('2026-02-08T11:00:00.000Z'),
        })

        const txMock = {
            workSessionParticipant: {
                updateMany: vi.fn().mockResolvedValue({ count: 0 }),
                count: vi.fn().mockResolvedValue(0),
            },
            workSession: {
                updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            },
        }
        prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => unknown) => {
            return await callback(txMock)
        })

        const request = new NextRequest('http://localhost/api/sessions/session-1/leave', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tasksWorkedOn: ['task-1'] }),
        })

        const response = await POST(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.success).toBe(true)
        expect(payload.alreadyLeft).toBe(true)
        expect(txMock.workSessionParticipant.updateMany).toHaveBeenCalledTimes(1)
    })

    it('records leave and transitions active session when user is last participant', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSession.findUnique.mockResolvedValue({ id: 'session-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            leftAt: null,
        })

        const txMock = {
            workSessionParticipant: {
                updateMany: vi.fn().mockResolvedValue({ count: 1 }),
                count: vi.fn().mockResolvedValue(0),
            },
            workSession: {
                updateMany: vi.fn().mockResolvedValue({ count: 1 }),
            },
        }
        prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => unknown) => {
            return await callback(txMock)
        })

        const request = new NextRequest('http://localhost/api/sessions/session-1/leave', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ tasksWorkedOn: ['task-1', 'task-2'] }),
        })

        const response = await POST(request, {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.success).toBe(true)
        expect(payload.alreadyLeft).toBe(false)
        expect(payload.participantCount).toBe(0)
        expect(txMock.workSession.updateMany).toHaveBeenCalledTimes(1)
    })

    it('returns 404 when session is missing', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSession.findUnique.mockResolvedValue(null)

        const request = new NextRequest('http://localhost/api/sessions/missing/leave', {
            method: 'POST',
        })

        const response = await POST(request, {
            params: Promise.resolve({ id: 'missing' }),
        })

        expect(response.status).toBe(404)
        expect(prismaMock.workSessionParticipant.findUnique).not.toHaveBeenCalled()
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })
})
