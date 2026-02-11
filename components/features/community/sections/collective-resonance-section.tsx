import { CollectiveExhale } from '@/components/features/community/collective-exhale'
import { cardLayout } from '@/components/ui/card-layouts'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { cn } from '@/lib/utils'

interface CollectiveResonanceSectionProps {
    totalReleased: number
    delay?: number
}

export function CollectiveResonanceSection({
    totalReleased,
    delay = 0,
}: CollectiveResonanceSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Community presence board"
            title="Presence Board"
            subtitle="Live aggregate signals from people handling admin."
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchPrimary, 'overflow-hidden')}>
                <div className="relative aspect-[16/7] w-full">
                    <CollectiveExhale count={totalReleased} showHeading={false} />
                </div>
            </div>
        </WorkbenchSection>
    )
}
