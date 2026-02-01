'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { SessionTimer } from "@/components/session-timer"
import { PLAYLISTS } from "@/components/session/youtube-player"
import { Play, Users, Volume2, VolumeX, CheckCircle2, Music, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const DURATION_OPTIONS = [
    { label: '25m', value: 25, description: 'Pomodoro' },
    { label: '45m', value: 45, description: 'Deep Work' },
    { label: 'Custom', value: 'custom', description: 'Set your own' },
]

export default function SessionPage() {
    const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(45)
    const [customDuration, setCustomDuration] = useState(30)
    const [isSessionActive, setIsSessionActive] = useState(false)
    const [ambientSound, setAmbientSound] = useState(false)

    // Get the actual duration value to use
    const actualDuration = selectedDuration === 'custom' ? customDuration : selectedDuration

    const handleSessionComplete = () => {
        setIsSessionActive(false)
        // TODO: Show completion celebration
    }

    if (isSessionActive) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-background/95">
                {/* Minimal header during session */}
                <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
                    <Badge variant="outline" className="gap-2">
                        <Users className="size-3" />
                        3 focusing
                    </Badge>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAmbientSound(!ambientSound)}
                    >
                        {ambientSound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
                    </Button>
                </div>

                <SessionTimer
                    initialMinutes={actualDuration}
                    onComplete={handleSessionComplete}
                />

                {/* Current task display */}
                <div className="mt-12 text-center max-w-md">
                    <p className="text-sm text-muted-foreground mb-2">Currently working on</p>
                    <p className="text-xl font-medium">Review quarterly report</p>
                </div>

                <Button
                    variant="ghost"
                    className="mt-8 text-muted-foreground"
                    onClick={() => setIsSessionActive(false)}
                >
                    Exit Session
                </Button>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="text-center mb-12">
                <div className="mb-6 inline-flex">
                    <div className="bg-primary/10 p-5 rounded-full">
                        <Play className="size-10 text-primary ml-1" />
                    </div>
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-3">Ready to Focus?</h1>
                <p className="text-lg text-muted-foreground">
                    Choose your session length and enter the flow state.
                </p>
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/10 mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">Session Duration</CardTitle>
                    <CardDescription>How long do you want to focus?</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {DURATION_OPTIONS.map((option) => (
                            <button
                                key={String(option.value)}
                                onClick={() => setSelectedDuration(option.value as number | 'custom')}
                                className={cn(
                                    "relative p-4 rounded-xl border-2 transition-all text-left",
                                    selectedDuration === option.value
                                        ? "border-primary bg-primary/5"
                                        : "border-transparent bg-muted/50 hover:bg-muted"
                                )}
                            >
                                {selectedDuration === option.value && (
                                    <CheckCircle2 className="absolute top-2 right-2 size-4 text-primary" />
                                )}
                                <span className="text-2xl font-bold block">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.description}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Duration Input */}
                    {selectedDuration === 'custom' && (
                        <div className="mt-4 flex items-center gap-3">
                            <Clock className="size-5 text-muted-foreground" />
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min={5}
                                    max={180}
                                    value={customDuration}
                                    onChange={(e) => setCustomDuration(Math.max(5, Math.min(180, parseInt(e.target.value) || 5)))}
                                    className="w-20 text-center text-lg font-bold"
                                />
                                <span className="text-muted-foreground">minutes</span>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Task Selection Preview */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-lg">Focus Task</CardTitle>
                    <CardDescription>Select a task to work on during this session</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {/* Placeholder tasks */}
                        {['Review quarterly report', 'Update documentation', 'Email follow-ups'].map((task, i) => (
                            <div
                                key={task}
                                className={cn(
                                    "p-3 rounded-lg border cursor-pointer transition-all",
                                    i === 0 ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
                                )}
                            >
                                <span className="font-medium">{task}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Playlist Selection - Coming Soon */}
            <Card className="mb-8 opacity-60">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Music className="size-5" />
                                Background Music
                            </CardTitle>
                            <CardDescription>Choose a playlist for your session</CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                        {PLAYLISTS.map((playlist) => (
                            <button
                                key={playlist.id}
                                disabled
                                className={cn(
                                    "p-3 rounded-xl border-2 transition-all text-center cursor-not-allowed",
                                    "border-transparent bg-muted/30"
                                )}
                            >
                                <span className="text-2xl mb-1 block">{playlist.emoji}</span>
                                <span className="text-xs font-medium block text-muted-foreground truncate">{playlist.name}</span>
                            </button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Button
                size="lg"
                className="w-full text-lg h-14 gap-3"
                onClick={() => setIsSessionActive(true)}
            >
                <Play className="size-5" />
                Start {actualDuration} Minute Session
            </Button>

            {/* Online users */}
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Users className="size-4" />
                <span>3 people are focusing right now</span>
            </div>
        </div>
    )
}
