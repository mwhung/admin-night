import { MilestoneProgress } from '@/components/features/community/milestone-progress'
import { cardLayout } from '@/components/ui/card-layouts'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { cn } from '@/lib/utils'

interface WeeklyMilestoneSectionProps {
    weeklyProgress: number
    weeklyGoal: number
    delay?: number
}

export function WeeklyMilestoneSection({
    weeklyProgress,
    weeklyGoal,
    delay = 0,
}: WeeklyMilestoneSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Weekly milestone"
            title="Weekly Marker"
            subtitle="Progress toward this week&apos;s shared marker."
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchSecondary, 'workbench-pad-card')}>
                <MilestoneProgress current={weeklyProgress} target={weeklyGoal} showHeading={false} />
            </div>
        </WorkbenchSection>
    )
}
