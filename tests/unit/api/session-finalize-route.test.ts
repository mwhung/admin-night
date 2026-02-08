import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getCurrentUserMock, prismaMock, generateSessionSummaryMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    generateSessionSummaryMock: vi.fn(),
    prismaMock: {
        workSessionParticipant: {
            findUnique: vi.fn(),
            updateMany: vi.fn(),
        },
        workSession: {
            updateMany: vi.fn(),
        },
        userAchievement: {
            findMany: vi.fn(),
            create: vi.fn(),
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

vi.mock('@/lib/ai/summary-generator', () => ({
    generateSessionSummary: generateSessionSummaryMock,
}))

vi.mock('@/lib/achievements/definitions', () => ({
    ACHIEVEMENTS: [
        {
            id: 'unbroken_focus',
            title: 'Unbroken Focus',
            description: 'No pauses for 20 minutes',
            triggerType: 'post_session',
        },
        {
            id: 'night_owl',
            title: 'Night Owl',
            description: 'Finished between midnight and five',
            triggerType: 'post_session',
        },
    ],
    getRandomHumor: vi.fn().mockReturnValue('dry humor'),
}))

import { POST } from '@/app/api/sessions/[id]/finalize/route'

const createRequest = (body: Record<string, unknown>) => (
    new NextRequest('http://localhost/api/sessions/session-1/finalize', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    })
)

describe('/api/sessions/[id]/finalize route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        generateSessionSummaryMock.mockReset()
        prismaMock.workSessionParticipant.findUnique.mockReset()
        prismaMock.workSessionParticipant.updateMany.mockReset()
        prismaMock.workSession.updateMany.mockReset()
        prismaMock.userAchievement.findMany.mockReset()
        prismaMock.userAchievement.create.mockReset()
        prismaMock.$transaction.mockReset()
    })

    it('finalizes session in one request with leave + summary', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSessionParticipant.findUnique
            .mockResolvedValueOnce({
                id: 'participant-1',
                joinedAt: new Date('2026-02-08T18:00:00.000Z'),
                leftAt: null,
                achievementSummary: null,
            })
            .mockResolvedValueOnce({
                id: 'participant-1',
                joinedAt: new Date('2026-02-08T18:00:00.000Z'),
                leftAt: new Date('2026-02-08T18:25:00.000Z'),
                achievementSummary: null,
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
        prismaMock.userAchievement.findMany.mockResolvedValue([])
        prismaMock.userAchievement.create.mockResolvedValue({})
        prismaMock.workSessionParticipant.updateMany.mockResolvedValue({ count: 1 })
        generateSessionSummaryMock.mockResolvedValue('Finalized summary')

        const response = await POST(createRequest({
            actualDurationSeconds: 1800,
            totalPauseSeconds: 0,
            pauseCount: 0,
            tasksCompletedCount: 1,
            tasksWorkedOn: ['task-1'],
        }), {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.success).toBe(true)
        expect(payload.alreadyLeft).toBe(false)
        expect(payload.alreadyCompleted).toBe(false)
        expect(payload.participantCount).toBe(0)
        expect(payload.summary).toBe('Finalized summary')
        expect(payload.newAchievements).toContain('Unbroken Focus')
        expect(prismaMock.$transaction).toHaveBeenCalledTimes(1)
        expect(prismaMock.userAchievement.create).toHaveBeenCalled()
    })

    it('returns fast when session is already finalized', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            joinedAt: new Date('2026-02-08T18:00:00.000Z'),
            leftAt: new Date('2026-02-08T18:25:00.000Z'),
            achievementSummary: 'Existing finalized summary',
        })

        const response = await POST(createRequest({
            actualDurationSeconds: 1800,
            totalPauseSeconds: 0,
            pauseCount: 0,
            tasksCompletedCount: 1,
            tasksWorkedOn: ['task-1'],
        }), {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.success).toBe(true)
        expect(payload.alreadyLeft).toBe(true)
        expect(payload.alreadyCompleted).toBe(true)
        expect(payload.summary).toBe('Existing finalized summary')
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
        expect(generateSessionSummaryMock).not.toHaveBeenCalled()
    })

    it('returns 400 for invalid payload', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        const response = await POST(createRequest({
            pauseCount: -1,
            tasksCompletedCount: 0,
        }), {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(400)
        expect(prismaMock.workSessionParticipant.findUnique).not.toHaveBeenCalled()
    })
})
