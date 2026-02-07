
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Orbit,
    Footprints,
    Play
} from 'lucide-react'
import Link from "next/link"
import { CollectiveExhale } from "@/components/features/community/collective-exhale"
import { VictoryFeed } from "@/components/features/community/victory-feed"
import { Typography } from "@/components/ui/typography"
import { motion } from 'framer-motion'
import { MilestoneProgress } from "@/components/features/community/milestone-progress"
import { DeadpanFacts } from "@/components/features/community/deadpan-facts"

interface GlobalStats {
    community: {
        totalTasksCompleted: number
        daily: {
            totalSteps: number
            activeUsers: number
            topCategories: string[]
        }
        weekly: {
            totalSteps: number
            goal: number
            progress: number
        }
        monthly: {
            totalSteps: number
            fact: string
        }
        // Legacy support if needed, or remove if API is fully migrated
        avgBloomTimeHours?: number
        peakFocusHour?: string
        mostProductiveDay?: string
    }
}

export default function CommunityPage() {
    const [stats, setStats] = useState<GlobalStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch('/api/community/stats')
                if (statsRes.ok) setStats(await statsRes.json())
            } catch (err) {
                console.error("Failed to fetch community stats", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const labelStyle = "text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60"

    return (
        <div className="container mx-auto p-8 space-y-16 max-w-4xl animate-in fade-in duration-1000 mb-20">
            {/* 1. Header & Atmosphere Layer */}
            <section className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-2"
                    >
                        <h1 className="text-4xl font-extralight tracking-tight text-foreground/90 font-sans">
                            The Collective Pulse
                        </h1>
                        <p className="text-muted-foreground font-light tracking-wide text-lg">
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
                    className="relative w-full aspect-[21/9] rounded-[2.5rem] overflow-hidden glass-therapeutic border-primary/5 shadow-2xl"
                >
                    <CollectiveExhale count={stats?.community.totalTasksCompleted || 0} />
                </motion.div>
            </section>

            {/* 2. Victory & Insight Layer */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Victory Feed (Wide) */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="lg:col-span-2"
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
                >
                    <Card className="h-full rounded-[2.5rem] border-primary/10 bg-primary/5 relative overflow-hidden group">
                        <CardHeader className="p-8 pb-0">
                            <CardTitle className={labelStyle}>Reclaimed Clarity</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 space-y-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-extralight text-primary/80 tabular-nums">
                                    {stats?.community.avgBloomTimeHours || '72'}
                                </span>
                                <span className="text-lg font-light text-muted-foreground">%</span>
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

                {/* Deadpan Facts (Monthly Reflection) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    <DeadpanFacts fact={stats?.community.monthly.fact} />
                </motion.div>
            </section>

            {/* 3. Ritual Rhythm Layer - Weekly Milestone */}
            <section className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="p-8 rounded-[2.5rem] border border-primary/10 bg-background/50 backdrop-blur-sm"
                >
                    <MilestoneProgress
                        current={stats?.community.weekly.progress || 0}
                        target={stats?.community.weekly.goal || 10000}
                    />
                </motion.div>
            </section>

            {/* Aesthetic Ending */}
            <footer className="pt-12 pb-12 text-center space-y-8 opacity-40">
                <div className="flex justify-center gap-12 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest">Admin Night</p>
                    <p className="text-sm font-light italic">"You are not doing this alone."</p>
                </div>
            </footer>
        </div>
    )
}
