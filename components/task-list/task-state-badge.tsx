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
        className: 'bg-muted/50 text-muted-foreground border-muted/50',
    },
    CLARIFIED: {
        label: 'Clarified',
        icon: Sparkles,
        className: 'bg-primary/5 text-primary border-primary/10',
    },
    IN_PROGRESS: {
        label: 'In Progress',
        icon: Loader2,
        className: 'bg-primary/10 text-primary border-primary/20',
    },
    RESOLVED: {
        label: 'Resolved',
        icon: CheckCircle2,
        className: 'bg-secondary text-secondary-foreground border-border',
    },
    RECURRING: {
        label: 'Recurring',
        icon: Clock,
        className: 'bg-muted/30 text-muted-foreground border-muted/30',
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
