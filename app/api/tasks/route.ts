
import { auth } from "@/auth"
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
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const state = searchParams.get('state') as TaskState | undefined

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: session.user.id,
                ...(state && { state })
            },
            orderBy: {
                createdAt: "desc",
            },
            ...(limit && { take: limit })
        })

        return NextResponse.json(tasks)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const json = await req.json()

        // Handle single or bulk creation
        const userId = session.user.id

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
