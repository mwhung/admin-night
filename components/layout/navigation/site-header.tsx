'use client'

import { useEffect, useRef } from 'react'
import { Moon, Sun, LogOut, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ParticipantCount } from '@/components/features/session'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSessions } from '@/lib/hooks/useSessions'
import { useAestheticMode } from '@/lib/hooks/useAestheticMode'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useSessionPresence } from '@/lib/realtime'

export function SiteHeader() {
    const headerRef = useRef<HTMLElement>(null)
    const { user, loading } = useAuth()
    const {
        mode: aestheticMode,
        resolvedMode,
        toggleLightDark,
    } = useAestheticMode({ userId: user?.id })
    const supabase = createClient()
    const shouldLoadSessionMetrics = !loading && Boolean(user)
    const { participantCount: onlineCount, isConnected: isPresenceConnected } = useSessionPresence({
        sessionId: 'global-online',
    })
    const { data: activeSessionsData } = useSessions({
        status: 'ACTIVE',
        enabled: shouldLoadSessionMetrics,
    })
    const activeSessionId = shouldLoadSessionMetrics
        ? activeSessionsData?.sessions[0]?.id ?? ''
        : ''
    const shouldTrackFocusedPresence = shouldLoadSessionMetrics && Boolean(activeSessionId)
    const { participantCount: focusedPresenceCount } = useSessionPresence({
        sessionId: activeSessionId || 'no-active-session',
        enabled: shouldTrackFocusedPresence,
    })
    const focusedCount = shouldTrackFocusedPresence
        ? Math.min(focusedPresenceCount, onlineCount)
        : 0
    const metricNumberClass = 'tabular-nums text-sm font-bold leading-none'
    const ThemeToggleIcon = resolvedMode === 'dark' ? Moon : Sun
    const nextModeLabel = resolvedMode === 'dark' ? 'light' : 'dark'

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    useEffect(() => {
        const headerElement = headerRef.current
        if (!headerElement) return

        const rootStyle = document.documentElement.style
        const updateHeaderHeightToken = () => {
            const measuredHeight = Math.round(headerElement.getBoundingClientRect().height)
            rootStyle.setProperty('--layout-header-height', `${measuredHeight}px`)
        }

        updateHeaderHeightToken()

        let resizeObserver: ResizeObserver | null = null
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateHeaderHeightToken)
            resizeObserver.observe(headerElement)
        }

        window.addEventListener('resize', updateHeaderHeightToken)

        return () => {
            resizeObserver?.disconnect()
            window.removeEventListener('resize', updateHeaderHeightToken)
        }
    }, [])

    return (
        <header
            ref={headerRef}
            className="sticky top-0 w-full z-50 p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 bg-background/55 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
        >
            <div className="flex items-center gap-2 min-w-0">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Moon className="h-4 w-4 text-primary" />
                </div>
                <span className="type-section-label uppercase text-foreground/85 tracking-[0.1em]">ADMIN NIGHT</span>
            </div>

            <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 px-3 py-1 gap-2 h-auto shadow-sm"
                role="status"
                aria-live="polite"
                aria-label={`${onlineCount} online, ${focusedCount} focused`}
            >
                <span className="inline-flex items-center gap-1.5 sm:hidden">
                    <span className={metricNumberClass}>{focusedCount}</span>
                    <span className="text-xs font-medium text-muted-foreground">focused</span>
                </span>

                <span className="hidden items-center gap-1.5 sm:inline-flex">
                    <ParticipantCount
                        count={onlineCount}
                        isConnected={isPresenceConnected}
                        size="sm"
                        showLabel={false}
                    />
                    <span className="text-xs font-medium text-muted-foreground">online</span>
                    <span className="text-xs text-muted-foreground/60">·</span>
                    <span className={metricNumberClass}>{focusedCount}</span>
                    <span className="text-xs font-medium text-muted-foreground">focused</span>
                </span>
            </Badge>

            <div className="justify-self-end">
                <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={toggleLightDark}
                        className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                        aria-label={`Switch to ${nextModeLabel} mode. Current mode: ${aestheticMode}.`}
                        title={`Switch to ${nextModeLabel} mode`}
                    >
                        <ThemeToggleIcon className="size-4" />
                    </Button>
                    {!loading && (
                        <>
                            {!user ? (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild className="type-section-label h-8 px-3">
                                        <Link href="/login">
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" size="sm" asChild className="type-section-label h-8 px-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border-none">
                                        <Link href="/register">
                                            Register
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link href="/settings" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                                        <div className="size-8 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                                            {user.user_metadata?.avatar_url ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={user.user_metadata.avatar_url} alt="" className="size-full rounded-full object-cover" />
                                            ) : (
                                                <User className="size-4 text-primary" />
                                            )}
                                        </div>
                                        <span className="type-caption uppercase tracking-[0.08em] font-semibold hidden sm:inline-block text-foreground/80">
                                            {user.user_metadata?.name || user.email?.split('@')[0]}
                                        </span>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={handleSignOut}
                                        className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                        title="Sign Out"
                                    >
                                        <LogOut className="size-4" />
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
