'use client'

import { motion } from 'framer-motion'
import { Trophy, Lock, Moon, Zap, Wind, Footprints, Sparkles, type LucideIcon } from 'lucide-react'
import { getAchievement, type Rarity } from '@/lib/achievements/definitions'

const iconMap: Record<string, LucideIcon> = {
    Moon,
    Zap,
    Wind,
    Footprints,
    Trophy,
    Sparkles,
}

interface AchievementCardProps {
    achievementId: string
    unlockedAt?: Date | string
    humorSnapshot?: string
    evidenceSnapshot?: string
    isLocked?: boolean
}

const rarityColors: Record<Rarity, { bg: string; border: string; glow: string }> = {
    common: {
        bg: 'from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800',
        border: 'border-slate-300 dark:border-slate-600',
        glow: 'shadow-slate-200/50 dark:shadow-slate-700/30',
    },
    uncommon: {
        bg: 'from-emerald-100 to-teal-200 dark:from-emerald-800 dark:to-teal-900',
        border: 'border-emerald-300 dark:border-emerald-600',
        glow: 'shadow-emerald-200/50 dark:shadow-emerald-700/30',
    },
    rare: {
        bg: 'from-blue-100 to-indigo-200 dark:from-blue-800 dark:to-indigo-900',
        border: 'border-blue-300 dark:border-blue-600',
        glow: 'shadow-blue-200/50 dark:shadow-blue-700/30',
    },
    legendary: {
        bg: 'from-amber-100 via-orange-200 to-rose-200 dark:from-amber-700 dark:via-orange-800 dark:to-rose-900',
        border: 'border-amber-400 dark:border-amber-500',
        glow: 'shadow-amber-300/60 dark:shadow-amber-600/40',
    },
}

export function AchievementCard({
    achievementId,
    unlockedAt,
    humorSnapshot,
    evidenceSnapshot,
    isLocked = false,
}: AchievementCardProps) {
    const definition = getAchievement(achievementId)

    if (!definition) {
        return null
    }

    const colors = rarityColors[definition.rarity]
    const IconComponent = definition.icon && iconMap[definition.icon]
        ? iconMap[definition.icon]
        : Trophy

    const formattedDate = unlockedAt
        ? new Date(unlockedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        })
        : null

    if (isLocked) {
        return (
            <div className="relative p-4 rounded-2xl bg-muted/30 border border-border/30 opacity-60">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-xl">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-muted-foreground">???</h4>
                        <p className="text-xs text-muted-foreground/60">Hidden achievement</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
        relative overflow-hidden p-4 rounded-2xl
        bg-gradient-to-br ${colors.bg}
        border ${colors.border}
        shadow-lg ${colors.glow}
        cursor-pointer
        group
      `}
        >
            {/* Shimmer effect for legendary */}
            {definition.rarity === 'legendary' && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            <div className="relative">
                {/* Header */}
                <div className="flex items-start gap-3">
                    <div className={`
            flex items-center justify-center w-12 h-12 rounded-xl
            bg-white/60 dark:bg-black/20
            backdrop-blur-sm
          `}>
                        <IconComponent className="w-6 h-6 text-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`
                text-xs font-semibold uppercase tracking-wider
                ${definition.rarity === 'legendary' ? 'text-amber-600 dark:text-amber-400' :
                                    definition.rarity === 'rare' ? 'text-blue-600 dark:text-blue-400' :
                                        definition.rarity === 'uncommon' ? 'text-emerald-600 dark:text-emerald-400' :
                                            'text-slate-500 dark:text-slate-400'}
              `}>
                                {definition.rarity}
                            </span>
                        </div>
                        <h4 className="text-base font-semibold text-foreground truncate">
                            {definition.title}
                        </h4>
                    </div>
                </div>

                {/* Humor line */}
                {humorSnapshot && (
                    <p className="mt-3 text-sm text-foreground/80 italic">
                        &quot;{humorSnapshot}&quot;
                    </p>
                )}

                {/* Evidence */}
                {evidenceSnapshot && (
                    <p className="mt-2 text-xs text-foreground/60">
                        {evidenceSnapshot}
                    </p>
                )}

                {/* Date */}
                {formattedDate && (
                    <p className="mt-3 text-xs text-foreground/50">
                        Unlocked on {formattedDate}
                    </p>
                )}
            </div>
        </motion.div>
    )
}
