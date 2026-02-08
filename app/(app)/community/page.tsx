
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Orbit,
    Users,
    Sparkles,
    Wind
} from 'lucide-react'
import { CollectiveExhale } from "@/components/features/community/collective-exhale"
import { VictoryFeed } from "@/components/features/community/victory-feed"
import { motion } from 'framer-motion'
import { MilestoneProgress } from "@/components/features/community/milestone-progress"
import { DeadpanFacts } from "@/components/features/community/deadpan-facts"
import { cn } from "@/lib/utils"
import { cardLayout } from "@/components/ui/card-layouts"

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
        reactions?: {
            daily: {
                byType: {
                    clap: number
                    fire: number
                    leaf: number
                }
                total: number
            }
            weekly: {
                total: number
                reactionDensity: number
                sessionParticipationRate: number
                userParticipationRate: number
            }
            monthly: {
                total: number
            }
        }
        metrics?: {
            reactionDensity: number
            sessionParticipationRate: number
            userParticipationRate: number
        }
        // Legacy support if needed, or remove if API is fully migrated
        avgBloomTimeHours?: number
        peakFocusHour?: string
        mostProductiveDay?: string
    }
}

export default function CommunityPage() {
    const [stats, setStats] = useState<GlobalStats | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await fetch('/api/community/stats')
                if (statsRes.ok) setStats(await statsRes.json())
            } catch (err) {
                console.error("Failed to fetch community stats", err)
            }
        }
        fetchData()
    }, [])

    const labelStyle = "type-section-label"
    const metaStyle = "type-caption mt-3 leading-relaxed"
    const totalReleased = stats?.community.totalTasksCompleted ?? 0
    const activeParticipants = stats?.community.daily.activeUsers ?? 0
    const dailyReactions = stats?.community.reactions?.daily.total ?? 0
    const reclaimedClarity = stats?.community.avgBloomTimeHours ?? 72
    const weeklyProgress = stats?.community.weekly.progress ?? 0
    const weeklyGoal = stats?.community.weekly.goal ?? 10000

    return (
        <div className="container mx-auto p-4 sm:p-5 md:p-6 space-y-6 md:space-y-8 max-w-4xl animate-in fade-in duration-1000 mb-20">
            <div className="flex flex-col gap-2 mb-6 md:mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col gap-2"
                >
                    <h1 className="type-page-title font-sans">
                        The Collective Pulse
                    </h1>
                    <p className="type-page-subtitle max-w-2xl">
                        Witness the shared rhythm of release and the weight of burdens letting go in real-time.
                    </p>
                </motion.div>
            </div>

            <div className="grid gap-x-5 gap-y-2 sm:gap-x-6 sm:gap-y-2 md:grid-cols-3">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card className={cn("shadow-sm overflow-hidden relative group min-h-[178px] md:min-h-[172px]", cardLayout.metric, cardLayout.interactive)}>
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Wind className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                            <CardTitle className={labelStyle}>Collective Releases</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 pb-5">
                            <div className="type-metric-value">{totalReleased.toLocaleString()}</div>
                            <p className={metaStyle}>Tasks completed by the community.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card className={cn("shadow-sm overflow-hidden relative group min-h-[178px] md:min-h-[172px]", cardLayout.metric, cardLayout.interactive)}>
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Users className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                            <CardTitle className={labelStyle}>Active Participants</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 pb-5">
                            <div className="type-metric-value">{activeParticipants}</div>
                            <p className={metaStyle}>People currently contributing today.</p>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card className={cn("shadow-sm overflow-hidden relative group min-h-[178px] md:min-h-[172px]", cardLayout.metric, cardLayout.interactive)}>
                        <div className="absolute top-0 right-0 p-3 opacity-20">
                            <Sparkles className="size-12 text-primary" />
                        </div>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                            <CardTitle className={labelStyle}>Today&apos;s Reactions</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-2 pb-5">
                            <div className="type-metric-value">{dailyReactions}</div>
                            <p className={metaStyle}>Clap, fire, and leaf reactions sent today.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className={cn(cardLayout.insight)}>
                    <CardHeader className="pb-3 border-b border-border/60 bg-muted/25">
                        <CardTitle className={labelStyle}>Collective Resonance</CardTitle>
                        <CardDescription className="type-caption mt-0.5">
                            Live view of shared release momentum.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="relative w-full aspect-[21/9]">
                            <CollectiveExhale count={totalReleased} />
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <div className="grid gap-x-7 gap-y-3 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-3.5">
                    <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <Card className={cn("h-full", cardLayout.insight)}>
                            <VictoryFeed />
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <Card className={cn(cardLayout.dataSurface)}>
                            <CardHeader className="pb-3 border-b border-border/60 bg-muted/25">
                                <CardTitle className={labelStyle}>Weekly Milestone</CardTitle>
                                <CardDescription className="type-caption mt-0.5">
                                    Progress toward this week&apos;s shared target.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5">
                                <MilestoneProgress current={weeklyProgress} target={weeklyGoal} />
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                <div className="space-y-3">
                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <Card className={cn("relative overflow-hidden min-h-[178px] md:min-h-[172px]", cardLayout.metric, cardLayout.interactive)}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-1.5">
                                <CardTitle className={labelStyle}>Reclaimed Clarity</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-2 pb-5 space-y-3">
                                <div className="flex items-baseline gap-2">
                                    <span className="type-metric-value">{reclaimedClarity}</span>
                                    <span className="text-lg font-medium text-muted-foreground">%</span>
                                </div>
                                <p className="type-body-soft">
                                    Average reduction in mental drag across all participants this week.
                                </p>
                            </CardContent>
                            <div className="absolute -bottom-10 -right-10 text-primary/[0.06] group-hover:scale-110 transition-transform duration-1000">
                                <Orbit className="size-64" />
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <DeadpanFacts fact={stats?.community.monthly.fact} />
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
