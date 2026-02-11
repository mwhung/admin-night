import { Trophy } from 'lucide-react'
import { AchievementCard } from '@/components/features/achievements'
import { HistorySection } from '@/components/features/history/history-section'
import type { UserAchievementRecord } from '@/components/features/history/use-user-history'

interface QuietMarkersSectionProps {
    achievements: UserAchievementRecord[]
    delay?: number
}

export function QuietMarkersSection({ achievements, delay = 0 }: QuietMarkersSectionProps) {
    return (
        <HistorySection
            ariaLabel="Quiet markers"
            title="Quiet Markers"
            subtitle={`${achievements.length} recorded`}
            delay={delay}
        >
            {achievements.length === 0 ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                        <Trophy className="size-3.5 text-white" />
                    </div>
                    <p className="text-sm italic text-muted-foreground">
                        &quot;Markers appear as your practice becomes steadier.&quot;
                    </p>
                </div>
            ) : (
                <div className="grid gap-x-4 gap-y-2 md:grid-cols-2 lg:grid-cols-3">
                    {achievements.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievementId={achievement.achievementId}
                            unlockedAt={achievement.unlockedAt}
                            humorSnapshot={achievement.humorSnapshot}
                            evidenceSnapshot={achievement.evidenceSnapshot}
                        />
                    ))}
                </div>
            )}
        </HistorySection>
    )
}
