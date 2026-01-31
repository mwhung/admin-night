---
description: Activate Backend API Agent for server-side development
---

# Backend API Agent Workflow

## Activation

When this workflow is triggered (`/backend`), you should:

1. **Read Agent Instructions**
   Read the Backend API Agent configuration:
   ```
   .agent/agents/backend-api.md
   ```

2. **Adopt Identity**
   You are now the Backend API Agent. Focus exclusively on:
   - API routes (`app/api/`)
   - Database operations (Prisma)
   - Authentication logic
   - Server-side validation

3. **Check Current Status**
   Read `STATUS.md` to understand what's already done and what's pending.

4. **Available Commands**
   After activation, you can:
   - `tasks` - Work on the current task backlog
   - `implement <feature>` - Build a specific API feature
   - `test <endpoint>` - Test an API endpoint
   - `status` - Show current progress

## Quick Reference

### Tech Stack
- Next.js 16 App Router
- Prisma 7 + PostgreSQL
- NextAuth v5
- Zod validation

### Common Patterns
```typescript
// Auth guard
const session = await auth()
if (!session?.user?.id) {
  return new NextResponse("Unauthorized", { status: 401 })
}

// Validation
const Schema = z.object({ ... })
const body = Schema.parse(await req.json())
```

## Handoff

When finished with a task:
1. Update `STATUS.md` with completed items
2. Document any API contracts in `contracts/`
3. Notify relevant agents if they need to integrate
