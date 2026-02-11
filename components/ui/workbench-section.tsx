import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WorkbenchSectionProps {
    ariaLabel: string
    title: string
    subtitle: string
    children: ReactNode
    delay?: number
    axis?: 'x' | 'y'
    className?: string
    titleClassName?: string
    subtitleClassName?: string
    headerExtra?: ReactNode
}

export function WorkbenchSection({
    ariaLabel,
    title,
    subtitle,
    children,
    delay = 0,
    axis = 'y',
    className,
    titleClassName = 'type-block-title',
    subtitleClassName = 'type-caption',
    headerExtra,
}: WorkbenchSectionProps) {
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
                <p className={titleClassName}>{title}</p>
                <p className={subtitleClassName}>{subtitle}</p>
                {headerExtra}
            </header>
            {children}
        </motion.section>
    )
}
