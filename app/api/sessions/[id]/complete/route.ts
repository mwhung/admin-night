
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/db'
import { ACHIEVEMENTS, getRandomHumor } from '@/lib/achievements/definitions'
import { generateSessionSummary } from '@/lib/ai/summary-generator'
import { completeSessionSchema } from '@/lib/contracts/session'
import { z } from 'zod'

const isPrismaUniqueConstraintError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false
    if (!('code' in error)) return false
    return error.code === 'P2002'
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Params is a Promise in Next 15
) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
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

        // 1. Fetch Session & Participant Record
        const participant = await prisma.workSessionParticipant.findUnique({
            where: {
                sessionId_userId: {
                    sessionId: id,
                    userId: user.id
                }
            },
            include: {
                session: true
            }
        })

        if (!participant) {
            return NextResponse.json({ error: 'Session not found or user not participating' }, { status: 404 })
        }

        if (participant.leftAt && participant.achievementSummary) {
            return NextResponse.json({
                success: true,
                alreadyCompleted: true,
                newAchievements: [],
                summary: participant.achievementSummary,
            })
        }

        // 2. Update Participant Stats (Mark as completed logically)
        // In a real app, we might update `leftAt` here if not already set, 
        // or we might trust the client's `actualDuration`.
        // For now, we update the participant entry with the final stats if we had columns for them.
        // Since we don't store granular stats in `WorkSessionParticipant` yet (schema limitation),
        // we will just use them for achievement calculation.

        // (Optional: Update leftAt if null)
        if (!participant.leftAt) {
            await prisma.workSessionParticipant.update({
                where: { id: participant.id },
                data: { leftAt: new Date() }
            })
        }

        // 3. Check Post-Session Achievements
        const newUnlockedAchievements = []

        // Context for logic checks
        const sessionContext = {
            durationMinutes: stats.actualDurationSeconds / 60,
            pauseCount: stats.pauseCount,
            startTime: participant.joinedAt,
            endTime: new Date(),
            tasksCompleted: stats.tasksCompletedCount
        }

        // Filter for post_session types
        const candidates = ACHIEVEMENTS.filter(a => a.triggerType === 'post_session')

        const unlockedCandidates = []

        // Evaluate each candidate
        for (const ach of candidates) {
            let unlocked = false

            // Hardcoded logic mapping (since logic is in code)
            // Implementation Detail: In a bigger app, we might use a strategy pattern or map.
            if (ach.id === 'night_owl') {
                const hour = sessionContext.endTime.getHours()
                if (hour >= 0 && hour < 5) unlocked = true
            }
            else if (ach.id === 'unbroken_focus') {
                if (sessionContext.pauseCount === 0 && sessionContext.durationMinutes >= 20) unlocked = true
            }
            // Add more conditions here...

            if (unlocked) {
                unlockedCandidates.push(ach)
            }
        }

        const unlockedAchievementIds = unlockedCandidates.map((ach) => ach.id)
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

        for (const ach of unlockedCandidates) {
            if (existingAchievementSet.has(ach.id)) continue

            try {
                await prisma.userAchievement.create({
                    data: {
                        userId: user.id,
                        achievementId: ach.id,
                        sessionId: id,
                        unlockedSource: 'post_session',
                        evidenceSnapshot: ach.description, // Simplified
                        humorSnapshot: getRandomHumor(ach.id)
                    }
                })
                newUnlockedAchievements.push(ach.title)
            } catch (createError) {
                if (!isPrismaUniqueConstraintError(createError)) {
                    throw createError
                }
            }
        }

        // 4. Generate LLM Summary
        const llmSummary = await generateSessionSummary({
            durationMinutes: Math.round(sessionContext.durationMinutes),
            tasksCompleted: sessionContext.tasksCompleted,
            pauseCount: sessionContext.pauseCount,
            newAchievements: newUnlockedAchievements
        })

        // 5. Save Summary
        await prisma.workSessionParticipant.update({
            where: { id: participant.id },
            data: { achievementSummary: llmSummary }
        })

        return NextResponse.json({
            success: true,
            newAchievements: newUnlockedAchievements,
            summary: llmSummary
        })

    } catch (error) {
        console.error('Session Completion Error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid stats data' }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
