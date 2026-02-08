
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'
import { MOCK_AUTH_COOKIE_NAME, resolveMockAuthUser } from '@/lib/mock-auth'
import { Prisma } from '@prisma/client'

export async function getCurrentUser() {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const mockUser = resolveMockAuthUser(cookieStore.get(MOCK_AUTH_COOKIE_NAME)?.value)

    // Development Mock Auth: allows local/e2e login bypass while staying disabled in production.
    if (mockUser) {
        let dbUser = await prisma.user.findUnique({ where: { email: mockUser.email } })
        if (!dbUser) {
            dbUser = await prisma.user.findUnique({ where: { id: mockUser.id } })
        }

        if (!dbUser) {
            try {
                dbUser = await prisma.user.create({
                    data: {
                        id: mockUser.id,
                        email: mockUser.email,
                        name: mockUser.name || 'Mock User',
                    }
                })
            } catch (error) {
                // Parallel test workers may race to create the same mock user.
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                    dbUser =
                        await prisma.user.findUnique({ where: { email: mockUser.email } }) ||
                        await prisma.user.findUnique({ where: { id: mockUser.id } })
                } else {
                    throw error
                }
            }
        }

        if (dbUser && (dbUser.email !== mockUser.email || dbUser.name !== (mockUser.name || 'Mock User'))) {
            dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                    email: mockUser.email,
                    name: mockUser.name || 'Mock User',
                },
            })
        }

        return dbUser ?? null
    }

    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return null
    }

    // Find or create the user in our Prisma database
    // This ensures that we have a record in the 'users' table that matches the Supabase user
    let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
    })

    if (!dbUser) {
        dbUser = await prisma.user.create({
            data: {
                id: user.id, // Use Supabase ID
                email: user.email,
                name: user.user_metadata?.name || null,
                image: user.user_metadata?.avatar_url || null,
            },
        })
    } else if (dbUser.id !== user.id) {
        // If user exists but has a different ID (e.g. from previous NextAuth setup)
        // We should probably update the ID to match Supabase for consistency, 
        // but that might break existing relations if we are not careful.
        // For MVP/Migration, let's update the ID if there's no conflict.
        // Actually, it's safer to just use the existing dbUser and maybe update the ID if it's a cuid.
        if (dbUser.id.length !== user.id.length) { // Simple check for cuid vs uuid
            await prisma.user.update({
                where: { email: user.email },
                data: { id: user.id }
            })
            dbUser.id = user.id
        }
    }

    return dbUser
}
