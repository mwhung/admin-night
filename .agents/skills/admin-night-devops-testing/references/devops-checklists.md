# DevOps Testing Checklists

## CI Workflow Checklist

Use for `.github/workflows/*`.

1. Confirm workflow uses existing `package.json` scripts.
2. Keep install step deterministic (`npm ci`).
3. Keep cache keys stable and scoped.
4. Fail early on lint/type/build before long test suites.
5. Verify secret-dependent steps have clear fallbacks or guards.

## Unit Test Reliability Checklist

Use for `tests/unit/*` and `vitest.config.ts`.

1. Keep each test isolated from global shared state.
2. Mock network/database boundaries explicitly.
3. Assert behavior, not implementation details.
4. Prefer deterministic fixtures over dynamic timestamps/random IDs.
5. Remove flaky sleeps/timeouts and use controlled fake timers when needed.

## E2E Stability Checklist

Use for `tests/e2e/*` and `playwright.config.ts`.

1. Replace fixed `waitForTimeout` with state-based waits.
2. Keep selectors role-based where possible.
3. Minimize cross-test coupling through unique test data.
4. Capture trace/screenshot only when needed to keep runtime bounded.
5. Re-run the affected spec at least once to confirm flake reduction.

## Deployment Checklist

Use for `vercel.json`, env handling, build-time behavior.

1. Confirm security headers remain explicit.
2. Confirm caching policy changes are intentional.
3. Keep required env vars documented in `.env.example`.
4. Validate `npm run build` locally after deployment config changes.
5. Note operational risk in handoff if production-only behavior is untested.

## Debug Sequence

1. Reproduce exact failing command locally.
2. Narrow failure to lint/type/build/test/deploy stage.
3. Fix the smallest root cause first.
4. Re-run only affected stage, then full minimal gate.
5. Report executed commands and any skipped checks.
