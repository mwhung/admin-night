'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { cardLayout } from '@/components/ui/card-layouts'

interface DeadpanFactProps {
    fact?: string
}

export function DeadpanFacts({ fact }: DeadpanFactProps) {
    // Default fact if none provided
    const displayFact = fact || "Processing collective productivity... Output: Sufficient to justify existence."

    return (
        <Card className={cn("h-full relative group", cardLayout.insight)}>
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/25 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Monthly Report
                </CardTitle>
                <Terminal className="w-4 h-4 text-muted-foreground/60" />
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
                <blockquote className="text-lg font-mono text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-4 py-1 italic">
                    &ldquo;{displayFact}&rdquo;
                </blockquote>
                <div className="mt-4 flex gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/10" />
                </div>
            </CardContent>
        </Card>
    )
}
