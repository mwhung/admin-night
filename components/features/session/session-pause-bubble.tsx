'use client'

import Link from 'next/link'
import { PauseCircle } from 'lucide-react'
import { useSessionRuntime } from './session-runtime-context'

const formatRemaining = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds))
    const mins = Math.floor(safeSeconds / 60)
    const secs = safeSeconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function SessionPauseBubble() {
    const { session } = useSessionRuntime()

    if (!session.isActive || !session.pausedByNavigation) {
        return null
    }

    const progress = session.totalSeconds > 0
        ? ((session.totalSeconds - session.remainingSeconds) / session.totalSeconds) * 100
        : 0

    const radius = 34
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (Math.max(0, Math.min(100, progress)) / 100) * circumference

    const resumeHref = session.sessionId
        ? `/sessions/${session.sessionId}`
        : '/focus'

    return (
        <Link
            href={resumeHref}
            className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-[60] h-24 w-24 rounded-full shadow-2xl shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            aria-label={`Session paused, ${formatRemaining(session.remainingSeconds)} remaining. Tap to return to your session.`}
            title="Session paused - tap to return"
        >
            <div className="absolute inset-0 rounded-full bg-card/90 backdrop-blur-xl border border-primary/20" />
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    strokeWidth="4"
                    className="text-primary/20"
                    stroke="currentColor"
                    fill="none"
                />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    strokeWidth="4"
                    className="text-primary"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>

            <div className="relative h-full w-full flex flex-col items-center justify-center leading-none">
                <PauseCircle className="h-4 w-4 text-primary/85 mb-1" />
                <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Paused</span>
                <span className="text-xs font-semibold tabular-nums text-foreground mt-1">
                    {formatRemaining(session.remainingSeconds)}
                </span>
            </div>
        </Link>
    )
}
