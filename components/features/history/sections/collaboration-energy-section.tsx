import type { CollaborationEnergy } from '@/lib/contracts/user-history'
import { HISTORY_LABEL_STYLE } from '@/components/features/history/history-view-model'
import { WorkbenchSection } from '@/components/ui/workbench-section'

interface CollaborationEnergySectionProps {
    collaborationEnergy: CollaborationEnergy
    delay?: number
}

export function CollaborationEnergySection({
    collaborationEnergy,
    delay = 0,
}: CollaborationEnergySectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Collaboration energy"
            title="Collaboration Energy"
            subtitle="How much shared focus has surrounded your sessions over time."
            axis="x"
            delay={delay}
        >
            <div className="grid gap-2.5 sm:grid-cols-2">
                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <p className={HISTORY_LABEL_STYLE}>Co-Focus Encounters</p>
                    <p className="mt-1.5 text-[1.45rem] font-medium leading-none tracking-[-0.015em] text-foreground">
                        {collaborationEnergy.cumulativeOthersPresent}
                    </p>
                    <p className="type-card-support mt-1.5">Total times others were present while you were focusing.</p>
                </div>

                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <p className={HISTORY_LABEL_STYLE}>Peak Session Size</p>
                    <p className="mt-1.5 text-[1.45rem] font-medium leading-none tracking-[-0.015em] text-foreground">
                        {collaborationEnergy.maxParticipantsInSession}
                    </p>
                    <p className="type-card-support mt-1.5">Largest number of people in one session, including you.</p>
                </div>
            </div>
        </WorkbenchSection>
    )
}
