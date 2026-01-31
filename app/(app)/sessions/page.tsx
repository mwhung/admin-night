// Sessions Browser Page
// Browse and join upcoming work sessions

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SessionCard } from "@/components/session"
import { useSessions, useJoinSession, useLeaveSession, useCreateSession } from "@/lib/hooks"
import {
    Calendar,
    Plus,
    Clock,
    Loader2,
    RefreshCcw,
    AlertCircle
} from "lucide-react"

export default function SessionsPage() {
    const [isCreating, setIsCreating] = useState(false)

    const {
        data: sessionsData,
        isLoading,
        error,
        refetch
    } = useSessions({ upcoming: true })

    const joinSession = useJoinSession()
    const leaveSession = useLeaveSession()
    const createSession = useCreateSession()

    const sessions = sessionsData?.sessions || []

    const handleJoin = async (sessionId: string) => {
        try {
            await joinSession.mutateAsync(sessionId)
        } catch (err) {
            console.error('Failed to join session:', err)
        }
    }

    const handleLeave = async (sessionId: string) => {
        try {
            await leaveSession.mutateAsync({ sessionId })
        } catch (err) {
            console.error('Failed to leave session:', err)
        }
    }

    const handleCreateQuickSession = async (durationMinutes: number) => {
        setIsCreating(true)
        try {
            const scheduledStart = new Date()
            scheduledStart.setMinutes(scheduledStart.getMinutes() + 5) // Start in 5 minutes
            await createSession.mutateAsync({ scheduledStart, durationMinutes })
        } catch (err) {
            console.error('Failed to create session:', err)
        } finally {
            setIsCreating(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-12 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto max-w-4xl py-12 px-4">
                <Card className="border-destructive/50">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                        <p className="text-lg font-medium mb-2">Failed to load sessions</p>
                        <p className="text-sm text-muted-foreground mb-4">
                            {error instanceof Error ? error.message : 'Unknown error'}
                        </p>
                        <Button onClick={() => refetch()} variant="outline">
                            <RefreshCcw className="h-4 w-4 mr-2" />
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Work Sessions</h1>
                        <p className="text-muted-foreground">
                            Join a session to focus together with others
                        </p>
                    </div>
                    <Button onClick={() => refetch()} variant="ghost" size="icon">
                        <RefreshCcw className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Quick Create Section */}
            <Card className="mb-8 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Quick Start Session
                    </CardTitle>
                    <CardDescription>
                        Start a new focus session that others can join
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { duration: 25, label: '25 min', desc: 'Pomodoro' },
                            { duration: 45, label: '45 min', desc: 'Deep Work' },
                            { duration: 60, label: '60 min', desc: 'Extended' },
                        ].map((option) => (
                            <Button
                                key={option.duration}
                                variant="outline"
                                className="h-auto py-4 flex flex-col gap-1"
                                onClick={() => handleCreateQuickSession(option.duration)}
                                disabled={isCreating}
                            >
                                <Clock className="h-4 w-4 mb-1" />
                                <span className="font-bold">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.desc}</span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Active Sessions */}
            {sessions.filter(s => s.status === 'ACTIVE').length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        Live Now
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2">
                        {sessions
                            .filter(s => s.status === 'ACTIVE')
                            .map(session => (
                                <SessionCard
                                    key={session.id}
                                    {...session}
                                    onJoin={() => handleJoin(session.id)}
                                    onLeave={() => handleLeave(session.id)}
                                    isLoading={joinSession.isPending || leaveSession.isPending}
                                />
                            ))}
                    </div>
                </div>
            )}

            {/* Upcoming Sessions */}
            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Upcoming Sessions
                </h2>
                {sessions.filter(s => s.status === 'SCHEDULED').length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                        {sessions
                            .filter(s => s.status === 'SCHEDULED')
                            .map(session => (
                                <SessionCard
                                    key={session.id}
                                    {...session}
                                    onJoin={() => handleJoin(session.id)}
                                    onLeave={() => handleLeave(session.id)}
                                    isLoading={joinSession.isPending || leaveSession.isPending}
                                />
                            ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground mb-4">
                                No upcoming sessions scheduled
                            </p>
                            <Button onClick={() => handleCreateQuickSession(25)} disabled={isCreating}>
                                <Plus className="h-4 w-4 mr-2" />
                                Create a Session
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Completed Sessions */}
            {sessions.filter(s => s.status === 'COMPLETED').length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
                        Recently Completed
                    </h2>
                    <div className="grid gap-4 md:grid-cols-2 opacity-60">
                        {sessions
                            .filter(s => s.status === 'COMPLETED')
                            .slice(0, 4)
                            .map(session => (
                                <SessionCard
                                    key={session.id}
                                    {...session}
                                />
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
