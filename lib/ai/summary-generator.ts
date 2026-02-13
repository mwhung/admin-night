
import { getOpenAIClient } from './openai';

const SUMMARY_FALLBACK = 'The night is over. Your tasks are done.'
const SUMMARY_TIMEOUT_MS = 2000

export async function generateSessionSummary(context: {
    durationMinutes: number;
    tasksCompleted: number;
    pauseCount: number;
    newAchievements: string[]; // List of achievement titles
}): Promise<string> {
    try {
        const { durationMinutes, tasksCompleted, pauseCount, newAchievements } = context;

        const prompt = `
      You are the narrator for "Admin Night", a calm, late-night productivity app.
      
      User just finished a session.
      Stats: ${durationMinutes} mins, ${tasksCompleted} tasks done, ${pauseCount} pauses.
      New Achievements Unlocked: ${newAchievements.join(', ') || 'None'}.
      
      Generate a ONE-SENTENCE summary (max 20 words).
      Tone: Deadpan, calm, slightly weird but supportive. Like a tired midnight radio host.
      If achievements were unlocked, mention them subtly. If not, focus on the effort.
      
      Examples:
      - "The silence was loud, but you were louder. Good work."
      - "You have conquered the night, and also your taxes."
      - "Three pauses? A hydrating strategy. I respect it."
    `;

        if (!process.env.OPENAI_API_KEY) {
            return SUMMARY_FALLBACK
        }

        const llmSummaryPromise = getOpenAIClient().chat.completions.create({
            messages: [{ role: 'system', content: prompt }],
            model: 'gpt-4o-mini',
            max_tokens: 50,
            temperature: 0.7,
        }).then((completion) => completion.choices[0].message.content || 'Session complete.')

        const timeoutPromise = new Promise<string>((resolve) => {
            setTimeout(() => resolve(SUMMARY_FALLBACK), SUMMARY_TIMEOUT_MS)
        })

        return await Promise.race([llmSummaryPromise, timeoutPromise])
    } catch (error) {
        console.error('LLM Generation Error:', error);
        return SUMMARY_FALLBACK
    }
}
