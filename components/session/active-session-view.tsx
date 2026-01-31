// Active Session View Component
// Full-screen view when participating in a session

'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SessionTimer } from '@/components/session-timer'
import { ParticipantCount } from './participant-count'
import { useSessionPresence, Participant } from '@/lib/realtime'
import { LogOut, Volume2, VolumeX, CheckCircle2 } from 'lucide-react'

interface ActiveSessionViewProps {
    sessionId: string
    userId: string
    userName?: string
    durationMinutes: number
    startTime: Date
    onLeave: () => void
    onComplete?: () => void
    className?: string
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
    const [tasksCompleted, setTasksCompleted] = useState(0)

    const { participants, participantCount, isConnected } = useSessionPresence({
        sessionId,
        userId,
        userName,
    })

    const handleComplete = useCallback(() => {
        onComplete?.()
    }, [onComplete])

    const incrementTasks = useCallback(() => {
        setTasksCompleted((prev) => prev + 1)
    }, [])

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
                    />
                </CardContent>
            </Card>

            {/* Task Counter */}
            <div className="flex flex-col items-center gap-4 mb-8">
                <p className="text-sm text-muted-foreground">Tasks completed this session</p>
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold tabular-nums">{tasksCompleted}</span>
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
        </div>
    )
}
