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
    CheckCircle2,
    Clock,
    LogOut,
    Moon,
    Sparkles,
    Trash2,
    ArrowRight,
    Music2,
    Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"

const DURATION_OPTIONS = [
    { value: 25, label: '25 min', description: 'Pomodoro Sprint' },
    { value: 45, label: '45 min', description: 'Deep Work' },
]

const QUICK_SUGGESTIONS = [
    { id: 'common-1', title: 'Inbox Zero (Clear Emails)', completed: false },
    { id: 'common-2', title: 'Pay Bills & Invoices', completed: false },
    { id: 'common-3', title: 'Financial Admin & Receipts', completed: false },
    { id: 'common-4', title: 'Update Personal Calendar', completed: false },
    { id: 'common-5', title: 'Weekly Planning & Strategy', completed: false },
]

interface TaskFromApi {
    id: string;
    title: string;
    state: string;
}

export default function AdminModePage() {
    const [step, setStep] = useState<'setup' | 'session' | 'finished'>('setup')
    const [selectedDuration, setSelectedDuration] = useState(25)
    const [liveCount, setLiveCount] = useState(() => Math.floor(Math.random() * 5) + 1)
    const [historyTasks, setHistoryTasks] = useState<TaskItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Playlist state
    const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(PLAYLISTS[0])
    const [isPlaying, setIsPlaying] = useState(true)

    // Task management
    const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([])
    const [newTaskInput, setNewTaskInput] = useState('')

    // Fetch history tasks
    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true)
            try {
                const res = await fetch('/api/tasks?limit=5')
                if (res.ok) {
                    const data = await res.json()
                    // Transform prisma task to TaskItem
                    const tasks: TaskItem[] = data.map((t: TaskFromApi) => ({
                        id: t.id,
                        title: t.title,
                        completed: false
                    }))
                    setHistoryTasks(tasks)
                }
            } catch (err) {
                console.error('Failed to fetch task history', err)
            } finally {
                setLoadingHistory(false)
            }
        }
        if (step === 'setup') fetchHistory()
    }, [step])

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

    const handleAddSuggestedTask = (task: TaskItem) => {
        if (selectedTasks.find(t => t.id === task.id)) return
        setSelectedTasks(prev => [...prev, { ...task, id: `copy-${task.id}-${Date.now()}` }])
    }

    const handleRemoveTask = (taskId: string) => {
        setSelectedTasks(prev => prev.filter(t => t.id !== taskId))
    }

    const handleToggleTask = (taskId: string) => {
        setSelectedTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
        )
    }

    const handleStartSession = async () => {
        const tasksToSync = selectedTasks.length > 0
            ? selectedTasks
            : [{ id: 'default', title: 'Focus on admin tasks', completed: false }]

        // Optimistically set step
        setStep('session')
        setLiveCount(prev => prev + 1)

        // Persistence: Sync tasks to DB so they appear in history later
        try {
            await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tasks: tasksToSync.map(t => ({ title: t.title }))
                })
            })
        } catch (err) {
            console.error('Failed to sync tasks to database', err)
        }
    }

    const handleEndSession = () => {
        setStep('finished')
        setLiveCount(prev => Math.max(1, prev - 1))
    }

    const handleBackToSetup = () => {
        setStep('setup')
        setSelectedTasks([])
    }

    const completedCount = selectedTasks.filter(t => t.completed).length

    // ==================== SESSION VIEW ====================
    if (step === 'session') {
        return (
            <div className="min-h-screen relative overflow-hidden">
                {/* Therapeutic Background - Reserved space for future visual elements */}
                <div className="fixed inset-0 -z-10">
                    {/* Monochromatic background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-background-warm to-background" />

                    {/* Floating decorative elements placeholder */}
                    <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-3xl animate-float" />
                    <div className="absolute top-40 right-20 w-24 h-24 rounded-full bg-secondary/20 blur-2xl animate-float-delayed" />
                    <div className="absolute bottom-32 left-1/4 w-40 h-40 rounded-full bg-primary/5 blur-3xl animate-float" />
                    <div className="absolute bottom-20 right-1/3 w-28 h-28 rounded-full bg-muted/30 blur-2xl animate-float-delayed" />
                </div>

                {/* Main Content */}
                <div className="pt-8 pb-8 px-4 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                    {/* Left: Hourglass Timer */}
                    <div className="flex flex-col items-center">
                        <HourglassTimer
                            durationMinutes={selectedDuration}
                            onComplete={handleEndSession}
                        />

                        {/* Prominent participant count */}
                        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                                <span className="h-2 w-2 bg-primary/40 rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-foreground/80">
                                    {liveCount} {liveCount === 1 ? 'person' : 'people'} also in Admin Time
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Focus together, finish together ✨
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
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-primary/60" />
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

    // ==================== FINISHED VIEW ====================
    if (step === 'finished') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
                <Card className="w-full max-w-md shadow-2xl border-primary/10 bg-card/50 backdrop-blur-xl animate-in zoom-in-95 duration-500">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-extralight text-primary">
                            Session Complete
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                            You&apos;ve put those burdens down. Now you can rest in peace.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-4">
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In this session, you handled:</p>
                            <div className="space-y-2">
                                {selectedTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                                            task.completed
                                                ? "bg-primary/5 border-primary/20 text-primary"
                                                : "bg-muted/30 border-muted text-muted-foreground"
                                        )}
                                    >
                                        {task.completed ? (
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                                        ) : (
                                            <Clock className="h-4 w-4 shrink-0" />
                                        )}
                                        <span className="text-sm font-medium">{task.title}</span>
                                        {task.completed && <span className="text-xs ml-auto font-bold opacity-70">DONE</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center space-y-4 pt-4 border-t border-border/50">
                            <p className="text-xs text-muted-foreground italic">
                                &ldquo;Focus is a sign of respect for time. You did great.&rdquo;
                            </p>
                            <Button
                                className="w-full h-12 gap-2 text-lg shadow-lg"
                                onClick={handleBackToSetup}
                            >
                                Back to Lounge
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // ==================== SETUP VIEW ====================
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
            <div className="container mx-auto max-w-2xl py-12 px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="mb-6 inline-flex">
                        <div className="relative">
                            <div className="bg-primary p-5 rounded-3xl shadow-lg shadow-primary/10">
                                <Moon className="h-10 w-10 text-primary-foreground" />
                            </div>
                            <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary/40" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extralight tracking-tight mb-2">
                        Admin Night
                    </h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Focus together in productive silence
                    </p>
                </div>

                {/* Live Count */}
                <Card className="mb-6 bg-primary/5 border-primary/10">
                    <CardContent className="py-3">
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-2.5 w-2.5 bg-primary/40 rounded-full animate-pulse" />
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
                            Enter a task or choose from suggestions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Add Custom Task */}
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter a new task..."
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

                        {/* Selected Tasks - Moved up for visibility */}
                        {selectedTasks.length > 0 && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Selected for this session</p>
                                {selectedTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 shadow-sm"
                                    >
                                        <span className="text-sm font-medium">{task.title}</span>
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

                        {/* Suggestions Grid */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Quick Suggestions</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {QUICK_SUGGESTIONS.filter(t => !selectedTasks.find(s => s.title === t.title)).map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleAddSuggestedTask(task)}
                                            className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                        >
                                            <span className="text-sm text-foreground/80 group-hover:text-foreground">{task.title}</span>
                                            <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Recent History */}
                            {historyTasks.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</p>
                                        {loadingHistory && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {historyTasks
                                            .filter(t => !selectedTasks.find(s => s.title === t.title))
                                            .slice(0, 3)
                                            .map((task) => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => handleAddSuggestedTask(task)}
                                                    className="flex items-center justify-between p-3 rounded-xl border border-dashed bg-muted/30 hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                                >
                                                    <span className="text-sm text-muted-foreground group-hover:text-foreground">{task.title}</span>
                                                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
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
