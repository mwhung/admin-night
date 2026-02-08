import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        workSessionParticipant: {
            findUnique: vi.fn(),
        },
        task: {
            findMany: vi.fn(),
        },
        userAchievement: {
            count: vi.fn(),
        },
    },
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { GET } from '@/app/api/sessions/[id]/summary/route'

describe('/api/sessions/[id]/summary route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.workSessionParticipant.findUnique.mockReset()
        prismaMock.task.findMany.mockReset()
        prismaMock.userAchievement.count.mockReset()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('prefers stored focusDurationSeconds over joinedAt-leftAt difference', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            sessionId: 'session-1',
            joinedAt: new Date('2026-02-08T10:00:00.000Z'),
            leftAt: new Date('2026-02-08T10:40:00.000Z'),
            focusDurationSeconds: 1200,
            tasksWorkedOn: ['task-1'],
            achievementSummary: 'Great focus today.',
        })
        prismaMock.task.findMany.mockResolvedValue([
            {
                id: 'task-1',
                title: 'Reply to inbox',
                state: 'RESOLVED',
            },
        ])
        prismaMock.userAchievement.count.mockResolvedValue(2)

        const response = await GET(
            new Request('http://localhost/api/sessions/session-1/summary'),
            { params: Promise.resolve({ id: 'session-1' }) },
        )

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.summary.elapsedSeconds).toBe(1200)
        expect(payload.summary.newAchievementCount).toBe(2)
        expect(payload.summary.tasks).toEqual([
            {
                id: 'task-1',
                title: 'Reply to inbox',
                completed: true,
            },
        ])
    })

    it('falls back to joinedAt-leftAt when focusDurationSeconds is missing', async () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-02-08T10:10:30.000Z'))

        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.workSessionParticipant.findUnique.mockResolvedValue({
            sessionId: 'session-1',
            joinedAt: new Date('2026-02-08T10:05:00.000Z'),
            leftAt: null,
            focusDurationSeconds: null,
            tasksWorkedOn: [],
            achievementSummary: '',
        })
        prismaMock.userAchievement.count.mockResolvedValue(0)

        const response = await GET(
            new Request('http://localhost/api/sessions/session-1/summary'),
            { params: Promise.resolve({ id: 'session-1' }) },
        )

        expect(response.status).toBe(200)
        const payload = await response.json()
        expect(payload.summary.elapsedSeconds).toBe(330)
    })
})
