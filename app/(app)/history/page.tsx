'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Clock,
    Zap,
    ArrowRight,
    Users,
    Sparkles,
    Wind,
    Trophy
} from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from "@/lib/utils"
import { cardLayout } from "@/components/ui/card-layouts"
import { AchievementCard } from '@/components/features/achievements'
import { useAuth } from '@/lib/hooks/useAuth'
import { GuestPlaceholder } from '@/components/features/auth/guest-placeholder'

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

interface HistoryData {
    stats: {
        totalResolved: number
        totalPending: number
        totalFocusMinutes: number
        dailyActivity: Record<string, number>
    }
    historyGroups: HistoryGroup[]
    allTasks: TaskRecord[]
}

interface UserAchievementRecord {
    id: string
    achievementId: string
    unlockedAt: string
    evidenceSnapshot: string
    humorSnapshot: string
}

export default function HistoryPage() {
    const [data, setData] = useState<HistoryData | null>(null)
    const [achievements, setAchievements] = useState<UserAchievementRecord[]>([])
    const [initialLoading, setInitialLoading] = useState(true)
    const prefersReducedMotion = useReducedMotion()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [historyRes, achievementsRes] = await Promise.all([
                    fetch('/api/user/history'),
                    fetch('/api/achievements')
                ])

                if (historyRes.ok) {
                    const historyData = await historyRes.json()
                    setData(historyData)
                }

                if (achievementsRes.ok) {
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


    const { user, loading: authLoading } = useAuth()
    const loading = initialLoading || authLoading

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-8 max-w-4xl flex items-center justify-center min-h-[60vh]">
                <Zap className={cn("size-8 text-primary opacity-20", !prefersReducedMotion && "animate-pulse")} />
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

    const { stats, historyGroups, allTasks } = data || {
        stats: { totalResolved: 0, totalPending: 0, totalFocusMinutes: 0, dailyActivity: {} },
        historyGroups: [],
        allTasks: []
    }

    const pendingTasks = allTasks.filter(t => t.state !== 'RESOLVED')

    // Prepare calendar data (last 28 days)
    const today = new Date()
    const calendarDays = Array.from({ length: 28 }, (_, i) => {
        const d = new Date()
        d.setDate(today.getDate() - (27 - i))
        return d
    })

    const labelStyle = "type-section-label"
    const metaStyle = "type-caption mt-3 leading-relaxed"

    return (
        <div className={cn(
            "container mx-auto p-4 sm:p-5 md:p-6 space-y-6 md:space-y-8 max-w-4xl",
            !prefersReducedMotion && "animate-in fade-in duration-1000"
        )}>
            {/* Header */}
            <div className="flex flex-col gap-2 mb-6 md:mb-8">
                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : undefined}
                    className="flex flex-col gap-2"
                >
                    <h1 className="type-page-title font-sans">
                        Your History
                    </h1>
                    <p className="type-page-subtitle max-w-2xl">
                        Tracing the footprints of your released items and cleared burdens.
                    </p>
                </motion.div>
            </div>

            {/* Stats Overview - Emotional Relief */}
            <div className="grid gap-x-5 gap-y-2 sm:gap-x-6 sm:gap-y-2 md:grid-cols-3">
                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.1 }}
                >
                    <Card className={cn(
                        "shadow-sm overflow-hidden relative group min-h-[178px] md:min-h-[172px]",
                        cardLayout.metric,
                        cardLayout.interactive
                    )}>
                        <div className={cn(
                            "absolute top-0 right-0 p-3 opacity-20 transition-transform",
                            !prefersReducedMotion && "group-hover:rotate-12"
                        )}>
                            <Wind className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                            <CardTitle className={labelStyle}>
                                Burdens Released
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 pb-5">
                            <div className="type-metric-value">{stats.totalResolved}</div>
                            <p className={metaStyle}>Closed loops no longer occupying your mind.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.2 }}
                >
                    <Card className={cn(
                        "shadow-sm overflow-hidden relative group min-h-[178px] md:min-h-[172px]",
                        cardLayout.metric,
                        cardLayout.interactive
                    )}>
                        <div className={cn(
                            "absolute top-0 right-0 p-3 opacity-20 transition-transform",
                            !prefersReducedMotion && "group-hover:scale-110"
                        )}>
                            <Clock className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                            <CardTitle className={labelStyle}>
                                Focus Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 pb-5">
                            <div className="type-metric-value flex items-baseline gap-1">
                                {Math.floor(stats.totalFocusMinutes / 60)}<span className="text-lg text-muted-foreground">h</span> {stats.totalFocusMinutes % 60}<span className="text-lg text-muted-foreground">m</span>
                            </div>
                            <p className={metaStyle}>Total footprints in the ritual of maintenance.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.3 }}
                >
                    <Card className={cn(
                        "shadow-sm overflow-hidden relative group min-h-[178px] md:min-h-[172px]",
                        cardLayout.metric,
                        cardLayout.interactive
                    )}>
                        <div className={cn(
                            "absolute top-0 right-0 p-3 opacity-20 transition-transform",
                            !prefersReducedMotion && "group-hover:-rotate-12"
                        )}>
                            <Sparkles className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                            <CardTitle className={labelStyle}>
                                Mind Clarity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 pb-5">
                            <div className="type-metric-value">
                                {allTasks.length > 0
                                    ? Math.round((stats.totalResolved / allTasks.length) * 100)
                                    : 100}<span className="text-lg text-muted-foreground">%</span>
                            </div>
                            <p className={metaStyle}>Burdens released vs. safely stored items.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Achievement Collection */}
            <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.4 }}
            >
                <Card className={cn(cardLayout.insight)}>
                    <CardHeader className="pb-3 border-b border-border/60 bg-muted/25">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg">
                                    <Trophy className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <CardTitle className={labelStyle}>Hidden Achievements</CardTitle>
                                    <CardDescription className="type-caption mt-0.5">
                                        {achievements.length} unlocked
                                    </CardDescription>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-5">
                        {achievements.length === 0 ? (
                            <div className="text-center py-8 space-y-3">
                                <div className="flex justify-center gap-1">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn("size-1.5 rounded-full bg-amber-500/60", !prefersReducedMotion && "animate-pulse")}
                                            style={{ animationDelay: `${i * 200}ms` }}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground italic">
                                    &quot;Hidden achievements reveal themselves when the time is right.&quot;
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
                                {achievements.map((ach) => (
                                    <AchievementCard
                                        key={ach.id}
                                        achievementId={ach.achievementId}
                                        unlockedAt={ach.unlockedAt}
                                        humorSnapshot={ach.humorSnapshot}
                                        evidenceSnapshot={ach.evidenceSnapshot}
                                    />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid gap-x-7 gap-y-3 lg:grid-cols-3">
                {/* Left Side: Session History & Calendar */}
                <div className="lg:col-span-2 space-y-3.5">
                    {/* Ritual Calendar */}
                    <Card className={cn(cardLayout.dataSurface)}>
                        <CardHeader className="bg-muted/25 border-b border-border/60 pb-3">
                            <CardTitle className={labelStyle}>
                                Ritual Calendar
                            </CardTitle>
                            <CardDescription className="type-caption mt-0.5">Your presence in the shared ritual over the last 4 weeks.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5">
                            <div className="flex flex-wrap gap-2 justify-center">
                                {calendarDays.map((day, idx) => {
                                    const dateStr = day.toISOString().split('T')[0]
                                    const count = stats.dailyActivity[dateStr] || 0
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "size-8 rounded-md transition-all duration-500",
                                                count > 0
                                                    ? cn("bg-primary/80 shadow-inner shadow-primary/40", !prefersReducedMotion && "animate-pulse-slow")
                                                    : "bg-muted/60 border border-border/60"
                                            )}
                                            style={{
                                                opacity: count > 0 ? Math.min(0.55 + (count * 0.2), 1) : 0.65,
                                                animationDelay: prefersReducedMotion ? undefined : `${idx * 50}ms`
                                            }}
                                            title={`${day.toDateString()}: ${count} session(s)`}
                                        />
                                    )
                                })}
                            </div>
                            <div className="mt-3 flex justify-between items-center type-caption uppercase tracking-[0.08em] px-2 sm:px-8">
                                <span>28 days ago</span>
                                <span>Today</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session-based History */}
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-4 px-1 pb-2">
                            <p className={cn(labelStyle, "text-primary")}>Session Footprints</p>
                            <div className="h-[2px] bg-gradient-to-r from-primary/35 via-primary/15 to-transparent flex-1 rounded-full" />
                        </div>

                        <div className="space-y-2">
                            {historyGroups.length === 0 && (
                                <Card className={cn(cardLayout.dataSurface, "border-dashed")}>
                                    <CardContent className="py-20 text-center space-y-3">
                                        <Wind className={cn(
                                            "size-8 text-muted-foreground mx-auto",
                                            !prefersReducedMotion && "animate-bounce-slow"
                                        )} />
                                        <p className="text-muted-foreground text-sm">Your journey is waiting for its first footprint.</p>
                                    </CardContent>
                                </Card>
                            )}

                            {historyGroups.map((group, idx) => (
                                <motion.div
                                    key={group.id}
                                    initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.08 * idx }}
                                >
                                    <Card className={cn("group overflow-hidden", cardLayout.dataSurface, cardLayout.interactive)}>
                                        <div className="flex items-stretch">
                                            {/* Date Sidebar */}
                                            <div className="w-24 bg-primary/[0.08] border-r border-border/60 flex flex-col items-center justify-center p-3 text-center">
                                                <span className="type-section-label">
                                                    {new Date(group.date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-[1.85rem] font-medium tracking-[-0.015em] text-primary/80 leading-none my-1">
                                                    {new Date(group.date).getDate()}
                                                </span>
                                                <span className="type-caption">
                                                    {new Date(group.date).getFullYear()}
                                                </span>
                                            </div>

                                            <div className="flex-1 p-3.5">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2 sm:gap-3">
                                                        <Badge variant="secondary" className="bg-primary/15 text-primary border border-primary/20 px-2.5 type-section-label">
                                                            {group.duration} MINS FOCUS
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5 type-caption uppercase tracking-[0.08em]">
                                                            <Users className="size-3" />
                                                            {Math.max((group.participantCount ?? 1) - 1, 0)} OTHERS PRESENT
                                                        </div>
                                                    </div>
                                                    <span className="type-section-label">
                                                        Session Record
                                                    </span>
                                                </div>

                                                <div className="space-y-2">
                                                    {group.tasks.map((task) => (
                                                        <div key={task.id} className="flex items-center justify-between group/task py-1">
                                                            <div className="flex items-center gap-2">
                                                                <div className={cn(
                                                                    "size-2 rounded-full",
                                                                    task.state === 'RESOLVED' ? "bg-primary" : "bg-muted-foreground/30"
                                                                )} />
                                                                <span className={cn(
                                                                    "text-sm",
                                                                    task.state === 'RESOLVED' ? "text-foreground" : "text-muted-foreground line-through opacity-70"
                                                                )}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            {task.state === 'RESOLVED' && (
                                                                <span className="type-caption text-primary/80 italic">Released</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {group.tasks.length === 0 && (
                                                        <p className="text-xs text-muted-foreground italic">Observation session only.</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side: Task Drawer (Still Holding) */}
                <div className="space-y-3">
                    <Card className={cn("backdrop-blur-sm border-dashed", cardLayout.dataSurface)}>
                        <CardHeader className="pb-2.5 border-b border-border/60 bg-muted/25">
                            <CardTitle className={labelStyle}>
                                Still Holding
                            </CardTitle>
                            <CardDescription className="type-caption mt-0.5">Open loops safely stored awaiting closure.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-none md:max-h-[500px] overflow-y-auto divide-y divide-border/40 custom-scrollbar">
                                {pendingTasks.length === 0 && !loading && (
                                    <div className="py-12 text-center px-4 space-y-2">
                                        <Sparkles className="size-5 text-primary/20 mx-auto" />
                                        <p className="text-xs text-muted-foreground italic">&ldquo;All loops are closed. Your mind is clear.&rdquo;</p>
                                    </div>
                                )}
                                <AnimatePresence initial={false}>
                                    {pendingTasks.map((task) => (
                                        <motion.div
                                            key={task.id}
                                            initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                                            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                                            className="p-3 flex items-center gap-3 hover:bg-muted/45 transition-colors group/item"
                                        >
                                            <div className="size-1.5 rounded-full bg-primary/20 group-hover/item:bg-primary transition-colors shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className={cn(
                                                    "text-xs text-foreground truncate leading-tight",
                                                    !prefersReducedMotion && "transition-transform group-hover/item:translate-x-0.5"
                                                )}>{task.title}</p>
                                                <p className="type-caption italic">Waiting in storage</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="p-2.5 bg-muted/20 border-t border-border/60">
                                <Button variant="ghost" size="sm" className="w-full h-8 type-section-label text-primary hover:bg-primary/10" asChild>
                                    <Link href="/focus">
                                        Face these tomorrow <ArrowRight className="size-3 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Small Aesthetic Card */}
                    <Card className={cn("border-dashed relative group", cardLayout.dataSurface)}>
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                        <CardContent className="py-6 text-center space-y-3 relative">
                            <div className="flex justify-center gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={cn("size-1 rounded-full bg-primary/50", !prefersReducedMotion && "animate-pulse")}
                                        style={{ animationDelay: `${i * 300}ms` }}
                                    />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="type-body-soft italic text-foreground/85">
                                    &ldquo;The longest journey is simply a series of small, released burdens.&rdquo;
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
