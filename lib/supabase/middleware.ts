
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // E2E Testing Bypass: Strictly disabled in production for security
    let user = null
    if (
        process.env.NEXT_PUBLIC_E2E_TESTING === 'true' &&
        process.env.NODE_ENV !== 'production' &&
        process.env.VERCEL_ENV !== 'production'
    ) {
        const mockUserCookie = request.cookies.get('e2e-mock-user')?.value
        if (mockUserCookie) {
            try {
                user = JSON.parse(mockUserCookie)
            } catch (e) {
                console.error('Invalid E2E mock user in middleware', e)
            }
        }
    }

    if (!user) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user: supabaseUser },
        } = await supabase.auth.getUser()
        user = supabaseUser
    }

    const { pathname } = request.nextUrl

    // Protected routes
    const protectedRoutes = ['/dashboard', '/inbox', '/session', '/settings']
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

    // Auth routes (login/register)
    const authRoutes = ['/login', '/register']
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    if (!user && isProtectedRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
        // user is logged in, redirect to dashboard
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If not, you may be setting cookies that are invalid and the user will have
    // a difficult time logging in.

    return supabaseResponse
}
