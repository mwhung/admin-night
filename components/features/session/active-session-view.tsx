// Active Session View Component
// Full-screen view when participating in a session

'use client'

import { useState, useCallback, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SessionTimer } from '@/components/features/session/timer-logic'
import { ParticipantCount } from './participant-count'
import { useSessionPresence } from '@/lib/realtime'
import { LogOut, Volume2, VolumeX, CheckCircle2 } from 'lucide-react'
import { useAchievementTracker } from '@/lib/hooks/use-achievement-tracker'
import { AchievementToast } from '@/components/features/achievements'

interface ActiveSessionViewProps {
    sessionId: string
    userId: string
    userName?: string
    durationMinutes: number
    startTime: Date
    onLeave: () => void
    onComplete?: (stats: SessionStats) => void
    className?: string
}

export interface SessionStats {
    actualDurationSeconds: number
    totalPauseSeconds: number
    pauseCount: number
    tasksCompletedCount: number
}

export function ActiveSessionView({
    sessionId,
    userId,
    userName,
    durationMinutes,
    startTime,
    onLeave,
    onComplete,
    className,
}: ActiveSessionViewProps) {
    const [isMuted, setIsMuted] = useState(true)
    const [sessionStartTime] = useState(new Date())

    const { participants, participantCount, isConnected } = useSessionPresence({
        sessionId,
        userId,
        userName,
    })

    // Achievement tracking
    const {
        sessionState,
        pendingToast,
        trackPause,
        trackTaskComplete,
        initSession,
        dismissToast,
        checkInSessionAchievements,
    } = useAchievementTracker()

    // Initialize session tracking
    useEffect(() => {
        initSession(sessionId)
    }, [sessionId, initSession])

    // Check achievements when tasks are completed
    useEffect(() => {
        checkInSessionAchievements()
    }, [sessionState.tasksCompletedCount, checkInSessionAchievements])

    const handleComplete = useCallback(() => {
        const stats: SessionStats = {
            actualDurationSeconds: Math.floor((Date.now() - sessionStartTime.getTime()) / 1000),
            totalPauseSeconds: 0, // TODO: track actual pause time
            pauseCount: sessionState.pauseCount,
            tasksCompletedCount: sessionState.tasksCompletedCount,
        }
        onComplete?.(stats)
    }, [onComplete, sessionStartTime, sessionState])

    const handlePause = useCallback(() => {
        trackPause()
    }, [trackPause])

    const incrementTasks = useCallback(() => {
        trackTaskComplete()
    }, [trackTaskComplete])


    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center min-h-[80vh] p-6',
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between w-full max-w-md mb-8">
                <ParticipantCount
                    count={participantCount}
                    isConnected={isConnected}
                    size="lg"
                />

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMuted(!isMuted)}
                    className="rounded-full"
                >
                    {isMuted ? (
                        <VolumeX className="h-5 w-5" />
                    ) : (
                        <Volume2 className="h-5 w-5" />
                    )}
                </Button>
            </div>

            {/* Timer */}
            <Card className="mb-8 bg-card/50 backdrop-blur-sm border-primary/20">
                <CardContent className="p-8">
                    <SessionTimer
                        initialMinutes={durationMinutes}
                        onComplete={handleComplete}
                        onPause={handlePause}
                    />
                </CardContent>
            </Card>

            {/* Task Counter */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <p className="text-sm text-muted-foreground">Loops closed this session</p>
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold tabular-nums">{sessionState.tasksCompletedCount}</span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={incrementTasks}
                        className="rounded-full"
                    >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        +1
                    </Button>
                </div>
            </div>

            {/* Leave Button */}
            <Button
                variant="destructive"
                size="lg"
                onClick={onLeave}
                className="rounded-full px-8"
            >
                <LogOut className="h-5 w-5 mr-2" />
                Leave Session
            </Button>

            {/* Participant Avatars */}
            {participantCount > 1 && (
                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                        Working together with
                    </p>
                    <div className="flex -space-x-2 justify-center">
                        {participants
                            .filter((p) => p.userId !== userId)
                            .slice(0, 5)
                            .map((participant, index) => (
                                <div
                                    key={participant.userId}
                                    className="h-10 w-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center text-xs font-medium"
                                    title={participant.userName || 'Anonymous'}
                                >
                                    {participant.userName?.[0]?.toUpperCase() || '?'}
                                </div>
                            ))}
                        {participantCount > 6 && (
                            <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium">
                                +{participantCount - 6}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Achievement Toast */}
            <AchievementToast
                achievement={pendingToast}
                onDismiss={dismissToast}
            />
        </div>
    )
}
