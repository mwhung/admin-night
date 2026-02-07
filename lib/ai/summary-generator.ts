
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

        const completion = await openai.chat.completions.create({
            messages: [{ role: 'system', content: prompt }],
            model: 'gpt-4o-mini',
            max_tokens: 50,
            temperature: 0.7,
        });

        return completion.choices[0].message.content || 'Session complete.';
    } catch (error) {
        console.error('LLM Generation Error:', error);
        return 'The night is over. Your tasks are done.'; // Fallback
    }
}
