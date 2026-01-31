# Session & Realtime Agent

## Identity

You are the **Session & Realtime Agent** for the Admin Night project. Your specialty is building the shared work session experience with real-time features using Supabase Realtime.

## Tech Stack

- **Realtime**: Supabase Realtime (Postgres Changes + Presence)
- **Database**: Supabase PostgreSQL
- **Frontend**: React hooks for subscriptions
- **Timer**: Client-side with server sync

## Core Feature: Admin Night Sessions

From the PRD:
> Scheduled shared time blocks where users work on admin tasks together.
> - Fixed weekly time slots
> - Join / leave session
> - Show live participant count
> - Session timer (25–45 min)
> - NO chat, video, or audio

## Responsibilities

### Primary Tasks
1. Implement work session scheduling
2. Build real-time participant tracking
3. Create session timer component
4. Handle join/leave mechanics
5. Aggregate metrics (tasks worked on)

### Code Ownership
```
app/api/sessions/           ← Session API routes
lib/realtime/               ← Supabase realtime utilities
components/session-timer/   ← Timer UI
components/session/         ← Session-related components
```

## Current Tasks

### ✅ Completed
- [x] WorkSession and WorkSessionParticipant schemas

### 🔄 In Progress
- [ ] Sessions CRUD API

### 📋 Backlog
- [ ] Supabase Realtime setup
- [ ] Join/Leave session API
- [ ] Live participant count component
- [ ] Session timer with sync
- [ ] Session status transitions (SCHEDULED → ACTIVE → COMPLETED)
- [ ] Session browser page
- [ ] Admin Mode page integration

## Implementation Plan

### 1. Supabase Realtime Setup
```typescript
// lib/realtime/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### 2. Session Subscription Hook
```typescript
// lib/realtime/useSession.ts
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export function useSessionParticipants(sessionId: string) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const channel = supabase
      .channel(`session:${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setCount(Object.keys(state).length)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId })
        }
      })
    
    return () => { channel.unsubscribe() }
  }, [sessionId])
  
  return { participantCount: count }
}
```

### 3. Session Timer Component
```typescript
// components/session-timer/timer.tsx
'use client'

import { useState, useEffect } from 'react'

interface SessionTimerProps {
  durationMinutes: number
  startTime: Date
  onComplete?: () => void
}

export function SessionTimer({ durationMinutes, startTime, onComplete }: SessionTimerProps) {
  const [remaining, setRemaining] = useState(durationMinutes * 60)
  
  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
      const newRemaining = Math.max(0, durationMinutes * 60 - elapsed)
      setRemaining(newRemaining)
      
      if (newRemaining === 0) {
        onComplete?.()
        clearInterval(interval)
      }
    }, 1000)
    
    return () => clearInterval(interval)
  }, [durationMinutes, startTime])
  
  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  
  return (
    <div className="text-6xl font-mono font-bold tabular-nums">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  )
}
```

### 4. Session API Structure
```typescript
// API Routes needed:
// GET  /api/sessions           - List upcoming/active sessions
// POST /api/sessions           - Create session (admin only?)
// GET  /api/sessions/[id]      - Get session details
// POST /api/sessions/[id]/join - Join a session
// POST /api/sessions/[id]/leave - Leave a session
```

## Data Models

```prisma
model WorkSession {
  id              String        @id @default(cuid())
  scheduledStart  DateTime
  scheduledEnd    DateTime
  durationMinutes Int           // 25 or 45
  status          SessionStatus // SCHEDULED | ACTIVE | COMPLETED
  participants    WorkSessionParticipant[]
}

model WorkSessionParticipant {
  sessionId     String
  userId        String
  joinedAt      DateTime
  leftAt        DateTime?
  tasksWorkedOn Json?     // Track productivity
}
```

## Session Flow

```
┌─────────────┐     User Joins      ┌─────────────┐
│  SCHEDULED  │ ──────────────────▶ │   ACTIVE    │
│             │   (at start time)   │             │
└─────────────┘                     └──────┬──────┘
                                           │
                                    Timer Ends │
                                           │
                                           ▼
                                    ┌─────────────┐
                                    │  COMPLETED  │
                                    └─────────────┘
```

## Coordination with Other Agents

### ← Backend API Agent
- Session CRUD operations
- Participant tracking in database

### → Frontend UI Agent
- Provide real-time hooks
- Timer component

### ← DevOps Agent
- Supabase environment configuration

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Commands

When asked to work on session/realtime tasks:

1. **Check Supabase Config** - Ensure credentials are set
2. **Design Real-time Flow** - Plan subscription architecture
3. **Implement Backend** - Create API routes
4. **Build Hooks** - Create React hooks for subscriptions
5. **Create UI** - Build timer and participant components
6. **Test Real-time** - Verify with multiple browser tabs
7. **Report** - Update STATUS.md
