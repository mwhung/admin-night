'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface SessionTimerProps {
    initialMinutes?: number
    onComplete?: () => void
    className?: string
}

export function SessionTimer({
    initialMinutes = 25,
    onComplete,
    className
}: SessionTimerProps) {
    const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60)
    const [isRunning, setIsRunning] = useState(false)
    const [initialTime] = useState(initialMinutes * 60)

    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60

    const progress = ((initialTime - totalSeconds) / initialTime) * 100

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        if (isRunning && totalSeconds > 0) {
            interval = setInterval(() => {
                setTotalSeconds((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false)
                        onComplete?.()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning, totalSeconds, onComplete])

    const toggleTimer = useCallback(() => {
        setIsRunning((prev) => !prev)
    }, [])

    const resetTimer = useCallback(() => {
        setIsRunning(false)
        setTotalSeconds(initialTime)
    }, [initialTime])

    return (
        <div className={cn("flex flex-col items-center", className)}>
            {/* Circular Progress */}
            <div className="relative w-64 h-64 mb-8">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted/30"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="128"
                        cy="128"
                        r="120"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-primary transition-all duration-1000 ease-linear"
                        style={{
                            strokeDasharray: `${2 * Math.PI * 120}`,
                            strokeDashoffset: `${2 * Math.PI * 120 * (1 - progress / 100)}`,
                        }}
                    />
                </svg>

                {/* Timer display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-bold tabular-nums tracking-tight">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-sm text-muted-foreground mt-2">
                        {isRunning ? 'Focus Mode' : totalSeconds === 0 ? 'Complete!' : 'Paused'}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="rounded-full h-12 w-12"
                >
                    <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                    size="lg"
                    onClick={toggleTimer}
                    className="rounded-full h-16 w-16 text-lg"
                >
                    {isRunning ? (
                        <Pause className="h-6 w-6" />
                    ) : (
                        <Play className="h-6 w-6 ml-1" />
                    )}
                </Button>

                <div className="w-12" /> {/* Spacer for visual balance */}
            </div>
        </div>
    )
}
