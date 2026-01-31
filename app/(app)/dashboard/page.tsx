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
    Zap
} from 'lucide-react'
import Link from "next/link"
import { cn } from "@/lib/utils"

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
                    fetch('/api/tasks?limit=10'),
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

    const completedTasks = tasks.filter(t => t.state === 'RESOLVED').length
    const totalFocusTime = (stats?.community.totalFocusMinutes || 0).toLocaleString()

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-6xl animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extralight tracking-tight">
                        Insights & History
                    </h1>
                    <p className="text-muted-foreground mt-1">Reflecting on your progress and the community&apos;s energy.</p>
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
                {/* Usage History */}
                <Card className="lg:col-span-2 shadow-xl border-border/40">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <History className="size-5 text-primary" />
                                Your Task History
                            </CardTitle>
                            <CardDescription>Recent items you&apos;ve worked on.</CardDescription>
                        </div>
                        {loading && <Zap className="size-4 animate-pulse text-primary" />}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-1">
                            {tasks.length === 0 && !loading && (
                                <div className="py-12 text-center space-y-3">
                                    <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto opacity-50">
                                        <ListTodo className="size-6" />
                                    </div>
                                    <p className="text-muted-foreground text-sm">No tasks yet. Start your first session!</p>
                                </div>
                            )}
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50"
                                >
                                    <div className={cn(
                                        "size-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                        task.state === 'RESOLVED' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        {task.state === 'RESOLVED' ? <CheckCircle2 className="size-5" /> : <Clock className="size-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{task.title}</p>
                                        <p className="text-muted-foreground text-xs">
                                            {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                                            task.state === 'RESOLVED' ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                        )}>
                                            {task.state === 'RESOLVED' ? 'Success' : 'Archived'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fun Stats & Community Vibe */}
                <div className="space-y-6">
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

