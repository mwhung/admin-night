// Session Scheduler Component
// Calendar-style UI for scheduling work sessions

'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    Clock,
    Users
} from 'lucide-react'
import type { Session } from '@/lib/hooks'

interface SessionSchedulerProps {
    sessions?: Session[]
    onCreateSession?: (date: Date, durationMinutes: number) => void
    onSelectSession?: (session: Session) => void
    className?: string
}

const DURATION_OPTIONS = [
    { value: 25, label: '25 min', color: 'bg-blue-500' },
    { value: 45, label: '45 min', color: 'bg-purple-500' },
    { value: 60, label: '60 min', color: 'bg-orange-500' },
]

const TIME_SLOTS = [
    '09:00', '10:00', '11:00', '12:00',
    '14:00', '15:00', '16:00', '17:00',
    '19:00', '20:00', '21:00'
]

export function SessionScheduler({
    sessions = [],
    onCreateSession,
    onSelectSession,
    className,
}: SessionSchedulerProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string | null>(null)
    const [selectedDuration, setSelectedDuration] = useState(25)
    const [showTimeSlots, setShowTimeSlots] = useState(false)

    // Get week days starting from current date
    const weekDays = useMemo(() => {
        const days: Date[] = []
        const start = new Date(currentDate)
        start.setDate(start.getDate() - start.getDay()) // Start from Sunday

        for (let i = 0; i < 7; i++) {
            const day = new Date(start)
            day.setDate(start.getDate() + i)
            days.push(day)
        }
        return days
    }, [currentDate])

    const navigateWeek = (direction: number) => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + direction * 7)
        setCurrentDate(newDate)
    }

    const formatDayName = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' })
    }

    const formatDayNumber = (date: Date) => {
        return date.getDate()
    }

    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }

    const isToday = (date: Date) => {
        const today = new Date()
        return date.toDateString() === today.toDateString()
    }

    const isPast = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return date < today
    }

    const getSessionsForDay = (date: Date) => {
        return sessions.filter(session => {
            const sessionDate = new Date(session.scheduledStart)
            return sessionDate.toDateString() === date.toDateString()
        })
    }

    const handleDateSelect = (date: Date) => {
        if (isPast(date)) return
        setSelectedDate(date)
        setShowTimeSlots(true)
        setSelectedTime(null)
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time)
    }

    const handleCreateSession = () => {
        if (!selectedDate || !selectedTime) return

        const [hours, minutes] = selectedTime.split(':').map(Number)
        const sessionDate = new Date(selectedDate)
        sessionDate.setHours(hours, minutes, 0, 0)

        onCreateSession?.(sessionDate, selectedDuration)

        // Reset
        setShowTimeSlots(false)
        setSelectedDate(null)
        setSelectedTime(null)
    }

    const isTimeSlotAvailable = (time: string) => {
        if (!selectedDate) return true

        const [hours, minutes] = time.split(':').map(Number)
        const slotTime = new Date(selectedDate)
        slotTime.setHours(hours, minutes, 0, 0)

        // Check if in the past
        if (slotTime < new Date()) return false

        // Check for conflicts
        return !sessions.some(session => {
            const start = new Date(session.scheduledStart)
            const end = new Date(session.scheduledEnd)
            return slotTime >= start && slotTime < end
        })
    }

    return (
        <Card className={cn('', className)}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Schedule Session</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateWeek(-1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[140px] text-center">
                            {formatMonth(currentDate)}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigateWeek(1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Week View */}
                <div className="grid grid-cols-7 gap-1">
                    {weekDays.map((day, index) => {
                        const daySessions = getSessionsForDay(day)
                        const isSelected = selectedDate?.toDateString() === day.toDateString()

                        return (
                            <button
                                key={index}
                                onClick={() => handleDateSelect(day)}
                                disabled={isPast(day)}
                                className={cn(
                                    'flex flex-col items-center p-2 rounded-lg transition-all',
                                    'hover:bg-accent/50',
                                    isToday(day) && 'ring-2 ring-primary ring-offset-2',
                                    isSelected && 'bg-primary text-primary-foreground',
                                    isPast(day) && 'opacity-40 cursor-not-allowed'
                                )}
                            >
                                <span className="text-xs text-muted-foreground">
                                    {formatDayName(day)}
                                </span>
                                <span className="text-lg font-semibold">
                                    {formatDayNumber(day)}
                                </span>
                                {daySessions.length > 0 && (
                                    <div className="flex gap-0.5 mt-1">
                                        {daySessions.slice(0, 3).map((_, i) => (
                                            <span
                                                key={i}
                                                className={cn(
                                                    'h-1.5 w-1.5 rounded-full',
                                                    isSelected ? 'bg-primary-foreground' : 'bg-primary'
                                                )}
                                            />
                                        ))}
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Time Slot Selection */}
                {showTimeSlots && selectedDate && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                                {selectedDate.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowTimeSlots(false)}
                            >
                                Cancel
                            </Button>
                        </div>

                        {/* Duration Selection */}
                        <div className="flex gap-2">
                            {DURATION_OPTIONS.map(option => (
                                <Button
                                    key={option.value}
                                    variant={selectedDuration === option.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedDuration(option.value)}
                                    className="flex-1"
                                >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {option.label}
                                </Button>
                            ))}
                        </div>

                        {/* Time Grid */}
                        <div className="grid grid-cols-4 gap-2">
                            {TIME_SLOTS.map(time => {
                                const available = isTimeSlotAvailable(time)
                                const isSelected = selectedTime === time

                                return (
                                    <Button
                                        key={time}
                                        variant={isSelected ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleTimeSelect(time)}
                                        disabled={!available}
                                        className={cn(
                                            !available && 'opacity-40 line-through'
                                        )}
                                    >
                                        {time}
                                    </Button>
                                )
                            })}
                        </div>

                        {/* Create Button */}
                        {selectedTime && (
                            <Button
                                className="w-full"
                                onClick={handleCreateSession}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Create {selectedDuration} min Session at {selectedTime}
                            </Button>
                        )}
                    </div>
                )}

                {/* Existing Sessions for Selected Day */}
                {selectedDate && getSessionsForDay(selectedDate).length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Existing sessions:</span>
                        {getSessionsForDay(selectedDate).map(session => (
                            <button
                                key={session.id}
                                onClick={() => onSelectSession?.(session)}
                                className="w-full flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">
                                        {new Date(session.scheduledStart).toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {session.durationMinutes}m
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span className="text-xs">{session.participantCount}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
