import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"

// Validation schema for registration
const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long").optional(),
})

/**
 * POST /api/auth/register
 * Register a new user with email and password
 */
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = RegisterSchema.parse(json)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: body.email.toLowerCase(),
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: body.email.toLowerCase(),
        password: hashedPassword,
        name: body.name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: "User registered successfully",
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: error.issues.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          }))
        },
        { status: 422 }
      )
    }

    console.error("[REGISTER_ERROR]", error)
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    )
  }
}
