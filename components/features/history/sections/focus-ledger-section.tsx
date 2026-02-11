import { Clock, Sparkles, Wind } from 'lucide-react'
import type { HistoryStats } from '@/lib/contracts/user-history'
import {
    HISTORY_LABEL_STYLE,
    formatFocusTime,
} from '@/components/features/history/history-view-model'
import { WorkbenchSection } from '@/components/ui/workbench-section'

interface FocusLedgerSectionProps {
    statsData: HistoryStats
    resolvedRatio: number
}

export function FocusLedgerSection({ statsData, resolvedRatio }: FocusLedgerSectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="Focus ledger"
            title="Focus Ledger"
            subtitle="Counts only: closed loops, time spent, and remaining load."
        >
            <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex items-center justify-between">
                        <p className={HISTORY_LABEL_STYLE}>Closed Loops</p>
                        <Wind className="size-4 text-primary/70" />
                    </div>
                    <p className="type-card-value mt-2">{statsData.totalResolved}</p>
                    <p className="type-card-support mt-1.5">You don&apos;t need to think about this for now.</p>
                </div>

                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex items-center justify-between">
                        <p className={HISTORY_LABEL_STYLE}>Focus Time</p>
                        <Clock className="size-4 text-primary/70" />
                    </div>
                    <p className="type-card-value mt-2">{formatFocusTime(statsData.totalFocusMinutes)}</p>
                    <p className="type-card-support mt-1.5">Time spent handling admin in session.</p>
                </div>

                <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                    <div className="flex items-center justify-between">
                        <p className={HISTORY_LABEL_STYLE}>Closure Rate</p>
                        <Sparkles className="size-4 text-primary/70" />
                    </div>
                    <p className="type-card-value mt-2">{resolvedRatio}%</p>
                    <p className="type-card-support mt-1.5">Resolved items vs open items.</p>
                </div>
            </div>
        </WorkbenchSection>
    )
}
