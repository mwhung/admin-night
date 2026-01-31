'use client'

import { cn } from '@/lib/utils'
import {
    Circle,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    Sparkles
} from 'lucide-react'

export type TaskState =
    | 'UNCLARIFIED'
    | 'CLARIFIED'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'RECURRING'

interface TaskStateBadgeProps {
    state: TaskState
    className?: string
    showLabel?: boolean
}

const stateConfig: Record<TaskState, {
    label: string
    icon: React.ElementType
    className: string
}> = {
    UNCLARIFIED: {
        label: 'Unclarified',
        icon: Circle,
        className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    CLARIFIED: {
        label: 'Clarified',
        icon: Sparkles,
        className: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    },
    IN_PROGRESS: {
        label: 'In Progress',
        icon: Loader2,
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    },
    RESOLVED: {
        label: 'Resolved',
        icon: CheckCircle2,
        className: 'bg-muted text-muted-foreground border-muted',
    },
    RECURRING: {
        label: 'Recurring',
        icon: Clock,
        className: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
    },
}

export function TaskStateBadge({
    state,
    className,
    showLabel = true
}: TaskStateBadgeProps) {
    const config = stateConfig[state] || stateConfig.UNCLARIFIED
    const Icon = config.icon

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all",
                config.className,
                className
            )}
        >
            <Icon
                className={cn(
                    "size-3",
                    state === 'IN_PROGRESS' && "animate-spin",
                    state === 'CLARIFIED' && "animate-pulse"
                )}
            />
            {showLabel && <span>{config.label}</span>}
        </span>
    )
}
