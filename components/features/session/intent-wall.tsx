import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from "@/components/ui/button"

interface IntentBubble {
    category: string
    count: number
}

interface IntentWallProps {
    onSelect?: (category: string) => void
    className?: string
}

export function IntentWall({ onSelect, className }: IntentWallProps) {
    const [intents, setIntents] = useState<IntentBubble[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchIntents = async () => {
            try {
                const res = await fetch('/api/community/intent')
                if (res.ok) {
                    const data = await res.json()
                    // If no data, provide some fallbacks for the "alive" feeling
                    if (!data.intents || data.intents.length === 0) {
                        setIntents([
                            { category: 'Reimbursements', count: 12 },
                            { category: 'Email Cleanup', count: 8 },
                            { category: 'Bills', count: 5 },
                            { category: 'Forms', count: 3 }
                        ])
                    } else {
                        setIntents(data.intents)
                    }
                }
            } catch (error) {
                console.error('Failed to load intent wall', error)
            } finally {
                setLoading(false)
            }
        }

        fetchIntents()
    }, [])

    // Gentler floating animation variants
    const floatVariants = {
        animate: (i: number) => ({
            y: [0, -10, 0],
            x: [0, i % 2 === 0 ? 5 : -5, 0],
            transition: {
                duration: 3 + (i % 2),
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.2
            }
        })
    }

    if (loading) return null

    return (
        <div className={cn("relative w-full h-64 overflow-hidden rounded-xl bg-transparent", className)}>
            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="flex flex-wrap gap-4 justify-center items-center max-w-2xl">
                    <AnimatePresence>
                        {intents.map((item, i) => (
                            <motion.button
                                key={item.category}
                                custom={i}
                                variants={floatVariants}
                                animate="animate"
                                initial={{ opacity: 0, scale: 0.8 }}
                                exit={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={() => onSelect?.(item.category)}
                                className={cn(
                                    "px-4 py-2 rounded-full border backdrop-blur-sm transition-colors",
                                    "bg-background/40 border-primary/10 hover:bg-primary/5 hover:border-primary/20",
                                    "flex items-center gap-2 shadow-sm"
                                )}
                            >
                                <span className="text-sm font-medium text-foreground/80">{item.category}</span>
                                <span className="flex items-center justify-center min-w-[1.2rem] h-[1.2rem] text-[10px] font-bold rounded-full bg-primary/10 text-primary">
                                    {item.count}
                                </span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Subtle header to explain context */}
            <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground/50">
                    Others are working on...
                </p>
            </div>
        </div>
    )
}
