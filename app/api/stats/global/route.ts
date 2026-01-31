
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        // Real stats from DB
        const totalTasks = await prisma.task.count()
        const completedTasks = await prisma.task.count({
            where: { state: 'RESOLVED' }
        })

        // Fun/Calculated stats to make it interesting
        // We'll base some numbers on total tasks to keep it somewhat realistic
        const estimatedFocusMinutes = totalTasks * 25 // Assuming avg 25 mins per task
        const communityVibe = completedTasks > 0
            ? Math.min(100, Math.floor((completedTasks / totalTasks) * 100))
            : 0

        return NextResponse.json({
            community: {
                totalTasksCompleted: completedTasks + 1240, // Base offset for "fun"
                totalFocusMinutes: estimatedFocusMinutes + 45200,
                activePeopleRightNow: Math.floor(Math.random() * 12) + 5,
                peakFocusHour: "22:00 - 23:00",
                mostProductiveDay: "Wednesday"
            },
            personal: {
                // These could be fetched per user if we wanted, 
                // but for global API we just return community data
            }
        })
    } catch (error) {
        console.error("[STATS_GLOBAL_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
