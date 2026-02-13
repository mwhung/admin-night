import type { PeakSessionWindow } from '@/lib/contracts/user-history'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { formatPeakSessionWindow } from '@/components/features/history/history-view-model'

interface AdminPeakWindowSectionProps {
    peakSessionWindow: PeakSessionWindow | null
    delay?: number
}

export function AdminPeakWindowSection({
    peakSessionWindow,
    delay = 0,
}: AdminPeakWindowSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Admin peak window"
            title="Admin Peak Window"
            subtitle="The opening hour where you most often begin an admin session."
            delay={delay}
        >
            <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                <p className="type-card-value">{formatPeakSessionWindow(peakSessionWindow)}</p>
                <p className="type-card-support mt-2">
                    {peakSessionWindow
                        ? `${peakSessionWindow.sessionCount} sessions started in this window.`
                        : 'Start a few sessions and the pattern will appear here.'}
                </p>
            </div>
        </WorkbenchSection>
    )
}
