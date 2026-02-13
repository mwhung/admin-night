import OpenAI from 'openai'

// Re-export parseSteps from parser module
export { parseSteps } from './parser'

let _openai: OpenAI | null = null

/**
 * Lazy-initialized OpenAI client to avoid build-time errors
 * when OPENAI_API_KEY is only available at runtime.
 */
export function getOpenAIClient(): OpenAI {
    if (!_openai) {
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }
    return _openai
}

/** @deprecated Use getOpenAIClient() instead */
export const openai = new Proxy({} as OpenAI, {
    get(_, prop) {
        return Reflect.get(getOpenAIClient(), prop)
    },
})

/**
 * Default model for task clarification
 * gpt-4o-mini is fast and cost-effective for this use case
 */
export const DEFAULT_MODEL = 'gpt-4o-mini'
