
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const PreferencesSchema = z.object({
    session_duration: z.number().optional(),
    aesthetic_mode: z.enum(["light", "dark", "adaptive"]).optional(),
    presence_visibility: z.enum(["public", "anonymous", "private"]).optional(),
    insight_level: z.enum(["basic", "detailed", "deep"]).optional(),
    ambient_sound: z.boolean().optional(),
    completion_cues: z.boolean().optional(),
})

function buildErrorResponse(
    status: number,
    code: string,
    message: string,
    details?: unknown
) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                ...(details !== undefined ? { details } : {}),
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

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { preferences: true }
        })

        return NextResponse.json(dbUser?.preferences || {})
    } catch (error) {
        console.error("[PREFERENCES_GET]", error)
        return buildErrorResponse(500, "PREFERENCES_GET_FAILED", "Failed to load user preferences.")
    }
}

export async function PATCH(req: Request) {
    const user = await getCurrentUser()

    if (!user?.id) {
        return buildErrorResponse(401, "UNAUTHORIZED", "Authentication required.")
    }

    try {
        const json = await req.json()
        const validatedData = PreferencesSchema.parse(json)

        // Fetch current preferences to merge
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { preferences: true }
        })

        const currentPrefs: Prisma.JsonObject =
            dbUser?.preferences && typeof dbUser.preferences === "object" && !Array.isArray(dbUser.preferences)
                ? (dbUser.preferences as Prisma.JsonObject)
                : {}
        const updatedPrefs = { ...currentPrefs, ...validatedData }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                preferences: updatedPrefs
            }
        })

        return NextResponse.json(updatedUser.preferences)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return buildErrorResponse(
                422,
                "INVALID_PREFERENCES_PAYLOAD",
                "Invalid preference payload.",
                error.issues
            )
        }
        console.error("[PREFERENCES_PATCH]", error)
        return buildErrorResponse(500, "PREFERENCES_PATCH_FAILED", "Failed to save user preferences.")
    }
}
