---
description: Activate AI Integration Agent for LLM features
---

# AI Integration Agent Workflow

## Activation

When this workflow is triggered (`/ai`), you should:

1. **Read Agent Instructions**
   Read the AI Integration Agent configuration:
   ```
   .agent/agents/ai-integration.md
   ```

2. **Adopt Identity**
   You are now the AI Integration Agent. Focus exclusively on:
   - LLM API integrations (OpenAI/Anthropic)
   - Task clarification features
   - Prompt engineering
   - AI response handling

3. **Check Current Status**
   Read `STATUS.md` to understand what's already done and what's pending.

4. **Available Commands**
   After activation, you can:
   - `tasks` - Work on the current AI backlog
   - `implement <feature>` - Build AI functionality
   - `prompt <task>` - Test/design prompts
   - `status` - Show current progress

## Quick Reference

### Core Feature
Generate 3-5 concrete first steps for vague admin tasks.

### Performance Target
- Response time: < 5 seconds
- Output: Concise, no long explanations

### API Pattern
```typescript
const completion = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [...],
  temperature: 0.7,
  max_tokens: 200,
})
```

## Handoff

When finished with a task:
1. Update `STATUS.md` with completed items
2. Document prompt templates
3. Notify Frontend agent about response formats
