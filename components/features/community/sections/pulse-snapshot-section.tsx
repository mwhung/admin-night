import { cardLayout } from '@/components/ui/card-layouts'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { cn } from '@/lib/utils'
import { COMMUNITY_LABEL_STYLE, type PulseSnapshotMetric } from '@/components/features/community/community-view-model'

interface PulseSnapshotSectionProps {
    metrics: PulseSnapshotMetric[]
    delay?: number
}

export function PulseSnapshotSection({ metrics, delay = 0 }: PulseSnapshotSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Pulse snapshot"
            title="Presence Snapshot"
            subtitle="Current community activity in one view."
            headerExtra={
                <p className="type-caption text-muted-foreground/85">
                    Anonymous aggregate data only.
                </p>
            }
            axis="x"
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchRail, 'workbench-pad-card')}>
                <div className="divide-y divide-border/45">
                    {metrics.map((metric) => (
                        <div key={metric.label} className="flex items-start justify-between gap-3 py-3">
                            <div>
                                <p className={COMMUNITY_LABEL_STYLE}>{metric.label}</p>
                                <p className="type-card-value mt-1.5">{metric.value}</p>
                                <p className="type-card-support mt-1.5">{metric.meta}</p>
                            </div>
                            <metric.icon className="mt-1 size-5 shrink-0 text-primary/70" />
                        </div>
                    ))}
                </div>
            </div>
        </WorkbenchSection>
    )
}
