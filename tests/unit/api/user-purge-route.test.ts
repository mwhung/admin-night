import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    prismaMock: {
        task: {
            deleteMany: vi.fn(),
        },
        workSessionParticipant: {
            deleteMany: vi.fn(),
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

import { DELETE } from '@/app/api/user/purge/route'

describe('/api/user/purge route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.task.deleteMany.mockReset()
        prismaMock.workSessionParticipant.deleteMany.mockReset()
        prismaMock.$transaction.mockReset()
    })

    it('returns structured unauthorized error when user is not authenticated', async () => {
        getCurrentUserMock.mockResolvedValue(null)

        const response = await DELETE()
        const payload = await response.json()

        expect(response.status).toBe(401)
        expect(payload).toMatchObject({
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required.',
            },
        })
    })

    it('returns deleted counts when purge succeeds', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.task.deleteMany.mockResolvedValue({ count: 4 })
        prismaMock.workSessionParticipant.deleteMany.mockResolvedValue({ count: 7 })
        prismaMock.$transaction.mockResolvedValue([
            { count: 4 },
            { count: 7 },
        ])

        const response = await DELETE()
        const payload = await response.json()

        expect(response.status).toBe(200)
        expect(prismaMock.task.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
        expect(prismaMock.workSessionParticipant.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } })
        expect(payload).toEqual({
            deleted: {
                tasks: 4,
                sessionParticipations: 7,
            },
        })
    })

    it('returns structured 500 error when purge fails', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })
        prismaMock.task.deleteMany.mockResolvedValue({ count: 1 })
        prismaMock.workSessionParticipant.deleteMany.mockResolvedValue({ count: 1 })
        prismaMock.$transaction.mockRejectedValue(new Error('db down'))

        const response = await DELETE()
        const payload = await response.json()

        expect(response.status).toBe(500)
        expect(payload).toMatchObject({
            error: {
                code: 'PURGE_FAILED',
                message: 'Failed to purge user history.',
            },
        })
    })
})
