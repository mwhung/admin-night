
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

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
 * Register a new user with email and password using Supabase Auth
 */
export async function POST(req: Request) {
  try {
    const json = await req.json()
    const body = RegisterSchema.parse(json)

    const supabase = await createClient()

    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: body.email.toLowerCase(),
      password: body.password,
      options: {
        data: {
          name: body.name || null,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: data.user?.id,
          email: data.user?.email,
        },
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
