import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes
const protectedRoutes = ['/dashboard', '/inbox', '/session', '/settings']
const authRoutes = ['/login', '/register']

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Get the auth token from the session cookie
    // NextAuth stores session in a cookie named based on the provider
    const sessionToken = request.cookies.get('authjs.session-token')?.value ||
        request.cookies.get('__Secure-authjs.session-token')?.value

    const isLoggedIn = !!sessionToken

    // Redirect unauthenticated users from protected routes to login
    if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Redirect authenticated users from auth routes to dashboard
    if (isAuthRoute && isLoggedIn) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
