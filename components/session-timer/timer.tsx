// Session Timer Component
// Displays countdown timer for work sessions with visual feedback

'use client'

import { useState, useEffect, useCallback } from 'react'
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
                    'font-mono font-bold tabular-nums transition-colors duration-300',
                    sizeClasses[size],
                    isComplete && 'text-green-500',
                    isUrgent && !isComplete && 'text-red-500 animate-pulse',
                    isWarning && !isComplete && 'text-yellow-500'
                )}
                role="timer"
                aria-live="polite"
                aria-label={`${minutes} minutes and ${seconds} seconds remaining`}
            >
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs h-2 bg-secondary rounded-full overflow-hidden">
                <div
                    className={cn(
                        'h-full transition-all duration-1000 ease-linear rounded-full',
                        isComplete && 'bg-green-500',
                        isUrgent && !isComplete && 'bg-red-500',
                        isWarning && !isComplete && 'bg-yellow-500',
                        !isUrgent && !isWarning && !isComplete && 'bg-primary'
                    )}
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Status Text */}
            {isComplete && (
                <p className="text-sm text-green-500 font-medium animate-bounce">
                    🎉 Session Complete!
                </p>
            )}
            {isUrgent && !isComplete && (
                <p className="text-sm text-red-500 font-medium">
                    ⏰ Final minute!
                </p>
            )}
        </div>
    )
}
