import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

// Schema for updating a task
const UpdateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    state: z.enum(["UNCLARIFIED", "CLARIFIED", "IN_PROGRESS", "RESOLVED", "RECURRING"]).optional(),
    aiSuggestions: z.array(z.string()).optional(),
})

type RouteParams = {
    params: Promise<{ id: string }>
}

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
 */
export async function GET(req: Request, { params }: RouteParams) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { id } = await params

        const task = await prisma.task.findUnique({
            where: {
                id,
                userId: session.user.id, // Ensure user owns this task
            },
        })

        if (!task) {
            return new NextResponse("Task not found", { status: 404 })
        }

        return NextResponse.json(task)
    } catch (error) {
        console.error("[TASK_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

/**
 * PUT /api/tasks/[id]
 * Update a task
 */
export async function PUT(req: Request, { params }: RouteParams) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { id } = await params
        const json = await req.json()
        const body = UpdateTaskSchema.parse(json)

        // Verify task exists and belongs to user
        const existingTask = await prisma.task.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!existingTask) {
            return new NextResponse("Task not found", { status: 404 })
        }

        // Build update data
        const updateData: {
            title?: string
            state?: "UNCLARIFIED" | "CLARIFIED" | "IN_PROGRESS" | "RESOLVED" | "RECURRING"
            aiSuggestions?: string[]
            resolvedAt?: Date | null
        } = {}

        if (body.title !== undefined) {
            updateData.title = body.title
        }

        if (body.state !== undefined) {
            updateData.state = body.state

            // Auto-set resolvedAt when task is resolved
            if (body.state === "RESOLVED") {
                updateData.resolvedAt = new Date()
            } else if (existingTask.state === "RESOLVED") {
                // Clear resolvedAt if moving away from RESOLVED
                updateData.resolvedAt = null
            }
        }

        if (body.aiSuggestions !== undefined) {
            updateData.aiSuggestions = body.aiSuggestions
        }

        const task = await prisma.task.update({
            where: {
                id,
            },
            data: updateData,
        })

        return NextResponse.json(task)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid request data", details: error.issues },
                { status: 422 }
            )
        }
        console.error("[TASK_PUT]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(req: Request, { params }: RouteParams) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const { id } = await params

        // Verify task exists and belongs to user
        const existingTask = await prisma.task.findUnique({
            where: {
                id,
                userId: session.user.id,
            },
        })

        if (!existingTask) {
            return new NextResponse("Task not found", { status: 404 })
        }

        await prisma.task.delete({
            where: {
                id,
            },
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[TASK_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
