import { getCurrentUser } from "@/lib/auth-utils"
import { createClient } from "@/lib/supabase/server"
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

export async function POST() {
    const user = await getCurrentUser()
    if (!user?.id) {
        return buildErrorResponse(401, "UNAUTHORIZED", "Authentication required.")
    }

    if (!user.email) {
        return buildErrorResponse(400, "MISSING_USER_EMAIL", "No email is associated with this account.")
    }

    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.resetPasswordForEmail(user.email)

        if (error) {
            return buildErrorResponse(400, "PASSWORD_RESET_REQUEST_FAILED", error.message)
        }

        return NextResponse.json({
            message: `Password reset email sent to ${user.email}.`,
        })
    } catch (error) {
        console.error("[PASSWORD_RESET_POST]", error)
        return buildErrorResponse(500, "PASSWORD_RESET_INTERNAL_ERROR", "Failed to send password reset email.")
    }
}
