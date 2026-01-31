import { describe, it, expect } from 'vitest'
import { CLARIFY_SYSTEM_PROMPT, formatClarifyUserMessage, CLARIFY_CONFIG } from '@/lib/prompts/clarify'

describe('Clarify Prompt', () => {
    describe('CLARIFY_SYSTEM_PROMPT', () => {
        it('should contain key instructions', () => {
            expect(CLARIFY_SYSTEM_PROMPT).toContain('3-5 steps')
            expect(CLARIFY_SYSTEM_PROMPT).toContain('under 15 words')
            expect(CLARIFY_SYSTEM_PROMPT).toContain('FIRST actions')
        })

        it('should include example task', () => {
            expect(CLARIFY_SYSTEM_PROMPT).toContain('Deal with taxes')
        })

        it('should include action verbs instruction', () => {
            expect(CLARIFY_SYSTEM_PROMPT).toContain('action verbs')
        })
    })

    describe('formatClarifyUserMessage', () => {
        it('should format task title correctly', () => {
            const result = formatClarifyUserMessage('Deal with taxes')
            expect(result).toBe('Task: Deal with taxes')
        })

        it('should handle empty string', () => {
            const result = formatClarifyUserMessage('')
            expect(result).toBe('Task: ')
        })

        it('should handle special characters', () => {
            const result = formatClarifyUserMessage("Fix mom's computer")
            expect(result).toBe("Task: Fix mom's computer")
        })
    })

    describe('CLARIFY_CONFIG', () => {
        it('should have correct temperature', () => {
            expect(CLARIFY_CONFIG.temperature).toBe(0.7)
        })

        it('should have reasonable max tokens', () => {
            expect(CLARIFY_CONFIG.maxTokens).toBe(200)
        })

        it('should have min/max steps', () => {
            expect(CLARIFY_CONFIG.minSteps).toBe(3)
            expect(CLARIFY_CONFIG.maxSteps).toBe(5)
        })
    })
})
