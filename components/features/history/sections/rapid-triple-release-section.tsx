import type { FastestTripleReleaseSession } from '@/lib/contracts/user-history'
import { formatFastestTripleRelease } from '@/components/features/history/history-view-model'
import { WorkbenchSection } from '@/components/ui/workbench-section'

interface RapidTripleReleaseSectionProps {
    fastestTripleReleaseSession: FastestTripleReleaseSession | null
    delay?: number
}

export function RapidTripleReleaseSection({
    fastestTripleReleaseSession,
    delay = 0,
}: RapidTripleReleaseSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Rapid triple release"
            title="Rapid Triple Release"
            subtitle="Your quickest session that released at least three tasks."
            axis="x"
            delay={delay}
        >
            <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                <p className="type-card-value">{formatFastestTripleRelease(fastestTripleReleaseSession)}</p>
                <p className="type-card-support mt-2">
                    {fastestTripleReleaseSession
                        ? `${new Date(fastestTripleReleaseSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${fastestTripleReleaseSession.resolvedTaskCount} tasks released in one run.`
                        : 'Once a session closes three tasks, the fastest run will be surfaced here.'}
                </p>
            </div>
        </WorkbenchSection>
    )
}
