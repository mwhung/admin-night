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

## Implementation Checklist

- Add/update token definitions in `app/styles/tokens.css`.
- If header UI changes, verify `site-header.tsx` still updates `--layout-header-height`.
- Update both page and loading skeleton containers to the same token contract.
- Run:
  - `npm run lint`
  - `npx tsc --noEmit`
