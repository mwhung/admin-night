import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { HISTORY_BLOCK_TITLE_STYLE } from './history-view-model'

interface HistorySectionProps {
    ariaLabel: string
    title: string
    subtitle: string
    children: ReactNode
    delay?: number
    axis?: 'x' | 'y'
    className?: string
}

export function HistorySection({
    ariaLabel,
    title,
    subtitle,
    children,
    delay = 0,
    axis = 'y',
    className,
}: HistorySectionProps) {
    const prefersReducedMotion = useReducedMotion()
    const transition = prefersReducedMotion ? { duration: 0 } : { duration: 0.14, delay }

    const initial = prefersReducedMotion
        ? false
        : axis === 'x'
            ? { opacity: 0, x: 8 }
            : { opacity: 0, y: 8 }

    return (
        <motion.section
            initial={initial}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={transition}
            className={cn('workbench-gap-title', className)}
            aria-label={ariaLabel}
        >
            <header className="space-y-1 px-1">
                <p className={HISTORY_BLOCK_TITLE_STYLE}>{title}</p>
                <p className="type-caption">{subtitle}</p>
            </header>
            {children}
        </motion.section>
    )
}
