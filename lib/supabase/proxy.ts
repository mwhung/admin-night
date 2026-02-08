
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { AUTH_ROUTES, PROTECTED_ROUTES, ROUTES } from '@/lib/routes'
import { MOCK_AUTH_COOKIE_NAME, resolveMockAuthUser } from '@/lib/mock-auth'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    let isAuthenticated = Boolean(
        resolveMockAuthUser(request.cookies.get(MOCK_AUTH_COOKIE_NAME)?.value)
    )

    if (!isAuthenticated) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

        const { data } = await supabase.auth.getClaims()
        isAuthenticated = Boolean(data?.claims)
    }

    const { pathname } = request.nextUrl

    // Protected routes
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    // Auth routes (login/register)
    const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

    if (!isAuthenticated && isProtectedRoute) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = ROUTES.LOGIN
        return NextResponse.redirect(url)
    }

    if (isAuthenticated && isAuthRoute) {
        // user is logged in, redirect to home
        const url = request.nextUrl.clone()
        url.pathname = ROUTES.HOME
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
