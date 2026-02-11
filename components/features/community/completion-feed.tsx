
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CheckCircle2, Zap, Globe, Clock, ArrowRight } from 'lucide-react'

interface CompletionItem {
    id: string
    message: string
    resolvedAt: string | null
}

interface CompletionFeedProps {
    showHeading?: boolean
    victories?: CompletionItem[]
}

const ICONS = [
    Zap,
    Globe,
    Clock,
    CheckCircle2,
] as const

function getRelativeTimeLabel(isoDate: string): string {
    const resolvedAt = new Date(isoDate)
    if (Number.isNaN(resolvedAt.getTime())) return 'Unknown time'

    const diffMs = Date.now() - resolvedAt.getTime()
    const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))

    if (diffMinutes < 1) return 'just now'
    if (diffMinutes < 60) return `${diffMinutes}m`

    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `${diffHours}h`

    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d`
}

export function CompletionFeed({ showHeading = true, victories = [] }: CompletionFeedProps) {
    const [index, setIndex] = useState(0)
    const feedItems = victories.length > 0
        ? victories
        : [
            {
                id: 'empty-state',
                message: 'No completions logged yet.',
                resolvedAt: null,
            },
        ]
    const itemCount = feedItems.length

    useEffect(() => {
        if (itemCount <= 1) return

        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % itemCount)
        }, 4000)
        return () => clearInterval(timer)
    }, [itemCount])

    const activeItem = feedItems[index % itemCount] ?? feedItems[0]
    const ActiveIcon = ICONS[index % ICONS.length]

    return (
        <div className="h-full w-full flex flex-col justify-center p-4 sm:p-5 space-y-5">
            <div className="space-y-2">
                {showHeading && (
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent Closures</p>
                )}
                <div className={showHeading ? "h-12 flex items-center" : "min-h-12 flex items-center"}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex size-10 items-center justify-center rounded-full border border-border/65 bg-surface-elevated/56">
                                <ActiveIcon className="size-4 text-primary/60" />
                            </div>
                            <p className="text-[0.95rem] leading-[1.45] text-foreground/88">
                                {activeItem.message}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 border-t border-border/55 pt-3">
                {feedItems.slice(0, 3).map((item) => (
                    <div
                        key={item.id}
                        className="group flex items-center justify-between rounded-lg px-1.5 py-1 opacity-70 transition-[opacity,background-color] hover:bg-muted/30 hover:opacity-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-1.5 rounded-full bg-primary/24 transition-colors group-hover:bg-primary/70" />
                            <span className="max-w-[200px] truncate text-sm text-foreground/88">{item.message}</span>
                        </div>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground/88">
                            {item.resolvedAt ? `${getRelativeTimeLabel(item.resolvedAt)} ago` : 'No timestamp'}
                        </span>
                    </div>
                ))}
            </div>

            <div className="pt-1">
                <button className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary/52 transition-colors hover:text-primary/72">
                    Open Community Dashboard <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
