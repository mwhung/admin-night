// Hourglass Timer Component
// Calming, therapeutic timer visualization

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface HourglassTimerProps {
    durationMinutes: number
    onComplete?: () => void
    className?: string
}

export function HourglassTimer({
    durationMinutes,
    onComplete,
    className,
}: HourglassTimerProps) {
    const totalSeconds = durationMinutes * 60
    const [remaining, setRemaining] = useState(totalSeconds)
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        if (remaining <= 0) {
            // Already complete, no need to set state again or clear interval
            return
        }

        const interval = setInterval(() => {
            setRemaining((prev) => {
                const next = prev <= 1 ? 0 : prev - 1
                if (next === 0) {
                    setIsComplete(true)
                    onComplete?.()
                }
                return next
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [onComplete])

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
                        className="absolute inset-0 bg-gradient-to-b from-amber-200/80 to-amber-300/60 rounded-t-full"
                        style={{
                            clipPath: 'polygon(10% 0%, 90% 0%, 60% 100%, 40% 100%)',
                        }}
                    >
                        {/* Sand in top */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-400 to-amber-300 transition-all duration-1000 ease-linear"
                            style={{
                                height: `${100 - progress}%`,
                                opacity: 0.9,
                            }}
                        />
                    </div>
                </div>

                {/* Middle Neck */}
                <div className="absolute top-[76px] left-1/2 -translate-x-1/2 w-3 h-6 bg-amber-100/50 rounded-sm">
                    {/* Falling sand particles */}
                    {!isComplete && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full overflow-hidden">
                            <div className="w-1 h-2 bg-amber-400 rounded-full animate-fall" />
                        </div>
                    )}
                </div>

                {/* Bottom Glass */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-20 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gradient-to-t from-amber-200/80 to-amber-100/40 rounded-b-full"
                        style={{
                            clipPath: 'polygon(40% 0%, 60% 0%, 90% 100%, 10% 100%)',
                        }}
                    >
                        {/* Sand in bottom */}
                        <div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-1000 ease-linear rounded-b-full"
                            style={{
                                height: `${progress}%`,
                                opacity: 0.9,
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
            <div className="text-center">
                <p className="text-2xl font-light tabular-nums text-muted-foreground">
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                    {isComplete ? 'Complete!' : 'remaining'}
                </p>
            </div>
        </div>
    )
}
