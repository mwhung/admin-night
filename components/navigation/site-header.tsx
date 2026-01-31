'use client'

import { useState, useEffect } from 'react'
import { Moon, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ParticipantCount } from '@/components/session'
import { cn } from '@/lib/utils'

export function SiteHeader() {
    const [liveCount, setLiveCount] = useState(12) // Default mock

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

            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground font-medium bg-muted/30 px-3 py-1.5 rounded-full border border-border/40">
                    <Sparkles className="size-3 text-primary/60" />
                    <span>2026 Therapeutic UI</span>
                </div>
            </div>
        </header>
    )
}
