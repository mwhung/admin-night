import { WorkbenchSection } from '@/components/ui/workbench-section'
import { HISTORY_LABEL_STYLE } from '@/components/features/history/history-view-model'
import { cn } from '@/lib/utils'

interface ProgressNoteSectionProps {
    totalSessions: number
    achievementsCount: number
    historyMarkersEnabled: boolean
    delay?: number
}

export function ProgressNoteSection({
    totalSessions,
    achievementsCount,
    historyMarkersEnabled,
    delay = 0,
}: ProgressNoteSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Progress note"
            title="Progress Note"
            subtitle="Session totals. That&apos;s it."
            axis="x"
            delay={delay}
        >
            <div className={cn('grid gap-2.5', historyMarkersEnabled && 'sm:grid-cols-2')}>
                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <p className={HISTORY_LABEL_STYLE}>Sessions Recorded</p>
                    <p className="mt-1.5 text-[1.45rem] font-medium leading-none tracking-[-0.015em] text-foreground">
                        {totalSessions}
                    </p>
                </div>

                {historyMarkersEnabled && (
                    <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                        <p className={HISTORY_LABEL_STYLE}>Markers Recorded</p>
                        <p className="mt-1.5 text-[1.45rem] font-medium leading-none tracking-[-0.015em] text-foreground">
                            {achievementsCount}
                        </p>
                    </div>
                )}
            </div>
            <p className="type-body-soft mt-3 italic text-foreground/85">
                &ldquo;Repeated small steps still count.&rdquo;
            </p>
        </WorkbenchSection>
    )
}
