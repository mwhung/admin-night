// Hourglass Timer Component
// Minimal mono style: clean, restrained, and primary-only

'use client'

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface HourglassTimerRef {
    addTime: (minutes: number) => void
    getElapsedTime: () => number
    getSnapshot: () => {
        totalSeconds: number
        remainingSeconds: number
    }
}

interface HourglassTimerProps {
    durationMinutes: number
    onComplete?: () => void
    onTick?: (snapshot: { totalSeconds: number; remainingSeconds: number }) => void
    paused?: boolean
    initialTotalSeconds?: number
    initialRemainingSeconds?: number
    className?: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const HourglassTimer = forwardRef<HourglassTimerRef, HourglassTimerProps>(({
    durationMinutes,
    onComplete,
    onTick,
    paused = false,
    initialTotalSeconds,
    initialRemainingSeconds,
    className,
}, ref) => {
    const defaultTotalSeconds = Math.max(1, Math.floor(durationMinutes * 60))
    const [totalSeconds, setTotalSeconds] = useState(() => {
        if (typeof initialTotalSeconds === 'number' && Number.isFinite(initialTotalSeconds)) {
            return Math.max(1, Math.floor(initialTotalSeconds))
        }
        return defaultTotalSeconds
    })
    const [remaining, setRemaining] = useState(() => {
        if (typeof initialRemainingSeconds === 'number' && Number.isFinite(initialRemainingSeconds)) {
            const normalized = Math.floor(initialRemainingSeconds)
            const maxRemaining = typeof initialTotalSeconds === 'number' && Number.isFinite(initialTotalSeconds)
                ? Math.max(1, Math.floor(initialTotalSeconds))
                : defaultTotalSeconds
            return clamp(normalized, 0, maxRemaining)
        }
        return defaultTotalSeconds
    })
    const [isComplete, setIsComplete] = useState(remaining <= 0)
    const onTickRef = useRef(onTick)
    const prefersReducedMotion = useReducedMotion() ?? false

    useEffect(() => {
        onTickRef.current = onTick
    }, [onTick])

    useImperativeHandle(ref, () => ({
        addTime: (minutes: number) => {
            const extraSeconds = Math.max(0, Math.floor(minutes * 60))
            if (extraSeconds <= 0) return
            setRemaining((prev) => prev + extraSeconds)
            setTotalSeconds((prev) => prev + extraSeconds)
            setIsComplete(false)
        },
        getElapsedTime: () => totalSeconds - remaining,
        getSnapshot: () => ({
            totalSeconds,
            remainingSeconds: remaining,
        }),
    }), [totalSeconds, remaining])

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
    }, [onComplete, paused, remaining])

    useEffect(() => {
        onTickRef.current?.({
            totalSeconds,
            remainingSeconds: remaining,
        })
    }, [totalSeconds, remaining])

    const progressPercent = clamp((totalSeconds - remaining) / totalSeconds, 0, 1) * 100
    const isRunning = !paused && remaining > 0
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60

    return (
        <div className={cn('flex flex-col items-center', className)}>
            <motion.div
                className="relative mb-4 h-52 w-36 overflow-hidden rounded-[1.9rem]"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                    background: 'radial-gradient(130% 120% at 50% 0%, hsl(var(--primary) / 0.2), hsl(var(--primary) / 0.06) 42%, hsl(var(--primary) / 0.02) 100%)',
                    boxShadow: '0 10px 24px hsl(var(--primary) / 0.16)',
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-12"
                    style={{
                        backgroundImage: 'repeating-linear-gradient(0deg, hsl(var(--primary) / 0.16) 0px, hsl(var(--primary) / 0.16) 0.5px, transparent 0.5px, transparent 2px)',
                        mixBlendMode: 'soft-light',
                    }}
                />

                <div className="absolute top-1.5 left-1/2 h-[3px] w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/70 via-primary/25 to-primary/70" />
                <div className="absolute bottom-1.5 left-1/2 h-[3px] w-32 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary/70 via-primary/25 to-primary/70" />

                <div className="absolute top-3 left-1/2 h-[90px] w-28 -translate-x-1/2 overflow-hidden">
                    <div
                        className="absolute inset-0 rounded-t-[44%] border border-primary/22 bg-gradient-to-b from-primary/22 via-primary/8 to-transparent"
                        style={{ clipPath: 'polygon(8% 0%, 92% 0%, 60% 100%, 40% 100%)' }}
                    >
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/74 via-primary/56 to-primary/30"
                            animate={{ height: `${100 - progressPercent}%`, opacity: paused ? 0.62 : 0.82 }}
                            transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.85, ease: 'easeInOut' }}
                        />
                        {!prefersReducedMotion && (
                            <motion.div
                                className="absolute left-1/2 top-5 h-[1.5px] w-14 -translate-x-1/2 rounded-full bg-primary/36"
                                animate={{ opacity: [0.2, 0.45, 0.2], scaleX: [0.95, 1.03, 0.95] }}
                                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        )}
                    </div>
                </div>

                <div className="absolute bottom-3 left-1/2 h-[90px] w-28 -translate-x-1/2 overflow-hidden">
                    <div
                        className="absolute inset-0 rounded-b-[44%] border border-primary/22 bg-gradient-to-t from-primary/22 via-primary/8 to-transparent"
                        style={{ clipPath: 'polygon(40% 0%, 60% 0%, 92% 100%, 8% 100%)' }}
                    >
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/82 via-primary/60 to-primary/34"
                            animate={{ height: `${progressPercent}%`, opacity: paused ? 0.66 : 0.86 }}
                            transition={prefersReducedMotion ? { duration: 0.01 } : { duration: 0.85, ease: 'easeInOut' }}
                        />
                        {!prefersReducedMotion && (
                            <motion.div
                                className="absolute bottom-4 left-1/2 h-[1.5px] w-12 -translate-x-1/2 rounded-full bg-primary/34"
                                animate={{ opacity: [0.15, 0.4, 0.15], scaleX: [0.94, 1.04, 0.94] }}
                                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                            />
                        )}
                    </div>
                </div>

                <div className="absolute left-1/2 top-[88px] h-10 w-3 -translate-x-1/2 rounded-sm bg-primary/18">
                    {isRunning && (
                        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 overflow-hidden">
                            {!prefersReducedMotion && (
                                <motion.div
                                    className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/74 via-primary/58 to-primary/18"
                                    animate={{ opacity: [0.35, 0.85, 0.35], scaleY: [0.85, 1, 0.85] }}
                                    transition={{ duration: 0.5, repeat: Infinity, ease: 'linear' }}
                                />
                            )}
                            {[0, 1].map((index) => (
                                <motion.span
                                    key={index}
                                    className="absolute left-1/2 h-1.5 w-1 -translate-x-1/2 rounded-full bg-primary/82"
                                    animate={prefersReducedMotion
                                        ? { y: 12, opacity: 0.72 }
                                        : { y: [-6, 30], x: [0, index === 0 ? -0.8 : 0.8, 0], opacity: [0, 0.84, 0] }}
                                    transition={{ duration: 0.85, repeat: Infinity, ease: 'easeIn', delay: index * 0.22 }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {!prefersReducedMotion && (
                    <motion.div
                        className="pointer-events-none absolute left-1/2 top-4 h-40 w-4 -translate-x-1/2 -skew-x-[17deg] rounded-full bg-primary/24 blur-[1px]"
                        animate={{ x: [-26, 26, -26], opacity: [0.08, 0.26, 0.08] }}
                        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
            </motion.div>

            <div className="text-center">
                <motion.p
                    className={cn(
                        'text-2xl font-light tabular-nums',
                        isComplete
                            ? 'text-primary'
                            : 'text-primary/84'
                    )}
                    style={isComplete ? { textShadow: '0 0 8px hsl(var(--primary) / 0.35)' } : undefined}
                    animate={prefersReducedMotion ? undefined : { scale: isComplete ? 1.1 : paused ? 1 : [1, 1.01, 1] }}
                    transition={{ duration: 0.9, repeat: paused || isComplete ? 0 : Infinity, ease: 'easeInOut' }}
                >
                    {isComplete ? '00:00' : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}
                </motion.p>
                <motion.p
                    className={cn(
                        'mt-1 text-xs uppercase tracking-widest',
                        isComplete ? 'font-medium text-primary' : 'text-primary/64'
                    )}
                    animate={prefersReducedMotion ? undefined : { opacity: isComplete ? [0.8, 1, 0.8] : 1 }}
                    transition={{ duration: 1.2, repeat: isComplete ? Infinity : 0, ease: 'easeInOut' }}
                >
                    {isComplete ? 'Ritual Complete' : paused ? 'Paused' : 'Focusing'}
                </motion.p>
            </div>
        </div>
    )
})

HourglassTimer.displayName = 'HourglassTimer'
