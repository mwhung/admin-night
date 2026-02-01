// Task Checklist Component
// Satisfying task completion with strong visual feedback

'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, Sparkles } from 'lucide-react'

export interface TaskItem {
    id: string
    title: string
    completed: boolean
}

interface TaskChecklistProps {
    tasks: TaskItem[]
    onToggle: (taskId: string) => void
    className?: string
}

export function TaskChecklist({
    tasks,
    onToggle,
    className,
}: TaskChecklistProps) {
    const [celebratingId, setCelebratingId] = useState<string | null>(null)

    const completedCount = tasks.filter(t => t.completed).length
    const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0

    const handleToggle = (taskId: string, completed: boolean) => {
        if (!completed) {
            setCelebratingId(taskId)
            setTimeout(() => setCelebratingId(null), 1000)
        }
        onToggle(taskId)
    }

    return (
        <div className={cn('w-full max-w-sm', className)}>
            {/* Progress Header */}
            <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                    {completedCount} of {tasks.length} tasks
                </p>
                <div className="flex items-center gap-1">
                    {completedCount === tasks.length && tasks.length > 0 && (
                        <Sparkles className="h-4 w-4 text-primary/40 animate-pulse" />
                    )}
                    <span className="text-sm font-medium">{Math.round(progress)}%</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
                <div
                    className="h-full bg-success rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Task List */}
            <div className="space-y-2">
                {tasks.map((task) => (
                    <button
                        key={task.id}
                        onClick={() => handleToggle(task.id, task.completed)}
                        className={cn(
                            'group w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300',
                            'hover:bg-muted/50',
                            task.completed && 'bg-primary/5',
                            celebratingId === task.id && 'animate-celebrate'
                        )}
                    >
                        {/* Checkbox */}
                        <div
                            className={cn(
                                'relative flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300',
                                'flex items-center justify-center',
                                task.completed
                                    ? 'bg-success border-transparent scale-110'
                                    : 'border-muted-foreground/30 group-hover:border-success/50'
                            )}
                        >
                            {task.completed && (
                                <Check className="h-4 w-4 text-success-foreground animate-checkmark" />
                            )}

                            {/* Celebration particles */}
                            {celebratingId === task.id && (
                                <>
                                    <span className="absolute -top-1 -left-1 w-2 h-2 bg-success/60 rounded-full animate-particle-1" />
                                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-success/50 rounded-full animate-particle-2" />
                                    <span className="absolute -bottom-1 -left-1 w-2 h-2 bg-success/40 rounded-full animate-particle-3" />
                                    <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-success/30 rounded-full animate-particle-4" />
                                </>
                            )}
                        </div>

                        {/* Task Title */}
                        <span
                            className={cn(
                                'flex-1 text-left text-sm transition-all duration-300',
                                task.completed
                                    ? 'text-muted-foreground line-through'
                                    : 'text-foreground'
                            )}
                        >
                            {task.title}
                        </span>

                        {/* Completed indicator */}
                        {task.completed && (
                            <Sparkles className="h-4 w-4 text-success/50" />
                        )}
                    </button>
                ))}
            </div>

            {/* All Done Message */}
            {completedCount === tasks.length && tasks.length > 0 && (
                <div className="mt-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-lg font-medium text-primary">🎉 All tasks complete!</p>
                    <p className="text-sm text-muted-foreground">Amazing work!</p>
                </div>
            )}
        </div>
    )
}
