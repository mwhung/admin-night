// Live Participant Count Component
// Displays real-time participant count with animated updates

'use client'

import { cn } from '@/lib/utils'
import { Users } from 'lucide-react'

interface ParticipantCountProps {
    count: number
    isConnected?: boolean
    showLabel?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export function ParticipantCount({
    count,
    isConnected = true,
    showLabel = true,
    className,
    size = 'md',
}: ParticipantCountProps) {
    const sizeClasses = {
        sm: 'text-sm gap-1',
        md: 'text-base gap-2',
        lg: 'text-lg gap-2',
    }

    const iconSizes = {
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    }

    return (
        <div
            className={cn(
                'flex items-center font-medium transition-all duration-300',
                sizeClasses[size],
                className
            )}
        >
            {/* Connection indicator */}
            <span
                className={cn(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                )}
                aria-label={isConnected ? 'Connected' : 'Disconnected'}
            />

            <Users className={cn(iconSizes[size], 'text-muted-foreground')} />

            <span
                className="tabular-nums font-bold"
                key={count} // Force re-render for animation
            >
                {count}
            </span>

            {showLabel && (
                <span className="text-muted-foreground">
                    {count === 1 ? 'participant' : 'participants'}
                </span>
            )}
        </div>
    )
}
