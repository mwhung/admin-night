
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CheckCircle2, Zap, Globe, Clock, ArrowRight } from 'lucide-react'

interface Victory {
    id: string
    text: string
    type: 'bill' | 'email' | 'call' | 'admin'
    time: string
}

interface VictoryFeedProps {
    showHeading?: boolean
}

const SAMPLE_VICTORIES: Victory[] = [
    { id: '1', text: 'Someone just settled a recurring bill.', type: 'bill', time: '2m' },
    { id: '2', text: 'An overdue email was finally sent.', type: 'email', time: '5m' },
    { id: '3', text: 'A difficult phone call reached closure.', type: 'call', time: '8m' },
    { id: '4', text: '5 disorganized files were safely archived.', type: 'admin', time: '12m' },
    { id: '5', text: 'The mental weight of insurance papers was released.', type: 'bill', time: '15m' },
]

const icons = {
    bill: <Zap className="size-4 text-primary/60" />,
    email: <Globe className="size-4 text-primary/60" />,
    call: <Clock className="size-4 text-primary/60" />,
    admin: <CheckCircle2 className="size-4 text-primary/60" />,
}

export function VictoryFeed({ showHeading = true }: VictoryFeedProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % SAMPLE_VICTORIES.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="h-full w-full flex flex-col justify-center p-4 sm:p-5 space-y-5">
            <div className="space-y-2">
                {showHeading && (
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent Victories</p>
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
                                {icons[SAMPLE_VICTORIES[index].type]}
                            </div>
                            <p className="text-[0.95rem] leading-[1.45] text-foreground/88">
                                {SAMPLE_VICTORIES[index].text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 border-t border-border/55 pt-3">
                {SAMPLE_VICTORIES.slice(0, 3).map((v) => (
                    <div
                        key={v.id}
                        className="group flex items-center justify-between rounded-lg px-1.5 py-1 opacity-70 transition-[opacity,background-color] hover:bg-muted/30 hover:opacity-100"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-1.5 rounded-full bg-primary/24 transition-colors group-hover:bg-primary/70" />
                            <span className="max-w-[200px] truncate text-sm text-foreground/88">{v.text}</span>
                        </div>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground/88">{v.time} ago</span>
                    </div>
                ))}
            </div>

            <div className="pt-1">
                <button className="group flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary/52 transition-colors hover:text-primary/72">
                    View Collective Pulse <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
