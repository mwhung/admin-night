import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cardLayout } from '@/components/ui/card-layouts'
import { cn } from '@/lib/utils'
import type { TaskRecord } from '@/lib/contracts/user-history'
import { HistorySection } from '@/components/features/history/history-section'

interface TaskDrawerSectionProps {
    pendingTasks: TaskRecord[]
    delay?: number
}

export function TaskDrawerSection({ pendingTasks, delay = 0 }: TaskDrawerSectionProps) {
    const prefersReducedMotion = useReducedMotion()

    return (
        <HistorySection
            ariaLabel="Task drawer"
            title="Task Drawer"
            subtitle="Open loops safely stored and waiting for closure."
            axis="x"
            delay={delay}
        >
            <div className={cn(cardLayout.workbenchRail, 'overflow-hidden')}>
                <div className="custom-scrollbar max-h-none divide-y divide-border/40 overflow-y-auto md:max-h-[520px]">
                    {pendingTasks.length === 0 && (
                        <div className="space-y-2 px-4 py-10 text-center sm:px-5">
                            <Sparkles className="mx-auto size-5 text-primary/25" />
                            <p className="text-xs italic text-muted-foreground">
                                &ldquo;All loops are closed. Your mind is clear.&rdquo;
                            </p>
                        </div>
                    )}

                    <AnimatePresence initial={false}>
                        {pendingTasks.map((task) => (
                            <motion.div
                                key={task.id}
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.14 }}
                                className="group/item flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/45 sm:px-5"
                            >
                                <div className="size-1.5 shrink-0 rounded-full bg-primary/25 transition-colors group-hover/item:bg-primary" />
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs leading-tight text-foreground">{task.title}</p>
                                    <p className="type-caption italic">Waiting in storage</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="border-t border-border/60 bg-muted/20 p-2.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-full type-section-label text-primary hover:bg-primary/10"
                        asChild
                    >
                        <Link href="/focus">
                            Face these tomorrow <ArrowRight className="ml-1 size-3" />
                        </Link>
                    </Button>
                </div>
            </div>
        </HistorySection>
    )
}
