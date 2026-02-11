import { CompletionFeed } from '@/components/features/community/completion-feed'
import { cardLayout } from '@/components/ui/card-layouts'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { cn } from '@/lib/utils'
import type { CommunityVictory } from '@/lib/contracts/community-stats'

interface CompletionFeedSectionProps {
    victories: CommunityVictory[]
    delay?: number
}

export function CompletionFeedSection({ victories, delay = 0 }: CompletionFeedSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Completion feed"
            title="Completion Feed"
            subtitle="Recent closures. One line at a time."
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchSecondary)}>
                <CompletionFeed showHeading={false} victories={victories} />
            </div>
        </WorkbenchSection>
    )
}
