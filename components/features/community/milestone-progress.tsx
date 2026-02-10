'use client'

import React from 'react'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface MilestoneProgressProps {
    current: number
    target: number
    className?: string
    showHeading?: boolean
}

export function MilestoneProgress({ current, target, className, showHeading = true }: MilestoneProgressProps) {
    const progress = Math.min(100, (current / target) * 100)

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex justify-between items-end gap-3">
                <div>
                    {showHeading && (
                        <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Weekly Goal</h3>
                    )}
                    <p className={cn("font-light text-foreground/90", showHeading ? "text-2xl" : "text-[1.65rem]")}>
                        {current.toLocaleString()} <span className="text-base text-muted-foreground/50">/ {target.toLocaleString()} steps</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-primary/22 bg-primary/10 px-3 py-1 text-xs font-medium text-primary/78">
                    <Lock className="w-3 h-3" />
                    <span>Shared Relief Marker @ 100%</span>
                </div>
            </div>

            <div className="relative pt-2">
                <Progress value={progress} className="h-3" indicatorClassName="bg-gradient-to-r from-primary/40 to-primary/76 transition-all duration-1000" />

                {/* Markers */}
                <div className="absolute top-0 left-[25%] h-2 w-px bg-foreground/5" />
                <div className="absolute top-0 left-[50%] h-2 w-px bg-foreground/5" />
                <div className="absolute top-0 left-[75%] h-2 w-px bg-foreground/5" />
            </div>

            <p className="type-card-support text-right italic">
                {100 - progress < 1 ? "Weekly marker reached." : `${Math.ceil(target - current)} more steps to reach this week's shared marker.`}
            </p>
        </div>
    )
}
