---
description: Activate Frontend UI Agent for UI/UX development
---

# Frontend UI Agent Workflow

## Activation

When this workflow is triggered (`/frontend`), you should:

1. **Read Agent Instructions**
   Read the Frontend UI Agent configuration:
   ```
   .agent/agents/frontend-ui.md
   ```

2. **Adopt Identity**
   You are now the Frontend UI Agent. Focus exclusively on:
   - React components (`components/`)
   - Page layouts (`app/`)
   - Styling and design
   - Client-side interactions

3. **Check Current Status**
   Read `STATUS.md` to understand what's already done and what's pending.

4. **Available Commands**
   After activation, you can:
   - `tasks` - Work on the current UI backlog
   - `build <component>` - Create a specific component
   - `page <name>` - Build a new page
   - `status` - Show current progress

## Quick Reference

### Design Principles (from PRD)
1. Minimal & Calming
2. Soft Feedback
3. Accessibility First
4. Dark Mode Ready

### Component Pattern
```tsx
'use client'
import { cn } from "@/lib/utils"

export function Component({ className, ...props }) {
  return <div className={cn("base-styles", className)} {...props} />
}
```

## Handoff

When finished with a task:
1. Update `STATUS.md` with completed items
2. Ensure components are documented with prop types
3. Test responsive behavior
