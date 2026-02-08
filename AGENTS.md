# Admin Night Agent Instructions

## Project Context

- Product: Admin Night (shared admin-task sessions with calm social accountability).
- Stack: Next.js 16 App Router, React 19, Tailwind CSS 4, Prisma 7, Supabase Auth/Realtime, Vitest, Playwright.

## Core Rules

- Respond to users in Traditional Chinese (`zh-TW`).
- Keep code, tests, and technical documentation in English.
- Reuse existing components and hooks before adding new files.
- Keep UI in the "Therapeutic UI" style: clear hierarchy, low noise, subtle motion.
- Use Prisma for all database access.
- Keep authentication on Supabase SSR helpers in `lib/supabase/`.
- Avoid `any` in API contracts and database-facing logic.

## Specialist Routing

- Use skill `$admin-night-specialists` for coding, debugging, refactor, testing, and review tasks in this repository.
- Choose one primary specialist lane first:
  - `frontend`: `app/(app)/`, `app/(auth)/`, `components/`, `app/styles/`
  - `backend`: `app/api/`, `lib/actions.ts`, `lib/contracts/`, `prisma/`
  - `session`: `app/api/sessions/`, `lib/realtime/`, `components/features/session/`
  - `ai`: `app/api/ai/`, `lib/ai/`, `lib/prompts/`
  - `devops`: `.github/workflows/`, `tests/`, `playwright.config.ts`, `vitest.config.ts`, `vercel.json`
- For high-focus lanes, call dedicated skills:
  - Use `$admin-night-session-realtime` for session lifecycle, timers, and realtime presence.
  - Use `$admin-night-devops-testing` for CI, test stability, and deployment hardening.

## Done Criteria

1. Run focused validation commands for changed areas.
2. Run `npm run lint` for cross-domain changes.
3. Run `npx tsc --noEmit` for type-sensitive updates.
4. Run related unit/e2e tests when behavior changes.
5. Update `STATUS.md` or `BACKLOG.md` when project status/backlog changes.

## Legacy References

- Keep using `.agent/agents/*.md` and `.agent/workflows/*.md` as detailed references until fully migrated.
