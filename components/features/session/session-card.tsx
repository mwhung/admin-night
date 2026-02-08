// Session Card Component
// Displays session information with status, time, and participant count

'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ParticipantCount } from './participant-count'
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react'

interface SessionCardProps {
    id: string
    scheduledStart: string
    scheduledEnd: string
    durationMinutes: number
    status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED'
    participantCount: number
    isParticipating: boolean
    onJoin?: () => void
    onLeave?: () => void
    isLoading?: boolean
    className?: string
}

export function SessionCard({
    id,
    scheduledStart,
    scheduledEnd,
    durationMinutes,
    status,
    participantCount,
    isParticipating,
    onJoin,
    onLeave,
    isLoading,
    className,
}: SessionCardProps) {
    const startDate = new Date(scheduledStart)
    const endDate = new Date(scheduledEnd)

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        })
    }

    const statusStyles = {
        SCHEDULED: 'bg-secondary/40 text-primary/60 border-border',
        ACTIVE: 'bg-primary/10 text-primary border-primary/20 animate-pulse',
        COMPLETED: 'bg-muted text-muted-foreground border-muted',
    }

    const statusLabels = {
        SCHEDULED: 'Upcoming',
        ACTIVE: 'Live Now',
        COMPLETED: 'Completed',
    }

    const isJoinable = status !== 'COMPLETED'

    return (
        <Card
            data-session-id={id}
            className={cn(
                'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
                status === 'ACTIVE' && 'ring-2 ring-primary/50',
                className
            )}
        >
            {/* Status indicator bar */}
            <div
                className={cn(
                    'absolute top-0 left-0 right-0 h-1',
                    status === 'SCHEDULED' && 'bg-secondary',
                    status === 'ACTIVE' && 'bg-primary',
                    status === 'COMPLETED' && 'bg-muted'
                )}
            />

            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {formatTime(startDate)} - {formatTime(endDate)}
                            </span>
                        </div>
                    </div>

                    <Badge variant="outline" className={cn(statusStyles[status])}>
                        {statusLabels[status]}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pb-3">
                <div className="flex items-center justify-between">
                    <ParticipantCount
                        count={participantCount}
                        isConnected={status === 'ACTIVE'}
                        size="sm"
                    />

                    <span className="text-sm text-muted-foreground">
                        {durationMinutes} min session
                    </span>
                </div>
            </CardContent>

            {isJoinable && (
                <CardFooter className="pt-0">
                    {isParticipating ? (
                        <Button
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            onClick={onLeave}
                            disabled={isLoading}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Leave Session
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            className="w-full"
                            onClick={onJoin}
                            disabled={isLoading}
                        >
                            <LogIn className="h-4 w-4 mr-2" />
                            Join Session
                        </Button>
                    )}
                </CardFooter>
            )}
        </Card>
    )
}
