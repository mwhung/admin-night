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
            aggregate: vi.fn(),
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
        prismaMock.workSessionParticipant.aggregate.mockReset()
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
                    tasksWorkedOn: ['task-1', 'task-1'],
                },
            ])
            .mockResolvedValueOnce([
                {
                    joinedAt: new Date('2026-02-09T12:00:00.000Z'),
                },
            ])

        prismaMock.workSessionParticipant.groupBy.mockResolvedValue([
            { sessionId: 'session-1', _count: { _all: 3 } },
        ])

        prismaMock.task.findMany
            .mockResolvedValueOnce([
                {
                    id: 'task-1',
                    title: 'Carry over unfinished task',
                    state: 'IN_PROGRESS',
                    createdAt: new Date('2026-02-01T00:00:00.000Z'),
                    resolvedAt: null,
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

        prismaMock.task.count
            .mockResolvedValueOnce(1)
            .mockResolvedValueOnce(2)

        prismaMock.workSessionParticipant.aggregate.mockResolvedValue({
            _sum: { focusDurationSeconds: 1500 },
            _count: { focusDurationSeconds: 2 },
        })

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
            totalResolved: 1,
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
        expect(prismaMock.workSessionParticipant.aggregate).not.toHaveBeenCalled()
        expect(prismaMock.workSessionParticipant.findMany).toHaveBeenCalledTimes(1)
    })
})
