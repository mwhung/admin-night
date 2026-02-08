# Codex Skills and Agent Usage

## What Is Loaded Automatically

- `AGENTS.md` at repository root is loaded automatically when working in this project.
- Global Codex config (`~/.codex/config.toml`) enables project fallback docs and skill paths.

## Available Skills

1. `$admin-night-specialists`
   - Orchestrator skill for routing tasks across frontend/backend/session/ai/devops lanes.
2. `$admin-night-session-realtime`
   - Specialized skill for session API lifecycle, realtime presence, and timer behavior.
3. `$admin-night-devops-testing`
   - Specialized skill for CI workflows, test reliability, and deployment hardening.

## How To Invoke A Skill

Use a direct prompt that explicitly references the skill name:

```text
Use $admin-night-specialists to implement this feature end-to-end.
```

```text
Use $admin-night-session-realtime to debug join/leave and participant count drift.
```

```text
Use $admin-night-devops-testing to fix flaky Playwright tests and update CI.
```

## Recommended Invocation Patterns

1. General coding/refactor request:
   - Start with `$admin-night-specialists`.
2. Session-specific failures:
   - Use `$admin-night-session-realtime`.
3. CI/test/deploy issues:
   - Use `$admin-night-devops-testing`.
4. Cross-domain tasks:
   - Start with `$admin-night-specialists`, then delegate to a specialized skill as needed.

## Practical Prompt Templates

```text
Use $admin-night-specialists. Build [feature], update tests, and summarize changed files + commands run.
```

```text
Use $admin-night-session-realtime. Investigate [session bug], add regression tests, and report root cause.
```

```text
Use $admin-night-devops-testing. Stabilize [CI failure], avoid flaky waits, and keep command sequence deterministic.
```
