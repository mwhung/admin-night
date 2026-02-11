import { Users, Wind } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { HistoryGroup, HistoryPagination } from '@/lib/contracts/user-history'
import { cn } from '@/lib/utils'
import { HistorySection } from '@/components/features/history/history-section'

interface SessionFootprintsSectionProps {
    historyGroups: HistoryGroup[]
    historyPagination: HistoryPagination | null
    loadingMoreHistory: boolean
    onLoadMoreHistory: () => Promise<void>
    delay?: number
}

export function SessionFootprintsSection({
    historyGroups,
    historyPagination,
    loadingMoreHistory,
    onLoadMoreHistory,
    delay = 0,
}: SessionFootprintsSectionProps) {
    return (
        <HistorySection
            ariaLabel="Session footprints"
            title="Session Footprints"
            subtitle="Chronological records from focused sessions."
            delay={delay}
        >
            <div className="space-y-2.5">
                {historyGroups.length === 0 ? (
                    <div className="space-y-2 py-8 text-center">
                        <Wind className="mx-auto size-6 text-muted-foreground/70" />
                        <p className="text-sm text-muted-foreground">Your journey is waiting for its first footprint.</p>
                    </div>
                ) : (
                    historyGroups.map((group) => {
                        const sessionDate = new Date(group.date)

                        return (
                            <article
                                key={group.id}
                                className="rounded-xl border border-border/65 bg-surface-elevated/52 workbench-pad-card-tight"
                            >
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <div className="rounded-lg border border-primary/20 bg-primary/10 px-2 py-1">
                                        <p className="type-caption uppercase tracking-[0.1em] text-primary/80">
                                            {sessionDate.toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className="border border-primary/20 bg-primary/15 px-2.5 type-section-label text-primary"
                                    >
                                        {group.duration} MINS FOCUS
                                    </Badge>
                                    <div className="flex items-center gap-1.5 type-caption uppercase tracking-[0.08em]">
                                        <Users className="size-3" />
                                        {Math.max((group.participantCount ?? 1) - 1, 0)} OTHERS PRESENT
                                    </div>
                                </div>

                                <div className="mt-2.5 space-y-1.5">
                                    {group.tasks.length === 0 && (
                                        <p className="text-xs italic text-muted-foreground">Observation session only.</p>
                                    )}

                                    {group.tasks.map((task) => (
                                        <div key={task.id} className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className={cn(
                                                        'size-1.5 rounded-full',
                                                        task.state === 'RESOLVED'
                                                            ? 'bg-primary'
                                                            : 'bg-muted-foreground/35'
                                                    )}
                                                />
                                                <span
                                                    className={cn(
                                                        'text-sm',
                                                        task.state === 'RESOLVED'
                                                            ? 'text-foreground'
                                                            : 'text-muted-foreground line-through opacity-70'
                                                    )}
                                                >
                                                    {task.title}
                                                </span>
                                            </div>
                                            {task.state === 'RESOLVED' && (
                                                <span className="type-caption italic text-primary/80">Released</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </article>
                        )
                    })
                )}

                {historyPagination?.hasMore && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            void onLoadMoreHistory()
                        }}
                        disabled={loadingMoreHistory}
                        className="h-8 w-full border-border/65 bg-surface-elevated/40 type-section-label hover:bg-muted/55"
                    >
                        {loadingMoreHistory ? 'Loading...' : 'Load Earlier Footprints'}
                    </Button>
                )}
            </div>
        </HistorySection>
    )
}
