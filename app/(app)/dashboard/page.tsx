'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Clock,
    CheckCircle2,
    ListTodo,
    Play,
    Sparkles,
    Globe,
    History,
    TrendingUp,
    Zap,
    ArrowRight
} from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface GlobalStats {
    community: {
        totalTasksCompleted: number
        totalFocusMinutes: number
        activePeopleRightNow: number
        peakFocusHour: string
        mostProductiveDay: string
    }
}

interface TaskRecord {
    id: string
    title: string
    state: string
    createdAt: string
}

export default function InsightsPage() {
    const [tasks, setTasks] = useState<TaskRecord[]>([])
    const [stats, setStats] = useState<GlobalStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tasksRes, statsRes] = await Promise.all([
                    fetch('/api/tasks?limit=50'),
                    fetch('/api/stats/global')
                ])
                if (tasksRes.ok) setTasks(await tasksRes.json())
                if (statsRes.ok) setStats(await statsRes.json())
            } catch (err) {
                console.error("Failed to fetch insights data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const resolvedTasks = tasks.filter(t => t.state === 'RESOLVED')
    const pendingTasks = tasks.filter(t => t.state !== 'RESOLVED')
    const totalFocusTime = (stats?.community.totalFocusMinutes || 0).toLocaleString()

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extralight tracking-tight">
                        Insights & History
                    </h1>
                    <p className="text-muted-foreground mt-1">Reflecting on your progress and the community&aps;s energy.</p>
                </div>
                <Button asChild className="gap-2 shadow-lg shadow-primary/20 bg-primary hover:scale-105 transition-transform">
                    <Link href="/admin-mode">
                        <Play className="size-4 fill-current" />
                        Start Admin Session
                    </Link>
                </Button>
            </div>

            {/* Top Metrics: Personal + Fun Global */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Personal Focus
                        </CardTitle>
                        <Zap className="h-4 w-4 text-primary/60" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{tasks.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tasks captured total</p>
                    </CardContent>
                </Card>

                <Card className="bg-secondary/40 border-border/50 hover:bg-secondary/60 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Global Impact
                        </CardTitle>
                        <Globe className="h-4 w-4 text-primary/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.community.totalTasksCompleted.toLocaleString() || '---'}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tasks finished by everyone</p>
                    </CardContent>
                </Card>

                <Card className="bg-primary/5 border-primary/10 hover:bg-primary/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Collective Flow
                        </CardTitle>
                        <Clock className="h-4 w-4 text-primary/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFocusTime}</div>
                        <p className="text-xs text-muted-foreground mt-1">Total minutes focused together</p>
                    </CardContent>
                </Card>

                <Card className="bg-secondary/40 border-border/50 hover:bg-secondary/60 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Peak Energy
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary/40" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.community.peakFocusHour || '---'}</div>
                        <p className="text-xs text-muted-foreground mt-1">When the community is active</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
                {/* Main Content: Victories */}
                <Card className="lg:col-span-2 shadow-xl border-border/40 overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between bg-primary/[0.02] border-b border-border/40 pb-4">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="size-5 text-primary" />
                                Your Recent Victories
                            </CardTitle>
                            <CardDescription>Items you&apos;ve successfully released.</CardDescription>
                        </div>
                        {loading && <Zap className="size-4 animate-pulse text-primary" />}
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border/40">
                            {resolvedTasks.length === 0 && !loading && (
                                <div className="py-20 text-center space-y-3">
                                    <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto opacity-50">
                                        <CheckCircle2 className="size-6 text-muted-foreground" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">No victories yet. Your journey begins here.</p>
                                </div>
                            )}
                            {resolvedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="group flex items-center gap-4 p-4 hover:bg-primary/[0.01] transition-colors"
                                >
                                    <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="size-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{task.title}</p>
                                        <p className="text-muted-foreground text-[10px] uppercase tracking-wider">
                                            Released on {new Date(task.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-[10px] font-bold border-primary/20 text-primary bg-primary/5">
                                            Success
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sidebar: Task Drawer & Community */}
                <div className="space-y-6">
                    {/* Task Drawer Section */}
                    <Card className="shadow-lg border-primary/10 bg-card/50 backdrop-blur-sm overflow-hidden border-dashed">
                        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                            <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-widest text-muted-foreground">
                                <ListTodo className="size-4 text-primary/60" />
                                Task Drawer
                            </CardTitle>
                            <CardDescription className="text-[10px]">Safely stored for your next session.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="max-h-[350px] overflow-y-auto divide-y divide-border/30">
                                {pendingTasks.length === 0 && !loading && (
                                    <div className="py-8 text-center px-4">
                                        <p className="text-xs text-muted-foreground italic">&ldquo;The drawer is empty. Your mind is clear.&rdquo;</p>
                                    </div>
                                )}
                                {pendingTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                                    >
                                        <Clock className="size-3.5 text-muted-foreground/50 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-foreground/80 truncate leading-tight">{task.title}</p>
                                            <p className="text-[9px] text-muted-foreground/60 italic">Waiting in storage</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-3 bg-muted/10 border-t border-border/40">
                                <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest h-8 text-primary/70" asChild>
                                    <Link href="/admin-mode">
                                        Focus on these <ArrowRight className="size-3 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Community Energy */}
                    <Card className="shadow-lg border-primary/10 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden relative">
                        <Sparkles className="absolute -top-4 -right-4 size-24 text-primary/5 rotate-12" />
                        <CardHeader>
                            <CardTitle className="text-lg">Community Energy</CardTitle>
                            <CardDescription>The pulse of Admin Night.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 relative">
                            <div className="p-4 rounded-2xl bg-background/50 border border-white/20 backdrop-blur-sm space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase">Active Right Now</p>
                                <div className="flex items-center gap-2">
                                    <div className="size-2 bg-primary/60 rounded-full animate-pulse" />
                                    <span className="text-2xl font-bold">{stats?.community.activePeopleRightNow || '--'} People</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Focusing along with you</p>
                            </div>

                            <div className="p-4 rounded-2xl bg-background/50 border border-white/20 backdrop-blur-sm space-y-1">
                                <p className="text-xs text-muted-foreground font-medium uppercase">Favorite Day</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold">{stats?.community.mostProductiveDay || '--'}</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground">When most tasks get cleared</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-muted/30 border-dashed">
                        <CardContent className="py-6 text-center space-y-2">
                            <p className="text-sm font-medium">Want more interesting stats?</p>
                            <p className="text-xs text-muted-foreground">As everyone completes more tasks, we&apos;ll unlock more community insights.</p>
                            <Button variant="link" size="sm" className="text-primary" asChild>
                                <Link href="/admin-mode">Keep Focusing ↗</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

