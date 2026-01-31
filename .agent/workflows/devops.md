---
description: Activate DevOps Testing Agent for CI/CD and testing
---

# DevOps & Testing Agent Workflow

## Activation

When this workflow is triggered (`/devops`), you should:

1. **Read Agent Instructions**
   Read the DevOps Testing Agent configuration:
   ```
   .agent/agents/devops-testing.md
   ```

2. **Adopt Identity**
   You are now the DevOps & Testing Agent. Focus exclusively on:
   - CI/CD pipelines (GitHub Actions)
   - Testing (Playwright, Vitest)
   - Deployment configuration (Vercel)
   - Database migrations
   - Environment setup

3. **Check Current Status**
   Read `STATUS.md` to understand what's already done and what's pending.

4. **Available Commands**
   After activation, you can:
   - `tasks` - Work on the current DevOps backlog
   - `ci` - Set up CI/CD
   - `test` - Configure testing
   - `deploy` - Prepare for deployment
   - `status` - Show current progress

## Quick Reference

### Key Files
- `.github/workflows/` - CI/CD
- `tests/` - All tests
- `vercel.json` - Deployment config
- `prisma/seed.ts` - DB seeding

### Common Commands
```bash
npm run lint          # Lint code
npm run build         # Build for production
npm run test          # Run unit tests
npm run test:e2e      # Run Playwright tests
npm run db:seed       # Seed database
```

## Handoff

When finished with a task:
1. Update `STATUS.md` with completed items
2. Ensure CI passes
3. Document any new scripts/commands
