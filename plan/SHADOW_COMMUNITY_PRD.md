# Shadow Community (Companionship) — Product Requirement Document (PRD)

> **Version**: v1.0
> **Parent**: [Admin Night PRD](file:///Users/minweih/Desktop/admin_night/PRD.md)
> **Goal**: Create a sense of "I'm not alone" (companionship) without the distraction of active social interaction (chat/video).

## 1. Overview

**The "Shadow Community"** addresses the isolation of doing admin tasks by providing lightweight, asynchronous, and aggregated signals of presence. It allows users to feel the momentum of the group without being interrupted by it.

### Core Philosophy
1.  **Presence over Conversation**: We want to feel people, not talk to them.
2.  **Aggregate over Individual**: Focus on the "swarm" movement rather than individual profiles.
3.  **Asynchronous Synchronicity**: Signals should work whether users are online at the exact same second or just in the same "window" (day/week).

---

## 2. Feature Areas

### A) In-Session Micro-Community (The "Live" Feel)

*Context: Active during a session.*

#### 1. Intent Wall ("Before we start")
*   **Purpose**: Immediate "I'm not alone" validation upon entry.
*   **Timing**: 3-5 seconds active during session entry/warm-up. Collapsible.
*   **UI Format: Bubble Cloud**
    *   Visual: Floating bubbles representing intent categories.
    *   Data: Category Name + Count (e.g., "Reimbursements x18", "Emails x12").
    *   Animation: Gentle floating/clustering.
*   **Interaction**: Passive viewing.

#### 2. Ambient Reactions ("Cheering together")
*   **Purpose**: Momentum sharing without distraction.
*   **Timing**:
    *   Start of session (first 10s).
    *   Micro-milestone (Task/Step completion).
    *   Wrap-up (Final 2 mins).
*   **UI Format: Corner Counter**
    *   Visual: Small, persistent but subtle counters in the corner.
    *   Types: 👏 (Cheer), 🔥 (Momentum), 🌿 (Relief).
    *   Behavior: Updates in near real-time (debounced).
    *   **Private Echo**: User sees their own click immediately; community counts update periodically.

---

### B) Explicit Community Achievements (The "Ritual")

*Context: Visible on Dashboard / Community Page. Persistent.*

#### 1. Daily Window ("Today's Swarm")
*   **Goal**: "Someone is doing admin with me today."
*   **Metrics**:
    *   **Today's Progress**: Total micro-steps cleared (e.g., "1,284 steps cleared today").
    *   **Top Categories**: "Reimbursements are trending today."
*   **Badges (Rotating)**:
    *   e.g., "Paperwork Day", "Inbox Zero Day".

#### 2. Weekly Window ("The Clear-out")
*   **Goal**: Steady ritual progress.
*   **Metrics**:
    *   **Weekly Progress Bar**: 0 → 10,000 community micro-steps.
    *   **Weekly Theme**: Auto-named by dominant category (e.g., "Email Cleanup Week").
*   **Reward**:
    *   Unlocks a shared asset (background, sound, new "deadpan" fact) when 100% is reached.

#### 3. Monthly Window ("The Reflection")
*   **Goal**: Satisfaction and "We did it".
*   **Feature: Deadpan Facts Card**
    *   Humorous, dry stats summary.
    *   *Example*: "This month, we collectively cleared 42,311 micro-steps. That is approximately 3 lifetimes of bureaucracy."

---

## 3. Data Requirements

### Privacy Principles
*   **No PII**: All community stats are aggregated.
*   **No Direct Messaging**: No user-to-user targeting.
*   **Time-Boxing**: Data is buckets by Day/Week/Month, not indefinite individual histories.

### Schema Additions (Conceptual)
*   **CommunityIntent**: Log anonymous intents (Category, Timestamp).
*   **CommunityReaction**: Log reaction events (Type, Timestamp).
*   **CommunityMilestone**: Track aggregate step counts per window.

---

## 4. User Flows

### Flow 1: Joining a Session
1.  User clicks "Start Session".
2.  **Intent Wall** appears overlaying the setup/warm-up screen ("You are joining 42 others working on...").
3.  User selects their task/intent.
4.  Session starts.

### Flow 2: Working & Reacting
1.  User completes a step.
2.  **Corner Counter** increments subtly.
3.  User clicks "🔥" button.
4.  Own count +1 immediately.
5.  Global count updates after short interval.

### Flow 3: Checking Community
1.  User visits "Community" page.
2.  Sees **Weekly Progress Bar** (e.g., 65% full).
3.  Sees **Deadpan Fact** of the month.
4.  Sees locked/unlocked rewards.

---

## 5. Success Metrics

*   **Participation Rate**: % of active sessions logging an intent.
*   **Reaction Density**: Avg reactions per active user per session.
*   **Retention**: Does viewing the Community Page correlate with higher D7 retention?
