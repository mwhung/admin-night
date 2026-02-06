# Admin Night — Development Standards

## 🔴 Critical Rules (Zero Tolerance)

-   **TypeScript**: No `any` type usage in critical paths (API responses, database schemas).
-   **React**: Use function declarations with typed props. No `React.FC`.
-   **Icons**: Use `lucide-react` exclusively.
-   **Database**: All data access must go through Prisma.
-   **Authentication**: Use Supabase Auth (migrated from NextAuth).
-   **Styling**: Tailwind CSS 4 using modern utility-first patterns.
-   **Design**: Follow "Therapeutic UI" principles—minimalist, adaptive, and calming. No excessive animations (>150ms).

## 🛠 Command Reference

### Development & Build
-   `npm run dev`: Start Next.js development server
-   `npm run build`: Build for production
-   `npm run start`: Start production server
-   `npx prisma generate`: Update Prisma client
-   `npx prisma db push`: Sync schema to database

### Testing & Quality
-   `npm run lint`: Run ESLint check
-   `npm test`: Run unit tests (Vitest)
-   `npm run test:e2e`: Run E2E tests (Playwright)
-   `npm run test:perf`: Run performance tests
-   `npx tsc --noEmit`: TypeScript type check

## 📁 Project Structure

-   `app/`: Next.js App Router (Pages, API Routes)
-   `components/`: React components (shadcn/ui in `components/ui`)
-   `lib/`: Shared utilities (prisma client, supabase client, helpers)
-   `hooks/`: Custom React hooks
-   `tests/`: Test suites (unit and e2e)
-   `prisma/`: Database schema and migrations

## 🧱 Core Domain Entities

-   **User**: Registered users with preferences and profile.
-   **Task**: Individual admin items with states: `UNCLARIFIED`, `CLARIFIED`, `IN_PROGRESS`, `RESOLVED`, `RECURRING`.
-   **WorkSession**: Scheduled "Admin Night" time blocks.
-   **WorkSessionParticipant**: Tracks user participation in a session and tasks worked on.

## 🎨 Naming Conventions

-   **Components**: `PascalCase.tsx`
-   **Hooks**: `useCamelCase.ts`
-   **Utilities/Lib**: `kebab-case.ts`
-   **API Routes**: `route.ts` inside kebab-case directories
-   **Variables/Functions**: `camelCase`
-   **Constants**: `SCREAMING_SNAKE_CASE`

## 🧠 AI Behavior & Communication

-   **Language**: Communicate in **繁體中文 (zh-TW)**.
-   **Code**: Code, comments, and documentation must be in **English**.
-   **Proactivity**: Check for existing components in `components/` before creating new ones.
-   **Testing**: Always consider impact on existing E2E tests when modified UI or Auth flows.
-   **Design**: Prioritize "Clarity over completeness" and "Relief over achievement" as per PRD.
