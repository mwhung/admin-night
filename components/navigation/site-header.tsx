'use client'

import { useState, useEffect } from 'react'
import { Moon, Sparkles, LogIn, LogOut, UserPlus, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ParticipantCount } from '@/components/session'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function SiteHeader() {
    const [liveCount, setLiveCount] = useState(12) // Default mock

    const { user, loading } = useAuth()
    const supabase = createClient()

    useEffect(() => {
        // Simulate live participant count
        setLiveCount(Math.floor(Math.random() * 5) + 8)

        const interval = setInterval(() => {
            setLiveCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1
                return Math.max(1, Math.min(20, prev + change))
            })
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <header className="w-full z-50 p-4 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
            <div className="flex items-center gap-2">
                <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Moon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-extralight tracking-widest uppercase">Admin Night</span>
                    <span className="text-[10px] text-muted-foreground font-medium tracking-[0.2em] -mt-1 uppercase opacity-50">Deep Focus</span>
                </div>
            </div>

            <Badge
                variant="outline"
                className="bg-primary/5 text-primary border-primary/20 px-3 py-1 gap-2 h-auto shadow-sm"
            >
                <ParticipantCount
                    count={liveCount}
                    isConnected={true}
                    size="sm"
                    showLabel={true}
                />
            </Badge>

            <div className="flex items-center gap-4">

                <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                    {!loading && (
                        <>
                            {!user ? (
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" asChild className="text-[11px] uppercase tracking-wider font-light h-8 px-3">
                                        <Link href="/login">
                                            Sign In
                                        </Link>
                                    </Button>
                                    <Button variant="secondary" size="sm" asChild className="text-[11px] uppercase tracking-wider font-medium h-8 px-4 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border-none">
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
                                                <img src={user.user_metadata.avatar_url} alt="" className="size-full rounded-full object-cover" />
                                            ) : (
                                                <User className="size-4 text-primary" />
                                            )}
                                        </div>
                                        <span className="text-[11px] uppercase tracking-wider font-medium hidden sm:inline-block">
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
