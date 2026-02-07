'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Progress } from "@/components/ui/progress"
import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface MilestoneProgressProps {
    current: number
    target: number
    className?: string
}

export function MilestoneProgress({ current, target, className }: MilestoneProgressProps) {
    const progress = Math.min(100, (current / target) * 100)

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Weekly Goal</h3>
                    <p className="text-2xl font-light text-foreground/90">
                        {current.toLocaleString()} <span className="text-base text-muted-foreground/50">/ {target.toLocaleString()} steps</span>
                    </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-primary/80 bg-primary/5 px-3 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    <span>Mystery Unlock @ 100%</span>
                </div>
            </div>

            <div className="relative pt-2">
                <Progress value={progress} className="h-3" indicatorClassName="bg-gradient-to-r from-primary/50 to-primary transition-all duration-1000" />

                {/* Markers */}
                <div className="absolute top-0 left-[25%] h-2 w-px bg-foreground/5" />
                <div className="absolute top-0 left-[50%] h-2 w-px bg-foreground/5" />
                <div className="absolute top-0 left-[75%] h-2 w-px bg-foreground/5" />
            </div>

            <p className="text-xs text-muted-foreground/60 italic text-right">
                {100 - progress < 1 ? "Goal Met!" : `${Math.ceil(target - current)} more steps to unlock shared reward.`}
            </p>
        </div>
    )
}
