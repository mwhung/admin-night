import { z } from 'zod'
import {
  DEFAULT_SESSION_DURATION,
  SESSION_DURATION_MAX,
  SESSION_DURATION_MIN,
} from '@/lib/constants/session'

export const createSessionSchema = z.object({
  scheduledStart: z.coerce.date(),
  durationMinutes: z
    .number()
    .min(SESSION_DURATION_MIN)
    .max(SESSION_DURATION_MAX)
    .default(DEFAULT_SESSION_DURATION),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>

const startSessionTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  completed: z.boolean().default(false),
})

export const startSessionSchema = z.object({
  durationMinutes: z
    .number()
    .min(SESSION_DURATION_MIN)
    .max(SESSION_DURATION_MAX)
    .default(DEFAULT_SESSION_DURATION),
  preferredSessionId: z.string().min(1).optional(),
  selectedTasks: z.array(startSessionTaskSchema).default([]),
})

export type StartSessionInput = z.infer<typeof startSessionSchema>

export const completeSessionSchema = z.object({
  actualDurationSeconds: z.number().min(0),
  totalPauseSeconds: z.number().min(0),
  pauseCount: z.number().min(0),
  tasksCompletedCount: z.number().min(0),
  tasksWorkedOn: z.array(z.string()).optional(),
})

export type CompleteSessionInput = z.infer<typeof completeSessionSchema>
