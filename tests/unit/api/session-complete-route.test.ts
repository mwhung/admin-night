import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getCurrentUserMock, prismaMock, generateSessionSummaryMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    generateSessionSummaryMock: vi.fn(),
    prismaMock: {
        workSessionParticipant: {
            findUnique: vi.fn(),
            update: vi.fn(),
        },
        userAchievement: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
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

import { POST } from '@/app/api/sessions/[id]/complete/route'

const createRequest = (body: Record<string, unknown>) => (
    new NextRequest('http://localhost/api/sessions/session-1/complete', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
    })
)

describe('/api/sessions/[id]/complete route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        generateSessionSummaryMock.mockReset()
        prismaMock.workSessionParticipant.findUnique.mockReset()
        prismaMock.workSessionParticipant.update.mockReset()
        prismaMock.userAchievement.findMany.mockReset()
        prismaMock.userAchievement.create.mockReset()
    })

    it('returns existing summary when session completion was already finalized', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            userId: 'user-1',
            sessionId: 'session-1',
            joinedAt: new Date('2026-02-08T10:00:00.000Z'),
            leftAt: new Date('2026-02-08T10:25:00.000Z'),
            achievementSummary: 'Existing completion summary',
            session: {
                id: 'session-1',
            },
        })

        const response = await POST(createRequest({
            actualDurationSeconds: 1500,
            totalPauseSeconds: 0,
            pauseCount: 0,
            tasksCompletedCount: 1,
            tasksWorkedOn: ['task-1'],
        }), {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.alreadyCompleted).toBe(true)
        expect(payload.summary).toBe('Existing completion summary')
        expect(prismaMock.workSessionParticipant.update).not.toHaveBeenCalled()
        expect(generateSessionSummaryMock).not.toHaveBeenCalled()
    })

    it('treats unique-constraint duplicates as safe retries', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            userId: 'user-1',
            sessionId: 'session-1',
            joinedAt: new Date('2026-02-08T10:00:00.000Z'),
            leftAt: null,
            achievementSummary: null,
            session: {
                id: 'session-1',
            },
        })
        prismaMock.userAchievement.findMany.mockResolvedValue([])
        prismaMock.userAchievement.create.mockRejectedValue({
            code: 'P2002',
        })
        prismaMock.workSessionParticipant.update.mockResolvedValue({})
        generateSessionSummaryMock.mockResolvedValue('Generated completion summary')

        const response = await POST(createRequest({
            actualDurationSeconds: 1800,
            totalPauseSeconds: 0,
            pauseCount: 0,
            tasksCompletedCount: 2,
            tasksWorkedOn: ['task-1', 'task-2'],
        }), {
            params: Promise.resolve({ id: 'session-1' }),
        })

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.success).toBe(true)
        expect(payload.newAchievements).toEqual([])
        expect(payload.summary).toBe('Generated completion summary')
        expect(prismaMock.workSessionParticipant.update).toHaveBeenCalledTimes(2)
    })

    it('returns 400 for invalid stats payload', async () => {
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
