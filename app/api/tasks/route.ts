
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"

const CreateTaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
})

export async function GET(req: Request) {
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const tasks = await prisma.task.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: "desc",
            },
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
        const body = CreateTaskSchema.parse(json)

        const task = await prisma.task.create({
            data: {
                title: body.title,
                userId: session.user.id,
                state: "UNCLARIFIED",
            },
        })

        return NextResponse.json(task)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid request data", { status: 422 })
        }
        return new NextResponse("Internal Error", { status: 500 })
    }
}
