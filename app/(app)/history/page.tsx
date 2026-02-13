'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { GuestPlaceholder } from '@/components/features/auth/guest-placeholder'
import {
    AdminPeakWindowSection,
    CollaborationEnergySection,
    FocusLedgerSection,
    FourWeekActivitySection,
    OpenLoopsSection,
    ProgressNoteSection,
    QuietMarkersSection,
    RapidTripleReleaseSection,
    SessionLogSection,
    TaskTypeAccumulationSection,
    buildHistoryCalendarDays,
    computeResolvedRatio,
    getHistoryStatsData,
    useUserHistory,
} from '@/components/features/history'
import { cardLayout } from '@/components/ui/card-layouts'
import { useAuth } from '@/lib/hooks/useAuth'
import { cn } from '@/lib/utils'

const historyMarkersEnabled = process.env.NEXT_PUBLIC_ENABLE_HISTORY_MARKERS === 'true'

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth()
    const prefersReducedMotion = useReducedMotion()

    const {
        stats,
        pendingTasks,
        historyGroups,
        historyPagination,
        achievements,
        initialLoading,
        loadingMoreHistory,
        loadMoreHistory,
    } = useUserHistory({
        enabled: Boolean(user),
        historyMarkersEnabled,
    })

    const loading = authLoading || (Boolean(user) && initialLoading)

    if (loading) {
        return (
            <div className="container mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center p-6">
                <Zap className={cn('size-8 text-primary/30', !prefersReducedMotion && 'animate-pulse')} />
            </div>
        )
    }

    if (!user) {
        return (
            <GuestPlaceholder
                pageName="History"
                description="History is for registered members. Sign in to view your records."
            />
        )
    }

    const statsData = getHistoryStatsData(stats)
    const resolvedRatio = computeResolvedRatio(statsData)
    const calendarDays = buildHistoryCalendarDays()

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
                    <h1 className="type-page-title font-sans">Your History</h1>
                    <p className="type-page-subtitle max-w-3xl">
                        Session records. No highlight reel.
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
                    aria-label="History workbench"
                >
                    <div className="grid workbench-gap-grid lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
                        <div className="workbench-gap-section">
                            <FocusLedgerSection statsData={statsData} resolvedRatio={resolvedRatio} />

                            <AdminPeakWindowSection
                                peakSessionWindow={statsData.peakSessionWindow}
                                delay={0.02}
                            />

                            {historyMarkersEnabled && (
                                <QuietMarkersSection achievements={achievements} delay={0.04} />
                            )}

                            <FourWeekActivitySection
                                calendarDays={calendarDays}
                                dailyActivity={statsData.dailyActivity}
                                delay={0.08}
                            />

                            <TaskTypeAccumulationSection
                                resolvedTaskTypeBreakdown={statsData.resolvedTaskTypeBreakdown}
                                delay={0.1}
                            />

                            <SessionLogSection
                                historyGroups={historyGroups}
                                historyPagination={historyPagination}
                                loadingMoreHistory={loadingMoreHistory}
                                onLoadMoreHistory={loadMoreHistory}
                                delay={0.14}
                            />
                        </div>

                        <div className="workbench-gap-section" aria-label="History context rail">
                            <OpenLoopsSection pendingTasks={pendingTasks} />

                            <CollaborationEnergySection
                                collaborationEnergy={statsData.collaborationEnergy}
                                delay={0.02}
                            />

                            <RapidTripleReleaseSection
                                fastestTripleReleaseSession={statsData.fastestTripleReleaseSession}
                                delay={0.04}
                            />

                            <ProgressNoteSection
                                totalSessions={statsData.totalSessions}
                                achievementsCount={achievements.length}
                                historyMarkersEnabled={historyMarkersEnabled}
                                delay={0.06}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
