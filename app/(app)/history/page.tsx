'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Clock,
    CheckCircle2,
    ListTodo,
    Play,
    Orbit,
    Zap,
    ArrowRight,
    Calendar,
    Users,
    TrendingDown,
    Sparkles,
    Wind
} from 'lucide-react'
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"

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

export default function HistoryPage() {
    const [data, setData] = useState<HistoryData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/user/history')
                if (res.ok) {
                    const historyData = await res.json()
                    setData(historyData)
                }
            } catch (err) {
                console.error("Failed to fetch history data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-8 max-w-6xl flex items-center justify-center min-h-[60vh]">
                <Zap className="size-8 animate-pulse text-primary opacity-20" />
            </div>
        )
    }

    const { stats, historyGroups, allTasks } = data || {
        stats: { totalResolved: 0, totalPending: 0, totalFocusMinutes: 0, dailyActivity: {} },
        historyGroups: [],
        allTasks: []
    }

    const pendingTasks = allTasks.filter(t => t.state !== 'RESOLVED')
    const resolvedTasks = allTasks.filter(t => t.state === 'RESOLVED')

    // Prepare calendar data (last 28 days)
    const today = new Date()
    const calendarDays = Array.from({ length: 28 }, (_, i) => {
        const d = new Date()
        d.setDate(today.getDate() - (27 - i))
        return d
    })

    const labelStyle = "text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60"

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-12 max-w-7xl animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-3"
                >
                    <h1 className="text-4xl font-extralight tracking-tight text-foreground/90">
                        Your History
                    </h1>
                    <p className="text-muted-foreground text-lg font-light max-w-lg leading-relaxed">
                        Tracing the footprints of your released items and cleared burdens.
                    </p>
                </motion.div>
                <div className="flex gap-4">
                    <Button variant="outline" asChild className="h-12 border-primary/10 hover:bg-primary/5 rounded-2xl px-8 transition-all hover:scale-105">
                        <Link href="/community">
                            <Orbit className="size-4 mr-2" />
                            Community
                        </Link>
                    </Button>
                    <Button asChild className="h-12 shadow-2xl shadow-primary/20 bg-primary hover:scale-105 transition-all rounded-2xl px-10">
                        <Link href="/admin-mode">
                            <Play className="size-4 mr-2 fill-current" />
                            Start Session
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Overview - Emotional Relief */}
            <div className="grid gap-6 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-all shadow-sm overflow-hidden relative group aspect-square md:aspect-auto">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:rotate-12 transition-transform">
                            <Wind className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={labelStyle}>
                                Burdens Released
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-5xl font-extralight tracking-tight">{stats.totalResolved}</div>
                            <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed opacity-70">Closed loops no longer occupying your mind.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-secondary/40 border-border/50 hover:bg-secondary/60 transition-all shadow-sm overflow-hidden relative group aspect-square md:aspect-auto">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform">
                            <Clock className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={labelStyle}>
                                Focus Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-5xl font-extralight tracking-tight flex items-baseline gap-1">
                                {Math.floor(stats.totalFocusMinutes / 60)}<span className="text-lg opacity-40">h</span> {stats.totalFocusMinutes % 60}<span className="text-lg opacity-40">m</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed opacity-70">Total footprints in the ritual of maintenance.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-all shadow-sm overflow-hidden relative group aspect-square md:aspect-auto">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:-rotate-12 transition-transform">
                            <Sparkles className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className={labelStyle}>
                                Mind Clarity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="text-5xl font-extralight tracking-tight">
                                {allTasks.length > 0
                                    ? Math.round((stats.totalResolved / allTasks.length) * 100)
                                    : 100}<span className="text-lg opacity-40">%</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed opacity-70">Burdens released vs. safely stored items.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid gap-6 md:grid-cols-12 lg:grid-cols-4">
                {/* Left Side: Session History & Calendar */}
                <div className="md:col-span-8 lg:col-span-3 space-y-6">
                    {/* Ritual Calendar */}
                    <Card className="shadow-lg border-border/40 overflow-hidden">
                        <CardHeader className="bg-primary/[0.02] border-b border-border/40 pb-4">
                            <CardTitle className={labelStyle}>
                                Ritual Calendar
                            </CardTitle>
                            <CardDescription className="text-xs">Your presence in the shared ritual over the last 4 weeks.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
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
                                                    ? "bg-primary shadow-inner shadow-white/20 animate-pulse-slow"
                                                    : "bg-muted/30 border border-border/40"
                                            )}
                                            style={{
                                                opacity: count > 0 ? Math.min(0.4 + (count * 0.2), 1) : 0.4,
                                                animationDelay: `${idx * 50}ms`
                                            }}
                                            title={`${day.toDateString()}: ${count} session(s)`}
                                        />
                                    )
                                })}
                            </div>
                            <div className="mt-4 flex justify-between items-center text-[10px] text-muted-foreground uppercase tracking-widest px-8">
                                <span>28 days ago</span>
                                <span>Today</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session-based History */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 px-1">
                            <p className={labelStyle}>Session Footprints</p>
                            <div className="h-px bg-border/40 flex-1" />
                        </div>

                        <div className="space-y-4">
                            {historyGroups.length === 0 && (
                                <Card className="bg-muted/5 border-dashed">
                                    <CardContent className="py-20 text-center space-y-3">
                                        <Wind className="size-8 text-muted-foreground/30 mx-auto animate-bounce-slow" />
                                        <p className="text-muted-foreground text-sm">Your journey is waiting for its first footprint.</p>
                                    </CardContent>
                                </Card>
                            )}

                            {historyGroups.map((group, idx) => (
                                <motion.div
                                    key={group.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * idx }}
                                >
                                    <Card className="hover:border-primary/20 transition-all group overflow-hidden">
                                        <div className="flex items-stretch">
                                            {/* Date Sidebar */}
                                            <div className="w-24 bg-primary/[0.03] border-r border-border/40 flex flex-col items-center justify-center p-3 text-center">
                                                <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground opacity-60">
                                                    {new Date(group.date).toLocaleDateString('en-US', { month: 'short' })}
                                                </span>
                                                <span className="text-2xl font-black tracking-tighter text-primary/80 leading-none my-1">
                                                    {new Date(group.date).getDate()}
                                                </span>
                                                <span className="text-[9px] font-medium text-muted-foreground opacity-60">
                                                    {new Date(group.date).getFullYear()}
                                                </span>
                                            </div>

                                            <div className="flex-1 p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold px-2">
                                                            {group.duration} MINS FOCUS
                                                        </Badge>
                                                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                            <Users className="size-3" />
                                                            {group.participantCount || Math.floor(Math.random() * 5) + 1} OTHERS PRESENT
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground opacity-40">
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
                                                                    task.state === 'RESOLVED' ? "text-foreground" : "text-muted-foreground line-through opacity-50"
                                                                )}>
                                                                    {task.title}
                                                                </span>
                                                            </div>
                                                            {task.state === 'RESOLVED' && (
                                                                <span className="text-[9px] text-primary/60 font-medium italic">Released</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {group.tasks.length === 0 && (
                                                        <p className="text-xs text-muted-foreground italic opacity-50">Observation session only.</p>
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
                <div className="md:col-span-4 lg:col-span-1 space-y-6">
                    <Card className="shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden border-dashed">
                        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                            <CardTitle className={labelStyle}>
                                Still Holding
                            </CardTitle>
                            <CardDescription className="text-[10px]">Open loops safely stored awaiting closure.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[500px] overflow-y-auto divide-y divide-border/30 custom-scrollbar">
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
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors group/item"
                                        >
                                            <div className="size-1.5 rounded-full bg-primary/20 group-hover/item:bg-primary transition-colors shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-foreground/80 truncate leading-tight transition-transform group-hover/item:translate-x-0.5">{task.title}</p>
                                                <p className="text-[9px] text-muted-foreground/60 italic">Waiting in storage</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <div className="p-3 bg-muted/10 border-t border-border/40">
                                <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 text-primary/70 hover:bg-primary/5" asChild>
                                    <Link href="/admin-mode">
                                        Face these tomorrow <ArrowRight className="size-3 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Small Aesthetic Card */}
                    <Card className="bg-muted/10 border-dashed overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                        <CardContent className="py-8 text-center space-y-4 relative">
                            <div className="flex justify-center gap-1">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="size-1 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 300}ms` }} />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-light italic leading-relaxed text-foreground/70">
                                    "The longest journey is simply a series of small, released burdens."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
