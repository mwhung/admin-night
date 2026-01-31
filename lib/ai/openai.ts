import OpenAI from 'openai'

// Re-export parseSteps from parser module
export { parseSteps } from './parser'

/**
 * OpenAI client instance for AI features
 * Used for task clarification and other LLM-powered features
 */
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Default model for task clarification
 * gpt-4o-mini is fast and cost-effective for this use case
 */
export const DEFAULT_MODEL = 'gpt-4o-mini'
