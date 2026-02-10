'use client'

import { type ComponentType, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Orbit, Sparkles, Users, Wind } from 'lucide-react'
import { CollectiveExhale } from "@/components/features/community/collective-exhale"
import { VictoryFeed } from "@/components/features/community/victory-feed"
import { MilestoneProgress } from "@/components/features/community/milestone-progress"
import { DeadpanFacts } from "@/components/features/community/deadpan-facts"
import { cn } from "@/lib/utils"
import { cardLayout } from "@/components/ui/card-layouts"

interface CommunityVictory {
    id: string
    message: string
    resolvedAt: string
}

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
        avgBloomTimeHours?: number | null
        peakFocusHour?: string
        mostProductiveDay?: string
        recentVictories?: CommunityVictory[]
    }
}

interface PulseMetric {
    label: string
    value: string
    meta: string
    icon: ComponentType<{ className?: string }>
}

export default function CommunityPage() {
    const [stats, setStats] = useState<GlobalStats | null>(null)
    const prefersReducedMotion = useReducedMotion()

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

    const labelStyle = "type-section-label text-[0.76rem] tracking-[0.07em]"
    const blockTitleStyle = "type-block-title"
    const totalReleased = stats?.community.totalTasksCompleted ?? 0
    const activeParticipants = stats?.community.daily.activeUsers ?? 0
    const dailyReactions = stats?.community.reactions?.daily.total ?? 0
    const avgBloomTimeHours = stats?.community.avgBloomTimeHours
    const bloomTimeLabel =
        typeof avgBloomTimeHours === 'number'
            ? `${avgBloomTimeHours.toFixed(1)}h`
            : '—'
    const weeklyProgress = stats?.community.weekly.progress ?? 0
    const weeklyGoal = stats?.community.weekly.goal ?? 10000

    const pulseMetrics: PulseMetric[] = [
        {
            label: "Collective Releases",
            value: totalReleased.toLocaleString(),
            meta: "Tasks completed by the community.",
            icon: Wind,
        },
        {
            label: "Active Participants",
            value: activeParticipants.toString(),
            meta: "People currently contributing today.",
            icon: Users,
        },
        {
            label: "Today's Reactions",
            value: dailyReactions.toString(),
            meta: "Clap, fire, and leaf reactions sent today.",
            icon: Sparkles,
        },
        {
            label: "Avg Bloom Time",
            value: bloomTimeLabel,
            meta: "Average hours from capture to release this week.",
            icon: Orbit,
        },
    ]

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
                    <h1 className="type-page-title font-sans">The Collective Pulse</h1>
                    <p className="type-page-subtitle max-w-3xl">
                        A calmer, single-surface view of shared release momentum and the footprints everyone leaves behind.
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
                    aria-label="Community workbench"
                >
                    <div className="grid workbench-gap-grid lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                        <div className="workbench-gap-section">
                            <motion.section
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                                className="workbench-gap-title"
                                aria-label="Collective resonance"
                            >
                                <header className="space-y-1 px-1">
                                    <p className={blockTitleStyle}>Collective Resonance</p>
                                    <p className="type-caption">Live view of shared release momentum.</p>
                                </header>
                                <div className={cn(cardLayout.workbenchPrimary, "overflow-hidden")}>
                                    <div className="relative w-full aspect-[16/7]">
                                        <CollectiveExhale count={totalReleased} showHeading={false} />
                                    </div>
                                </div>
                            </motion.section>

                            <motion.section
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.04 }}
                                className="workbench-gap-title"
                                aria-label="Victory feed"
                            >
                                <header className="space-y-1 px-1">
                                    <p className={blockTitleStyle}>Victory Feed</p>
                                    <p className="type-caption">Recent moments where people cleared one thing at a time.</p>
                                </header>
                                <div className={cn(cardLayout.workbenchSecondary)}>
                                    <VictoryFeed
                                        showHeading={false}
                                        victories={stats?.community.recentVictories ?? []}
                                    />
                                </div>
                            </motion.section>

                            <motion.section
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.08 }}
                                className="workbench-gap-title"
                                aria-label="Weekly milestone"
                            >
                                <header className="space-y-1 px-1">
                                    <p className={blockTitleStyle}>Weekly Milestone</p>
                                    <p className="type-caption">Progress toward this week&apos;s shared target.</p>
                                </header>
                                <div className={cn(cardLayout.workbenchSecondary, "workbench-pad-card")}>
                                    <MilestoneProgress current={weeklyProgress} target={weeklyGoal} showHeading={false} />
                                </div>
                            </motion.section>
                        </div>

                        <div className="workbench-gap-section" aria-label="Community context rail">
                            <motion.section
                                initial={prefersReducedMotion ? false : { opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                                className="workbench-gap-title"
                                aria-label="Pulse snapshot"
                            >
                                <header className="space-y-1 px-1">
                                    <p className={blockTitleStyle}>Pulse Snapshot</p>
                                    <p className="type-caption">Current community signals in one glance.</p>
                                    <p className="type-caption text-muted-foreground/85">
                                        Only anonymous, aggregate signals are shown here.
                                    </p>
                                </header>
                                <div className={cn(cardLayout.workbenchRail, "workbench-pad-card")}>
                                    <div className="divide-y divide-border/45">
                                        {pulseMetrics.map((metric) => (
                                            <div key={metric.label} className="flex items-start justify-between gap-3 py-3">
                                                <div>
                                                    <p className={labelStyle}>{metric.label}</p>
                                                    <p className="type-card-value mt-1.5">
                                                        {metric.value}
                                                    </p>
                                                    <p className="type-card-support mt-1.5">{metric.meta}</p>
                                                </div>
                                                <metric.icon className="mt-1 size-5 shrink-0 text-primary/70" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>

                            <motion.section
                                initial={prefersReducedMotion ? false : { opacity: 0, x: 8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay: 0.04 }}
                                className="workbench-gap-title"
                                aria-label="Monthly report"
                            >
                                <header className="space-y-1 px-1">
                                    <p className={blockTitleStyle}>Monthly Report</p>
                                    <p className="type-caption">A short deadpan interpretation of this month&apos;s signal.</p>
                                </header>
                                <div className={cn(cardLayout.workbenchRail, "workbench-pad-card")}>
                                    <DeadpanFacts mode="embedded" fact={stats?.community.monthly.fact} />
                                </div>
                            </motion.section>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
