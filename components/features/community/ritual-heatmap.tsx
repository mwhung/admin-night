
'use client'

import { motion } from 'framer-motion'

interface RitualHeatmapProps {
    hourlyActivity: number[]
}

export function RitualHeatmap({ hourlyActivity }: RitualHeatmapProps) {
    const max = Math.max(...hourlyActivity, 1)

    return (
        <div className="relative aspect-square max-w-[300px] mx-auto flex items-center justify-center p-8">
            {/* Clock Face Background */}
            <div className="absolute inset-0 rounded-full border border-primary/5 bg-primary/2" />

            {/* Hour Marks */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute h-full w-0.5 pointer-events-none"
                    style={{ transform: `rotate(${i * 30}deg)` }}
                >
                    <div className="h-2 w-full bg-primary/10 rounded-full mt-1" />
                </div>
            ))}

            {/* Data Points (24 hours) */}
            <div className="relative size-full">
                {hourlyActivity.map((count, i) => {
                    const angle = (i * 15) - 90 // Start from Top
                    const normalized = count / max
                    const radius = 40 + (normalized * 50) // Scale radius by activity
                    const size = 4 + (normalized * 12)

                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.02 }}
                            className="absolute rounded-full bg-primary/20 blur-[1px] hover:bg-primary/40 transition-colors cursor-help"
                            style={{
                                width: size,
                                height: size,
                                left: `calc(50% + ${radius}% * ${Math.cos(angle * (Math.PI / 180))})`,
                                top: `calc(50% + ${radius}% * ${Math.sin(angle * (Math.PI / 180))})`,
                                transform: 'translate(-50%, -50%)'
                            }}
                            title={`${i}:00 - ${count} tasks`}
                        />
                    )
                })}
            </div>

            <div className="absolute flex flex-col items-center text-center pointer-events-none">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">The Core Rhythm</span>
                <span className="text-xl font-light">24h Pulse</span>
            </div>

            {/* Labels for 12, 6, 18, 0 */}
            <div className="absolute top-0 text-xs text-muted-foreground/40 font-mono">12:00</div>
            <div className="absolute bottom-0 text-xs text-muted-foreground/40 font-mono">00:00</div>
            <div className="absolute left-0 text-xs text-muted-foreground/40 font-mono">18:00</div>
            <div className="absolute right-0 text-xs text-muted-foreground/40 font-mono">06:00</div>
        </div>
    )
}
