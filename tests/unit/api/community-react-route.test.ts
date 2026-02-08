import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const { getCurrentUserMock, prismaMock } = vi.hoisted(() => {
    process.env.ENABLE_COMMUNITY_REACTION_WRITES = 'false'

    return {
        getCurrentUserMock: vi.fn(),
        prismaMock: {
            workSessionParticipant: {
                findFirst: vi.fn(),
            },
            communityReaction: {
                findMany: vi.fn(),
            },
            communitySessionReaction: {
                findMany: vi.fn(),
            },
            $transaction: vi.fn(),
        },
    }
})

vi.mock('@/lib/auth-utils', () => ({
    getCurrentUser: getCurrentUserMock,
}))

vi.mock('@/lib/db', () => ({
    prisma: prismaMock,
}))

import { GET, POST } from '@/app/api/community/react/route'

describe('/api/community/react route', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReset()
        prismaMock.workSessionParticipant.findFirst.mockReset()
        prismaMock.communityReaction.findMany.mockReset()
        prismaMock.communitySessionReaction.findMany.mockReset()
        prismaMock.$transaction.mockReset()
    })

    it('returns 503 when reaction writes are disabled', async () => {
        getCurrentUserMock.mockResolvedValue({ id: 'user-1' })

        const request = new NextRequest('http://localhost/api/community/react', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ type: 'clap' }),
        })

        const response = await POST(request)
        expect(response.status).toBe(503)

        const payload = await response.json()
        expect(payload).toMatchObject({
            code: 'REACTION_WRITES_DISABLED',
        })
        expect(getCurrentUserMock).not.toHaveBeenCalled()
        expect(prismaMock.$transaction).not.toHaveBeenCalled()
    })

    it('returns session reactions when querying with sessionId', async () => {
        prismaMock.communityReaction.findMany.mockResolvedValue([{ type: 'clap', count: 5 }])
        prismaMock.communitySessionReaction.findMany.mockResolvedValue([{ type: 'fire', count: 2 }])

        const request = new NextRequest('http://localhost/api/community/react?sessionId=session-2')
        const response = await GET(request)
        expect(response.status).toBe(200)

        const payload = await response.json()
        expect(payload.scope).toBe('session')
        expect(payload.dailyReactions).toEqual({
            clap: 5,
            fire: 0,
            leaf: 0,
        })
        expect(payload.reactions).toEqual({
            clap: 0,
            fire: 2,
            leaf: 0,
        })
    })
})
