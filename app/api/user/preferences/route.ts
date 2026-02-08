
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

export async function GET() {
    const user = await getCurrentUser()

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { preferences: true }
        })

        return NextResponse.json(dbUser?.preferences || {})
    } catch (error) {
        console.error("[PREFERENCES_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    const user = await getCurrentUser()

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
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
            return new NextResponse(JSON.stringify(error.issues), { status: 422 })
        }
        console.error("[PREFERENCES_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
