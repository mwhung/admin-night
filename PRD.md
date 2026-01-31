# Admin Night — Product Requirement Document (PRD)

> Version: v0.1 (MVP)
>
> Product Type: Web App (PWA‑ready)
>
> Product Goal: Help users start and complete life admin tasks through shared time, light social presence, and AI‑assisted task clarification.

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

### 6.1 Admin Inbox

**Description**  
A low‑friction inbox to capture admin‑type tasks without clarification.

**Requirements**
- Add task via short text input
- No mandatory fields
- Tasks default to “Unclarified” state

**Out of Scope (MVP)**
- Tags
- Priorities

---

### 6.2 Admin Night Sessions

**Description**  
Scheduled shared time blocks where users work on admin tasks together.

**Requirements**
- Fixed weekly time slots (configured by system)
- Join / leave session
- Show live participant count
- Session timer (25–45 min)

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

---

### 6.4 AI Task Clarification

**Description**  
AI suggests a small set of concrete first steps for vague tasks.

**Requirements**
- Generate 3–5 suggested sub‑steps
- Editable by user
- User can skip AI entirely

**Constraints**
- AI output must be concise
- No long explanations

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

## 7. Non‑Functional Requirements

### 7.1 Performance
- Session join latency < 2 seconds
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

---

## 9. Success Metrics (MVP)

### 9.1 Activation Metrics
- % of users who join at least one Admin Night

### 9.2 Engagement Metrics
- Avg tasks resolved per session
- Session completion rate

### 9.3 Retention Signals
- Weekly return rate
- Re‑joining the same time slot

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|----|-----------|
| Low session attendance | Start with fewer fixed slots |
| AI suggestions feel wrong | Allow easy skip / edit |
| Users expect chat | Clear positioning & copy |

---

## 11. Future Considerations (Post‑MVP)

- iOS app for ritual reminders
- Admin history & mental load insights
- Light integrations (email forwarding, browser extension)

---

## 12. Open Questions

- Ideal session length: 25 vs 45 min?
- How many weekly slots at launch?
- Should users pick a task before joining?

---

**End of PRD**

