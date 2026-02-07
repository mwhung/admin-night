'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import debounce from 'lodash/debounce'

// Emojis mapping
const REACTION_TYPES = [
    { type: 'clap', emoji: '👏', label: 'Cheer' },
    { type: 'fire', emoji: '🔥', label: 'Momentum' },
    { type: 'leaf', emoji: '🌿', label: 'Relief' }
]

export function ReactionOverlay() {
    const [counts, setCounts] = useState<Record<string, number>>({ clap: 0, fire: 0, leaf: 0 })
    const [localClicks, setLocalClicks] = useState<Record<string, number>>({ clap: 0, fire: 0, leaf: 0 })
    const [showParticles, setShowParticles] = useState<{ id: number, type: string, x: number, y: number }[]>([])

    // Poll for updates every 10 seconds (in real app, use websockets or server sent events)
    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const res = await fetch('/api/community/react')
                if (res.ok) {
                    const data = await res.json()
                    if (data.reactions) {
                        setCounts(prev => ({ ...prev, ...data.reactions }))
                    }
                }
            } catch (err) {
                console.error("Failed to poll reactions", err)
            }
        }

        fetchReactions()
        const interval = setInterval(fetchReactions, 10000)
        return () => clearInterval(interval)
    }, [])

    // API call to increment (debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedIncrement = useCallback(
        debounce(async (type: string) => {
            try {
                await fetch('/api/community/react', {
                    method: 'POST',
                    body: JSON.stringify({ type }),
                    headers: { 'Content-Type': 'application/json' }
                })
            } catch (err) {
                console.error("Failed to send reaction", err)
            }
        }, 500),
        []
    )

    const handleReact = (type: string, e: React.MouseEvent) => {
        // 1. Optimistic update
        setCounts(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }))
        setLocalClicks(prev => ({ ...prev, [type]: (prev[type] || 0) + 1 }))

        // 2. Trigger animation
        const id = Date.now()
        // Randomize position slightly around the button
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        // Calculate relative position within the fixed container for the particle
        // Note: This is simplified; specific positioning logic depends on container

        setShowParticles(prev => [...prev, { id, type, x: 0, y: 0 }])
        setTimeout(() => {
            setShowParticles(prev => prev.filter(p => p.id !== id))
        }, 1000)

        // 3. API Call
        debouncedIncrement(type)
    }

    return (
        <div className="fixed bottom-8 right-8 z-50 flex gap-3 pointer-events-auto">
            {REACTION_TYPES.map(({ type, emoji }) => (
                <div key={type} className="relative group">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleReact(type, e)}
                        className={cn(
                            "flex flex-col items-center justify-center w-12 h-14 rounded-2xl",
                            "bg-background/80 backdrop-blur-md border border-primary/10 shadow-lg",
                            "hover:bg-primary/5 hover:border-primary/20 transition-all"
                        )}
                    >
                        <span className="text-xl leading-none mb-1">{emoji}</span>
                        <span className="text-[10px] font-bold text-muted-foreground/70 tabular-nums">
                            {counts[type] || 0}
                        </span>
                    </motion.button>

                    {/* Private Echo: +1 Animation */}
                    <AnimatePresence>
                        {localClicks[type] > 0 && (
                            <motion.div
                                key={`echo-${type}-${localClicks[type]}`}
                                initial={{ opacity: 1, y: -10, scale: 0.5 }}
                                animate={{ opacity: 0, y: -40, scale: 1.2 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.8 }}
                                className="absolute -top-4 left-1/2 -translate-x-1/2 text-primary font-bold text-xs pointer-events-none"
                            >
                                +1
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}
