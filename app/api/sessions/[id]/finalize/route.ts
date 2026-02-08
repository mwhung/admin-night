import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { ACHIEVEMENTS, getRandomHumor } from '@/lib/achievements/definitions'
import { generateSessionSummary } from '@/lib/ai/summary-generator'
import { completeSessionSchema } from '@/lib/contracts/session'

const isPrismaUniqueConstraintError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false
    if (!('code' in error)) return false
    return error.code === 'P2002'
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser()
        if (!user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id: sessionId } = await params

        let body: Record<string, unknown> = {}
        try {
            body = await request.json() as Record<string, unknown>
        } catch {
            body = {}
        }

        const normalized = {
            actualDurationSeconds:
                body.actualDurationSeconds ??
                (typeof body.durationMinutes === 'number'
                    ? body.durationMinutes * 60
                    : 0),
            totalPauseSeconds: body.totalPauseSeconds ?? 0,
            pauseCount: body.pauseCount ?? 0,
            tasksCompletedCount:
                body.tasksCompletedCount ??
                (typeof body.tasksCompleted === 'number' ? body.tasksCompleted : 0),
            tasksWorkedOn: body.tasksWorkedOn,
        }

        const stats = completeSessionSchema.parse(normalized)
        const persistedDurationSeconds = Math.max(0, Math.floor(stats.actualDurationSeconds))

        const participant = await prisma.workSessionParticipant.findUnique({
            where: {
                sessionId_userId: {
                    sessionId,
                    userId: user.id,
                },
            },
            select: {
                id: true,
                joinedAt: true,
                leftAt: true,
                achievementSummary: true,
            },
        })

        if (!participant) {
            return NextResponse.json(
                { error: 'Session not found or user not participating' },
                { status: 404 }
            )
        }

        if (participant.leftAt && participant.achievementSummary) {
            return NextResponse.json({
                success: true,
                alreadyLeft: true,
                alreadyCompleted: true,
                participantCount: 0,
                newAchievements: [],
                summary: participant.achievementSummary,
            })
        }

        const now = new Date()
        const { remainingCount, alreadyLeft } = await prisma.$transaction(async (tx) => {
            const leaveUpdate = await tx.workSessionParticipant.updateMany({
                where: {
                    id: participant.id,
                    leftAt: null,
                },
                data: {
                    leftAt: now,
                    focusDurationSeconds: persistedDurationSeconds,
                    tasksWorkedOn: Array.isArray(stats.tasksWorkedOn) && stats.tasksWorkedOn.length > 0
                        ? stats.tasksWorkedOn
                        : undefined,
                },
            })

            const activeCount = await tx.workSessionParticipant.count({
                where: {
                    sessionId,
                    leftAt: null,
                },
            })

            if (activeCount === 0) {
                await tx.workSession.updateMany({
                    where: {
                        id: sessionId,
                        status: 'ACTIVE',
                    },
                    data: { status: 'COMPLETED' },
                })
            }

            return {
                remainingCount: activeCount,
                alreadyLeft: leaveUpdate.count === 0,
            }
        })

        await prisma.workSessionParticipant.update({
            where: { id: participant.id },
            data: {
                focusDurationSeconds: persistedDurationSeconds,
                tasksWorkedOn: Array.isArray(stats.tasksWorkedOn) && stats.tasksWorkedOn.length > 0
                    ? stats.tasksWorkedOn
                    : undefined,
            },
        })

        const participantAfterLeave = await prisma.workSessionParticipant.findUnique({
            where: { id: participant.id },
            select: {
                id: true,
                joinedAt: true,
                leftAt: true,
                achievementSummary: true,
            },
        })

        if (!participantAfterLeave) {
            return NextResponse.json({ error: 'Failed to finalize session' }, { status: 500 })
        }

        if (participantAfterLeave.achievementSummary) {
            return NextResponse.json({
                success: true,
                alreadyLeft,
                alreadyCompleted: true,
                participantCount: remainingCount,
                newAchievements: [],
                summary: participantAfterLeave.achievementSummary,
            })
        }

        const sessionContext = {
            durationMinutes: stats.actualDurationSeconds / 60,
            pauseCount: stats.pauseCount,
            startTime: participantAfterLeave.joinedAt,
            endTime: participantAfterLeave.leftAt ?? new Date(),
            tasksCompleted: stats.tasksCompletedCount,
        }

        const candidates = ACHIEVEMENTS.filter((achievement) => achievement.triggerType === 'post_session')
        const unlockedCandidates = []

        for (const achievement of candidates) {
            let unlocked = false

            if (achievement.id === 'night_owl') {
                const hour = sessionContext.endTime.getHours()
                if (hour >= 0 && hour < 5) unlocked = true
            } else if (achievement.id === 'unbroken_focus') {
                if (sessionContext.pauseCount === 0 && sessionContext.durationMinutes >= 20) unlocked = true
            }

            if (unlocked) {
                unlockedCandidates.push(achievement)
            }
        }

        const unlockedAchievementIds = unlockedCandidates.map((achievement) => achievement.id)
        const existingAchievements = unlockedAchievementIds.length > 0
            ? await prisma.userAchievement.findMany({
                where: {
                    userId: user.id,
                    achievementId: { in: unlockedAchievementIds },
                },
                select: {
                    achievementId: true,
                },
            })
            : []
        const existingAchievementSet = new Set(existingAchievements.map((achievement) => achievement.achievementId))
        const newUnlockedAchievements = []

        for (const achievement of unlockedCandidates) {
            if (existingAchievementSet.has(achievement.id)) continue

            try {
                await prisma.userAchievement.create({
                    data: {
                        userId: user.id,
                        achievementId: achievement.id,
                        sessionId,
                        unlockedSource: 'post_session',
                        evidenceSnapshot: achievement.description,
                        humorSnapshot: getRandomHumor(achievement.id),
                    },
                })
                newUnlockedAchievements.push(achievement.title)
            } catch (createError) {
                if (!isPrismaUniqueConstraintError(createError)) {
                    throw createError
                }
            }
        }

        const generatedSummary = await generateSessionSummary({
            durationMinutes: Math.round(sessionContext.durationMinutes),
            tasksCompleted: sessionContext.tasksCompleted,
            pauseCount: sessionContext.pauseCount,
            newAchievements: newUnlockedAchievements,
        })

        const saveSummaryResult = await prisma.workSessionParticipant.updateMany({
            where: {
                id: participantAfterLeave.id,
                achievementSummary: null,
            },
            data: {
                achievementSummary: generatedSummary,
            },
        })

        let finalSummary = generatedSummary
        let alreadyCompleted = false
        if (saveSummaryResult.count === 0) {
            const existingSummary = await prisma.workSessionParticipant.findUnique({
                where: { id: participantAfterLeave.id },
                select: { achievementSummary: true },
            })
            if (existingSummary?.achievementSummary) {
                finalSummary = existingSummary.achievementSummary
                alreadyCompleted = true
            }
        }

        return NextResponse.json({
            success: true,
            alreadyLeft,
            alreadyCompleted,
            participantCount: remainingCount,
            newAchievements: newUnlockedAchievements,
            summary: finalSummary,
        })
    } catch (error) {
        console.error('Session Finalize Error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid stats data' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
