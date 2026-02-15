
'use client'

import { motion } from 'framer-motion'

interface CollectiveExhaleProps {
    count: number
    showHeading?: boolean
}

export function CollectiveExhale({ count, showHeading = true }: CollectiveExhaleProps) {
    return (
        <div className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-transparent to-primary/[0.02]">
            {/* 2026 Energy Ball (Fluid Visual) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                {/* Core Blob 1 */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 0.9, 1.1, 1],
                        rotate: [0, 90, 180, 270, 360],
                        borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 50% 50%", "30% 60% 70% 40% / 50% 60% 30% 60%"],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute size-[400px] bg-primary/10 blur-[80px]"
                />

                {/* Internal Blob 2 (Brighter) */}
                <motion.div
                    animate={{
                        scale: [0.8, 1.1, 0.9, 1],
                        rotate: [360, 270, 180, 90, 0],
                        borderRadius: ["50% 50% 50% 50%", "40% 60% 40% 60% / 60% 40% 60% 40%", "50% 50% 50% 50%"],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute size-[300px] bg-primary/20 blur-[60px] mix-blend-overlay"
                />

                {/* Third Blob (Accent) */}
                <motion.div
                    animate={{
                        x: [0, 40, -40, 0],
                        y: [0, -30, 30, 0],
                        scale: [1, 1.3, 0.8, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute size-[250px] bg-primary/15 blur-[100px]"
                />
            </div>

            <div className="relative z-10 text-center space-y-6">
                <div className={showHeading ? "space-y-1" : ""}>
                    {showHeading && (
                        <p className="text-xs font-bold uppercase tracking-[0.5em] text-primary/40">Community Presence</p>
                    )}
                    <motion.div
                        key={count}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-7xl font-extralight tracking-tighter text-foreground/90 tabular-nums"
                    >
                        {count.toLocaleString()}
                    </motion.div>
                </div>

                <div className="space-y-2 max-w-[280px] mx-auto">
                    <p className="text-lg font-light text-muted-foreground leading-relaxed">
                        Tasks closed by the group in the past 24h.
                    </p>
                    <div className="h-px w-8 bg-primary/20 mx-auto mt-4" />
                </div>
            </div>

            {/* Micro-Particles (Reclaim Attention) */}
            {[...Array(20)].map((_, i) => {
                const baseX = ((i * 73) % 400) - 200
                const baseY = ((i * 97) % 400) - 200
                const duration = 7 + (i % 10)
                const delay = (i * 0.5) % 10

                return (
                    <motion.div
                        key={i}
                        className="absolute size-px bg-primary/40"
                        initial={{
                            x: baseX,
                            y: baseY,
                            opacity: 0
                        }}
                        animate={{
                            y: [null, -100],
                            opacity: [0, 0.4, 0],
                            scale: [1, 2, 1]
                        }}
                        transition={{
                            duration,
                            repeat: Infinity,
                            delay
                        }}
                    />
                )
            })}
        </div>
    )
}
