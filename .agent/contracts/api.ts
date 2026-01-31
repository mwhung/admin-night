/**
 * API Contracts - Shared Types Between Backend and Frontend Agents
 * 
 * This file defines the interface contracts that both Backend and Frontend
 * agents must adhere to. When Backend creates an endpoint, update the types here.
 * Frontend should import types from this file for type safety.
 */

// ============================================
// Task Types
// ============================================

export type TaskState =
    | 'UNCLARIFIED'
    | 'CLARIFIED'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'RECURRING'

export interface Task {
    id: string
    userId: string
    title: string
    state: TaskState
    aiSuggestions: string[] | null
    createdAt: string
    updatedAt: string
    resolvedAt: string | null
}

export interface CreateTaskRequest {
    title: string
}

export interface UpdateTaskRequest {
    title?: string
    state?: TaskState
    aiSuggestions?: string[]
}

// ============================================
// Session Types
// ============================================

export type SessionStatus =
    | 'SCHEDULED'
    | 'ACTIVE'
    | 'COMPLETED'

export interface WorkSession {
    id: string
    scheduledStart: string
    scheduledEnd: string
    durationMinutes: number
    status: SessionStatus
    createdAt: string
    participantCount?: number
}

export interface WorkSessionParticipant {
    id: string
    sessionId: string
    userId: string
    joinedAt: string
    leftAt: string | null
    tasksWorkedOn: string[] | null
}

export interface JoinSessionRequest {
    sessionId: string
}

export interface LeaveSessionRequest {
    sessionId: string
}

// ============================================
// User Types
// ============================================

export interface User {
    id: string
    name: string | null
    email: string | null
    image: string | null
    preferences: UserPreferences | null
}

export interface UserPreferences {
    ambientSound: boolean
    sessionDuration: 25 | 45
    theme: 'light' | 'dark' | 'system'
}

export interface UpdatePreferencesRequest {
    ambientSound?: boolean
    sessionDuration?: 25 | 45
    theme?: 'light' | 'dark' | 'system'
}

// ============================================
// AI Types
// ============================================

export interface ClarifyTaskRequest {
    taskId: string
    taskTitle: string
}

export interface ClarifyTaskResponse {
    suggestions: string[]
    taskId: string
}

// ============================================
// Auth Types
// ============================================

export interface RegisterRequest {
    email: string
    password: string
    name?: string
}

export interface LoginRequest {
    email: string
    password: string
}

// ============================================
// API Response Wrapper
// ============================================

export interface ApiResponse<T> {
    data?: T
    error?: string
    message?: string
}

// ============================================
// API Endpoints Reference
// ============================================

/**
 * API Endpoint Reference:
 * 
 * Tasks:
 * - GET    /api/tasks           - List user's tasks
 * - POST   /api/tasks           - Create task
 * - GET    /api/tasks/[id]      - Get single task
 * - PUT    /api/tasks/[id]      - Update task
 * - DELETE /api/tasks/[id]      - Delete task
 * - POST   /api/tasks/[id]/clarify - Trigger AI clarification
 * 
 * Sessions:
 * - GET    /api/sessions        - List upcoming sessions
 * - GET    /api/sessions/[id]   - Get session details
 * - POST   /api/sessions/[id]/join  - Join session
 * - POST   /api/sessions/[id]/leave - Leave session
 * 
 * Users:
 * - GET    /api/users/me        - Get current user
 * - PUT    /api/users/preferences - Update preferences
 * 
 * Auth:
 * - POST   /api/auth/register   - Register new user
 * - POST   /api/auth/[...nextauth] - NextAuth handlers
 * 
 * AI:
 * - POST   /api/ai/clarify      - Get AI suggestions for task
 */
