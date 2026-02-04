
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function DELETE() {
    const user = await getCurrentUser()

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // Delete all tasks and participation records for this user
        await prisma.$transaction([
            prisma.task.deleteMany({
                where: { userId: user.id }
            }),
            prisma.workSessionParticipant.deleteMany({
                where: { userId: user.id }
            })
        ])

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[USER_PURGE_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
