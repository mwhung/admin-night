
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

function buildErrorResponse(status: number, code: string, message: string) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
            },
        },
        { status }
    )
}

export async function DELETE() {
    const user = await getCurrentUser()

    if (!user?.id) {
        return buildErrorResponse(401, "UNAUTHORIZED", "Authentication required.")
    }

    try {
        // Delete all tasks and participation records for this user
        const [deletedTasks, deletedParticipations] = await prisma.$transaction([
            prisma.task.deleteMany({
                where: { userId: user.id }
            }),
            prisma.workSessionParticipant.deleteMany({
                where: { userId: user.id }
            })
        ])

        return NextResponse.json({
            deleted: {
                tasks: deletedTasks.count,
                sessionParticipations: deletedParticipations.count,
            },
        })
    } catch (error) {
        console.error("[USER_PURGE_DELETE]", error)
        return buildErrorResponse(500, "PURGE_FAILED", "Failed to purge user history.")
    }
}
