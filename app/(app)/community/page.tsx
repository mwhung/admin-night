'use client'

import { motion, useReducedMotion } from 'framer-motion'
import {
    CollectiveResonanceSection,
    CompletionFeedSection,
    MonthlyReportSection,
    PulseSnapshotSection,
    WeeklyMilestoneSection,
    getCommunityOverview,
    useCommunityStats,
} from '@/components/features/community'
import { cardLayout } from '@/components/ui/card-layouts'
import { cn } from '@/lib/utils'

export default function CommunityPage() {
    const prefersReducedMotion = useReducedMotion()
    const { stats } = useCommunityStats()

    const {
        totalReleased,
        weeklyProgress,
        weeklyGoal,
        recentVictories,
        monthlyFact,
        pulseSnapshotMetrics,
    } = getCommunityOverview(stats)

    return (
        <div
            className={cn(
                'container mx-auto mb-20 max-w-6xl p-4 sm:p-5 md:p-6',
                !prefersReducedMotion && 'animate-in fade-in duration-150'
            )}
        >
            <div className="space-y-2 pt-8 pb-10">
                <motion.div
                    initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                    className="space-y-2"
                >
                    <h1 className="type-page-title font-sans">Community Presence</h1>
                    <p className="type-page-subtitle max-w-3xl">
                        Anonymous presence data. Quiet accountability. No chat.
                    </p>
                </motion.div>
            </div>

            <div
                className="rounded-[calc(var(--radius)+1.2rem)] p-[1px]"
                style={{
                    backgroundImage:
                        'linear-gradient(135deg, color-mix(in srgb, var(--workbench-divider) 56%, transparent 44%) 0%, color-mix(in srgb, var(--workbench-divider) 24%, transparent 76%) 40%, color-mix(in srgb, var(--background) 72%, transparent 28%) 72%, var(--background) 100%)',
                }}
            >
                <section
                    className={cn(cardLayout.workbenchShellFrosted, 'workbench-pad-shell')}
                    aria-label="Community workbench"
                >
                    <div className="grid workbench-gap-grid lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                        <div className="workbench-gap-section">
                            <CollectiveResonanceSection totalReleased={totalReleased} />

                            <CompletionFeedSection victories={recentVictories} delay={0.04} />

                            <WeeklyMilestoneSection
                                weeklyProgress={weeklyProgress}
                                weeklyGoal={weeklyGoal}
                                delay={0.08}
                            />
                        </div>

                        <div className="workbench-gap-section" aria-label="Community context rail">
                            <PulseSnapshotSection metrics={pulseSnapshotMetrics} />

                            <MonthlyReportSection fact={monthlyFact} delay={0.04} />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
