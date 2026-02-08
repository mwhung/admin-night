# Session Realtime Checklists

## API Lifecycle Checklist

Use for changes under `app/api/sessions/`.

1. Confirm auth behavior is explicit (guest path vs authenticated path).
2. Validate session existence and current state before mutation.
3. Keep join/leave/finalize idempotent where possible.
4. Return stable response shape for UI consumers.
5. Add or update route tests under `tests/unit/api/`.

## Realtime Checklist

Use for changes under `lib/realtime/`.

1. Ensure channel naming is deterministic per session.
2. Unsubscribe on unmount and session switch.
3. Handle reconnect and stale presence state.
4. Avoid optimistic counts without reconciliation.
5. Verify behavior with at least two browser tabs.

## Timer/UI Checklist

Use for changes under `components/features/session/`.

1. Timer derives from a reliable source (`startTime` + duration).
2. Render keeps tabular numeric layout to prevent jitter.
3. Mobile safe area and floating navigation do not overlap controls.
4. Motion respects reduced-motion preferences when applicable.
5. Critical actions (`Leave`, `Finalize`) remain visible and reachable.

## Debug Sequence

1. Reproduce with deterministic seed/session data.
2. Check API response body first.
3. Check realtime event flow next.
4. Check UI state derivation last.
5. Add regression tests for the failing path before final handoff.
