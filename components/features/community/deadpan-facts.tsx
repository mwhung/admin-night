'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Terminal } from 'lucide-react'

interface DeadpanFactProps {
    fact?: string
}

export function DeadpanFacts({ fact }: DeadpanFactProps) {
    // Default fact if none provided
    const displayFact = fact || "Processing collective productivity... Output: Sufficient to justify existence."

    return (
        <Card className="h-full rounded-[2.5rem] border-primary/10 bg-black/5 dark:bg-white/5 relative overflow-hidden group">
            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Monthly Report
                </CardTitle>
                <Terminal className="w-4 h-4 text-muted-foreground/40" />
            </CardHeader>
            <CardContent className="p-8 pt-4">
                <blockquote className="text-lg font-mono text-muted-foreground/80 leading-relaxed border-l-2 border-primary/20 pl-4 py-1 italic">
                    "{displayFact}"
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
