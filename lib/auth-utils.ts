
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db'

export async function getCurrentUser() {
    // E2E Testing Bypass: Allows tests to simulate a logged-in user without real Supabase calls
    if (process.env.NEXT_PUBLIC_E2E_TESTING === 'true') {
        const { cookies } = await import('next/headers')
        const cookieStore = await cookies()
        const mockUserJson = cookieStore.get('e2e-mock-user')?.value

        if (mockUserJson) {
            try {
                const mockUser = JSON.parse(mockUserJson)
                // Ensure the mock user exists in Prisma for data consistency
                let dbUser = await prisma.user.findUnique({ where: { email: mockUser.email } })
                if (!dbUser) {
                    dbUser = await prisma.user.create({
                        data: {
                            id: mockUser.id,
                            email: mockUser.email,
                            name: mockUser.name || 'E2E Tester',
                        }
                    })
                }
                return dbUser
            } catch (e) {
                console.error('Invalid E2E mock user JSON', e)
            }
        }
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
