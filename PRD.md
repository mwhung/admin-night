# Admin Night — Product Requirement Document (PRD)

> Version: v0.1 (MVP)
>
> Product Type: Web App (PWA‑ready)
>
> Product Goal: Help users start and complete life admin tasks through shared time, light social presence, and AI‑assisted task clarification.

## Operation Modes

1. **Guest Mode (Anonymous)**
   - No registration/login required.
   - Can create and join sessions in real time.
   - Can view community information.
   - No task recommendations, personal history, task drawer, or other cumulative features.
   - Records are not persisted across devices or sessions.

2. **Registered Mode (User)**
   - Full features enabled.
   - Personalized task recommendations and task drawer.
   - Comprehensive history and insights.
   - Data persists across all devices.

## Account & Authentication UI (2026 Trends)

- **Banner/Header**: Top-right corner provides "Sign In", "Sign Out", and "Register" options.
- **Settings Integration**: Dedicated "Account" section for managing profile, security, and data transparency.
- **Design Philosophy**: 2026 Therapeutic UI - minimalist, adaptive, and privacy-focused.

---

## 1. Product Overview

### 1.1 Product Vision
Admin Night creates a **shared ritual for life maintenance**.

Instead of pushing users to be more productive, the product focuses on:
- Reducing mental load
- Lowering task‑starting friction
- Providing quiet social accountability

> *“You don’t need to do everything — you just need to stop carrying it.”*

---

### 1.2 One‑Sentence Value Proposition

> **A lightweight social productivity app that helps people finally face and finish admin tasks — together, at the same time, with just enough AI help.**

---

## 2. Problem Definition

### 2.1 Target Problems

Admin tasks are:
- Vague and emotionally heavy
- Easy to postpone
- Poorly handled by traditional to‑do apps

Users often:
- Know *that* they need to do something
- But not *how to start*
- And avoid doing it alone

---

### 2.2 Why Existing Solutions Fail

| Solution | Limitation |
|-------|-----------|
| To‑do apps | Assume task clarity and motivation |
| Calendar blocking | Too rigid, no emotional support |
| Focus apps | Designed for deep work, not admin |

---

## 3. Target Users

### 3.1 Primary Users
- Knowledge workers
- Designers, engineers, researchers
- People with high cognitive load

### 3.2 Secondary Users
- Freelancers
- Caregivers
- Users with mild executive dysfunction

---

## 4. Core Use Case

> **“I have several annoying life tasks I’ve been avoiding. There’s an Admin Night session tonight. I’ll join and clear at least one thing.”**

---

## 5. Product Principles

1. **Clarity over completeness**  
   The goal is to clarify the first step, not plan everything.

2. **Presence over interaction**  
   Users feel others, without needing to talk.

3. **Relief over achievement**  
   Completion should feel like release, not performance.

4. **Ritual over optimization**  
   Fixed time, fixed mode, predictable flow.

---

## 6. Functional Requirements (MVP)

### 6.1 Admin Inbox (Deferred to Post‑MVP)

**Description**  
A low‑friction inbox to capture admin‑type tasks without clarification.

**Status: Descope for MVP (Confirmed)**
- Functionality absorbed by **6.3 Admin Mode UI** during the "Setup" phase.
- Users capture tasks directly when starting a session.
- Captured tasks for registered users will be stored in a "Task Drawer" (conceptual) to be automatically surfaced in the next session.
- Outside of active sessions, there is currently no separate entry point for task capture in MVP.

---

### 6.2 Admin Night Sessions

**Description**  
Shared time blocks where users work on admin tasks together.

**Requirements**
- Real-time create / join / leave session flow (Guest + Registered)
- Show live participant count
- Session timer (custom 15–60 min)

**Future Direction**
- Add "Community Day" style fixed shared windows once participation patterns are stable.

**Non‑Goals**
- Chat
- Video or audio between users

---

### 6.3 Admin Mode UI

**Description**  
A distraction‑reduced interface activated during sessions.

**Requirements**
- Minimal color palette
- Large timer
- Current task focus view
- Optional ambient sound toggle

**Layout System Standard (2026)**
- Session layout spacing must use semantic layout tokens, not page-local magic numbers.
- Sticky banner offset and safe-area handling must be resolved through runtime + derived tokens.
- Reference implementation: `docs/design/layout-token-architecture.md`

---

### 6.4 AI Task Clarification (Future Phase)

**Description**  
AI suggests a small set of concrete first steps for vague tasks.

**Status: Deferred**
- Will be implemented in the next major update.
- Focus for MVP is on the core ritual and basic task management.

---

### 6.5 Task States

Tasks must support the following states:

| State | Meaning |
|----|----|
| Unclarified | Captured but vague |
| Clarified | First step defined |
| In Progress | Actively working |
| Resolved | No longer needs attention |
| Recurring | Returns later |

---

### 6.6 Completion Feedback

**Description**  
Provide emotional closure when a task or step is completed.

**Requirements**
- Subtle visual transition
- Optional soft sound / haptic
- Short reassuring message (non‑celebratory)

Example copy:
> “You don’t need to think about this for now.”

---

### 6.7 User Preferences & Settings

**Description**  
Provide users with granular control over their therapeutic environment and data.

**Requirements**
- **Ritual & Session**:
    - Default Session Duration (25/45/60 min)
    - Ritual Reminders toggle
- **Therapeutic Environment**:
    - Focus Aesthetic (Light/Dark/Adaptive)
    - Ambient Soundscapes toggle
    - Task Sounds (auditory feedback) toggle
- **Privacy & Presence**:
    - Presence Visibility (Public/Anonymous/Private)
    - History Data Detail (Basic/Detailed/Deep)
- **Data Sovereignty**:
    - Export Footprint: Download all personal data (tasks, preferences) in JSON format.
    - Purge All History: Irreversibly delete all task history and session participation data.

---

## 7. Non‑Functional Requirements

### 7.1 Performance
- Session join latency target (production): < 2 seconds
- Session join smoke benchmark (development/E2E): < 6 seconds
- AI response < 5 seconds (acceptable)

### 7.2 Accessibility
- Keyboard navigable
- Screen reader friendly
- Color contrast compliant

### 7.3 Privacy
- No public profiles
- No task sharing between users
- Aggregate numbers only (e.g. participant count)

---

## 8. Out of Scope (MVP)

- Mobile native apps
- Deep third‑party integrations (Gmail, Slack)
- Gamification (points, streaks, leaderboards)
- Public or private chat
- Ritual Reminders (Web/Mobile notifications)

---

## 9. Success Metrics (MVP)

### 9.1 Activation Metrics
- % of users who join at least one Admin Night

### 9.2 Engagement Metrics
- Avg tasks resolved per session
- Session completion rate

### 9.3 Retention Signals
- Weekly return rate
- Re‑joining shared sessions week over week

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|----|-----------|
| Low session attendance | Introduce Community Day fixed shared windows after usage patterns are observed |
| AI suggestions feel wrong | Allow easy skip / edit |
| Users expect chat | Clear positioning & copy |

---

## 11. Future Considerations (Post‑MVP)

### 11.1 Light Gamification (Relief-focused)
- **Progress Particles**: Soft “light points” visual feedback upon step completion.
- **Clear 3**: Minimum win condition (completing 3 steps in a session) to reduce pressure and provide a sense of "enough for today."
- **Community Progress Pool**: Aggregate display of total steps/points completed by all users in the session (no personal data revealed).
- **Weekly Insight Cards**: Personal and community summary cards showing ritual consistency and progress.

### 11.2 Atmosphere & Tone
- **Time-box Themes**: Switchable timer skins (e.g., Tea Timer, Hourglass) that adjust visuals, microcopy, and ambient soundscapes.
- **Visual-Writing Mode Linkage**: Link the visual theme to the microcopy's personality.
    - **Light Mode (Healing Style)**: Accompanied by therapeutic, reassuring, and warm text.
    - **Dark Mode (Dead Humor Style)**: Accompanied by deadpan, factual, and dryly humorous text (e.g., "Filed.", "Civilization continues.").

### 11.3 Extended Features
- iOS app for ritual reminders.
- Admin history & mental load insights.
- **Task Drawer:** Automatically carry over unfinished tasks from the previous session to the next "Setup" screen.
- **AI Clarification:** Integrated agent to help break down overwhelming tasks during the setup phase.
- Light integrations (email forwarding, browser extension).

---

## 12. Open Questions

- What should the default session length be within the 15–60 min range?
- When should Community Day fixed shared windows launch, and how many per week?
- Should users pick a task before joining?

---

**End of PRD**
