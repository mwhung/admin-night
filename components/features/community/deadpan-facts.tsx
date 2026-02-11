'use client'

import { useReducedMotion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardLayout } from '@/components/ui/card-layouts'

interface DeadpanFactProps {
    fact?: string
    mode?: 'card' | 'embedded'
    className?: string
}

export function DeadpanFacts({ fact, mode = 'card', className }: DeadpanFactProps) {
    const prefersReducedMotion = useReducedMotion()
    const displayFact = fact || 'Community admin output is within expected limits.'

    if (mode === 'embedded') {
        return (
            <div className={cn("space-y-3.5", className)}>
                <blockquote className={cn(
                    cardLayout.metricStrip,
                    "border-l-2 border-primary/24 py-2 pl-4 text-[0.94rem] font-mono italic leading-relaxed text-muted-foreground/85"
                )}>
                    &ldquo;{displayFact}&rdquo;
                </blockquote>
                <div className="flex gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full bg-primary/38", !prefersReducedMotion && "animate-pulse")} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/22" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/12" />
                </div>
            </div>
        )
    }

    return (
        <Card className={cn("h-full", cardLayout.workbenchRail, className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/60 bg-muted/20 pb-3">
                <CardTitle className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Monthly Report
                </CardTitle>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent className="space-y-3.5 p-4 sm:p-5">
                <blockquote className={cn(
                    cardLayout.metricStrip,
                    "border-l-2 border-primary/24 py-2 pl-4 text-[0.94rem] font-mono italic leading-relaxed text-muted-foreground/85"
                )}>
                    &ldquo;{displayFact}&rdquo;
                </blockquote>
                <div className="flex gap-2">
                    <div className={cn("h-1.5 w-1.5 rounded-full bg-primary/45", !prefersReducedMotion && "animate-pulse")} />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/24" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/12" />
                </div>
            </CardContent>
        </Card>
    )
}
