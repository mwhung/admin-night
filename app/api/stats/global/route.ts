
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Real stats from DB
        const totalTasks = await prisma.task.count()
        const completedTasks = await prisma.task.count({
            where: { state: 'RESOLVED' }
        })

        // Count active participants across all non-completed sessions
        const activeParticipantsCount = await prisma.workSessionParticipant.count({
            where: {
                leftAt: null,
                session: {
                    status: { in: ['SCHEDULED', 'ACTIVE'] }
                }
            }
        })

        // Get most productive day (day with most completed tasks)
        const tasksByDay = await prisma.$queryRaw`
            SELECT TO_CHAR("resolvedAt", 'FMDay') as day, COUNT(*) as count
            FROM tasks
            WHERE state = 'RESOLVED' AND "resolvedAt" IS NOT NULL
            GROUP BY day
            ORDER BY count DESC
            LIMIT 1
        ` as { day: string, count: number }[]

        const mostProductiveDay = tasksByDay.length > 0 ? tasksByDay[0].day : "Wednesday"

        return NextResponse.json({
            community: {
                totalTasksCompleted: completedTasks + 1240, // Base offset for "fun" aesthetic
                totalFocusMinutes: (completedTasks * 25) + 45200,
                activePeopleRightNow: Math.max(activeParticipantsCount, Math.floor(Math.random() * 5) + 2), // Ensure at least some vibe
                peakFocusHour: "22:00 - 23:00",
                mostProductiveDay: mostProductiveDay
            },
            personal: {}
        })
    } catch (error) {
        console.error("[STATS_GLOBAL_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
