import { getCurrentUser } from "@/lib/auth-utils"
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

export async function GET() {
    const user = await getCurrentUser()
    if (!user?.id) {
        return buildErrorResponse(401, "UNAUTHORIZED", "Authentication required.")
    }

    return NextResponse.json({
        user: {
            id: user.id,
            email: user.email ?? null,
            name: typeof user.name === "string" ? user.name : null,
            avatarUrl: typeof user.image === "string" ? user.image : null,
        },
    })
}
