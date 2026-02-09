# Layout Token Architecture (2026)

## Purpose

Define a single, system-level contract for vertical layout spacing between the sticky site banner and page content, while keeping safe-area handling and viewport sizing consistent across session surfaces.

## Token Layers

1. Primitive tokens
- Source of truth for raw dimensions (spacing scale, baseline sizes).

2. Semantic layout tokens
- Human-meaningful variables used by pages/components.
- Example: `--layout-banner-content-gap`.

3. Runtime tokens
- Values measured from real UI geometry at runtime.
- Example: `--layout-header-height` measured by `ResizeObserver`.

4. Derived tokens
- Computed formulas combining semantic + runtime tokens.
- Example: `--layout-session-main-height`.

## Current Contract

Defined in `/Users/minweih/Desktop/admin_night/app/styles/tokens.css`:

- `--layout-safe-top`, `--layout-safe-right`, `--layout-safe-bottom`, `--layout-safe-left`
- `--layout-header-height`
- `--layout-banner-content-gap`
- `--layout-floating-nav-height`
- `--layout-main-bottom-reserve`
- `--layout-session-main-height`
- `--layout-scroll-padding-top`

## Runtime Measurement

`/Users/minweih/Desktop/admin_night/components/layout/navigation/site-header.tsx` updates `--layout-header-height` on mount and resize using `ResizeObserver`.

Rules:
- Never hardcode header height in page-level `calc(...)`.
- Keep runtime measurement in one place (the site banner owner component).
- Use token fallback defaults in CSS for first paint.

## Page Usage Rules

1. Use semantic tokens, not magic numbers.
- Preferred: `pt-[var(--layout-banner-content-gap)]`
- Avoid: `pt-3` as page-specific banner offset.

2. Use derived height token for session screens.
- Preferred: `h-[var(--layout-session-main-height)]`
- Avoid: `h-[calc(100dvh-11.25rem)]` or similar page-local formulas.

3. Keep loading and loaded states aligned.
- Session loading pages must use the same layout tokens as active session pages.

4. Keep sticky-header anchor behavior predictable.
- Global `scroll-padding-top` should use `--layout-scroll-padding-top`.

## 2026-02-09 UI Refinements

### Typography Floor

Scope:
- Global micro typography used in session, community, auth placeholders, and shared UI badges.

Contract:
- Minimum rendered font size is `12px` (`0.75rem`).
- Use `text-xs` as the smallest Tailwind text utility.
- Do not introduce `text-[9px]`, `text-[10px]`, or `text-[11px]`.
- Utility classes `type-section-label` and `type-caption` are standardized at `0.75rem`.
- Dynamic font sizing must clamp to a lower bound of `12px` (for example via `Math.max(12, computedSize)`).

Primary implementation files:
- `/Users/minweih/Desktop/admin_night/app/styles/utilities.css`
- `/Users/minweih/Desktop/admin_night/components/ui/badge.tsx`
- `/Users/minweih/Desktop/admin_night/components/features/community/themes-of-the-night.tsx`

### Workbench Hero Rhythm (History / Community / Settings)

Scope:
- `/Users/minweih/Desktop/admin_night/app/(app)/history/page.tsx`
- `/Users/minweih/Desktop/admin_night/app/(app)/community/page.tsx`
- `/Users/minweih/Desktop/admin_night/app/(app)/settings/page.tsx`

Contract:
- Keep header-to-title offset fixed at `pt-8`.
- Keep title/subtitle stack density compact (`space-y-2` or `gap-2`).
- Increase subtitle-to-content spacing to `10` scale units for better section separation:
  - History/Community: `pb-10`
  - Settings: `mb-10`

### Hero Label Simplification

Scope:
- `/Users/minweih/Desktop/admin_night/app/(app)/history/page.tsx`
- `/Users/minweih/Desktop/admin_night/app/(app)/community/page.tsx`

Change:
- Removed top helper labels `Personal Workbench` and `Community Workbench`.
- Keep the main page title + subtitle as the only hero text to reduce visual noise.

### Workbench Surface Contract (History / Community)

Scope:
- `/Users/minweih/Desktop/admin_night/app/(app)/history/page.tsx`
- `/Users/minweih/Desktop/admin_night/app/(app)/community/page.tsx`
- `/Users/minweih/Desktop/admin_night/components/ui/card-layouts.ts`
- `/Users/minweih/Desktop/admin_night/app/styles/tokens.css`
- `/Users/minweih/Desktop/admin_night/app/styles/utilities.css`

Contract:
- Replace bento-like compositions with a two-column workbench surface:
  - `lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]`.
- Keep the outer frame as a 1px gradient stroke from top-left to bottom-right, fading into `--background` at the tail.
- Keep the main shell frosted and low-noise:
  - Use `cardLayout.workbenchShellFrosted`.
  - Light mode: no drop shadow.
  - Dark mode: subtle shadow is allowed for depth separation.
- Section structure must be consistent:
  - `Title + subtitle` outside.
  - `content` inside exactly one card layer.
  - Avoid nested "card inside card" wrappers unless functionally required (for example, data scrollers or embedded sub-panels).
- Use workbench spacing tokens only (no page-local magic numbers):
  - `--space-workbench-shell-pad`
  - `--space-workbench-grid-gap`
  - `--space-workbench-section-gap`
  - `--space-workbench-title-gap`
  - `--space-workbench-card-pad-x/y`
  - `--space-workbench-card-tight-pad-x/y`
- Card tone hierarchy must stay coherent across light/dark modes:
  - Primary: `workbenchPrimary`
  - Secondary: `workbenchSecondary`
  - Rail/context: `workbenchRail`
  - Embedded strip: `metricStrip`
- Typography must use shared utilities for consistency:
  - `type-block-title`
  - `type-card-value`
  - `type-card-support`

Implementation notes:
- Outer gradient frame lives at page level (wrapper around `workbenchShellFrosted`).
- Shared rhythm classes:
  - `workbench-pad-shell`
  - `workbench-gap-grid`
  - `workbench-gap-section`
  - `workbench-gap-title`
  - `workbench-pad-card`
  - `workbench-pad-card-tight`

## Implementation Checklist

- Add/update token definitions in `app/styles/tokens.css`.
- If header UI changes, verify `site-header.tsx` still updates `--layout-header-height`.
- Update both page and loading skeleton containers to the same token contract.
- Run:
  - `npm run lint`
  - `npx tsc --noEmit`
