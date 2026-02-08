# Domain Playbooks

Use this file after selecting a primary lane.

## Frontend Lane

- Focus: page/layout composition, accessibility, responsive behavior, component UX.
- Primary files: `app/(app)/`, `app/(auth)/`, `components/`, `app/styles/`.
- Mandatory checks:
  - Reuse existing primitives in `components/ui/`.
  - Preserve Therapeutic UI principles from `PRD.md`.
  - Validate keyboard and screen-reader semantics for changed UI.
- Validation:
  - `npm run lint`
  - Targeted tests under `tests/e2e/` or `tests/unit/` related to changed flows

## Backend Lane

- Focus: route correctness, auth guards, validation, Prisma operations.
- Primary files: `app/api/`, `lib/actions.ts`, `lib/contracts/`, `prisma/`.
- Mandatory checks:
  - Guard authenticated routes with Supabase user checks.
  - Validate request payloads with Zod.
  - Keep response shapes stable for UI consumers.
- Validation:
  - `npm run lint`
  - `npx tsc --noEmit`
  - Route-focused tests in `tests/unit/api/`

## Session Lane

- Focus: shared session lifecycle, participant presence, timer behavior.
- Primary files: `app/api/sessions/`, `lib/realtime/`, `components/features/session/`.
- Preferred skill: `$admin-night-session-realtime`.
- Mandatory checks:
  - Ensure join/leave/finalize behavior remains consistent.
  - Keep client timer logic synchronized with server state.
  - Guard against regressions in mobile session layouts.
- Validation:
  - `npm run lint`
  - `npx tsc --noEmit`
  - `npm run test:e2e -- tests/e2e/session_flow.spec.ts` when session behavior changes

## AI Lane

- Focus: task clarification prompts, model integration, parser reliability.
- Primary files: `app/api/ai/`, `lib/ai/`, `lib/prompts/`.
- Mandatory checks:
  - Keep output concise and structured for UI rendering.
  - Handle model errors and malformed output safely.
  - Preserve deterministic parsing in `lib/ai/parser.ts`.
- Validation:
  - `npm run lint`
  - `npm run test -- tests/unit/ai`

## DevOps Lane

- Focus: CI reliability, test stability, deployment hardening, perf checks.
- Primary files: `.github/workflows/`, `tests/`, `playwright.config.ts`, `vercel.json`.
- Preferred skill: `$admin-night-devops-testing`.
- Mandatory checks:
  - Keep CI commands aligned with `package.json` scripts.
  - Avoid flaky waits in Playwright tests.
  - Ensure security/performance config changes are explicit.
- Validation:
  - `npm run lint`
  - Run the exact changed CI/test commands locally when possible

## Cross-Lane Handoff

1. Keep change scope explicit in final summary.
2. List tests actually executed and highlight any skipped checks.
3. Update `STATUS.md` or `BACKLOG.md` when roadmap status changed.
