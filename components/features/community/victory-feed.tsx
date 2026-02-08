
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

export function VictoryFeed() {
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent Victories</p>
                <div className="h-12 flex items-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex items-center gap-4"
                        >
                            <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                {icons[SAMPLE_VICTORIES[index].type]}
                            </div>
                            <p className="text-base font-light text-foreground/80 leading-snug">
                                {SAMPLE_VICTORIES[index].text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-3 border-t border-border/60">
                {SAMPLE_VICTORIES.slice(0, 3).map((v) => (
                    <div key={v.id} className="flex items-center justify-between opacity-40 group hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3">
                            <div className="size-1.5 rounded-full bg-primary/20 group-hover:bg-primary transition-colors" />
                            <span className="text-sm font-light truncate max-w-[200px]">{v.text}</span>
                        </div>
                        <span className="text-[10px] font-medium tabular-nums">{v.time} ago</span>
                    </div>
                ))}
            </div>

            <div className="pt-1">
                <button className="text-[11px] uppercase tracking-[0.12em] font-semibold text-primary/40 hover:text-primary/70 transition-colors flex items-center gap-2 group">
                    View Collective Pulse <ArrowRight className="size-3 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    )
}
