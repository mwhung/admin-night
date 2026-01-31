// Admin Mode Page
// Join the shared Admin Night focus session with task planning

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HourglassTimer } from "@/components/session/hourglass-timer"
import { TaskChecklist, TaskItem } from "@/components/session/task-checklist"
import { ParticipantCount } from "@/components/session"
import { PlaylistSelector, YouTubePlayer, MiniPlayer, PLAYLISTS, Playlist } from "@/components/session/youtube-player"
import {
    Plus,
    Users,
    Volume2,
    VolumeX,
    Clock,
    CheckCircle2,
    LogOut,
    Moon,
    Sparkles,
    Trash2,
    ArrowRight,
    Wand2,
    Music2
} from "lucide-react"
import { cn } from "@/lib/utils"

const DURATION_OPTIONS = [
    { value: 25, label: '25 min', description: 'Pomodoro Sprint' },
    { value: 45, label: '45 min', description: 'Deep Work' },
]

// Suggested tasks from Inbox (mock - will integrate with real data)
const SUGGESTED_TASKS = [
    { id: 'task-1', title: 'Review quarterly report', completed: false },
    { id: 'task-2', title: 'Reply to important emails', completed: false },
    { id: 'task-3', title: 'Update project documentation', completed: false },
]

export default function AdminModePage() {
    const [step, setStep] = useState<'setup' | 'session'>('setup')
    const [selectedDuration, setSelectedDuration] = useState(25)
    const [ambientSound, setAmbientSound] = useState(false)
    const [liveCount, setLiveCount] = useState(() => Math.floor(Math.random() * 5) + 1)

    // Playlist state
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(PLAYLISTS[0])
    const [isPlaying, setIsPlaying] = useState(true)

    // Task management
    const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([])
    const [newTaskInput, setNewTaskInput] = useState('')

    // Simulate live participant count
    useEffect(() => {
        const interval = setInterval(() => {
            setLiveCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1
                return Math.max(1, Math.min(20, prev + change))
            })
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    const handleAddTask = () => {
        if (!newTaskInput.trim()) return
        const newTask: TaskItem = {
            id: `custom-${Date.now()}`,
            title: newTaskInput.trim(),
            completed: false,
        }
        setSelectedTasks(prev => [...prev, newTask])
        setNewTaskInput('')
    }

    const handleAddSuggestedTask = (task: typeof SUGGESTED_TASKS[0]) => {
        if (selectedTasks.find(t => t.id === task.id)) return
        setSelectedTasks(prev => [...prev, { ...task }])
    }

    const handleRemoveTask = (taskId: string) => {
        setSelectedTasks(prev => prev.filter(t => t.id !== taskId))
    }

    const handleToggleTask = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        )
    }

    const handleStartSession = () => {
        if (selectedTasks.length === 0) {
            // Add a default task if none selected
            setSelectedTasks([{ id: 'default', title: 'Focus on admin tasks', completed: false }])
        }
        setStep('session')
        setLiveCount(prev => prev + 1)
    }

    const handleEndSession = () => {
        setStep('setup')
        setLiveCount(prev => Math.max(1, prev - 1))
    }

    const completedCount = selectedTasks.filter(t => t.completed).length

    // ==================== SESSION VIEW ====================
    if (step === 'session') {
        return (
            <div className="min-h-screen relative overflow-hidden">
                {/* Therapeutic Background - Reserved space for future visual elements */}
                <div className="fixed inset-0 -z-10">
                    {/* Gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-50/30 via-background to-blue-50/20 dark:from-amber-950/20 dark:via-background dark:to-blue-950/10" />

                    {/* Floating decorative elements placeholder */}
                    <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-amber-200/10 blur-3xl animate-float" />
                    <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-blue-200/10 blur-2xl animate-float-delayed" />
                    <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-green-200/10 blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-purple-200/10 blur-2xl animate-float-delayed" />
                </div>

                {/* Minimal header */}
                <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-background/60 backdrop-blur-md border-b border-border/50">
                    <ParticipantCount
                        count={liveCount}
                        isConnected={true}
                        size="md"
                    />

                    <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-600 border-green-500/20"
                    >
                        <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                        Admin Night
                    </Badge>

                    <div className="relative flex items-center gap-2">
                        {selectedPlaylist && selectedPlaylist.id !== 'silence' && (
                            <span className="text-sm text-muted-foreground hidden sm:block">
                                {selectedPlaylist.emoji} {selectedPlaylist.name}
                            </span>
                        )}
                        <MiniPlayer
                            playlist={selectedPlaylist}
                            isPlaying={isPlaying}
                            onPlayingChange={setIsPlaying}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="pt-24 pb-8 px-4 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                    {/* Left: Hourglass Timer */}
                    <div className="flex flex-col items-center">
                        <HourglassTimer
                            durationMinutes={selectedDuration}
                            onComplete={handleEndSession}
                        />

                        {/* Prominent participant count */}
                        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                                    {liveCount} {liveCount === 1 ? '人' : '人'}也在 Admin Time
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                一起專注，一起完成 ✨
                            </p>
                        </div>
                    </div>

                    {/* Right: Task List & Player */}
                    <div className="w-full max-w-sm space-y-4">
                        {/* YouTube Player (if playlist selected) */}
                        {selectedPlaylist && selectedPlaylist.id !== 'silence' && (
                            <YouTubePlayer
                                playlist={selectedPlaylist}
                                isPlaying={isPlaying}
                                onPlayingChange={setIsPlaying}
                                className="shadow-xl"
                            />
                        )}

                        <Card className="bg-card/80 backdrop-blur-sm border-border/50 shadow-xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                                    Today&apos;s Tasks
                                </CardTitle>
                                <CardDescription>
                                    {completedCount} of {selectedTasks.length} completed
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TaskChecklist
                                    tasks={selectedTasks}
                                    onToggle={handleToggleTask}
                                />
                            </CardContent>
                        </Card>

                        {/* Exit Button */}
                        <Button
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-destructive"
                            onClick={handleEndSession}
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit Session Early
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // ==================== SETUP VIEW ====================
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-amber-50/10 dark:to-amber-950/5">
            <div className="container mx-auto max-w-2xl py-12 px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="mb-6 inline-flex">
                        <div className="relative">
                            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-5 rounded-3xl shadow-lg shadow-amber-500/20">
                                <Moon className="h-10 w-10 text-white" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">
                        Admin Night
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Focus together in productive silence
                    </p>
                </div>

                {/* Live Count */}
                <Card className="mb-6 bg-green-500/5 border-green-500/20">
                    <CardContent className="py-3">
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="font-medium">
                                {liveCount} {liveCount === 1 ? 'person is' : 'people are'} focusing now
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 1: Duration Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-5 w-5" />
                            1. Choose Focus Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-3">
                            {DURATION_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedDuration(option.value)}
                                    className={cn(
                                        "relative p-4 rounded-xl border-2 transition-all text-left",
                                        selectedDuration === option.value
                                            ? "border-primary bg-primary/5 shadow-md"
                                            : "border-muted hover:border-muted-foreground/30"
                                    )}
                                >
                                    {selectedDuration === option.value && (
                                        <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                                    )}
                                    <span className="text-2xl font-bold block">{option.label}</span>
                                    <span className="text-xs text-muted-foreground">{option.description}</span>
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Task Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle2 className="h-5 w-5" />
                            2. What will you work on?
                        </CardTitle>
                        <CardDescription>
                            Select from your inbox or add custom tasks
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Add Custom Task */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add a task..."
                                value={newTaskInput}
                                onChange={(e) => setNewTaskInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleAddTask}
                                disabled={!newTaskInput.trim()}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* AI Suggestion Hint */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                            <Wand2 className="h-3.5 w-3.5" />
                            <span>AI can help break down complex tasks</span>
                        </div>

                        {/* Selected Tasks */}
                        {selectedTasks.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm font-medium">Selected ({selectedTasks.length})</p>
                                {selectedTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10"
                                    >
                                        <span className="text-sm">{task.title}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemoveTask(task.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Suggested Tasks (from Inbox) */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">From your inbox</p>
                            {SUGGESTED_TASKS.filter(t => !selectedTasks.find(s => s.id === t.id)).map((task) => (
                                <button
                                    key={task.id}
                                    onClick={() => handleAddSuggestedTask(task)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg border border-dashed hover:border-primary/50 hover:bg-muted/50 transition-colors text-left"
                                >
                                    <span className="text-sm text-muted-foreground">{task.title}</span>
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 3: Playlist Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Music2 className="h-5 w-5" />
                            3. Choose Focus Music
                        </CardTitle>
                        <CardDescription>
                            Pick a playlist or focus in silence
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PlaylistSelector
                            selectedPlaylist={selectedPlaylist}
                            onSelect={setSelectedPlaylist}
                        />
                    </CardContent>
                </Card>

                {/* Start Button */}
                <Button
                    size="lg"
                    className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20"
                    onClick={handleStartSession}
                >
                    Start Session
                    <ArrowRight className="h-5 w-5" />
                </Button>

                {/* Selected playlist hint */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                    {selectedPlaylist && selectedPlaylist.id !== 'silence'
                        ? `🎵 You'll be listening to ${selectedPlaylist.name}`
                        : '🔇 You chose to focus in silence'}
                </p>
            </div>
        </div>
    )
}
