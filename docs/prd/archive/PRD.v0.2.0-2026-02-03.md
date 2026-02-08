# Admin Night — Product Requirement Document (PRD)

> Version: v0.2 (MVP) — 02-03 update
>
> Product Type: Web App (PWA‑ready)
>
> Product Goal: Help users start and complete life admin tasks through shared time, light social presence, and AI‑assisted task clarification.

### Version Notes
- **v0.1 (MVP baseline)**: Initial PRD.
- **v0.2 (02-03 update)**: Add **light gamification** that stays aligned with the healing/relief tone:
  - Progress particles (soft “light points”) on step completion
  - **Clear 3** (minimum success threshold per session)
  - Theme-based time-box timer (e.g., Tea timer / Hourglass)
  - Social “we’re in this together” via **community progress pool** (aggregate only)
  - Insight & History weekly cards + **deadpan admin humor** (low-frequency footnotes, optional)

### Changelog

#### v0.2 — 02-03 update
- Added **light gamification** features aligned with “relief over achievement”:
  - Progress particles (“light points”) on step completion
  - **Clear 3** (minimum win condition per session)
  - Theme-based time-box timer (Tea timer / Hourglass)
  - Social presence upgrade: **community progress pool** (aggregate only)
  - Insight & History: weekly Community Ledger + Personal Report cards
  - **Deadpan admin humor** footnotes (10–20% frequency, optional setting)
- Updated relevant sections:
  - **6.2 / 6.3 / 6.6** updated to reflect themes, particles, and community pool
  - **7.3 Privacy** clarified aggregate-only treatment for community metrics
  - **8 Out of Scope** refined to exclude **heavy** gamification (points economy, streaks, leaderboards, penalties) while keeping light gamification in-scope
  - **9 Success Metrics** expanded with steps/session and Clear 3 rate

#### v0.1 — MVP baseline
- Initial PRD (shared ritual + light social presence + AI-assisted task clarification)


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
- Show **community progress pool** (aggregate steps/points during the session window)
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
- **Theme-based timer style** (e.g., Tea timer / Hourglass) affects visuals & copy (no user customization in MVP)
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
- **Progress particles**: add 1–3 soft “light points” when a step is completed (low-stimulus)
- Optional soft sound / haptic
- Short reassuring message (non‑celebratory)

Example copy:
> “You don’t need to think about this for now.”

---

### 6.7 Clear 3 (Minimum Success Threshold)

**Description**  
A session-level “minimum win condition” to reduce pressure and increase completion. A user “clears” the night after completing **3 steps** (not necessarily 3 tasks).

**Requirements**
- Track completed steps within the active session
- Show a simple 0/3 → 1/3 → 2/3 → **Clear** indicator
- On Clear:
  - Show a gentle closure message (“You’ve done enough for tonight.”)
  - Provide an optional CTA to continue (never required)

**Non‑Goals**
- Streaks or penalties if users don’t reach Clear 3


### 6.8 Time-box Themes (Timer Skins)

**Description**  
Offer a small set of timer “themes” that change visual style + microcopy (and optional ambient sound) to help users enter the right mood, without increasing workflow complexity.

**Requirements**
- Provide **2 themes** at MVP launch:
  - Tea timer
  - Hourglass
- Theme affects:
  - Timer visuals / background
  - Session microcopy (short, calm)
  - Optional ambient sound profile (must be toggleable)
- Theme selection persists per user (default to last used)

**Constraints**
- No user-created themes in MVP
- Themes should remain low-stimulus (aligned with “Relief over achievement”)


### 6.9 Social Presence — Community Progress Pool

**Description**  
Strengthen “we’re doing this together” without exposing any private task content.

**Requirements**
- In-session display:
  - Live participant count
  - A shared aggregate counter (e.g., “Tonight we added **{N}** light points” or “Completed **{N}** steps together”)
- Aggregate only:
  - No usernames
  - No per-user contribution breakdown
  - No leaderboard


### 6.10 Insight & History (Weekly Cards)

**Description**  
Provide lightweight ownership via personal and community summaries. This supports reflection without performance pressure.

**Requirements**
- **Community Ledger Card (weekly)**
  - Community total steps (or points)
  - Community total sessions
  - (Optional) Community Clear 3 count
- **Personal Report Card (weekly)**
  - Personal total steps (or points)
  - Personal total sessions
  - (Optional) Personal Clear 3 count


### 6.11 Deadpan Admin Humor (Low-frequency Footnotes)

**Description**  
Occasional deadpan footnotes that “look directly at admin boredom” in a calm, factual tone—only in History/Insight surfaces.

**Requirements**
- Show a single short footnote under weekly cards at **10–20% frequency** (default 15%)
- Footnotes are **optional** (user can disable in settings)
- Tone rules:
  - Never shame the user
  - No guilt language
  - No sarcasm about personal failure

Example footnotes:
- “Filed.”
- “Civilization continues.”
- “These numbers are real.”


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
- Aggregate numbers only (e.g. participant count, community progress pool, weekly ledger totals)

---

## 8. Out of Scope (MVP)

- Mobile native apps
- Deep third‑party integrations (Gmail, Slack)
- **Heavy gamification** (points economy, streaks, leaderboards, penalties). Light gamification is in-scope (particles, Clear 3, themes, aggregate community progress, weekly cards).
- Public or private chat

---

## 9. Success Metrics (MVP)

### 9.1 Activation Metrics
- % of users who join at least one Admin Night

### 9.2 Engagement Metrics
- Avg tasks resolved per session
- Avg steps completed per session
- Session completion rate
- Clear 3 rate (per session)

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
- Admin history & mental load insights (deeper breakdowns, trends)
- Expanded ritual elements (lightweight start/end prompts, optional surprise notes)
- Light integrations (email forwarding, browser extension)

---

## 12. Open Questions

- Ideal session length: 25 vs 45 min?
- How many weekly slots at launch?
- Should users pick a task before joining?

---

**End of PRD**

