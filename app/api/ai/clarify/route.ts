
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { openai, DEFAULT_MODEL, parseSteps } from '@/lib/ai/openai'
import { CLARIFY_SYSTEM_PROMPT, formatClarifyUserMessage, CLARIFY_CONFIG } from '@/lib/prompts/clarify'

/**
 * POST /api/ai/clarify
 * Generate 3-5 concrete first steps for a vague task
 * 
 * Request body:
 * - taskTitle: string (required) - The task to clarify
 * - taskId?: string (optional) - ID of existing task to update
 * 
 * Response:
 * - suggestions: string[] - Array of 3-5 actionable steps
 * - taskId?: string - Echo back taskId if provided
 */
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Parse request body
        const body = await req.json()
        const { taskTitle, taskId } = body

        // Validate input
        if (!taskTitle || typeof taskTitle !== 'string') {
            return NextResponse.json(
                { error: 'taskTitle is required and must be a string' },
                { status: 400 }
            )
        }

        if (taskTitle.length < 2 || taskTitle.length > 500) {
            return NextResponse.json(
                { error: 'taskTitle must be between 2 and 500 characters' },
                { status: 400 }
            )
        }

        // Check if OpenAI API key is configured
        if (!process.env.OPENAI_API_KEY) {
            console.error('OPENAI_API_KEY is not configured')
            return NextResponse.json(
                { error: 'AI service is not configured' },
                { status: 503 }
            )
        }

        // Call OpenAI API
        const startTime = Date.now()

        const completion = await openai.chat.completions.create({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: CLARIFY_SYSTEM_PROMPT },
                { role: 'user', content: formatClarifyUserMessage(taskTitle) }
            ],
            temperature: CLARIFY_CONFIG.temperature,
            max_tokens: CLARIFY_CONFIG.maxTokens,
        })

        const responseTime = Date.now() - startTime
        console.log(`[AI Clarify] Response time: ${responseTime}ms for task: "${taskTitle.substring(0, 50)}"`)

        // Parse the response
        const rawContent = completion.choices[0]?.message?.content
        const suggestions = parseSteps(rawContent)

        // Validate we got enough suggestions
        if (suggestions.length < CLARIFY_CONFIG.minSteps) {
            console.warn(`[AI Clarify] Only got ${suggestions.length} suggestions, expected ${CLARIFY_CONFIG.minSteps}+`)
        }

        // Return response
        return NextResponse.json({
            suggestions,
            ...(taskId && { taskId }),
            meta: {
                responseTimeMs: responseTime,
                model: DEFAULT_MODEL,
            }
        })

    } catch (error) {
        console.error('[AI Clarify] Error:', error)

        // Handle specific OpenAI errors
        if (error instanceof Error) {
            if (error.message.includes('API key')) {
                return NextResponse.json(
                    { error: 'AI service configuration error' },
                    { status: 503 }
                )
            }
            if (error.message.includes('rate limit')) {
                return NextResponse.json(
                    { error: 'AI service is busy, please try again' },
                    { status: 429 }
                )
            }
        }

        return NextResponse.json(
            { error: 'Failed to generate suggestions' },
            { status: 500 }
        )
    }
}
