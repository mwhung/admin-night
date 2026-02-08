import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        $transaction: vi.fn(),
    },
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { POST } from '@/app/api/sessions/start/route'

const createRequest = (body: Record<string, unknown>) => (
    new NextRequest('http://localhost/api/sessions/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    })
)

describe('/api/sessions/start route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.$transaction.mockReset()
    })

    it('returns 401 when user is not authenticated', async () => {
        getCurrentUserMock.mockResolvedValue(null)

        const response = await POST(createRequest({
            durationMinutes: 25,
            selectedTasks: [],
        }))

        expect(response.status).toBe(401)
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('creates a session and returns task mappings in one response', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        const txMock = {
            workSession: {
                findFirst: vi.fn()
                    .mockResolvedValueOnce(null) // active session
                    .mockResolvedValueOnce(null), // scheduled window session
                create: vi.fn().mockResolvedValue({
                    id: 'session-1',
                    scheduledStart: new Date('2026-02-08T10:00:00.000Z'),
                    scheduledEnd: new Date('2026-02-08T10:25:00.000Z'),
                    durationMinutes: 25,
                    status: 'ACTIVE',
                }),
                update: vi.fn(),
            },
            workSessionParticipant: {
                findUnique: vi.fn().mockResolvedValue(null),
                create: vi.fn().mockResolvedValue({ id: 'participant-1' }),
                update: vi.fn(),
                count: vi.fn().mockResolvedValue(1),
            },
            task: {
                findMany: vi.fn().mockResolvedValue([
                    {
                        id: 'task-existing',
                        title: 'Existing Task',
                        state: 'IN_PROGRESS',
                    },
                ]),
                create: vi.fn().mockResolvedValue({
                    id: 'task-new',
                    title: 'Custom Task',
                    state: 'UNCLARIFIED',
                }),
            },
        }

        prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => unknown) => {
            return await callback(txMock)
        })

        const response = await POST(createRequest({
            durationMinutes: 25,
            selectedTasks: [
                { id: 'task-existing', title: 'Existing Task', completed: false },
                { id: 'custom-123', title: 'Custom Task', completed: false },
            ],
        }))

        expect(response.status).toBe(200)
        const payload = await response.json()

        expect(payload.session.id).toBe('session-1')
        expect(payload.session.status).toBe('ACTIVE')
        expect(payload.session.isParticipating).toBe(true)
        expect(payload.taskMappings).toEqual([
            {
                clientId: 'task-existing',
                taskId: 'task-existing',
                title: 'Existing Task',
                state: 'IN_PROGRESS',
            },
            {
                clientId: 'custom-123',
                taskId: 'task-new',
                title: 'Custom Task',
                state: 'UNCLARIFIED',
            },
        ])

        expect(txMock.workSession.create).toHaveBeenCalledTimes(1)
        expect(txMock.workSessionParticipant.create).toHaveBeenCalledTimes(1)
        expect(txMock.task.create).toHaveBeenCalledTimes(1)
    })
})
