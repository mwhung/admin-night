// Admin Mode Page
// Join the shared Admin Night focus session with task planning

'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HourglassTimer, HourglassTimerRef } from "@/components/features/session/hourglass-timer"
import { TaskChecklist, TaskItem } from "@/components/features/session/task-checklist"
import {
    Plus,
    CheckCircle2,
    Clock,
    LogOut,
    Moon,
    Sparkles,
    Trash2,
    ArrowRight,
    Loader2,
    Inbox as InboxIcon,
    GripVertical,
    Mail,
    CreditCard,
    Wallet,
    Calendar,
    ListChecks,
    RefreshCw,
    HandCoins,
    FolderOpen,
    HeartPulse,
    IdCard,
    FileText,
} from "lucide-react"
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
import { useStartSession } from '@/lib/hooks/useSessions'
import { useAchievementTracker } from '@/lib/hooks/use-achievement-tracker'
import { AchievementToast, SessionSummary } from '@/components/features/achievements'
import { SESSION_DURATION_MAX, SESSION_DURATION_MIN } from '@/lib/constants/session'
import { SessionSoundscapePlayer, SoundscapeSelector, useSessionRuntime } from '@/components/features/session'
import { QUICK_TASK_SUGGESTION_SEEDS } from '@/lib/session/task-suggestion-seeds'
import { buildSetupTaskSuggestionPools } from '@/lib/session/build-task-suggestions'
import { LAST_SESSION_TASKS_LIMIT, selectLastSessionPendingTasks } from '@/lib/session/last-session-tasks'
import {
    DEFAULT_SOUNDSCAPE_ID,
    DEFAULT_SOUNDSCAPE_LOOP_MODE,
    DEFAULT_SOUNDSCAPE_VOLUME,
    SILENCE_SOUNDSCAPE_ID,
    clampSoundscapeVolume,
    isSoundscapeId,
    isSoundscapeLoopMode,
    type SoundscapeId,
    type SoundscapeLoopMode,
    type SoundscapePreferencePayload,
    type SoundscapePlaybackState,
} from '@/lib/session/soundscapes'

const DURATION_OPTIONS = [
    { value: 25, label: '25 min', description: 'Quick Session' },
    { value: 45, label: '45 min', description: 'Extended Session' },
    { value: 'custom', label: 'Custom', description: 'Set your own' },
]
const SESSION_CONNECTING_STATUS_DELAY_MS = 600
const SOUNDSCAPE_PREFERENCES_STORAGE_KEY = 'admin-night:soundscape-preferences'
const SOUNDSCAPE_PREFERENCES_SAVE_DELAY_MS = 300

const normalizeTaskTitle = (title: string): string => title.trim().toLowerCase()
const isEphemeralTaskId = (taskId: string): boolean => (
    taskId.startsWith('custom-') || taskId.startsWith('copy-')
)
const isLocalSessionId = (value: string | null | undefined): value is string => (
    typeof value === 'string' && value.startsWith('local-')
)
const resolvePreferredSessionId = (...sessionIds: Array<string | null | undefined>): string | null => {
    const validSessionIds = sessionIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
    const persistedSessionId = validSessionIds.find((id) => !isLocalSessionId(id))
    return persistedSessionId ?? validSessionIds[0] ?? null
}

const normalizeSoundscapePreferences = (
    payload: Partial<SoundscapePreferencesResponse> | null | undefined
): Partial<SoundscapePreferencePayload> => {
    if (!payload) return {}

    const normalized: Partial<SoundscapePreferencePayload> = {}

    if (isSoundscapeId(payload.soundscape_id)) {
        normalized.soundscape_id = payload.soundscape_id
    }

    if (typeof payload.soundscape_volume === 'number') {
        normalized.soundscape_volume = clampSoundscapeVolume(payload.soundscape_volume)
    }

    if (typeof payload.soundscape_shuffle === 'boolean') {
        normalized.soundscape_shuffle = payload.soundscape_shuffle
    }

    if (isSoundscapeLoopMode(payload.soundscape_loop_mode)) {
        normalized.soundscape_loop_mode = payload.soundscape_loop_mode
    }

    return normalized
}

const readSoundscapePreferencesFromStorage = (): Partial<SoundscapePreferencePayload> => {
    if (typeof window === 'undefined') return {}

    try {
        const raw = window.localStorage.getItem(SOUNDSCAPE_PREFERENCES_STORAGE_KEY)
        if (!raw) return {}

        const parsed = JSON.parse(raw) as Partial<SoundscapePreferencesResponse>
        return normalizeSoundscapePreferences(parsed)
    } catch {
        return {}
    }
}

const writeSoundscapePreferencesToStorage = (payload: SoundscapePreferencePayload) => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(SOUNDSCAPE_PREFERENCES_STORAGE_KEY, JSON.stringify(payload))
}

type AdminModeWorkflowView = 'setup' | 'session' | 'summary'
type Step = 'setup' | 'session' | 'finished'

interface SessionSummaryResponse {
    summary: {
        sessionId: string
        llmSummary: string
        newAchievementCount: number
        elapsedSeconds: number
        tasks: TaskItem[]
    }
}

interface SyncSessionStartOptions {
    redirectOnSuccess?: boolean
}

interface AdminModeWorkflowProps {
    view: AdminModeWorkflowView
    sessionId?: string
}

interface TaskFromApi {
    id: string;
    title: string;
    state: string;
    isFromLastSession?: boolean;
}

interface SoundscapePreferencesResponse {
    soundscape_id?: string
    soundscape_volume?: number
    soundscape_shuffle?: boolean
    soundscape_loop_mode?: string
}

interface SortableTaskItemProps {
    task: TaskItem;
    onRemove: (id: string) => void;
    isSessionTheme?: boolean;
}

interface SessionStageHeaderProps {
    durationMinutes: number;
    statusMessage: string | null;
    statusIsError?: boolean;
}

interface SessionTimeAdjustControlsProps {
    onAddFiveMinutes: () => void;
    onAddTenMinutes: () => void;
}

interface TaskSuggestionLabelProps {
    title: string;
    titleClassName?: string;
    iconTone?: 'default' | 'primary';
}

interface TaskSuggestionIconProps {
    title: string;
    className?: string;
}

function TaskSuggestionIcon({ title, className }: TaskSuggestionIconProps) {
    if (/\b(inbox|email|mail)\b/i.test(title)) return <Mail className={className} />
    if (/\b(bill|invoice|payment|pay)\b/i.test(title)) return <CreditCard className={className} />
    if (/\b(financial|finance|receipt|expense)\b/i.test(title)) return <Wallet className={className} />
    if (/\b(calendar|schedule)\b/i.test(title)) return <Calendar className={className} />
    if (/\b(plan|planning|strategy)\b/i.test(title)) return <ListChecks className={className} />
    if (/\b(id|passport|license)\b/i.test(title)) return <IdCard className={className} />
    if (/\b(subscription|renew|membership)\b/i.test(title)) return <RefreshCw className={className} />
    if (/\b(reimburse|reimbursement)\b/i.test(title)) return <HandCoins className={className} />
    if (/\b(document|file|form|paperwork|organize)\b/i.test(title)) return <FolderOpen className={className} />
    if (/\b(health|checkup|medical|doctor)\b/i.test(title)) return <HeartPulse className={className} />

    return <FileText className={className} />
}

function TaskSuggestionLabel({
    title,
    titleClassName,
    iconTone = 'default',
}: TaskSuggestionLabelProps) {
    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <span
                className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border",
                    iconTone === 'primary'
                        ? "border-primary/20 bg-primary/10 text-primary/80"
                        : "border-border/50 bg-muted/35 text-muted-foreground"
                )}
            >
                <TaskSuggestionIcon title={title} className="h-3.5 w-3.5" />
            </span>
            <span className={cn("truncate text-sm", titleClassName)}>{title}</span>
        </div>
    )
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
                "flex items-center justify-between p-3 rounded-[calc(var(--radius)-0.125rem)] border shadow-[inset_0_1px_0_rgba(255,255,255,0.56)] transition-all",
                isSessionTheme
                    ? "bg-[var(--task-selected-bg-soft)] border-[var(--task-selected-border)]"
                    : "bg-[var(--task-selected-bg)] border-[var(--task-selected-border)]",
                isDragging
                    ? "opacity-65 scale-[1.01] shadow-[0_14px_28px_rgba(74,102,131,0.22)] border-[var(--task-selected-border-strong)] bg-[var(--task-selected-bg-strong)] ring-1 ring-[var(--task-selected-ring)]"
                    : "opacity-100"
            )}
        >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1.5 -ml-1 rounded-md transition-colors text-muted-foreground/50 hover:bg-white/35 hover:text-[var(--task-selected-handle)]"
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

function SessionStageHeader({
    durationMinutes,
    statusMessage,
    statusIsError = false,
}: SessionStageHeaderProps) {
    const hasStatusMessage = Boolean(statusMessage)

    return (
        <CardHeader className="space-y-2 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <Clock className="h-4 w-4 text-primary/75" />
                Session In Progress
            </CardTitle>
            <CardDescription
                role={hasStatusMessage ? "status" : undefined}
                aria-live={hasStatusMessage ? "polite" : undefined}
                className="flex min-h-5 items-center justify-between gap-3 text-sm text-muted-foreground"
            >
                <span
                    className={cn(
                        "truncate",
                        hasStatusMessage
                            ? statusIsError
                                ? "text-destructive"
                                : "text-muted-foreground"
                            : "select-none text-transparent"
                    )}
                >
                    {statusMessage ?? '\u00A0'}
                </span>
                <span className="font-semibold text-foreground/70">{durationMinutes} min</span>
            </CardDescription>
        </CardHeader>
    )
}

function SessionTimeAdjustControls({
    onAddFiveMinutes,
    onAddTenMinutes,
}: SessionTimeAdjustControlsProps) {
    return (
        <div className="mx-auto flex w-full max-w-[25.5rem] items-center justify-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-primary/30 px-4 text-xs font-semibold sm:h-10 sm:px-5"
                onClick={onAddFiveMinutes}
            >
                <Plus className="h-3.5 w-3.5" />
                Add 5m
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-full border-primary/30 px-4 text-xs font-semibold sm:h-10 sm:px-5"
                onClick={onAddTenMinutes}
            >
                <Plus className="h-3.5 w-3.5" />
                Add 10m
            </Button>
        </div>
    )
}

const stepFromView = (view: AdminModeWorkflowView): Step => (
    view === 'summary' ? 'finished' : view
)

const applyTaskMappings = (
    tasks: TaskItem[],
    taskMappings: Array<{ clientId: string; taskId: string; title: string; state: string }>
): TaskItem[] => {
    const mappingByClientId = new Map(taskMappings.map((mapping) => [mapping.clientId, mapping]))

    return tasks.map((task) => {
        const mapping = mappingByClientId.get(task.id)
        if (!mapping) {
            return task
        }

        return {
            ...task,
            id: mapping.taskId,
            title: mapping.title,
            state: mapping.state,
        }
    })
}

export function AdminModeWorkflow({ view, sessionId }: AdminModeWorkflowProps) {
    const router = useRouter()
    const timerRef = useRef<HourglassTimerRef>(null)
    const hasHydratedRuntime = useRef(false)
    const endingSessionRef = useRef(false)
    const startingSessionRef = useRef(false)
    const syncSessionStartPromiseRef = useRef<Promise<string | null> | null>(null)
    const [step, setStep] = useState<Step>(() => stepFromView(view))
    const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false)
    const [selectedDuration, setSelectedDuration] = useState<number | 'custom'>(25)
    const [customDuration, setCustomDuration] = useState(30)
    const [selectedSoundscapeId, setSelectedSoundscapeId] = useState<SoundscapeId>(DEFAULT_SOUNDSCAPE_ID)
    const [soundscapeVolume, setSoundscapeVolume] = useState(DEFAULT_SOUNDSCAPE_VOLUME)
    const [soundscapeShuffle, setSoundscapeShuffle] = useState(false)
    const [soundscapeLoopMode, setSoundscapeLoopMode] = useState<SoundscapeLoopMode>(DEFAULT_SOUNDSCAPE_LOOP_MODE)
    const [historyTasks, setHistoryTasks] = useState<TaskItem[]>([])
    const [loadingHistory, setLoadingHistory] = useState(false)
    const [isSyncing, setIsSyncing] = useState(false)
    const [elapsedSeconds, setElapsedSeconds] = useState(0)
    const [sessionSummary, setSessionSummary] = useState<string | null>(null)
    const [newAchievementsCount, setNewAchievementsCount] = useState(0)
    const [loadingSummary, setLoadingSummary] = useState(view === 'summary')
    const [isEndingSession, setIsEndingSession] = useState(false)
    const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false)
    const [sessionEndError, setSessionEndError] = useState<string | null>(null)
    const [isStartingSession, setIsStartingSession] = useState(false)
    const [sessionStartError, setSessionStartError] = useState<string | null>(null)
    const [shouldShowSessionConnectingStatus, setShouldShowSessionConnectingStatus] = useState(false)
    const soundscapePreferencesLoadedRef = useRef(false)
    const soundscapePreferencesSaveTimeoutRef = useRef<number | null>(null)

    // Get the actual duration value to use
    const actualDuration = selectedDuration === 'custom' ? customDuration : selectedDuration
    // Task management
    const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([])
    const [newTaskInput, setNewTaskInput] = useState('')

    const startSessionMutation = useStartSession()
    const {
        session: runtimeSession,
        startSession: startRuntimeSession,
        syncSession: syncRuntimeSession,
        clearSession: clearRuntimeSession,
    } = useSessionRuntime()

    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const preferredSessionId = useMemo(
        () => resolvePreferredSessionId(activeSessionId, runtimeSession.sessionId, sessionId),
        [activeSessionId, runtimeSession.sessionId, sessionId]
    )
    const hasPersistedSession = Boolean(preferredSessionId && !isLocalSessionId(preferredSessionId))

    const applySoundscapePreferences = useCallback((payload: Partial<SoundscapePreferencePayload>) => {
        if (payload.soundscape_id) {
            setSelectedSoundscapeId(payload.soundscape_id)
        }
        if (typeof payload.soundscape_volume === 'number') {
            setSoundscapeVolume(clampSoundscapeVolume(payload.soundscape_volume))
        }
        if (typeof payload.soundscape_shuffle === 'boolean') {
            setSoundscapeShuffle(payload.soundscape_shuffle)
        }
        if (payload.soundscape_loop_mode) {
            setSoundscapeLoopMode(payload.soundscape_loop_mode)
        }
    }, [])

    const buildSoundscapePreferencePayload = useCallback((
        overrides: Partial<SoundscapePreferencePayload> = {}
    ): SoundscapePreferencePayload => ({
        soundscape_id: overrides.soundscape_id ?? selectedSoundscapeId,
        soundscape_volume: overrides.soundscape_volume ?? soundscapeVolume,
        soundscape_shuffle: overrides.soundscape_shuffle ?? soundscapeShuffle,
        soundscape_loop_mode: overrides.soundscape_loop_mode ?? soundscapeLoopMode,
    }), [selectedSoundscapeId, soundscapeVolume, soundscapeShuffle, soundscapeLoopMode])

    const queueSoundscapePreferenceSave = useCallback((
        overrides: Partial<SoundscapePreferencePayload> = {}
    ) => {
        const nextPreferences = buildSoundscapePreferencePayload(overrides)
        writeSoundscapePreferencesToStorage(nextPreferences)

        if (typeof window === 'undefined') return

        if (soundscapePreferencesSaveTimeoutRef.current !== null) {
            window.clearTimeout(soundscapePreferencesSaveTimeoutRef.current)
        }

        soundscapePreferencesSaveTimeoutRef.current = window.setTimeout(() => {
            void fetch('/api/user/preferences', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nextPreferences),
            }).catch(() => undefined)
        }, SOUNDSCAPE_PREFERENCES_SAVE_DELAY_MS)
    }, [buildSoundscapePreferencePayload])

    const handleSelectSoundscape = useCallback((soundscapeId: SoundscapeId) => {
        setSelectedSoundscapeId(soundscapeId)
        queueSoundscapePreferenceSave({ soundscape_id: soundscapeId })
    }, [queueSoundscapePreferenceSave])

    const handleSessionSoundscapeChange = useCallback((patch: Partial<SoundscapePlaybackState>) => {
        if (!runtimeSession.isActive) return

        const nextSoundscapeId = isSoundscapeId(patch.soundscapeId)
            ? patch.soundscapeId
            : runtimeSession.soundscape.soundscapeId

        const nextVolume = typeof patch.volume === 'number'
            ? clampSoundscapeVolume(patch.volume)
            : runtimeSession.soundscape.volume

        const nextShuffle = typeof patch.shuffle === 'boolean'
            ? patch.shuffle
            : runtimeSession.soundscape.shuffle

        const nextLoopMode = isSoundscapeLoopMode(patch.loopMode)
            ? patch.loopMode
            : runtimeSession.soundscape.loopMode

        const nextTrackIndex = typeof patch.trackIndex === 'number'
            ? patch.trackIndex
            : runtimeSession.soundscape.trackIndex

        const requestedPlayingState = typeof patch.isPlaying === 'boolean'
            ? patch.isPlaying
            : runtimeSession.soundscape.isPlaying

        const nextIsPlaying = nextSoundscapeId === SILENCE_SOUNDSCAPE_ID
            ? false
            : requestedPlayingState

        syncRuntimeSession({
            soundscape: {
                soundscapeId: nextSoundscapeId,
                trackIndex: nextTrackIndex,
                isPlaying: nextIsPlaying,
                volume: nextVolume,
                shuffle: nextShuffle,
                loopMode: nextLoopMode,
            },
        })

        setSelectedSoundscapeId(nextSoundscapeId)
        setSoundscapeVolume(nextVolume)
        setSoundscapeShuffle(nextShuffle)
        setSoundscapeLoopMode(nextLoopMode)

        queueSoundscapePreferenceSave({
            soundscape_id: nextSoundscapeId,
            soundscape_volume: nextVolume,
            soundscape_shuffle: nextShuffle,
            soundscape_loop_mode: nextLoopMode,
        })
    }, [runtimeSession.isActive, runtimeSession.soundscape, syncRuntimeSession, queueSoundscapePreferenceSave])

    useEffect(() => {
        setStep(stepFromView(view))
    }, [view])

    useEffect(() => {
        setLoadingSummary(view === 'summary')
    }, [view])

    useEffect(() => {
        if (view !== 'setup') return
        router.prefetch('/sessions/pending')
    }, [view, router])

    useEffect(() => {
        return () => {
            if (typeof window === 'undefined') return
            if (soundscapePreferencesSaveTimeoutRef.current === null) return
            window.clearTimeout(soundscapePreferencesSaveTimeoutRef.current)
            soundscapePreferencesSaveTimeoutRef.current = null
        }
    }, [])

    useEffect(() => {
        if (view !== 'setup') return
        if (soundscapePreferencesLoadedRef.current) return
        soundscapePreferencesLoadedRef.current = true

        const localPreferences = readSoundscapePreferencesFromStorage()
        applySoundscapePreferences(localPreferences)

        let isCancelled = false

        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/user/preferences', { cache: 'no-store' })
                if (!response.ok) return

                const payload = await response.json() as SoundscapePreferencesResponse
                if (isCancelled) return

                const normalized = normalizeSoundscapePreferences(payload)
                applySoundscapePreferences(normalized)

                const mergedPreferences = buildSoundscapePreferencePayload(normalized)
                writeSoundscapePreferencesToStorage(mergedPreferences)
            } catch {
                // Ignore preference hydration failures and keep local defaults.
            }
        }

        void fetchPreferences()

        return () => {
            isCancelled = true
        }
    }, [view, applySoundscapePreferences, buildSoundscapePreferencePayload])

    useEffect(() => {
        if (hasHydratedRuntime.current) return
        hasHydratedRuntime.current = true

        if (view === 'summary') return

        if (!runtimeSession.isActive) return

        if (view === 'setup' && runtimeSession.sessionId) {
            router.replace(`/sessions/${runtimeSession.sessionId}`)
        }

        setStep(stepFromView(view))
        setSelectedTasks(runtimeSession.selectedTasks)
        setActiveSessionId(runtimeSession.sessionId)

        const restoredDuration = Math.max(
            SESSION_DURATION_MIN,
            Math.min(SESSION_DURATION_MAX, runtimeSession.durationMinutes)
        )

        if (DURATION_OPTIONS.some(option => option.value === restoredDuration)) {
            setSelectedDuration(restoredDuration)
        } else {
            setSelectedDuration('custom')
            setCustomDuration(restoredDuration)
        }

        setSelectedSoundscapeId(runtimeSession.soundscape.soundscapeId)
        setSoundscapeVolume(runtimeSession.soundscape.volume)
        setSoundscapeShuffle(runtimeSession.soundscape.shuffle)
        setSoundscapeLoopMode(runtimeSession.soundscape.loopMode)
    }, [runtimeSession, router, view])

    useEffect(() => {
        if (!runtimeSession.isActive) return

        setSelectedSoundscapeId(runtimeSession.soundscape.soundscapeId)
        setSoundscapeVolume(runtimeSession.soundscape.volume)
        setSoundscapeShuffle(runtimeSession.soundscape.shuffle)
        setSoundscapeLoopMode(runtimeSession.soundscape.loopMode)
    }, [
        runtimeSession.isActive,
        runtimeSession.soundscape.soundscapeId,
        runtimeSession.soundscape.volume,
        runtimeSession.soundscape.shuffle,
        runtimeSession.soundscape.loopMode,
    ])

    useEffect(() => {
        if (view !== 'session') return
        if (!sessionId) return
        setActiveSessionId((currentSessionId) => {
            if (isLocalSessionId(sessionId) && currentSessionId && !isLocalSessionId(currentSessionId)) {
                return currentSessionId
            }
            return sessionId
        })
    }, [view, sessionId])

    useEffect(() => {
        if (view !== 'session') return
        if (!sessionId) return

        if (!runtimeSession.isActive) {
            router.replace('/focus')
            return
        }

        if (!preferredSessionId || preferredSessionId === sessionId) {
            return
        }

        // Once a persisted session id exists, never redirect back to a local placeholder id.
        if (isLocalSessionId(preferredSessionId) && !isLocalSessionId(sessionId)) {
            return
        }

        router.replace(`/sessions/${preferredSessionId}`)
    }, [view, sessionId, runtimeSession.isActive, preferredSessionId, router])

    useEffect(() => {
        if (!isExitConfirmOpen) return

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return
            setIsExitConfirmOpen(false)
        }

        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [isExitConfirmOpen])

    useEffect(() => {
        if (hasPersistedSession || sessionStartError) {
            setShouldShowSessionConnectingStatus(false)
            return
        }

        const timeoutId = window.setTimeout(() => {
            setShouldShowSessionConnectingStatus(true)
        }, SESSION_CONNECTING_STATUS_DELAY_MS)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [hasPersistedSession, sessionStartError])

    useEffect(() => {
        if (view !== 'summary') return
        if (!sessionId) {
            router.replace('/focus')
            return
        }

        let isCancelled = false

        const fetchSummary = async () => {
            try {
                setLoadingSummary(true)

                const res = await fetch(`/api/sessions/${sessionId}/summary`, {
                    cache: 'no-store',
                })

                if (!res.ok) {
                    if (!isCancelled) {
                        router.replace('/focus')
                    }
                    return
                }

                const data = await res.json() as SessionSummaryResponse

                if (isCancelled) return

                setSelectedTasks(Array.isArray(data.summary.tasks) ? data.summary.tasks : [])
                setElapsedSeconds(Number.isFinite(data.summary.elapsedSeconds) ? data.summary.elapsedSeconds : 0)
                setSessionSummary(data.summary.llmSummary || null)
                setNewAchievementsCount(Number.isFinite(data.summary.newAchievementCount) ? data.summary.newAchievementCount : 0)
            } catch {
                if (!isCancelled) {
                    router.replace('/focus')
                }
            } finally {
                if (!isCancelled) {
                    setLoadingSummary(false)
                }
            }
        }

        void fetchSummary()

        return () => {
            isCancelled = true
        }
    }, [view, sessionId, router])

    useEffect(() => {
        if (view !== 'summary') return
        if (!sessionId) {
            router.replace('/focus')
            return
        }

        if (runtimeSession.isActive) {
            clearRuntimeSession()
        }
    }, [view, sessionId, runtimeSession.isActive, clearRuntimeSession, router])

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

    useEffect(() => {
        if (step !== 'session' || !runtimeSession.isActive) return
        const sessionIdToSync = resolvePreferredSessionId(activeSessionId, runtimeSession.sessionId, sessionId)
        if (!sessionIdToSync) return

        syncRuntimeSession({
            selectedTasks,
            sessionId: sessionIdToSync,
            durationMinutes: actualDuration,
        })
    }, [
        selectedTasks,
        step,
        runtimeSession.isActive,
        runtimeSession.sessionId,
        activeSessionId,
        actualDuration,
        sessionId,
        syncRuntimeSession,
    ])

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

    // Fetch history and unfinished tasks
    useEffect(() => {
        const fetchHistory = async () => {
            setLoadingHistory(true)
            try {
                // Request info about the last session tasks
                const res = await fetch(`/api/tasks?limit=${LAST_SESSION_TASKS_LIMIT}&includeLastSession=true`)
                if (res.ok) {
                    const data = await res.json()
                    const rawTasks = Array.isArray(data) ? data as TaskFromApi[] : []

                    // Drawer only shows unfinished tasks from the immediate last session.
                    const lastSessionPendingTasks: TaskItem[] = selectLastSessionPendingTasks(rawTasks)
                        .map((task) => ({
                            id: task.id,
                            title: task.title,
                            completed: false,
                            state: task.state,
                            isFromLastSession: true,
                        }))

                    setHistoryTasks(lastSessionPendingTasks)
                }
            } catch (err) {
                console.error('Failed to fetch task history', err)
            } finally {
                setLoadingHistory(false)
            }
        }
        if (step === 'setup') fetchHistory()
    }, [step])

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

    const selectedTaskTitleSet = useMemo(
        () => new Set(selectedTasks.map((task) => normalizeTaskTitle(task.title))),
        [selectedTasks]
    )
    const selectedTasksRef = useRef<TaskItem[]>(selectedTasks)

    useEffect(() => {
        selectedTasksRef.current = selectedTasks
    }, [selectedTasks])

    const historyTaskIdSet = useMemo(
        () => new Set(historyTasks.map((task) => task.id)),
        [historyTasks]
    )

    const { drawerPool: setupDrawerPool, otherSuggestionPool: setupOtherSuggestionPool } = useMemo(
        () => buildSetupTaskSuggestionPools({ historyTasks }),
        [historyTasks]
    )

    const displayedDrawerTasks = useMemo(
        () => setupDrawerPool.filter((task) => !selectedTaskTitleSet.has(normalizeTaskTitle(task.title))),
        [setupDrawerPool, selectedTaskTitleSet]
    )

    const displayedOtherSuggestions = useMemo(
        () => setupOtherSuggestionPool.filter((task) => !selectedTaskTitleSet.has(normalizeTaskTitle(task.title))),
        [setupOtherSuggestionPool, selectedTaskTitleSet]
    )

    const handleAddSuggestedTask = (task: TaskItem) => {
        const normalizedTitle = normalizeTaskTitle(task.title)
        if (selectedTasks.find(t => t.id === task.id || normalizeTaskTitle(t.title) === normalizedTitle)) return

        // Keep drawer tasks on their original DB id to avoid creating duplicate records per session.
        if (historyTaskIdSet.has(task.id)) {
            setSelectedTasks(prev => [...prev, { ...task, completed: false }])
            return
        }

        setSelectedTasks(prev => [...prev, { ...task, id: `copy-${task.id}-${Date.now()}` }])
    }

    const handleRemoveTask = (taskId: string) => {
        setSelectedTasks(prev => prev.filter(t => t.id !== taskId))
    }

    const syncTasksWithBackend = async (): Promise<TaskItem[]> => {
        const newTasks = selectedTasks.filter((task) => isEphemeralTaskId(task.id))

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
                    const createdTasksFromApi = await res.json() as Array<Pick<TaskItem, 'id' | 'title'>>
                    const existingRealTasks = selectedTasks.filter((task) => !isEphemeralTaskId(task.id))

                    // Preserve completion state when ephemeral tasks are materialized in DB.
                    const completionQueueByTitle = new Map<string, boolean[]>()
                    for (const task of newTasks) {
                        const normalizedTitle = normalizeTaskTitle(task.title)
                        const queue = completionQueueByTitle.get(normalizedTitle) ?? []
                        queue.push(task.completed)
                        completionQueueByTitle.set(normalizedTitle, queue)
                    }

                    const syncedTasks = createdTasksFromApi.map((task) => {
                        const normalizedTitle = normalizeTaskTitle(task.title)
                        const queue = completionQueueByTitle.get(normalizedTitle)
                        const completed = queue && queue.length > 0 ? queue.shift() ?? false : false

                        return {
                            id: task.id,
                            title: task.title,
                            completed,
                        }
                    })
                    const nextTasks = [...existingRealTasks, ...syncedTasks]
                    setSelectedTasks(nextTasks)
                    return nextTasks
                }
            } catch (err) {
                console.error('Failed to sync tasks to database', err)
            } finally {
                setIsSyncing(false)
            }
        }
        return selectedTasks
    }

    const syncSessionStartWithServer = async (
        tasksSnapshot: TaskItem[],
        { redirectOnSuccess = true }: SyncSessionStartOptions = {}
    ): Promise<string | null> => {
        if (syncSessionStartPromiseRef.current) {
            return syncSessionStartPromiseRef.current
        }

        const syncPromise = (async () => {
            startingSessionRef.current = true

            const preferredPersistedSessionId = activeSessionId && !activeSessionId.startsWith('local-')
                ? activeSessionId
                : runtimeSession.sessionId && !runtimeSession.sessionId.startsWith('local-')
                    ? runtimeSession.sessionId
                    : undefined

            setIsStartingSession(true)
            setSessionStartError(null)

            try {
                const payload = await startSessionMutation.mutateAsync({
                    durationMinutes: actualDuration,
                    preferredSessionId: preferredPersistedSessionId,
                    selectedTasks: tasksSnapshot.map((task) => ({
                        id: task.id,
                        title: task.title,
                        completed: task.completed,
                    })),
                })

                const mappedTasks = applyTaskMappings(selectedTasksRef.current, payload.taskMappings)

                setSelectedTasks(mappedTasks)
                setActiveSessionId(payload.session.id)
                syncRuntimeSession({
                    sessionId: payload.session.id,
                    durationMinutes: actualDuration,
                    selectedTasks: mappedTasks,
                })

                if (redirectOnSuccess) {
                    router.replace(`/sessions/${payload.session.id}`)
                }

                return payload.session.id
            } catch (err) {
                console.error('Failed to sync session start with server', err)
                setSessionStartError('Unable to connect this session right now. Retry in a moment.')
                return null
            } finally {
                startingSessionRef.current = false
                setIsStartingSession(false)
            }
        })()

        syncSessionStartPromiseRef.current = syncPromise
        const persistedSessionId = await syncPromise
        syncSessionStartPromiseRef.current = null
        return persistedSessionId
    }

    const handleStartSession = () => {
        if (isStartingSession || startingSessionRef.current) return

        const tasksSnapshot = selectedTasksRef.current.map((task) => ({ ...task }))
        const localSessionId = `local-${Date.now()}`

        setSessionStartError(null)
        setActiveSessionId(localSessionId)

        startRuntimeSession({
            sessionId: localSessionId,
            durationMinutes: actualDuration,
            selectedTasks: tasksSnapshot,
            soundscape: {
                soundscapeId: selectedSoundscapeId,
                trackIndex: 0,
                isPlaying: selectedSoundscapeId !== SILENCE_SOUNDSCAPE_ID,
                volume: soundscapeVolume,
                shuffle: soundscapeShuffle,
                loopMode: soundscapeLoopMode,
            },
        })

        router.push(`/sessions/${localSessionId}`)
        void syncSessionStartWithServer(tasksSnapshot)
    }

    const handleRetrySessionStart = () => {
        if (isStartingSession || startingSessionRef.current) return

        const currentSessionId = activeSessionId ?? runtimeSession.sessionId
        if (!currentSessionId || !currentSessionId.startsWith('local-')) return

        const tasksSnapshot = selectedTasksRef.current.map((task) => ({ ...task }))
        void syncSessionStartWithServer(tasksSnapshot)
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
        if (!isEphemeralTaskId(taskId)) {
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
        if (endingSessionRef.current) return
        endingSessionRef.current = true
        setIsEndingSession(true)
        setSessionEndError(null)

        if (runtimeSession.isActive) {
            syncRuntimeSession({
                soundscape: { isPlaying: false },
            })
        }

        const seconds = timerRef.current?.getElapsedTime() || 0
        let summarySessionId = activeSessionId ?? runtimeSession.sessionId ?? sessionId

        if (!summarySessionId) {
            clearRuntimeSession()
            router.push('/focus')
            endingSessionRef.current = false
            setIsEndingSession(false)
            return
        }

        if (summarySessionId.startsWith('local-')) {
            const tasksSnapshot = selectedTasksRef.current.map((task) => ({ ...task }))
            const persistedSessionId = await syncSessionStartWithServer(tasksSnapshot, {
                redirectOnSuccess: false,
            })
            if (!persistedSessionId) {
                setSessionEndError('Unable to sync this session right now. Please try again.')
                endingSessionRef.current = false
                setIsEndingSession(false)
                return
            }
            summarySessionId = persistedSessionId
        }

        let shouldNavigateToSummary = false

        try {
            const completedCount = selectedTasks.filter(t => t.completed).length
            const finalizeRes = await fetch(`/api/sessions/${summarySessionId}/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actualDurationSeconds: Math.floor(seconds),
                    totalPauseSeconds: 0,
                    pauseCount: sessionState.pauseCount,
                    tasksCompletedCount: completedCount,
                    tasksWorkedOn: selectedTasks.map(t => t.id),
                })
            })

            if (!finalizeRes.ok) {
                const payload = await finalizeRes.json().catch(() => null)
                const errorMessage = payload && typeof payload.error === 'string'
                    ? payload.error
                    : 'Failed to finalize session'
                throw new Error(errorMessage)
            }

            shouldNavigateToSummary = true
        } catch (err) {
            console.error('Failed to complete session', err)
            setSessionEndError('Unable to end this session right now. Please try again.')
        } finally {
            if (shouldNavigateToSummary) {
                router.push(`/sessions/${summarySessionId}/summary`)
            }
            endingSessionRef.current = false
            setIsEndingSession(false)
        }
    }

    const handleConfirmEndSession = () => {
        if (isEndingSession) return
        if (isStartingSession) {
            setSessionStartError('Session is still syncing. Please wait a moment.')
            return
        }

        setIsExitConfirmOpen(true)
    }

    const handleCancelEndSession = () => {
        if (isEndingSession) return
        setIsExitConfirmOpen(false)
    }

    const handleEndSessionFromDialog = async () => {
        if (isEndingSession || isStartingSession) return
        setIsExitConfirmOpen(false)
        await handleEndSession()
    }


    const handleAdjustTasks = () => {
        setIsTaskDrawerOpen(true)
    }

    const handleSaveTaskChanges = async () => {
        await syncTasksWithBackend()
        setIsTaskDrawerOpen(false)
    }

    const handleBackToSetup = () => {
        clearRuntimeSession()
        setActiveSessionId(null)
        setSelectedTasks([])
        setSessionStartError(null)
        router.push('/focus')
    }

    const completedCount = selectedTasks.filter(t => t.completed).length
    const baselineTaskCount = runtimeSession.initialTaskCount > 0
        ? runtimeSession.initialTaskCount
        : selectedTasks.length
    const completionPercent = baselineTaskCount > 0
        ? Math.round((completedCount / baselineTaskCount) * 100)
        : 0
    const completionBarPercent = Math.min(100, completionPercent)
    const isTimerPaused = isTaskDrawerOpen || runtimeSession.pausedByNavigation
    const runtimeTimerTotal = runtimeSession.isActive ? runtimeSession.totalSeconds : actualDuration * 60
    const runtimeTimerRemaining = runtimeSession.isActive ? runtimeSession.remainingSeconds : actualDuration * 60
    const sessionStageStatusMessage = sessionStartError
        ? sessionStartError
        : hasPersistedSession
            ? null
            : (shouldShowSessionConnectingStatus ? 'Connecting to shared session...' : null)
    const endSessionDialogTitle = hasPersistedSession
        ? 'End session now?'
        : 'End session and sync first?'
    const endSessionDialogDescription = hasPersistedSession
        ? 'You will end now and open the session summary.'
        : 'This session is still local. We will sync it first, then open the summary.'
    const endSessionDialogAction = 'End and View Summary'
    // ==================== SESSION VIEW ====================
    if (step === 'session') {
        return (
            <div className="relative h-full min-h-0 overflow-hidden">
                {isExitConfirmOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
                            onClick={handleCancelEndSession}
                            aria-hidden="true"
                        />
                        <Card
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="exit-session-confirm-title"
                            aria-describedby="exit-session-confirm-description"
                            className="relative w-full max-w-md border-border/85 bg-card/96 shadow-[0_26px_44px_rgba(31,42,55,0.28)]"
                        >
                            <CardHeader className="space-y-2">
                                <CardTitle id="exit-session-confirm-title" className="text-lg">
                                    {endSessionDialogTitle}
                                </CardTitle>
                                <CardDescription id="exit-session-confirm-description" className="text-sm">
                                    {endSessionDialogDescription}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={handleCancelEndSession}
                                    disabled={isEndingSession}
                                >
                                    Keep Session
                                </Button>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    className="w-full sm:w-auto"
                                    onClick={handleEndSessionFromDialog}
                                    disabled={isEndingSession || isStartingSession}
                                >
                                    {isEndingSession ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Ending...
                                        </>
                                    ) : (
                                        endSessionDialogAction
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

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
                            <h2 className="text-xl font-light mb-1">Edit Session Tasks</h2>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Timer paused while editing</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add task..."
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
                                    <p className="text-xs font-bold text-primary uppercase">Current List</p>
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
                                <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Quick add</p>
                                <div className="grid grid-cols-1 gap-2">
                                    {QUICK_TASK_SUGGESTION_SEEDS.filter(t => !selectedTaskTitleSet.has(normalizeTaskTitle(t.title))).slice(0, 3).map((task) => (
                                        <button
                                            key={task.id}
                                            onClick={() => handleAddSuggestedTask(task)}
                                            className="flex items-center justify-between p-2 rounded-lg border border-dashed hover:bg-primary/5 text-left transition-colors"
                                        >
                                            <TaskSuggestionLabel
                                                title={task.title}
                                                titleClassName="text-xs text-foreground/80"
                                            />
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
                            Save and Resume
                        </Button>
                    </div>
                </div>

                {/* Overlay */}
                {isTaskDrawerOpen && (
                    <div
                        className="fixed inset-0 bg-background/40 z-40 animate-in fade-in duration-300"
                        onClick={() => setIsTaskDrawerOpen(false)}
                    />
                )}

                {/* Main Content */}
                <div className="mx-auto h-[var(--layout-session-main-height)] w-full max-w-5xl overflow-hidden px-4 pb-[max(0.75rem,var(--layout-safe-bottom))] pt-[var(--layout-banner-content-gap)] sm:px-5 md:px-6">
                    <div className="grid h-full min-h-0 w-full grid-rows-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-3 lg:h-[min(66dvh,500px)] lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:grid-rows-1 lg:gap-4">
                        {/* Left: Timer Stage */}
                        <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border/80 bg-card/92 shadow-[0_16px_34px_rgba(31,42,55,0.14)]">
                            <SessionStageHeader
                                durationMinutes={actualDuration}
                                statusMessage={sessionStageStatusMessage}
                                statusIsError={Boolean(sessionStartError)}
                            />

                            <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 pb-3 sm:gap-4 sm:pb-4">
                                <div className="flex min-h-0 w-full flex-1 items-center justify-center">
                                    <HourglassTimer
                                        key={activeSessionId || runtimeSession.sessionId || String(actualDuration)}
                                        ref={timerRef}
                                        durationMinutes={actualDuration}
                                        onComplete={handleEndSession}
                                        onTick={({ totalSeconds, remainingSeconds }) => {
                                            if (step !== 'session') return
                                            const sessionIdToSync = resolvePreferredSessionId(activeSessionId, runtimeSession.sessionId, sessionId)
                                            if (!sessionIdToSync) return
                                            syncRuntimeSession({
                                                sessionId: sessionIdToSync,
                                                durationMinutes: actualDuration,
                                                totalSeconds,
                                                remainingSeconds,
                                                selectedTasks,
                                            })
                                        }}
                                        paused={isTimerPaused}
                                        initialTotalSeconds={runtimeTimerTotal}
                                        initialRemainingSeconds={runtimeTimerRemaining}
                                    />
                                </div>

                                <SessionTimeAdjustControls
                                    onAddFiveMinutes={() => timerRef.current?.addTime(5)}
                                    onAddTenMinutes={() => timerRef.current?.addTime(10)}
                                />
                            </CardContent>
                        </Card>

                        {/* Right: Tasks and Actions */}
                        <Card className="flex h-full min-h-0 flex-col overflow-hidden border-border/80 bg-card/92 shadow-[0_16px_34px_rgba(31,42,55,0.14)]">
                            <CardHeader className="space-y-2 pb-2 sm:pb-3">
                                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                                    <CheckCircle2 className="h-4 w-4 text-primary/75" />
                                    Session Tasks
                                </CardTitle>
                                <CardDescription className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>{completedCount} of {selectedTasks.length} filed</span>
                                    <span className="font-semibold text-foreground/70">{completionPercent}%</span>
                                </CardDescription>
                                <div className="h-1.5 overflow-hidden rounded-full bg-muted/70">
                                    <div
                                        className="h-full rounded-full bg-success transition-all duration-500 ease-out"
                                        style={{ width: `${completionBarPercent}%` }}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="flex min-h-0 flex-1 flex-col gap-3 pb-3 sm:pb-4">
                                <div className="min-h-[68px] flex-1 overflow-y-auto pr-1">
                                    <TaskChecklist
                                        tasks={selectedTasks}
                                        onToggle={handleToggleTask}
                                        showSummary={false}
                                        compact
                                        className="max-w-none"
                                    />
                                </div>
                                <SessionSoundscapePlayer
                                    playback={runtimeSession.soundscape}
                                    onPlaybackChange={handleSessionSoundscapeChange}
                                />
                                <div className="flex flex-col gap-2 pt-1">
                                    <Button
                                        variant="secondary"
                                        className="h-10 w-full bg-secondary/80 text-secondary-foreground"
                                        onClick={handleAdjustTasks}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Edit Tasks
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        className="h-10 w-full text-muted-foreground hover:text-destructive"
                                        onClick={handleConfirmEndSession}
                                        disabled={isEndingSession || isStartingSession}
                                    >
                                        {isEndingSession || isStartingSession ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <LogOut className="h-4 w-4 mr-2" />
                                        )}
                                        {isEndingSession
                                            ? 'Ending...'
                                            : isStartingSession
                                                ? 'Connecting...'
                                                : 'End Session'}
                                    </Button>
                                    {sessionStartError && (
                                        <div className="space-y-2 text-center">
                                            <p className="text-xs text-destructive">
                                                {sessionStartError}
                                            </p>
                                            {!hasPersistedSession && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8"
                                                    onClick={handleRetrySessionStart}
                                                    disabled={isStartingSession}
                                                >
                                                    Retry Sync
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                    {sessionEndError && (
                                        <p className="text-xs text-destructive text-center">
                                            {sessionEndError}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
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
                            Session Filed.
                        </CardTitle>
                        <CardDescription className="text-base mt-4 font-light leading-relaxed">
                            Session closed. <br />
                            You don&apos;t need to think about this for now.
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
                                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Filed.</p>
                                <p className="text-2xl font-light text-primary">{completedTasks.length}</p>
                            </div>
                            <div className="bg-muted/30 rounded-2xl p-4 text-center border border-border/50">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Time Spent</p>
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
                                    <p className="text-xs font-bold text-success/70 uppercase tracking-widest">Filed:</p>
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
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Still Open:</p>
                                    <p className="text-xs text-muted-foreground/60 italic -mt-1 mb-2">Saved as Open Loops. Can wait.</p>
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
                                &ldquo;Enough for now. Continue next session.&rdquo;
                            </p>
                            <Button
                                className="w-full h-14 gap-2 text-md font-light rounded-2xl shadow-xl shadow-primary/10 transition-all hover:shadow-primary/20"
                                onClick={handleBackToSetup}
                            >
                                Back to Focus
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
            <div className="container mx-auto max-w-2xl pt-10 pb-12 px-4">
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
                    <h1 className="type-page-title mb-2">
                        Admin Night
                    </h1>
                    <p className="type-page-subtitle max-w-md mx-auto">
                        Shared admin block. Bring the list.
                    </p>
                </div>

                {/* Step 1: Task Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[1.02rem] font-medium tracking-[-0.01em]">
                            <CheckCircle2 className="h-5 w-5" />
                            1. Pick Session Tasks
                        </CardTitle>
                        <CardDescription>
                            Select what you&apos;ll handle in this block.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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

                        {/* Selected Tasks - Moved up for visibility */}
                        {selectedTasks.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                <p className="type-section-label text-primary">Queued for this session</p>
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
                                <p className="type-caption italic text-center">Drag to reorder.</p>
                            </div>
                        )}

                        {/* Suggestions Grid */}
                        <div className="space-y-4">
                            {/* Recent History / Task Drawer */}
                            {displayedDrawerTasks.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-3 border-t border-border/30 pt-4">
                                        <p className="type-section-label flex items-center gap-2">
                                            <InboxIcon className="h-3 w-3" />
                                            From Task Drawer
                                        </p>
                                        {loadingHistory && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {displayedDrawerTasks.map((task) => (
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
                                                <TaskSuggestionLabel
                                                    title={task.title}
                                                    iconTone={(task.isFromLastSession && task.state !== 'RESOLVED') ? 'primary' : 'default'}
                                                    titleClassName={cn(
                                                        (task.isFromLastSession && task.state !== 'RESOLVED')
                                                            ? "text-foreground font-medium"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                                <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {displayedOtherSuggestions.length > 0 && (
                                <div>
                                    <p className="type-section-label mb-3">{setupDrawerPool.length > 0 ? 'More Suggestions' : 'Quick Suggestions'}</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {displayedOtherSuggestions.map((task) => (
                                            <button
                                                key={task.id}
                                                onClick={() => handleAddSuggestedTask(task)}
                                                className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                            >
                                                <TaskSuggestionLabel
                                                    title={task.title}
                                                    titleClassName="text-foreground/80 group-hover:text-foreground"
                                                />
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
                        <CardTitle className="flex items-center gap-2 text-[1.02rem] font-medium tracking-[-0.01em]">
                            <Clock className="h-5 w-5" />
                            2. Pick Session Length
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {DURATION_OPTIONS.map((option) => (
                                <div key={String(option.value)} className="flex flex-col gap-2">
                                    <button
                                        onClick={() => setSelectedDuration(option.value as number | 'custom')}
                                        className={cn(
                                            "relative p-4 rounded-xl border transition-[border-color,background-color,box-shadow,transform] duration-150 text-left",
                                            selectedDuration === option.value
                                                ? "border-[var(--task-selected-border-strong)] bg-[var(--task-selected-bg-soft)] shadow-[0_10px_22px_rgba(74,102,131,0.16)] ring-1 ring-[var(--task-selected-ring)]"
                                                : "border-border/65 bg-surface-elevated/42 hover:border-border/80 hover:bg-surface-elevated/68"
                                        )}
                                    >
                                        {selectedDuration === option.value && (
                                            <CheckCircle2 className="absolute top-2 right-2 h-4 w-4 text-primary" />
                                        )}
                                        <span className="text-2xl font-bold block">{option.label}</span>
                                        <span className="text-xs text-muted-foreground">{option.description}</span>
                                    </button>

                                    {option.value === 'custom' && (
                                        <div className={cn(
                                            "flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors duration-150",
                                            selectedDuration === 'custom'
                                                ? "border-[var(--task-selected-border)] bg-[var(--task-selected-bg-soft)]"
                                                : "border-border/65 bg-surface-elevated/42"
                                        )}>
                                            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            <Input
                                                type="number"
                                                min={SESSION_DURATION_MIN}
                                                max={SESSION_DURATION_MAX}
                                                value={customDuration}
                                                onFocus={() => setSelectedDuration('custom')}
                                                onClick={() => setSelectedDuration('custom')}
                                                onChange={(e) => {
                                                    setSelectedDuration('custom')
                                                    setCustomDuration(Math.max(
                                                        SESSION_DURATION_MIN,
                                                        Math.min(SESSION_DURATION_MAX, parseInt(e.target.value) || SESSION_DURATION_MIN)
                                                    ))
                                                }}
                                                className="h-9 w-20 text-center text-base font-bold"
                                            />
                                            <span className="text-sm text-muted-foreground">min</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 3: Soundscape Selection */}
                <Card className="mb-6">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-[1.02rem] font-medium tracking-[-0.01em]">
                            <Sparkles className="h-5 w-5" />
                            3. Pick Soundscape
                        </CardTitle>
                        <CardDescription>
                            Choose one backdrop for this session. You can still change tracks while focusing.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SoundscapeSelector
                            selectedSoundscapeId={selectedSoundscapeId}
                            onSelect={handleSelectSoundscape}
                        />
                    </CardContent>
                </Card>

                {/* Start Button */}
                <Button
                    size="lg"
                    className="w-full h-14 text-lg gap-2 shadow-lg shadow-primary/20 transition-all duration-300 hover:bg-success hover:text-success-foreground hover:shadow-success/25"
                    onClick={handleStartSession}
                    disabled={isStartingSession}
                >
                    {isStartingSession ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Starting...
                        </>
                    ) : (
                        <>
                            Start Session
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </Button>

            </div>
        </div>
    )
}
