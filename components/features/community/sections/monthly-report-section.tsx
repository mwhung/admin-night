import { DeadpanFacts } from '@/components/features/community/deadpan-facts'
import { cardLayout } from '@/components/ui/card-layouts'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { cn } from '@/lib/utils'

interface MonthlyReportSectionProps {
    fact?: string
    delay?: number
}

export function MonthlyReportSection({ fact, delay = 0 }: MonthlyReportSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Monthly report"
            title="Monthly Report"
            subtitle="Dry monthly summary. Numbers first."
            axis="x"
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchRail, 'workbench-pad-card')}>
                <DeadpanFacts mode="embedded" fact={fact} />
            </div>
        </WorkbenchSection>
    )
}
