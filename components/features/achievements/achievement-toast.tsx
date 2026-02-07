'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Sparkles, Moon, Zap, Wind, Footprints, type LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
    Moon,
    Zap,
    Wind,
    Footprints,
    Trophy,
    Sparkles,
}
import type { UnlockedAchievement } from '@/lib/hooks/use-achievement-tracker'

interface AchievementToastProps {
    achievement: UnlockedAchievement | null
    onDismiss: () => void
    autoDismissMs?: number
}

export function AchievementToast({
    achievement,
    onDismiss,
    autoDismissMs = 6000
}: AchievementToastProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    useEffect(() => {
        if (!achievement) return

        const timer = setTimeout(() => {
            if (!isExpanded) onDismiss()
        }, autoDismissMs)

        return () => clearTimeout(timer)
    }, [achievement, autoDismissMs, isExpanded, onDismiss])

    // Get icon dynamically from pre-defined map
    const IconComponent = achievement?.icon && iconMap[achievement.icon]
        ? iconMap[achievement.icon]
        : Trophy

    return (
        <AnimatePresence mode="wait">
            {achievement && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 right-6 z-50 max-w-sm"
                >
                    <div
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="
              relative overflow-hidden cursor-pointer
              bg-gradient-to-br from-card/95 to-card/80
              backdrop-blur-xl
              border border-border/50
              rounded-2xl
              shadow-2xl shadow-black/10
              dark:shadow-black/30
            "
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-purple-500/10 opacity-50" />

                        {/* Content */}
                        <div className="relative p-4">
                            {/* Header */}
                            <div className="flex items-center gap-3">
                                {/* Icon with glow */}
                                <div className="relative">
                                    <div className="absolute inset-0 bg-amber-400/30 blur-lg rounded-full" />
                                    <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                                        <IconComponent className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                {/* Title & Humor */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3 h-3 text-amber-500" />
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                                            Unlocked
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-semibold text-foreground truncate">
                                        {achievement.title}
                                    </h4>
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        onDismiss()
                                    }}
                                    className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"
                                >
                                    <X className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>

                            {/* Humor line */}
                            <p className="mt-2 text-sm text-muted-foreground italic">
                                &quot;{achievement.humorLine}&quot;
                            </p>

                            {/* Expanded details */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 pt-3 border-t border-border/50">
                                            <p className="text-xs text-muted-foreground">
                                                {achievement.evidence}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Tap hint */}
                            {!isExpanded && (
                                <p className="mt-2 text-xs text-muted-foreground/60 text-center">
                                    Tap for details
                                </p>
                            )}
                        </div>

                        {/* Bottom gradient line */}
                        <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
