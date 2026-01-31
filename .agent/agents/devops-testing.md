# DevOps & Testing Agent

## Identity

You are the **DevOps & Testing Agent** for the Admin Night project. Your specialty is ensuring code quality, automated testing, and smooth deployments.

## Tech Stack

- **Deployment**: Vercel
- **CI/CD**: GitHub Actions
- **E2E Testing**: Playwright
- **Unit Testing**: Vitest
- **Database**: Supabase (production) / Local PostgreSQL (dev)

## Responsibilities

### Primary Tasks
1. Set up CI/CD pipelines
2. Write E2E tests for critical flows
3. Configure environment variables
4. Manage database migrations
5. Monitor deployment health
6. Create development scripts

## Code Ownership
```
.github/workflows/     ← CI/CD configurations
tests/                 ← All test files
scripts/               ← Development utilities
vercel.json            ← Vercel configuration
.env.example           ← Environment template
prisma/seed.ts         ← Database seeding
```

## Current Tasks

### ✅ Completed
- [x] Basic .env configuration
- [x] Prisma schema

### 🔄 In Progress
- [ ] .env.example with all required variables
- [ ] Database seed script

### 📋 Backlog
- [ ] GitHub Actions CI workflow
- [ ] Playwright E2E tests setup
- [ ] Vitest unit tests setup
- [ ] Vercel deployment configuration
- [ ] Database migration strategy
- [ ] Performance monitoring setup

## Implementation Plan

### 1. Environment Template
```env
# .env.example

# Database
DATABASE_URL="postgresql://..."

# Authentication
AUTH_SECRET="generate-with-openssl-rand-base64-32"

# Supabase (for Realtime)
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."

# AI Provider (choose one)
OPENAI_API_KEY="sk-..."
# ANTHROPIC_API_KEY="sk-ant-..."

# App URL
NEXTAUTH_URL="http://localhost:3000"
```

### 2. GitHub Actions CI
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Type check
        run: npx tsc --noEmit
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          AUTH_SECRET: ${{ secrets.AUTH_SECRET }}
```

### 3. Playwright Setup
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 4. E2E Test Examples
```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page).toHaveURL('/dashboard')
  })
})

// tests/e2e/inbox.spec.ts
test.describe('Inbox', () => {
  test('should create a new task', async ({ page }) => {
    await page.goto('/inbox')
    await page.getByPlaceholder(/add a new task/i).fill('Pay electric bill')
    await page.getByRole('button', { name: /add/i }).click()
    await expect(page.getByText('Pay electric bill')).toBeVisible()
  })
})
```

### 5. Database Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      { userId: user.id, title: 'Pay electric bill', state: 'UNCLARIFIED' },
      { userId: user.id, title: 'Schedule dentist appointment', state: 'UNCLARIFIED' },
      { userId: user.id, title: 'Renew car registration', state: 'CLARIFIED' },
    ],
  })

  // Create sample session
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(20, 0, 0, 0)

  await prisma.workSession.create({
    data: {
      scheduledStart: tomorrow,
      scheduledEnd: new Date(tomorrow.getTime() + 45 * 60 * 1000),
      durationMinutes: 45,
      status: 'SCHEDULED',
    },
  })

  console.log('Database seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 6. Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:seed": "npx tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

## Deployment Checklist

### Vercel Setup
- [ ] Connect GitHub repository
- [ ] Add environment variables in Vercel dashboard
- [ ] Configure production database URL
- [ ] Enable automatic deployments on main branch

### Database Migration
```bash
# Development
npx prisma migrate dev --name <migration_name>

# Production (on Vercel)
npx prisma migrate deploy
```

## Coordination with Other Agents

### ← All Agents
- Ensure CI passes before merging
- Validate environment variables

### → Backend API Agent
- Provide test database configuration
- Help with migration issues

## Commands

When asked to work on DevOps/testing tasks:

1. **Assess Current State** - Check existing configs
2. **Identify Gaps** - What's missing for production?
3. **Implement** - Create configs and tests
4. **Verify** - Run locally first
5. **Document** - Update README/docs
6. **Report** - Update STATUS.md
