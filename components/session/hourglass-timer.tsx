// Hourglass Timer Component
// Calming, therapeutic timer visualization

'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { cn } from '@/lib/utils'

export interface HourglassTimerRef {
    addTime: (minutes: number) => void
}

interface HourglassTimerProps {
    durationMinutes: number
    onComplete?: () => void
    paused?: boolean
    className?: string
}

export const HourglassTimer = forwardRef<HourglassTimerRef, HourglassTimerProps>(({
    durationMinutes,
    onComplete,
    paused = false,
    className,
}, ref) => {
    const [totalSeconds, setTotalSeconds] = useState(durationMinutes * 60)
    const [remaining, setRemaining] = useState(durationMinutes * 60)
    const [isComplete, setIsComplete] = useState(false)

    // Expose addTime method via ref
    useImperativeHandle(ref, () => ({
        addTime: (minutes: number) => {
            const extraSeconds = minutes * 60
            setRemaining(prev => prev + extraSeconds)
            setTotalSeconds(prev => prev + extraSeconds)
            setIsComplete(false)
        }
    }))

    // Handle initial duration and external resets
    useEffect(() => {
        const newTotal = durationMinutes * 60
        setTotalSeconds(newTotal)
        setRemaining(newTotal)
        setIsComplete(false)
    }, [durationMinutes])

    useEffect(() => {
        if (remaining <= 0 || paused) return

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    setIsComplete(true)
                    onComplete?.()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [onComplete, remaining > 0, paused]) // Watch paused state

    const progress = ((totalSeconds - remaining) / totalSeconds) * 100
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60

    return (
        <div className={cn('flex flex-col items-center', className)}>
            {/* Hourglass Container */}
            <div className="relative w-32 h-48 mb-6">
                {/* Top Glass */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-20 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-primary/5 rounded-t-full"
                        style={{
                            clipPath: 'polygon(10% 0%, 90% 0%, 60% 100%, 40% 100%)',
                        }}
                    >
                        {/* Sand in top */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/40 to-primary/20 transition-all duration-1000 ease-linear"
                            style={{
                                height: `${100 - progress}%`,
                                opacity: 0.8,
                            }}
                        />
                    </div>
                </div>

                {/* Middle Neck */}
                <div className="absolute top-[76px] left-1/2 -translate-x-1/2 w-3 h-6 bg-primary/5 rounded-sm">
                    {/* Falling sand particles */}
                    {!isComplete && !paused && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full overflow-hidden">
                            <div className="w-1 h-2 bg-primary/40 rounded-full animate-fall" />
                        </div>
                    )}
                </div>

                {/* Bottom Glass */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-primary/5 rounded-b-full"
                        style={{
                            clipPath: 'polygon(40% 0%, 60% 0%, 90% 100%, 10% 100%)',
                        }}
                    >
                        {/* Sand in bottom */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/60 to-primary/40 transition-all duration-1000 ease-linear rounded-b-full"
                            style={{
                                height: `${progress}%`,
                                opacity: 0.8,
                            }}
                        />
                    </div>
                </div>

                {/* Glass Frame */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Top frame */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-2 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 rounded-full shadow-sm" />
                    {/* Bottom frame */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-2 bg-gradient-to-r from-stone-300 via-stone-200 to-stone-300 rounded-full shadow-sm" />
                </div>
            </div>

            {/* Time Display (Subtle) */}
            <div className="text-center group">
                <p className={cn(
                    "text-2xl font-light tabular-nums transition-all duration-1000",
                    isComplete ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]" : "text-muted-foreground"
                )}>
                    {isComplete ? "00:00" : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
                </p>
                <p className={cn(
                    "text-xs mt-1 transition-all duration-1000 uppercase tracking-widest",
                    isComplete ? "text-primary font-medium animate-pulse" : "text-muted-foreground/60"
                )}>
                    {isComplete ? 'Ritual Complete' : 'Focusing'}
                </p>
            </div>
        </div>
    )
})

HourglassTimer.displayName = 'HourglassTimer'
