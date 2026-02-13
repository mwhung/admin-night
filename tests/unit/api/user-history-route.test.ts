import type { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        task: {
            findMany: vi.fn(),
            count: vi.fn(),
        },
        workSessionParticipant: {
            count: vi.fn(),
            findMany: vi.fn(),
            groupBy: vi.fn(),
        },
    },
}))

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { GET } from '@/app/api/user/history/route'

function buildRequest(search = ''): NextRequest {
    return new Request(`http://localhost/api/user/history${search}`) as unknown as NextRequest
}

describe('/api/user/history route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.task.findMany.mockReset()
        prismaMock.task.count.mockReset()
        prismaMock.workSessionParticipant.count.mockReset()
        prismaMock.workSessionParticipant.findMany.mockReset()
        prismaMock.workSessionParticipant.groupBy.mockReset()
    })

    it('returns 401 when user is not authenticated', async () => {
        getCurrentUserMock.mockResolvedValue(null)

        const response = await GET(buildRequest())

        expect(response.status).toBe(401)
        expect(prismaMock.workSessionParticipant.count).not.toHaveBeenCalled()
    })

    it('returns paginated history with overview data on the first page', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        prismaMock.workSessionParticipant.count.mockResolvedValue(2)
        prismaMock.workSessionParticipant.findMany
            .mockResolvedValueOnce([
                {
                    id: 'p-1',
                    sessionId: 'session-1',
                    joinedAt: new Date('2026-02-09T12:00:00.000Z'),
                    leftAt: new Date('2026-02-09T12:25:00.000Z'),
                    tasksWorkedOn: ['task-1', 'task-3', 'task-4'],
                },
            ])
            .mockResolvedValueOnce([
                {
                    joinedAt: new Date('2026-02-09T12:00:00.000Z'),
                },
            ])
            .mockResolvedValueOnce([
                {
                    sessionId: 'session-1',
                    joinedAt: new Date('2026-02-09T12:00:00.000Z'),
                    leftAt: new Date('2026-02-09T12:25:00.000Z'),
                    focusDurationSeconds: 0,
                    tasksWorkedOn: ['task-1', 'task-3', 'task-4'],
                },
                {
                    sessionId: 'session-3',
                    joinedAt: new Date('2026-02-10T12:00:00.000Z'),
                    leftAt: null,
                    focusDurationSeconds: 0,
                    tasksWorkedOn: ['task-2'],
                },
            ])

        prismaMock.workSessionParticipant.groupBy.mockResolvedValue([
            { sessionId: 'session-1', _count: { _all: 3 } },
        ]).mockResolvedValueOnce([
            { sessionId: 'session-1', _count: { _all: 3 } },
        ]).mockResolvedValueOnce([
            { sessionId: 'session-1', _count: { _all: 3 } },
            { sessionId: 'session-3', _count: { _all: 2 } },
        ])

        prismaMock.task.findMany
            .mockResolvedValueOnce([
                {
                    id: 'task-1',
                    title: 'Pay utility bill',
                    state: 'RESOLVED',
                    createdAt: new Date('2026-02-01T00:00:00.000Z'),
                    resolvedAt: new Date('2026-02-09T12:08:00.000Z'),
                },
            ])
            .mockResolvedValueOnce([
                {
                    id: 'task-1',
                    title: 'Carry over unfinished task',
                    state: 'IN_PROGRESS',
                    createdAt: new Date('2026-02-01T00:00:00.000Z'),
                    resolvedAt: null,
                },
                {
                    id: 'task-2',
                    title: 'Another pending task',
                    state: 'CLARIFIED',
                    createdAt: new Date('2026-02-02T00:00:00.000Z'),
                    resolvedAt: null,
                },
            ])
            .mockResolvedValueOnce([
                {
                    id: 'task-1',
                    title: 'Pay utility bill',
                    state: 'RESOLVED',
                    createdAt: new Date('2026-02-01T00:00:00.000Z'),
                    resolvedAt: new Date('2026-02-09T12:08:00.000Z'),
                },
                {
                    id: 'task-3',
                    title: 'Reply overdue email',
                    state: 'RESOLVED',
                    createdAt: new Date('2026-02-04T00:00:00.000Z'),
                    resolvedAt: new Date('2026-02-09T12:15:00.000Z'),
                },
                {
                    id: 'task-4',
                    title: 'Submit tax form',
                    state: 'RESOLVED',
                    createdAt: new Date('2026-02-05T00:00:00.000Z'),
                    resolvedAt: new Date('2026-02-09T12:20:00.000Z'),
                },
            ])

        prismaMock.task.count
            .mockResolvedValueOnce(3)
            .mockResolvedValueOnce(2)

        const response = await GET(buildRequest('?page=1&limit=1'))
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(payload.pagination).toMatchObject({
            page: 1,
            limit: 1,
            hasMore: true,
            totalSessions: 2,
        })
        expect(payload.stats).toMatchObject({
            totalResolved: 3,
            totalPending: 2,
            totalFocusMinutes: 25,
            totalSessions: 2,
        })
        expect(payload.stats.dailyActivity).toMatchObject({
            '2026-02-09': 1,
        })
        expect(payload.historyGroups).toHaveLength(1)
        expect(payload.historyGroups[0].tasks.map((task: { id: string }) => task.id)).toEqual(['task-1'])
        expect(payload.pendingTasks).toHaveLength(2)
        expect(prismaMock.workSessionParticipant.findMany).toHaveBeenCalledTimes(3)
        expect(payload.stats.peakSessionWindow).toMatchObject({
            sessionCount: 1,
        })
        expect(typeof payload.stats.peakSessionWindow.dayLabel).toBe('string')
        expect(typeof payload.stats.peakSessionWindow.startHour).toBe('number')
        expect(payload.stats.peakSessionWindow.endHour).toBe((payload.stats.peakSessionWindow.startHour + 1) % 24)
        expect(payload.stats.collaborationEnergy).toMatchObject({
            cumulativeOthersPresent: 3,
            maxParticipantsInSession: 3,
        })
        expect(payload.stats.fastestTripleReleaseSession).toMatchObject({
            sessionId: 'session-1',
            durationMinutes: 25,
            resolvedTaskCount: 3,
        })
        expect(payload.stats.resolvedTaskTypeBreakdown).toEqual(expect.arrayContaining([
            { type: 'Finance & Bills', count: 2 },
            { type: 'Email & Follow-ups', count: 1 },
        ]))
    })

    it('returns only history groups when includeOverview=false', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        prismaMock.workSessionParticipant.count.mockResolvedValue(2)
        prismaMock.workSessionParticipant.findMany.mockResolvedValueOnce([
            {
                id: 'p-2',
                sessionId: 'session-2',
                joinedAt: new Date('2026-02-08T12:00:00.000Z'),
                leftAt: new Date('2026-02-08T12:25:00.000Z'),
                tasksWorkedOn: ['task-2'],
            },
        ])
        prismaMock.workSessionParticipant.groupBy.mockResolvedValue([
            { sessionId: 'session-2', _count: { _all: 2 } },
        ])

        prismaMock.task.findMany.mockResolvedValueOnce([
            {
                id: 'task-2',
                title: 'Another pending task',
                state: 'CLARIFIED',
                createdAt: new Date('2026-02-02T00:00:00.000Z'),
                resolvedAt: null,
            },
        ])

        const response = await GET(buildRequest('?page=2&limit=1&includeOverview=false'))
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(payload.pagination).toMatchObject({
            page: 2,
            limit: 1,
            hasMore: false,
            totalSessions: 2,
        })
        expect(payload.historyGroups).toHaveLength(1)
        expect(payload.stats).toBeUndefined()
        expect(payload.pendingTasks).toBeUndefined()
        expect(prismaMock.task.count).not.toHaveBeenCalled()
        expect(prismaMock.workSessionParticipant.findMany).toHaveBeenCalledTimes(1)
    })
})
