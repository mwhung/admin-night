'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface SessionSummaryProps {
    newAchievementCount: number
    llmSummary: string
    isLoading?: boolean
}

export function SessionSummary({
    newAchievementCount,
    llmSummary,
    isLoading = false,
}: SessionSummaryProps) {
    const [showSummary, setShowSummary] = useState(false)

    useEffect(() => {
        // Delay showing summary for dramatic effect
        const timer = setTimeout(() => setShowSummary(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="w-full max-w-lg mx-auto p-6">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-4 py-8"
                    >
                        <div className="relative">
                            <div className="w-12 h-12 rounded-full border-2 border-muted animate-pulse" />
                            <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-amber-500 animate-pulse" />
                        </div>
                        <p className="text-sm text-muted-foreground">Reflecting on your session...</p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        {/* LLM Summary */}
                        {showSummary && llmSummary && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center"
                            >
                                <p className="text-lg text-foreground/90 italic leading-relaxed">
                                    &quot;{llmSummary}&quot;
                                </p>
                            </motion.div>
                        )}

                        {/* Achievement Count */}
                        {newAchievementCount > 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="
                  relative overflow-hidden
                  p-4 rounded-2xl
                  bg-gradient-to-br from-amber-50 to-orange-100
                  dark:from-amber-900/30 dark:to-orange-900/30
                  border border-amber-200/50 dark:border-amber-700/50
                "
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-amber-400/30 blur-md rounded-full" />
                                            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl">
                                                <Trophy className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">
                                                Unlocked {newAchievementCount} new achievement{newAchievementCount > 1 ? 's' : ''}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                View in your collection
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        href="/history"
                                        className="
                      flex items-center gap-1 px-3 py-1.5 rounded-lg
                      text-xs font-medium text-amber-700 dark:text-amber-300
                      bg-amber-100 dark:bg-amber-800/30
                      hover:bg-amber-200 dark:hover:bg-amber-800/50
                      transition-colors
                    "
                                    >
                                        View
                                        <ChevronRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </motion.div>
                        )}

                        {/* No achievements case */}
                        {newAchievementCount === 0 && showSummary && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center text-sm text-muted-foreground"
                            >
                                Keep going. The hidden ones reveal themselves eventually.
                            </motion.p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
