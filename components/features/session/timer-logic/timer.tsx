// Session Timer Component
// Displays countdown timer for work sessions with visual feedback

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface SessionTimerProps {
    durationMinutes: number
    startTime: Date
    onComplete?: () => void
    onTick?: (remainingSeconds: number) => void
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export function SessionTimer({
    durationMinutes,
    startTime,
    onComplete,
    onTick,
    className,
    size = 'lg',
}: SessionTimerProps) {
    const totalSeconds = durationMinutes * 60
    const [remaining, setRemaining] = useState(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        return Math.max(0, totalSeconds - elapsed)
    })
    const [isComplete, setIsComplete] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
            const newRemaining = Math.max(0, totalSeconds - elapsed)
            setRemaining(newRemaining)
            onTick?.(newRemaining)

            if (newRemaining === 0 && !isComplete) {
                setIsComplete(true)
                onComplete?.()
                clearInterval(interval)
            }
        }, 1000)

        return () => clearInterval(interval)
    }, [durationMinutes, startTime, totalSeconds, onComplete, onTick, isComplete])

    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60

    const progress = ((totalSeconds - remaining) / totalSeconds) * 100
    const isUrgent = remaining <= 60 && remaining > 0
    const isWarning = remaining <= 300 && remaining > 60

    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-6xl',
    }

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            {/* Timer Display */}
            <div
                className={cn(
                    'font-mono font-bold tabular-nums transition-colors duration-1000',
                    sizeClasses[size],
                    isComplete && 'text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.3)]',
                    isUrgent && !isComplete && 'text-primary/80',
                    isWarning && !isComplete && 'text-primary/60'
                )}
                role="timer"
                aria-live="polite"
                aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
            >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-1000 ease-linear rounded-full',
                        isComplete && 'bg-primary',
                        (isUrgent || isWarning) && !isComplete && 'bg-primary/60',
                        !isUrgent && !isWarning && !isComplete && 'bg-primary/40'
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Status Text */}
            {isComplete && (
                <p className="text-sm text-primary font-light tracking-widest animate-pulse">
                    Complete. You don&apos;t need to think about this for now.
                </p>
            )}
            {isUrgent && !isComplete && (
                <p className="text-sm text-primary/60 font-light">
                    Wrapping up soon...
                </p>
            )}
        </div>
    )
}
