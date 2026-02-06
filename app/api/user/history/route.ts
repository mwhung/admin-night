
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    const user = await getCurrentUser()

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // 1. Fetch all tasks for the user
        const tasks = await prisma.task.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        })

        // 2. Fetch participation history
        const participations = await prisma.workSessionParticipant.findMany({
            where: { userId: user.id },
            include: {
                session: true
            },
            orderBy: { joinedAt: 'desc' }
        })

        // 3. Calculate total focus time
        const totalFocusMinutes = participations.reduce((acc, p) => {
            if (p.joinedAt && p.leftAt) {
                const diff = (p.leftAt.getTime() - p.joinedAt.getTime()) / (1000 * 60)
                return acc + diff
            }
            return acc
        }, 0)

        // 4. Group data by session/day for the UI
        // We'll create a "history" array that includes sessions and tasks
        const historyGroups = await Promise.all(participations.map(async (p) => {
            const taskIds = (p.tasksWorkedOn as string[]) || []
            const sessionTasks = tasks.filter(t => taskIds.includes(t.id))

            // Count total participants in this session
            const participantCount = await prisma.workSessionParticipant.count({
                where: { sessionId: p.sessionId }
            })

            return {
                id: p.id,
                sessionId: p.sessionId,
                date: p.joinedAt,
                duration: p.leftAt ? Math.round((p.leftAt.getTime() - p.joinedAt.getTime()) / (1000 * 60)) : 0,
                tasks: sessionTasks,
                participantCount: participantCount
            }
        }))

        // 5. Daily activity for calendar (simple map of date strings to counts)
        const dailyActivity: Record<string, number> = {}
        participations.forEach(p => {
            const dateStr = p.joinedAt.toISOString().split('T')[0]
            dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1
        })

        return NextResponse.json({
            stats: {
                totalResolved: tasks.filter(t => t.state === 'RESOLVED').length,
                totalPending: tasks.filter(t => t.state !== 'RESOLVED').length,
                totalFocusMinutes: Math.round(totalFocusMinutes),
                dailyActivity
            },
            historyGroups,
            allTasks: tasks
        })
    } catch (error) {
        console.error("[USER_HISTORY_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
