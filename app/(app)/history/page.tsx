'use client'

import { useEffect, useState } from 'react'
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Clock, Sparkles, Trophy, Users, Wind, Zap } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AchievementCard } from '@/components/features/achievements'
import { GuestPlaceholder } from '@/components/features/auth/guest-placeholder'
import { cn } from "@/lib/utils"
import { useAuth } from '@/lib/hooks/useAuth'
import { cardLayout } from "@/components/ui/card-layouts"

interface TaskRecord {
    id: string
    title: string
    state: string
    createdAt: string
    resolvedAt?: string
}

interface HistoryGroup {
    id: string
    sessionId: string
    date: string
    duration: number
    tasks: TaskRecord[]
    participantCount: number
}

interface HistoryStats {
    totalResolved: number
    totalPending: number
    totalFocusMinutes: number
    dailyActivity: Record<string, number>
    totalSessions: number
}

interface HistoryPagination {
    page: number
    limit: number
    hasMore: boolean
    totalSessions: number
}

interface HistoryResponse {
    stats?: HistoryStats
    historyGroups: HistoryGroup[]
    pendingTasks?: TaskRecord[]
    pagination: HistoryPagination
}

interface UserAchievementRecord {
    id: string
    achievementId: string
    unlockedAt: string
    evidenceSnapshot: string
    humorSnapshot: string
}

const historyMarkersEnabled = process.env.NEXT_PUBLIC_ENABLE_HISTORY_MARKERS === 'true'
const HISTORY_PAGE_SIZE = 10

export default function HistoryPage() {
    const [stats, setStats] = useState<HistoryStats | null>(null)
    const [pendingTasks, setPendingTasks] = useState<TaskRecord[]>([])
    const [historyGroups, setHistoryGroups] = useState<HistoryGroup[]>([])
    const [historyPagination, setHistoryPagination] = useState<HistoryPagination | null>(null)
    const [achievements, setAchievements] = useState<UserAchievementRecord[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const [loadingMoreHistory, setLoadingMoreHistory] = useState(false)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyRes, achievementsRes] = await Promise.all([
                    fetch(`/api/user/history?page=1&limit=${HISTORY_PAGE_SIZE}`),
                    historyMarkersEnabled ? fetch('/api/achievements') : Promise.resolve(null),
                ])

                if (historyRes.ok) {
                    const historyData = await historyRes.json() as HistoryResponse
                    setHistoryGroups(historyData.historyGroups)
                    setHistoryPagination(historyData.pagination)
                    if (historyData.stats) {
                        setStats(historyData.stats)
                    }
                    if (historyData.pendingTasks) {
                        setPendingTasks(historyData.pendingTasks)
                    }
                }

                if (achievementsRes?.ok) {
                    const achData = await achievementsRes.json()
                    setAchievements(achData.achievements || [])
                }
            } catch (err) {
                console.error("Failed to fetch data", err)
            } finally {
                setInitialLoading(false)
            }
        }
        fetchData()
    }, [])

    const loadMoreHistory = async () => {
        if (!historyPagination?.hasMore || loadingMoreHistory) {
            return
        }

        setLoadingMoreHistory(true)
        try {
            const nextPage = historyPagination.page + 1
            const response = await fetch(
                `/api/user/history?page=${nextPage}&limit=${HISTORY_PAGE_SIZE}&includeOverview=false`
            )

            if (!response.ok) {
                return
            }

            const nextPageData = await response.json() as HistoryResponse
            setHistoryGroups((prev) => [...prev, ...nextPageData.historyGroups])
            setHistoryPagination(nextPageData.pagination)
        } catch (err) {
            console.error("Failed to load more history", err)
        } finally {
            setLoadingMoreHistory(false)
        }
    }

    const { user, loading: authLoading } = useAuth()
    const loading = initialLoading || authLoading

    if (loading) {
        return (
            <div className="container mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center p-6">
                <Zap className={cn("size-8 text-primary/30", !prefersReducedMotion && "animate-pulse")} />
            </div>
        )
    }

    if (!user) {
        return (
            <GuestPlaceholder
                pageName="History"
                description="History is available for registered members. Sign in to start tracing your footprints."
            />
        )
    }

    const statsData = stats || {
        totalResolved: 0,
        totalPending: 0,
        totalFocusMinutes: 0,
        dailyActivity: {},
        totalSessions: 0,
    }

    const totalTaskCount = statsData.totalResolved + statsData.totalPending
    const resolvedRatio = totalTaskCount > 0 ? Math.round((statsData.totalResolved / totalTaskCount) * 100) : 100

    const today = new Date()
    const calendarDays = Array.from({ length: 28 }, (_, index) => {
        const day = new Date(today)
        day.setDate(today.getDate() - (27 - index))
        return day
    })

    const labelStyle = "type-section-label text-[0.76rem] tracking-[0.07em]"
    const blockTitleStyle = "type-block-title"

    return (
        <div className={cn(
            "container mx-auto mb-20 max-w-6xl p-4 sm:p-5 md:p-6",
            !prefersReducedMotion && "animate-in fade-in duration-150"
        )}>
            <div className="space-y-2 pt-8 pb-10">
                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                    className="space-y-2"
                >
                    <h1 className="type-page-title font-sans">Your History</h1>
                    <p className="type-page-subtitle max-w-3xl">
                        One calm surface for your timeline, progress markers, and loops still waiting for closure.
                    </p>
                </motion.div>
            </div>

            <div
                className="rounded-[calc(var(--radius)+1.2rem)] p-[1px]"
                style={{
                    backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--workbench-divider) 56%, transparent 44%) 0%, color-mix(in srgb, var(--workbench-divider) 24%, transparent 76%) 40%, color-mix(in srgb, var(--background) 72%, transparent 28%) 72%, var(--background) 100%)",
                }}
            >
                <section
                    className={cn(cardLayout.workbenchShellFrosted, "workbench-pad-shell")}
                    aria-label="History workbench"
                >
                    <div className="grid workbench-gap-grid lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                        <div className="workbench-gap-section">
                        <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                            className="workbench-gap-title"
                            aria-label="Focus ledger"
                        >
                            <header className="space-y-1 px-1">
                                <p className={blockTitleStyle}>Focus Ledger</p>
                                <p className="type-caption">
                                    A condensed summary of released burden, focus investment, and current clarity.
                                </p>
                            </header>
                            <div className="grid gap-2.5 sm:grid-cols-3">
                                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                    <div className="flex items-center justify-between">
                                        <p className={labelStyle}>Burdens Released</p>
                                        <Wind className="size-4 text-primary/70" />
                                    </div>
                                    <p className="type-card-value mt-2">
                                        {statsData.totalResolved}
                                    </p>
                                    <p className="type-card-support mt-1.5">Closed loops no longer occupying your mind.</p>
                                </div>

                                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                    <div className="flex items-center justify-between">
                                        <p className={labelStyle}>Focus Time</p>
                                        <Clock className="size-4 text-primary/70" />
                                    </div>
                                    <p className="type-card-value mt-2">
                                        {Math.floor(statsData.totalFocusMinutes / 60)}h {statsData.totalFocusMinutes % 60}m
                                    </p>
                                    <p className="type-card-support mt-1.5">Total footprints in the ritual of maintenance.</p>
                                </div>

                                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                    <div className="flex items-center justify-between">
                                        <p className={labelStyle}>Mind Clarity</p>
                                        <Sparkles className="size-4 text-primary/70" />
                                    </div>
                                    <p className="type-card-value mt-2">
                                        {resolvedRatio}%
                                    </p>
                                    <p className="type-card-support mt-1.5">Released items vs safely stored tasks.</p>
                                </div>
                            </div>
                        </motion.section>

                        {historyMarkersEnabled && (
                            <motion.section
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.04 }}
                                className="workbench-gap-title"
                                aria-label="Quiet markers"
                            >
                                <header className="space-y-1 px-1">
                                    <p className={blockTitleStyle}>Quiet Markers</p>
                                    <p className="type-caption">{achievements.length} recorded</p>
                                </header>
                                {achievements.length === 0 ? (
                                    <div className="flex items-center gap-2.5 rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                                            <Trophy className="size-3.5 text-white" />
                                        </div>
                                        <p className="text-sm italic text-muted-foreground">
                                            &quot;Markers appear as your practice becomes steadier.&quot;
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
                                        {achievements.map((achievement) => (
                                            <AchievementCard
                                                key={achievement.id}
                                                achievementId={achievement.achievementId}
                                                unlockedAt={achievement.unlockedAt}
                                                humorSnapshot={achievement.humorSnapshot}
                                                evidenceSnapshot={achievement.evidenceSnapshot}
                                            />
                                        ))}
                                    </div>
                                )}
                            </motion.section>
                        )}

                        <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.08 }}
                            className="workbench-gap-title"
                            aria-label="Ritual calendar"
                        >
                            <header className="space-y-1 px-1">
                                <p className={blockTitleStyle}>Ritual Calendar</p>
                                <p className="type-caption">Presence in the shared ritual over the last 4 weeks.</p>
                            </header>
                            <div className={cn(cardLayout.workbenchSecondary, "workbench-pad-card")}>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {calendarDays.map((day) => {
                                        const dateStr = day.toISOString().split('T')[0]
                                        const count = statsData.dailyActivity[dateStr] || 0
                                        return (
                                            <div
                                                key={dateStr}
                                                className={cn(
                                                    "size-7 rounded-md border transition-colors duration-150",
                                                    count > 0
                                                        ? "border-primary/35 bg-primary/70"
                                                        : "border-border/60 bg-muted/45"
                                                )}
                                                style={{ opacity: count > 0 ? Math.min(0.55 + (count * 0.2), 1) : 0.58 }}
                                                title={`${day.toDateString()}: ${count} session(s)`}
                                            />
                                        )
                                    })}
                                </div>
                                <div className="mt-3 flex items-center justify-between px-1 type-caption uppercase tracking-[0.08em]">
                                    <span>28 days ago</span>
                                    <span>Today</span>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.12 }}
                            className="workbench-gap-title"
                            aria-label="Session footprints"
                        >
                            <header className="space-y-1 px-1">
                                <p className={blockTitleStyle}>Session Footprints</p>
                                <p className="type-caption">Chronological records from focused sessions.</p>
                            </header>
                            <div className="space-y-2.5">
                                {historyGroups.length === 0 ? (
                                    <div className="space-y-2 py-8 text-center">
                                        <Wind className="mx-auto size-6 text-muted-foreground/70" />
                                        <p className="text-sm text-muted-foreground">Your journey is waiting for its first footprint.</p>
                                    </div>
                                ) : (
                                    historyGroups.map((group) => {
                                        const sessionDate = new Date(group.date)
                                        return (
                                            <article key={group.id} className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    <div className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1">
                                                        <p className="type-caption uppercase tracking-[0.1em] text-primary/80">
                                                            {sessionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                    </div>
                                                    <Badge variant="secondary" className="border border-primary/20 bg-primary/15 px-2.5 type-section-label text-primary">
                                                        {group.duration} MINS FOCUS
                                                    </Badge>
                                                    <div className="flex items-center gap-1.5 type-caption uppercase tracking-[0.08em]">
                                                        <Users className="size-3" />
                                                        {Math.max((group.participantCount ?? 1) - 1, 0)} OTHERS PRESENT
                                                    </div>
                                                </div>

                                                <div className="mt-2.5 space-y-1.5">
                                                    {group.tasks.length === 0 && (
                                                        <p className="text-xs italic text-muted-foreground">Observation session only.</p>
                                                    )}

                                                    {group.tasks.map((task) => (
                                                        <div key={task.id} className="flex items-center justify-between py-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "size-1.5 rounded-full",
                                                                    task.state === 'RESOLVED' ? "bg-primary" : "bg-muted-foreground/35"
                                                                )} />
                                                                <span className={cn(
                                                                    "text-sm",
                                                                    task.state === 'RESOLVED'
                                                                        ? "text-foreground"
                                                                        : "text-muted-foreground line-through opacity-70"
                                                                )}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            {task.state === 'RESOLVED' && (
                                                                <span className="type-caption italic text-primary/80">Released</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </article>
                                        )
                                    })
                                )}

                                {historyPagination?.hasMore && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={loadMoreHistory}
                                        disabled={loadingMoreHistory}
                                        className="h-8 w-full border-border/65 bg-surface-elevated/40 type-section-label hover:bg-muted/55"
                                    >
                                        {loadingMoreHistory ? "Loading..." : "Load Earlier Footprints"}
                                    </Button>
                                )}
                            </div>
                        </motion.section>
                        </div>

                        <div className="workbench-gap-section" aria-label="History context rail">
                        <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                            className="workbench-gap-title"
                            aria-label="Task drawer"
                        >
                            <header className="space-y-1 px-1">
                                <p className={blockTitleStyle}>Task Drawer</p>
                                <p className="type-caption">Open loops safely stored and waiting for closure.</p>
                            </header>
                            <div className={cn(cardLayout.workbenchRail, "overflow-hidden")}>
                                <div className="custom-scrollbar max-h-none divide-y divide-border/40 overflow-y-auto md:max-h-[520px]">
                                    {pendingTasks.length === 0 && (
                                        <div className="space-y-2 px-4 py-10 text-center sm:px-5">
                                            <Sparkles className="mx-auto size-5 text-primary/25" />
                                            <p className="text-xs italic text-muted-foreground">
                                                &ldquo;All loops are closed. Your mind is clear.&rdquo;
                                            </p>
                                        </div>
                                    )}

                                    <AnimatePresence initial={false}>
                                        {pendingTasks.map((task) => (
                                            <motion.div
                                                key={task.id}
                                                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                                                className="group/item flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/45 sm:px-5"
                                            >
                                                <div className="size-1.5 shrink-0 rounded-full bg-primary/25 transition-colors group-hover/item:bg-primary" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs leading-tight text-foreground">{task.title}</p>
                                                    <p className="type-caption italic">Waiting in storage</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                <div className="border-t border-border/60 bg-muted/20 p-2.5">
                                    <Button variant="ghost" size="sm" className="h-8 w-full type-section-label text-primary hover:bg-primary/10" asChild>
                                        <Link href="/focus">
                                            Face these tomorrow <ArrowRight className="ml-1 size-3" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </motion.section>

                        <motion.section
                            initial={prefersReducedMotion ? false : { opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.04 }}
                            className="workbench-gap-title"
                            aria-label="Progress note"
                        >
                            <header className="space-y-1 px-1">
                                <p className={blockTitleStyle}>Progress Note</p>
                                <p className="type-caption">A compact status of your long-running momentum.</p>
                            </header>
                            <div className={cn("grid gap-2.5", historyMarkersEnabled && "sm:grid-cols-2")}>
                                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                    <p className={labelStyle}>Sessions Recorded</p>
                                    <p className="mt-1.5 text-[1.45rem] font-medium leading-none tracking-[-0.015em] text-foreground">
                                        {statsData.totalSessions}
                                    </p>
                                </div>
                                {historyMarkersEnabled && (
                                    <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                                        <p className={labelStyle}>Markers Recorded</p>
                                        <p className="mt-1.5 text-[1.45rem] font-medium leading-none tracking-[-0.015em] text-foreground">
                                            {achievements.length}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <p className="type-body-soft mt-3 italic text-foreground/85">
                                &ldquo;The longest journey is simply a series of small, released burdens.&rdquo;
                            </p>
                        </motion.section>
                        </div>
                </div>
            </section>
        </div>
        </div>
    )
}
