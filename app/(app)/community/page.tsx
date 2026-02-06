
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Clock,
    Globe,
    Zap,
    Play,
    Users,
    Footprints,
    Timer,
    Wind,
    Orbit,
    Sparkles
} from 'lucide-react'
import Link from "next/link"
import { CollectiveExhale } from "@/components/community/collective-exhale"
import { VictoryFeed } from "@/components/community/victory-feed"
import { motion } from 'framer-motion'

interface GlobalStats {
    community: {
        totalTasksCompleted: number
        totalFocusMinutes: number
        peakFocusHour: string
        mostProductiveDay: string
        avgBloomTimeHours: number
        victories: { label: string, count: number, icon: string }[]
    }
}

export default function CommunityPage() {
    const [stats, setStats] = useState<GlobalStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch('/api/stats/global')
                if (statsRes.ok) setStats(await statsRes.json())
            } catch (err) {
                console.error("Failed to fetch community stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const labelStyle = "text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60"

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-12 max-w-7xl animate-in fade-in duration-1000 mb-20">
            {/* 1. Header & Atmosphere Layer */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h1 className="text-4xl font-extralight tracking-tight text-foreground/90">
                            The Collective Pulse
                        </h1>
                        <p className="text-muted-foreground text-lg font-light max-w-lg leading-relaxed border-l-2 border-primary/5 pl-6">
                            Witness the shared rhythm of release and the weight of burdens letting go in real-time.
                        </p>
                    </motion.div>

                    <div className="flex gap-4">
                        <Button variant="outline" asChild className="h-14 border-primary/5 hover:bg-primary/5 rounded-full px-8 transition-all hover:scale-105 glass-therapeutic">
                            <Link href="/history">
                                <Footprints className="size-4 mr-2" />
                                Your Journey
                            </Link>
                        </Button>
                        <Button asChild className="h-14 shadow-2xl shadow-primary/20 bg-primary hover:scale-105 transition-all rounded-full px-12">
                            <Link href="/admin-mode">
                                <Play className="size-4 mr-2 fill-current" />
                                Start Session
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Atmosphere Hero: Energy Ball */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="relative w-full aspect-[21/7] min-h-[300px] rounded-[2.5rem] overflow-hidden glass-therapeutic border-primary/5 shadow-2xl"
                >
                    <CollectiveExhale count={stats?.community.totalTasksCompleted || 0} />
                </motion.div>
            </section>

            {/* 2. Victory & Insight Layer */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Victory Feed (Wide) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-7"
                >
                    <Card className="h-full rounded-[2.5rem] border-primary/5 glass-therapeutic overflow-hidden shadow-xl">
                        <VictoryFeed />
                    </Card>
                </motion.div>

                {/* Mental Bloom (Focused) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-5"
                >
                    <Card className="h-full rounded-[2.5rem] border-primary/10 bg-primary/5 relative overflow-hidden group">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className={labelStyle}>Reclaimed Clarity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extralight text-primary/80 tabular-nums">
                                    {stats?.community.avgBloomTimeHours || '72'}
                                </span>
                                <span className="text-xl font-light text-muted-foreground">%</span>
                            </div>
                            <div className="space-y-4">
                                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                                    Average reduction in mental drag across all participants this week.
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['Focus', 'Flow', 'Release'].map(tag => (
                                        <span key={tag} className="text-[9px] px-4 py-1.5 rounded-full bg-background border border-border uppercase tracking-widest font-bold opacity-60">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute -bottom-10 -right-10 text-primary/[0.03] group-hover:scale-110 transition-transform duration-1000">
                            <Orbit className="size-64" />
                        </div>
                    </Card>
                </motion.div>
            </section>

            {/* 3. Ritual Rhythm Layer - Minimalist White Space */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center p-8 md:p-12 rounded-[2.5rem] border border-dashed border-primary/10 bg-transparent text-center space-y-4"
                >
                    <p className={labelStyle}>Peak Attunement</p>
                    <h3 className="text-4xl font-extralight tracking-tight text-foreground/80">
                        {stats?.community.peakFocusHour || '21:00'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-light italic opacity-70">
                        The hour our minds breathe most deeply together.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center justify-center p-8 md:p-12 rounded-[2.5rem] border border-dashed border-primary/10 bg-transparent text-center space-y-4"
                >
                    <p className={labelStyle}>Rhythm of the Week</p>
                    <h3 className="text-4xl font-extralight tracking-tight text-foreground/80">
                        {stats?.community.mostProductiveDay || 'Tuesdays'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-light italic opacity-70">
                        When the collective will is strongest.
                    </p>
                </motion.div>
            </section>

            {/* Aesthetic Ending */}
            <footer className="pt-12 pb-12 text-center space-y-8 opacity-40">
                <div className="flex justify-center gap-12 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-[0.5em]">Admin Night</p>
                    <p className="text-sm font-light italic">"You are not doing this alone."</p>
                </div>
            </footer>
        </div>
    )
}
