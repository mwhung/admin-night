
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

import { TaskState } from "@prisma/client"
const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
})

const BulkCreateSchema = z.object({
    tasks: z.array(z.object({
        title: z.string().min(1)
    }))
})

export async function GET(req: Request) {
    const user = await getCurrentUser()
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const state = searchParams.get('state') as TaskState | undefined
    const includeLastSession = searchParams.get('includeLastSession') === 'true'

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // 1. Fetch typical tasks
        const tasks = await prisma.task.findMany({
            where: {
                userId: user.id,
                ...(state && { state })
            },
            orderBy: {
                createdAt: "desc",
            },
            ...(limit && { take: limit })
        })

        // 2. Identify tasks from the last session if requested
        let lastSessionTaskIds: string[] = []
        if (includeLastSession) {
            const lastParticipation = await prisma.workSessionParticipant.findFirst({
                where: {
                    userId: user.id,
                    leftAt: { not: null }
                },
                orderBy: {
                    joinedAt: 'desc'
                }
            })

            if (lastParticipation?.tasksWorkedOn) {
                lastSessionTaskIds = lastParticipation.tasksWorkedOn as string[]
            }
        }

        // 3. Map with metadata
        const tasksWithMetadata = tasks.map(task => ({
            ...task,
            isFromLastSession: lastSessionTaskIds.includes(task.id)
        }))

        return NextResponse.json(tasksWithMetadata)
    } catch (error) {
        console.error("[TASKS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const user = await getCurrentUser()

    if (!user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const json = await req.json()

        // Handle single or bulk creation
        const userId = user.id

        if (json.tasks && Array.isArray(json.tasks)) {
            const body = BulkCreateSchema.parse(json)
            const tasks = await Promise.all(
                body.tasks.map(t =>
                    prisma.task.create({
                        data: {
                            title: t.title,
                            userId: userId,
                            state: "UNCLARIFIED",
                        }
                    })
                )
            )
            return NextResponse.json(tasks)
        } else {
            const body = CreateTaskSchema.parse(json)
            const task = await prisma.task.create({
                data: {
                    title: body.title,
                    userId: userId,
                    state: "UNCLARIFIED",
                },
            })
            return NextResponse.json(task)
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 })
        }
        console.error("[TASKS_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
