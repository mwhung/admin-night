// Admin Mode Page
// Join the shared Admin Night focus session with task planning

'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { HourglassTimer, HourglassTimerRef } from "@/components/features/session/hourglass-timer"
import { TaskChecklist, TaskItem } from "@/components/features/session/task-checklist"
import { ParticipantCount } from "@/components/features/session"
import { PLAYLISTS } from "@/components/features/session/youtube-player"
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
    Loader2,
    Inbox as InboxIcon,
    GripVertical,
    Trophy
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { IntentWall } from "@/components/features/session/intent-wall"
import { ReactionOverlay } from "@/components/features/session/reaction-overlay"
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { cn } from "@/lib/utils"
import { useAuth } from '@/lib/hooks/useAuth'
import { useSessionPresence } from '@/lib/realtime'
import { useJoinSession, useLeaveSession, useSessions, useCreateSession } from '@/lib/hooks/useSessions'
import { useAchievementTracker } from '@/lib/hooks/use-achievement-tracker'
import { AchievementToast, SessionSummary } from '@/components/features/achievements'

const DURATION_OPTIONS = [
    { value: 25, label: '25 min', description: 'Quick Session' },
    { value: 45, label: '45 min', description: 'Extended Session' },
    { value: 'custom', label: 'Custom', description: 'Set your own' },
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
    isFromLastSession?: boolean;
}

interface SortableTaskItemProps {
    task: TaskItem;
    onRemove: (id: string) => void;
    isSessionTheme?: boolean;
}

function SortableTaskItem({ task, onRemove, isSessionTheme = false }: SortableTaskItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center justify-between p-3 rounded-lg shadow-sm transition-all",
                isSessionTheme ? "bg-primary/5 border border-primary/10" : "bg-primary/10 border border-primary/20",
                isDragging ? "opacity-50 scale-102 shadow-lg border-primary/40 bg-primary/20 ring-1 ring-primary/20" : "opacity-100"
            )}
        >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-primary/10 rounded transition-colors text-muted-foreground/40 hover:text-primary/60"
                >
                    <GripVertical className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium truncate">{task.title}</span>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => onRemove(task.id)}
            >
                <Trash2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

export default function AdminModePage() {
    const timerRef = useRef<HourglassTimerRef>(null)
    const [step, setStep] = useState<'setup' | 'session' | 'finished'>('setup')
    const [showIntentWall, setShowIntentWall] = useState(true)
    const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(25)
    const [customDuration, setCustomDuration] = useState(30)
    const [liveCount, setLiveCount] = useState(() => Math.floor(Math.random() * 5) + 1)
    const [historyTasks, setHistoryTasks] = useState<TaskItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [sessionSummary, setSessionSummary] = useState<string | null>(null)
    const [newAchievementsCount, setNewAchievementsCount] = useState(0)
    const [loadingSummary, setLoadingSummary] = useState(false)

    // Get the actual duration value to use
    const actualDuration = selectedDuration === 'custom' ? customDuration : selectedDuration
    // Task management
    const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([])
    const [newTaskInput, setNewTaskInput] = useState('')

    // Auth and Presence
    const { user } = useAuth()
    const { data: sessionsData } = useSessions({ status: 'ACTIVE' })
    const joinSessionMutation = useJoinSession()
    const leaveSessionMutation = useLeaveSession()
    const createSessionMutation = useCreateSession()

    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

    const { participantCount: realLiveCount, isConnected } = useSessionPresence({
        sessionId: activeSessionId || 'global',
        userId: user?.id || 'anonymous',
        userName: user?.user_metadata?.name || user?.email || 'Anonymous',
        enabled: step === 'session'
    })

    // Achievement Tracking
    const {
        sessionState,
        pendingToast,
        trackPause,
        trackTaskComplete,
        initSession,
        dismissToast,
        checkInSessionAchievements,
    } = useAchievementTracker()

    // Initialize session when entering session step
    useEffect(() => {
        if (step === 'session' && activeSessionId) {
            initSession(activeSessionId)
        }
    }, [step, activeSessionId, initSession])

    // Check achievements when tasks change
    useEffect(() => {
        if (step === 'session') {
            checkInSessionAchievements()
        }
    }, [sessionState.tasksCompletedCount, checkInSessionAchievements, step])

    // Track pauses (when drawer opens) for achievements
    useEffect(() => {
        if (step === 'session' && isTaskDrawerOpen) {
            trackPause()
        }
    }, [isTaskDrawerOpen, step, trackPause])

    // Drag and Drop Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setSelectedTasks((items) => {
                const oldIndex = items.findIndex((t) => t.id === active.id);
                const newIndex = items.findIndex((t) => t.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Use actual count when in session, otherwise use simulated or global
    const displayCount = step === 'session' ? realLiveCount : liveCount

    // Fetch history and unfinished tasks
    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true)
            try {
                // Request info about the last session tasks
                const res = await fetch('/api/tasks?limit=20&includeLastSession=true')
                if (res.ok) {
                    const data = await res.json()

                    // Transform and sort: Prioritize only tasks from the LAST session
                    const tasks: TaskItem[] = data.map((t: TaskFromApi) => ({
                        id: t.id,
                        title: t.title,
                        completed: false,
                        state: t.state,
                        isFromLastSession: t.isFromLastSession
                    }))

                    // Sort: Last session's pending tasks FIRST
                    const sortedTasks = [...tasks].sort((a, b) => {
                        const aPendingLast = a.isFromLastSession && a.state !== 'RESOLVED'
                        const bPendingLast = b.isFromLastSession && b.state !== 'RESOLVED'

                        if (aPendingLast && !bPendingLast) return -1
                        if (!aPendingLast && bPendingLast) return 1

                        // Fallback to general pending (if any others were manually added in inbox)
                        const aPending = a.state !== 'RESOLVED'
                        const bPending = b.state !== 'RESOLVED'
                        if (aPending && !bPending) return -1
                        if (!aPending && bPending) return 1

                        return 0
                    })

                    setHistoryTasks(sortedTasks)
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

    const syncTasksWithBackend = async () => {
        const newTasks = selectedTasks.filter(t => t.id.startsWith('custom-') || t.id.startsWith('copy-'))

        if (newTasks.length > 0) {
            setIsSyncing(true)
            try {
                const res = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tasks: newTasks.map(t => ({ title: t.title }))
                    })
                })

                if (res.ok) {
                    const createdTasksFromApi = await res.json()
                    setSelectedTasks(prev => {
                        const existingRealTasks = prev.filter(t => !t.id.startsWith('custom-') && !t.id.startsWith('copy-'))
                        const syncedTasks = createdTasksFromApi.map((t: any) => ({
                            id: t.id,
                            title: t.title,
                            completed: false
                        }))
                        return [...existingRealTasks, ...syncedTasks]
                    })
                    return true
                }
            } catch (err) {
                console.error('Failed to sync tasks to database', err)
            } finally {
                setIsSyncing(false)
            }
        }
        return false
    }

    const handleStartSession = async () => {
        const tasksToSync = selectedTasks.length > 0
            ? selectedTasks
            : [{ id: 'default', title: 'Focus on admin tasks', completed: false }]

        await syncTasksWithBackend()

        // Session Management
        try {
            let sessionId = sessionsData?.sessions[0]?.id

            if (!sessionId) {
                // Create a new session if none is active
                const newSession = await createSessionMutation.mutateAsync({
                    scheduledStart: new Date(),
                    durationMinutes: actualDuration as number
                })
                sessionId = newSession.session.id
            }

            if (sessionId) {
                setActiveSessionId(sessionId)
                await joinSessionMutation.mutateAsync(sessionId)
            }
        } catch (err) {
            console.error('Failed to handle session join', err)
        }

        setStep('session')
        setShowIntentWall(false) // Hide wall when session starts
    }

    const handleToggleTask = async (taskId: string) => {
        const task = selectedTasks.find(t => t.id === taskId)
        if (!task) return

        const newCompleted = !task.completed

        // Optimistic update
        setSelectedTasks(prev =>
            prev.map(t => t.id === taskId ? { ...t, completed: newCompleted } : t)
        )

        // API update if it's a real DB task (all tasks in session should be now)
        if (!taskId.startsWith('custom-') && !taskId.startsWith('copy-')) {
            try {
                // If checking as completed, track for achievements
                if (newCompleted) {
                    trackTaskComplete()
                }

                await fetch(`/api/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        state: newCompleted ? 'RESOLVED' : 'IN_PROGRESS'
                    })
                })
            } catch (err) {
                console.error('Failed to update task status', err)
            }
        }
    }


    const handleEndSession = async () => {
        const seconds = timerRef.current?.getElapsedTime() || 0
        setElapsedSeconds(seconds)
        setStep('finished')
        setLoadingSummary(true)

        if (activeSessionId) {
            try {
                // Leave session first
                await leaveSessionMutation.mutateAsync({
                    sessionId: activeSessionId,
                    tasksWorkedOn: selectedTasks.map(t => t.id)
                })

                // Call session complete API for achievements and summary
                const completedCount = selectedTasks.filter(t => t.completed).length
                const res = await fetch(`/api/sessions/${activeSessionId}/complete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        durationMinutes: Math.floor(seconds / 60),
                        tasksCompleted: completedCount,
                        pauseCount: 0, // TODO: track actual pauses
                    })
                })

                if (res.ok) {
                    const data = await res.json()
                    setSessionSummary(data.summary || null)
                    setNewAchievementsCount(data.newAchievements?.length || 0)
                }
            } catch (err) {
                console.error('Failed to complete session', err)
            } finally {
                setLoadingSummary(false)
            }
        } else {
            setLoadingSummary(false)
        }
    }


    const handleAdjustTasks = () => {
        setIsTaskDrawerOpen(true)
    }

    const handleSaveTaskChanges = async () => {
        await syncTasksWithBackend()
        setIsTaskDrawerOpen(false)
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
                {/* Intent Wall Overlay (Active before session starts fully, or during setup) */}
                <AnimatePresence>
                    {showIntentWall && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
                        >
                            <div className="w-full max-w-4xl relative">
                                <IntentWall onSelect={(cat) => console.log('Selected intent:', cat)} />
                                <div className="text-center mt-12">
                                    <Button
                                        onClick={() => setShowIntentWall(false)}
                                        size="lg"
                                        className="h-14 px-8 rounded-full text-lg font-light shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                    >
                                        I'm ready to start
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reaction Overlay (Active during session) */}
                {!showIntentWall && <ReactionOverlay />}

                {/* Achievement Toast */}
                <AchievementToast
                    achievement={pendingToast}
                    onDismiss={dismissToast}
                />

                {/* Therapeutic Background */}
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background-warm to-background" />

                {/* Task Modification Drawer */}
                <div
                    className={cn(
                        "fixed inset-y-0 left-0 w-full max-w-sm bg-card/95 backdrop-blur-xl border-r border-primary/10 shadow-2xl z-50 transition-all duration-500 ease-in-out transform flex flex-col",
                        isTaskDrawerOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div>
                            <h2 className="text-xl font-light mb-1">Adjust Your Session</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Add or remove items while the timer continues</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add a missing task..."
                                    value={newTaskInput}
                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                                    className="flex-1"
                                />
                                <Button size="icon" variant="outline" onClick={handleAddTask}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {selectedTasks.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-primary uppercase">Current Tasks</p>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        modifiers={[restrictToVerticalAxis]}
                                    >
                                        <div className="space-y-2">
                                            <SortableContext
                                                items={selectedTasks.map(t => t.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {selectedTasks.map((task) => (
                                                    <SortableTaskItem
                                                        key={task.id}
                                                        task={task}
                                                        onRemove={handleRemoveTask}
                                                        isSessionTheme={true}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </div>
                                    </DndContext>
                                </div>
                            )}

                            <div>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Quick Add</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {QUICK_SUGGESTIONS.filter(t => !selectedTasks.find(s => s.title === t.title)).slice(0, 3).map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleAddSuggestedTask(task)}
                                            className="flex items-center justify-between p-2 rounded-lg border border-dashed hover:bg-primary/5 text-left transition-colors"
                                        >
                                            <span className="text-xs">{task.title}</span>
                                            <Plus className="h-3 w-3 text-muted-foreground" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-primary/10 bg-muted/20">
                        <Button className="w-full h-12 shadow-lg group" onClick={handleSaveTaskChanges} disabled={isSyncing}>
                            {isSyncing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                            )}
                            Save Changes & Resume
                        </Button>
                    </div>
                </div>

                {/* Overlay */}
                {isTaskDrawerOpen && (
                    <div
                        className="fixed inset-0 bg-background/40 backdrop-blur-sm z-40 animate-in fade-in duration-300"
                        onClick={() => setIsTaskDrawerOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="pt-8 pb-8 px-4 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
                    {/* ... (Existing Hourglass and Participant Count) ... */}
                    {/* Left: Hourglass Timer */}
                    <div className="flex flex-col items-center">
                        <HourglassTimer
                            ref={timerRef}
                            durationMinutes={actualDuration}
                            onComplete={handleEndSession}
                            paused={isTaskDrawerOpen}
                        />

                        {/* Add Time Buttons */}
                        <div className="flex gap-2 mt-6 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-[10px] h-8 px-4 flex items-center gap-1 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                                onClick={() => timerRef.current?.addTime(5)}
                            >
                                <Plus className="h-3 w-3" /> 5m
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full text-[10px] h-8 px-4 flex items-center gap-1 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all"
                                onClick={() => timerRef.current?.addTime(10)}
                            >
                                <Plus className="h-3 w-3" /> 10m
                            </Button>
                        </div>

                        {/* Prominent participant count */}
                        <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20">
                                <span className="h-2 w-2 bg-success rounded-full animate-pulse" />
                                <span className="text-sm font-medium text-foreground/80">
                                    {displayCount} {displayCount === 1 ? 'person is' : 'people are'} releasing burdens
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Focus together, finish together ✨
                            </p>
                        </div>
                    </div>

                    {/* Right: Task List */}
                    <div className="w-full max-w-sm space-y-4">

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

                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="w-full bg-background/50 hover:bg-background/80 border-border/40"
                                onClick={handleAdjustTasks}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Modify Tasks
                            </Button>

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
            </div>
        )
    }

    // ==================== FINISHED VIEW ====================
    if (step === 'finished') {
        const completedTasks = selectedTasks.filter(t => t.completed)
        const pendingTasks = selectedTasks.filter(t => !t.completed)

        return (
            <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
                {/* Therapeutic Background */}
                <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background via-background-warm to-secondary/10" />

                {/* Ritual Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] animate-pulse" />

                <Card className="w-full max-w-lg shadow-2xl border-primary/5 bg-card/60 backdrop-blur-2xl animate-in zoom-in-95 duration-1000">
                    <CardHeader className="text-center pb-2">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="bg-primary/5 p-6 rounded-full">
                                    <Moon className="h-10 w-10 text-primary/60" />
                                </div>
                                <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-primary/40 animate-pulse" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-light tracking-tight text-foreground/90">
                            Released
                        </CardTitle>
                        <CardDescription className="text-base mt-4 font-light leading-relaxed">
                            You&apos;ve let go of what you were tightly holding onto. <br />
                            By closing these open loops, you&apos;ve given yourself the gift of a clearer mind.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-6">
                        {/* Session Summary (LLM + Achievements) */}
                        <SessionSummary
                            llmSummary={sessionSummary || ''}
                            newAchievementCount={newAchievementsCount}
                            isLoading={loadingSummary}
                        />

                        {/* Status Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary/5 rounded-2xl p-4 text-center border border-primary/10">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Released</p>
                                <p className="text-2xl font-light text-primary">{completedTasks.length}</p>
                            </div>
                            <div className="bg-muted/30 rounded-2xl p-4 text-center border border-border/50">
                                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Time Spent</p>
                                <p className="text-2xl font-light text-foreground/70">
                                    {elapsedSeconds < 60
                                        ? `${elapsedSeconds}s`
                                        : `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60 > 0 ? `${elapsedSeconds % 60}s` : ''}`.trim()}
                                </p>
                            </div>
                        </div>

                        {/* Task List - Categorized by Relief */}
                        <div className="space-y-4">
                            {completedTasks.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-success/70 uppercase tracking-widest">Released Items:</p>
                                    {completedTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-success/5 border border-success/10 text-success/80"
                                        >
                                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                                            <span className="text-sm font-light">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {pendingTasks.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Still Holding:</p>
                                    <p className="text-[10px] text-muted-foreground/60 italic -mt-1 mb-2">They are safely stored Open Loops. Focus on your rest for now.</p>
                                    {pendingTasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-background/40 border border-dashed border-border text-muted-foreground/70"
                                        >
                                            <Clock className="h-4 w-4 shrink-0" />
                                            <span className="text-sm font-light">{task.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Closure Quote & Action */}
                        <div className="text-center space-y-6 pt-6 border-t border-primary/5">
                            <p className="text-sm text-muted-foreground/80 font-light italic leading-relaxed">
                                &ldquo;You don&apos;t need to do everything — you just need to stop carrying it.&rdquo;
                            </p>
                            <Button
                                className="w-full h-14 gap-2 text-md font-light rounded-2xl shadow-xl shadow-primary/10 transition-all hover:shadow-primary/20"
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
                        Releasing burdens and closing open loops together
                    </p>
                </div>

                {/* Live Count */}
                <Card className="mb-6 bg-success/5 border-success/10">
                    <CardContent className="py-3">
                        <div className="flex items-center justify-center gap-2">
                            <span className="h-2.5 w-2.5 bg-success rounded-full animate-pulse" />
                            <span className="font-medium">
                                {displayCount} {displayCount === 1 ? 'person is' : 'people are'} focusing now
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* Step 1: Task Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CheckCircle2 className="h-5 w-5" />
                            1. Declutter Your Mind
                        </CardTitle>
                        <CardDescription>
                            Choose items to focus on during this session (Open Loops).
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
                            <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <p className="text-xs font-semibold uppercase tracking-wider text-primary">Selected for this session</p>
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                    modifiers={[restrictToVerticalAxis]}
                                >
                                    <div className="space-y-2">
                                        <SortableContext
                                            items={selectedTasks.map(t => t.id)}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {selectedTasks.map((task) => (
                                                <SortableTaskItem
                                                    key={task.id}
                                                    task={task}
                                                    onRemove={handleRemoveTask}
                                                />
                                            ))}
                                        </SortableContext>
                                    </div>
                                </DndContext>
                                <p className="text-[10px] text-muted-foreground italic text-center">Drag to reorder tasks</p>
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

                            {/* Recent History / Task Drawer */}
                            {historyTasks.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-3 border-t border-border/30 pt-4">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            <InboxIcon className="h-3 w-3" />
                                            From Your Task Drawer
                                        </p>
                                        {loadingHistory && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {historyTasks
                                            .filter(t => !selectedTasks.find(s => s.title === t.title))
                                            .slice(0, 5) // Show top 5 prioritized items
                                            .map((task: any) => (
                                                <button
                                                    key={task.id}
                                                    onClick={() => handleAddSuggestedTask(task)}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border transition-all text-left group",
                                                        (task.isFromLastSession && task.state !== 'RESOLVED')
                                                            ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                                                            : "bg-muted/30 border-dashed hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className={cn(
                                                            "text-sm",
                                                            (task.isFromLastSession && task.state !== 'RESOLVED') ? "text-foreground font-medium" : "text-muted-foreground"
                                                        )}>
                                                            {task.title}
                                                        </span>
                                                        {task.isFromLastSession && task.state !== 'RESOLVED' && (
                                                            <span className="text-[9px] uppercase tracking-tighter text-primary/60 font-bold">From your last session</span>
                                                        )}
                                                    </div>
                                                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 2: Duration Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Clock className="h-5 w-5" />
                            2. Select Session Length
                        </CardTitle>
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

                        {/* Custom Duration Input */}
                        {selectedDuration === 'custom' && (
                            <div className="mt-4 flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
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

                {/* Step 3: Playlist Selection - Coming Soon */}
                <Card className="mb-6 opacity-60">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Music2 className="h-5 w-5" />
                                    3. Choose Focus Music
                                </CardTitle>
                                <CardDescription>
                                    Pick a playlist or focus in silence
                                </CardDescription>
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

                {/* Start Button */}
                <Button
                    size="lg"
                    className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-success hover:text-success-foreground hover:shadow-success/25"
                    onClick={handleStartSession}
                >
                    Start Session
                    <ArrowRight className="h-5 w-5" />
                </Button>

            </div>
        </div>
    )
}
