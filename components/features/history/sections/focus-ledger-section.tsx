import { Clock, Sparkles, Wind } from 'lucide-react'
import type { HistoryStats } from '@/lib/contracts/user-history'
import {
    HISTORY_LABEL_STYLE,
    formatFocusTime,
} from '@/components/features/history/history-view-model'
import { HistorySection } from '@/components/features/history/history-section'

interface FocusLedgerSectionProps {
    statsData: HistoryStats
    resolvedRatio: number
}

export function FocusLedgerSection({ statsData, resolvedRatio }: FocusLedgerSectionProps) {
    return (
        <HistorySection
            ariaLabel="Focus ledger"
            title="Focus Ledger"
            subtitle="A condensed summary of released burden, focus investment, and current clarity."
        >
            <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex items-center justify-between">
                        <p className={HISTORY_LABEL_STYLE}>Burdens Released</p>
                        <Wind className="size-4 text-primary/70" />
                    </div>
                    <p className="type-card-value mt-2">{statsData.totalResolved}</p>
                    <p className="type-card-support mt-1.5">Closed loops no longer occupying your mind.</p>
                </div>

                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex items-center justify-between">
                        <p className={HISTORY_LABEL_STYLE}>Focus Time</p>
                        <Clock className="size-4 text-primary/70" />
                    </div>
                    <p className="type-card-value mt-2">{formatFocusTime(statsData.totalFocusMinutes)}</p>
                    <p className="type-card-support mt-1.5">Total footprints in the ritual of maintenance.</p>
                </div>

                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex items-center justify-between">
                        <p className={HISTORY_LABEL_STYLE}>Mind Clarity</p>
                        <Sparkles className="size-4 text-primary/70" />
                    </div>
                    <p className="type-card-value mt-2">{resolvedRatio}%</p>
                    <p className="type-card-support mt-1.5">Released items vs safely stored tasks.</p>
                </div>
            </div>
        </HistorySection>
    )
}
