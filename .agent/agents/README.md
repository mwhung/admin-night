# Admin Night - Multi-Agent Architecture

This project uses 5 specialized AI agents that work together to build the application.

## 🤖 Agent Overview

| Agent | File | Primary Focus |
|-------|------|---------------|
| Backend API Agent | `backend-api.md` | API routes, database operations |
| Frontend UI Agent | `frontend-ui.md` | React components, pages |
| AI Integration Agent | `ai-integration.md` | Task clarification, LLM integration |
| Session Realtime Agent | `session-realtime.md` | Work sessions, live features |
| DevOps Testing Agent | `devops-testing.md` | CI/CD, testing, deployment |

## 🚀 How to Use

### Starting an Agent Session

To activate a specific agent, use the corresponding slash command:

```
/backend    - Start Backend API Agent
/frontend   - Start Frontend UI Agent  
/ai         - Start AI Integration Agent
/session    - Start Session Realtime Agent
/devops     - Start DevOps Testing Agent
```

### Agent Communication Protocol

Agents communicate through:
1. **Shared Codebase** - All agents read/write to the same repository
2. **Interface Contracts** - Defined in `contracts/` directory
3. **Status Updates** - Each agent updates `STATUS.md` after completing tasks

## 📋 Current Sprint Status

Check `STATUS.md` for real-time progress of all agents.

## 🔄 Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REQUEST                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              ORCHESTRATOR (Main Agent)                       │
│  Analyzes request → Delegates to appropriate agent           │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐       ┌─────────┐       ┌─────────┐
   │ Agent 1 │       │ Agent 2 │       │ Agent N │
   └────┬────┘       └────┬────┘       └────┬────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                    Shared Codebase
```
