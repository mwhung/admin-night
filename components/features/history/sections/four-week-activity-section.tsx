import { cardLayout } from '@/components/ui/card-layouts'
import { WorkbenchSection } from '@/components/ui/workbench-section'
import { cn } from '@/lib/utils'

interface FourWeekActivitySectionProps {
    calendarDays: Date[]
    dailyActivity: Record<string, number>
    delay?: number
}

export function FourWeekActivitySection({
    calendarDays,
    dailyActivity,
    delay = 0,
}: FourWeekActivitySectionProps) {
    return (
        <WorkbenchSection
            ariaLabel="4-week activity"
            title="4-Week Activity"
            subtitle="Last 4 weeks. No spin."
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchSecondary, 'workbench-pad-card')}>
                <div className="flex flex-wrap justify-center gap-2">
                    {calendarDays.map((day) => {
                        const dateStr = day.toISOString().split('T')[0]
                        const count = dailyActivity[dateStr] || 0

                        return (
                            <div
                                key={dateStr}
                                className={cn(
                                    'size-7 rounded-md border transition-colors duration-150',
                                    count > 0
                                        ? 'border-primary/35 bg-primary/70'
                                        : 'border-border/60 bg-muted/45'
                                )}
                                style={{ opacity: count > 0 ? Math.min(0.55 + count * 0.2, 1) : 0.58 }}
                                title={`${day.toDateString()}: ${count} session(s)`}
                            />
                        )
                    })}
                </div>
                <div className="mt-3 flex items-center justify-between px-1 type-caption uppercase tracking-[0.08em]">
                    <span>28 days ago</span>
                    <span>Today</span>
                </div>
            </div>
        </WorkbenchSection>
    )
}
