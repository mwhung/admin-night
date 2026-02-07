# Hidden Achievements & Narration Implementation Plan

## ✅ Completed (Phase 1 & 2)

### 1. Database Schema
- [x] Added `UserAchievement` model to store unlock records
- [x] Added `achievementSummary` field to `WorkSessionParticipant` for LLM summary
- [x] Successfully migrated schema with `prisma db push`

### 2. Achievement Definitions (`lib/achievements/definitions.ts`)
- [x] Created `AchievementDef` interface with:
  - `id`, `icon`, `title`, `description`, `rarity`, `triggerType`
  - `humorOptions[]` - Pool of pre-defined humor lines (random selection)
- [x] Implemented helper functions: `getAchievement()`, `getRandomHumor()`
- [x] Defined initial MVP achievements:
  - `night_owl` (rare, post_session) - Sessions between 00:00-04:00
  - `unbroken_focus` (uncommon, post_session) - Zero pauses, 20+ mins
  - `quick_wrap` (common, post_session) - Fast wrap-up
  - `first_step` (common, in_session) - First task completed

### 3. Backend APIs
- [x] `GET /api/achievements` - Fetch user's unlocked achievements
- [x] `POST /api/achievements/unlock` - Unlock achievement (for in-session)
- [x] `POST /api/sessions/[id]/complete` - Session completion with:
  - Post-session achievement checking
  - LLM summary generation
  - Achievement persistence

### 4. LLM Service (`lib/ai/summary-generator.ts`)
- [x] Created `generateSessionSummary()` function
- [x] Uses GPT-4o-mini with "deadpan, calm, weird but supportive" tone
- [x] Graceful fallback on API failure

### 5. Frontend Logic
- [x] `useAchievementTracker` hook for in-session tracking
  - Tracks: `pauseCount`, `tasksCompletedCount`
  - Rate limiting: max 2 toasts per session
  - Optimistic unlock with backend sync

### 6. UI Components
- [x] `AchievementToast` - In-session notification
  - Animated entry/exit with Framer Motion
  - Expandable details on tap
  - Auto-dismiss with 6s timer
- [x] `AchievementCard` - History collection card
  - Rarity-based color theming
  - Shimmer effect for legendary
- [x] `SessionSummary` - Post-session summary component
  - Shows LLM-generated summary
  - Displays new achievement count with link to History

### 7. History Page Integration
- [x] Added Achievement Collection section
- [x] Fetches achievements via API
- [x] Displays cards in responsive grid

---

## 🔲 Remaining (Phase 3)

### Frontend Integration
- [ ] Wire `useAchievementTracker` into active session flow
- [ ] Add `AchievementToast` to session layout
- [ ] Integrate `SessionSummary` into wrap-up flow
- [ ] Call `POST /api/sessions/[id]/complete` on session end

### Additional Achievements
- [ ] Define remaining 8-10 MVP achievements
- [ ] Add more `in_session` type achievements

### Testing
- [ ] Unit tests for achievement logic
- [ ] E2E test for unlock flow

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
├──────────────────────┬──────────────────────────────────────┤
│  useAchievementTracker │   AchievementToast  │  SessionSummary │
│  (in-session tracking) │   (notifications)   │  (wrap-up)      │
└──────────────────────┴──────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                         APIs                                 │
├─────────────────────────────────────────────────────────────┤
│  GET /api/achievements           → List user achievements    │
│  POST /api/achievements/unlock   → Unlock (in-session)       │
│  POST /api/sessions/[id]/complete → Complete + LLM summary   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        Services                              │
├─────────────────────────────────────────────────────────────┤
│  lib/achievements/definitions.ts  → Static achievement defs  │
│  lib/ai/summary-generator.ts      → LLM summary generation   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        Database                              │
├─────────────────────────────────────────────────────────────┤
│  UserAchievement                  → Unlock records           │
│  WorkSessionParticipant           → Session summary storage  │
└─────────────────────────────────────────────────────────────┘
```
