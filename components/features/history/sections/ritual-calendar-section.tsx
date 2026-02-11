import { cardLayout } from '@/components/ui/card-layouts'
import { HistorySection } from '@/components/features/history/history-section'
import { cn } from '@/lib/utils'

interface RitualCalendarSectionProps {
    calendarDays: Date[]
    dailyActivity: Record<string, number>
    delay?: number
}

export function RitualCalendarSection({
    calendarDays,
    dailyActivity,
    delay = 0,
}: RitualCalendarSectionProps) {
    return (
        <HistorySection
            ariaLabel="Ritual calendar"
            title="Ritual Calendar"
            subtitle="Presence in the shared ritual over the last 4 weeks."
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
        </HistorySection>
    )
}
