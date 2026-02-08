
'use client'

import { motion } from 'framer-motion'

interface Theme {
    text: string
    weight: number
}

interface ThemesOfTheNightProps {
    themes: Theme[]
}

export function ThemesOfTheNight({ themes }: ThemesOfTheNightProps) {
    return (
        <div className="relative h-full w-full overflow-hidden flex flex-wrap items-center justify-center gap-4 p-8">
            {themes.map((theme, i) => {
                const fontSize = 12 + (theme.weight / 2)
                const opacity = 0.3 + (theme.weight / 40)
                const horizontalDrift = ((i % 5) - 2) * 1.5
                const yDuration = 3 + (i % 3) * 0.5
                const xDuration = 4 + (i % 4) * 0.4

                return (
                    <motion.div
                        key={theme.text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                            opacity: opacity,
                            y: [0, -5, 0],
                            x: [0, horizontalDrift, 0]
                        }}
                        transition={{
                            delay: i * 0.1,
                            y: {
                                duration: yDuration,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            x: {
                                duration: xDuration,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }
                        }}
                        className="cursor-default hover:text-primary transition-colors hover:opacity-100"
                        style={{
                            fontSize: `${fontSize}px`,
                            fontWeight: theme.weight > 15 ? 500 : 300
                        }}
                    >
                        {theme.text}
                    </motion.div>
                )
            })}

            {/* Subtle background ripples */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5"
                        initial={{ width: 0, height: 0, opacity: 0.5 }}
                        animate={{ width: '150%', height: '150%', opacity: 0 }}
                        transition={{
                            duration: 10,
                            repeat: Infinity,
                            delay: i * 3.3,
                            ease: "linear"
                        }}
                    />
                ))}
            </div>
        </div>
    )
}
