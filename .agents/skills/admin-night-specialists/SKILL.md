---
name: admin-night-specialists
description: Route and execute coding work in the Admin Night repository across five specialist lanes (frontend UI, backend API, session realtime, AI integration, and devops/testing). Use when tasks involve implementation, debugging, refactoring, tests, or review for files in app/, components/, lib/, prisma/, tests/, or .github/workflows.
---

# Admin Night Specialists

## Purpose

Deliver scoped changes by selecting the correct specialist lane, loading only the needed context, applying project constraints, and running the right validation commands.

## Start Every Task

1. Read `.agent/instructions.md`.
2. Read `STATUS.md` if the request affects backlog/sprint progress.
3. Classify the request into one primary lane: `frontend`, `backend`, `session`, `ai`, or `devops`.
4. Read lane guidance in `references/domain-playbooks.md`.
5. Implement the change in lane-owned files first.
6. Run lane validation before final handoff.

## Select The Lane

- `frontend`: UI structure, interactions, accessibility, responsive behavior.
  Trigger files: `app/(app)/`, `app/(auth)/`, `components/`, `app/styles/`.
- `backend`: API handlers, auth checks, Prisma queries, data contracts.
  Trigger files: `app/api/`, `lib/actions.ts`, `lib/contracts/`, `prisma/`.
- `session`: session lifecycle, timers, presence, participant mechanics.
  Trigger files: `app/api/sessions/`, `lib/realtime/`, `components/features/session/`.
- `ai`: prompt engineering, model clients, parsing AI outputs, AI routes.
  Trigger files: `app/api/ai/`, `lib/ai/`, `lib/prompts/`.
- `devops`: test stability, CI workflows, deployment, performance checks.
  Trigger files: `tests/`, `.github/workflows/`, `playwright.config.ts`, `vercel.json`.

## Delegate To Second-Layer Skills

- For session-heavy requests, invoke `$admin-night-session-realtime`.
- For CI/test/deploy-heavy requests, invoke `$admin-night-devops-testing`.
- Keep `$admin-night-specialists` as the orchestrator for routing and cross-lane handoff.

## Apply Project Constraints

- Communicate with users in Traditional Chinese.
- Keep code, comments, and technical docs in English.
- Reuse existing UI primitives before creating new components.
- Maintain Therapeutic UI direction: calm, clear, low visual noise.
- Avoid `any` in API responses and database-facing logic.
- Use Prisma for data access and Supabase SSR utilities for auth.

## Validate Before Handoff

- `frontend`: run `npm run lint` and targeted UI tests.
- `backend`: run `npm run lint`, `npx tsc --noEmit`, and route-related unit tests.
- `session`: run `npm run lint`, `npx tsc --noEmit`, and session e2e tests when behavior changes.
- `ai`: run `npm run lint` and AI-related unit tests.
- `devops`: run edited pipeline commands locally, then `npm run lint`.

## References

- Read `references/domain-playbooks.md` for lane-specific checklists and commands.
- Read `.agent/agents/*.md` for deeper role conventions.
- Read `.agent/workflows/*.md` when slash-style workflow behavior is requested.
