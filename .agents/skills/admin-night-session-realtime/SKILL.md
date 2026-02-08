---
name: admin-night-session-realtime
description: Implement and debug Admin Night session lifecycle, realtime presence, participant tracking, and timer behavior. Use when requests touch app/api/sessions, lib/realtime, components/features/session, or session-related e2e flows.
---

# Admin Night Session Realtime

## Purpose

Deliver stable session behavior from API to UI, including join/leave/finalize flow, realtime participant updates, and timer consistency.

## Run Order

1. Read `.agent/instructions.md`.
2. Read `.agent/agents/session-realtime.md` for domain expectations.
3. Read `references/session-checklists.md`.
4. Identify impacted layer:
   - API lifecycle
   - Realtime subscription/presence
   - Session UI/timer experience
5. Implement the smallest safe change.
6. Run validation commands before handoff.

## Scope Boundaries

- Own:
  - `app/api/sessions/`
  - `lib/realtime/`
  - `components/features/session/`
- Coordinate with:
  - backend lane for schema/auth changes
  - frontend lane for broad visual refactors
  - devops lane for flaky e2e stabilization

## Must-Hold Behaviors

- Session state transitions must remain coherent (`SCHEDULED`, `ACTIVE`, `COMPLETED`).
- Participant count must handle rapid join/leave without stale UI.
- Timer display must remain stable on tab switches and reconnect.
- Mobile session actions must not overlap floating navigation.

## Validation Gate

- `npm run lint`
- `npx tsc --noEmit` when changing shared types/contracts
- `npm run test:e2e -- tests/e2e/session_flow.spec.ts` for flow changes
- Run related `tests/unit/api/session-*.test.ts` for route behavior changes

## References

- Use `references/session-checklists.md` for per-task checklists and debugging sequence.
