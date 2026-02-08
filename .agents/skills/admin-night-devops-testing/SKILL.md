---
name: admin-night-devops-testing
description: Harden CI, test reliability, and deployment quality for Admin Night. Use when requests touch tests, Playwright/Vitest configs, GitHub workflows, vercel.json, or performance/stability investigation.
---

# Admin Night Devops Testing

## Purpose

Stabilize quality gates and deployment safety by applying deterministic test practices, correct CI command chains, and explicit environment handling.

## Run Order

1. Read `.agent/instructions.md`.
2. Read `.agent/agents/devops-testing.md`.
3. Read `references/devops-checklists.md`.
4. Classify issue type:
   - CI workflow failure
   - unit test regression
   - e2e flakiness/performance
   - deployment/runtime config issue
5. Implement targeted fixes with minimal blast radius.
6. Run the exact affected commands locally before handoff.

## Scope Boundaries

- Own:
  - `.github/workflows/`
  - `tests/`
  - `playwright.config.ts`
  - `vitest.config.ts`
  - `vercel.json`
  - `.env.example`
- Coordinate with:
  - frontend/backend/session lanes when root cause is feature logic

## Must-Hold Behaviors

- CI command order must mirror local development reality.
- Avoid flaky fixed-time waits in e2e; prefer event/assertion waits.
- Keep test data setup deterministic and isolated.
- Do not relax assertions only to make tests pass.

## Validation Gate

- `npm run lint`
- `npm run test` for unit-level test changes
- `npm run test:e2e -- <target-spec>` for e2e-focused changes
- `npm run build` when workflow/deploy config changes can affect build

## References

- Use `references/devops-checklists.md` for CI/test/deploy troubleshooting sequence.
