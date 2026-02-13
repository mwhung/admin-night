import type { TaskTypeBreakdownItem } from '@/lib/contracts/user-history'
import {
    HISTORY_LABEL_STYLE,
    getTaskTypeBarWidth,
    getTaskTypeMaxCount,
} from '@/components/features/history/history-view-model'
import { WorkbenchSection } from '@/components/ui/workbench-section'

interface TaskTypeAccumulationSectionProps {
    resolvedTaskTypeBreakdown: TaskTypeBreakdownItem[]
    delay?: number
}

export function TaskTypeAccumulationSection({
    resolvedTaskTypeBreakdown,
    delay = 0,
}: TaskTypeAccumulationSectionProps) {
    const taskTypes = resolvedTaskTypeBreakdown.slice(0, 6)
    const maxCount = getTaskTypeMaxCount(taskTypes)

    return (
        <WorkbenchSection
            ariaLabel="Resolved task type accumulation"
            title="Resolved Task Type Accumulation"
            subtitle="Cumulative release by task pattern across your admin history."
            delay={delay}
        >
            <div className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight">
                {taskTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No resolved tasks yet. Type patterns will appear once releases accumulate.</p>
                ) : (
                    <div className="space-y-3">
                        {taskTypes.map((item) => (
                            <div key={item.type} className="space-y-1.5">
                                <div className="flex items-center justify-between gap-3">
                                    <p className={HISTORY_LABEL_STYLE}>{item.type}</p>
                                    <p className="text-xs tabular-nums text-muted-foreground">{item.count}</p>
                                </div>
                                <div className="h-2 rounded-full bg-primary/12">
                                    <div
                                        className="h-2 rounded-full bg-primary/70"
                                        style={{ width: `${getTaskTypeBarWidth(item.count, maxCount)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </WorkbenchSection>
    )
}
