import { describe, it, expect } from 'vitest'
import { parseSteps } from '@/lib/ai/parser'

describe('parseSteps', () => {
    it('should return empty array for null input', () => {
        expect(parseSteps(null)).toEqual([])
    })

    it('should return empty array for empty string', () => {
        expect(parseSteps('')).toEqual([])
    })

    it('should parse numbered list format', () => {
        const input = `1. Find your tax documents
2. Check the deadline
3. Gather W-2 forms`

        const result = parseSteps(input)

        expect(result).toEqual([
            'Find your tax documents',
            'Check the deadline',
            'Gather W-2 forms'
        ])
    })

    it('should parse numbered list with parentheses', () => {
        const input = `1) First step
2) Second step
3) Third step`

        const result = parseSteps(input)

        expect(result).toEqual([
            'First step',
            'Second step',
            'Third step'
        ])
    })

    it('should parse bullet points with dashes', () => {
        const input = `- Find documents
- Check deadline
- Gather forms`

        const result = parseSteps(input)

        expect(result).toEqual([
            'Find documents',
            'Check deadline',
            'Gather forms'
        ])
    })

    it('should parse bullet points with asterisks', () => {
        const input = `* Find documents
* Check deadline
* Gather forms`

        const result = parseSteps(input)

        expect(result).toEqual([
            'Find documents',
            'Check deadline',
            'Gather forms'
        ])
    })

    it('should parse plain lines', () => {
        const input = `Find documents
Check deadline
Gather forms`

        const result = parseSteps(input)

        expect(result).toEqual([
            'Find documents',
            'Check deadline',
            'Gather forms'
        ])
    })

    it('should filter out empty lines', () => {
        const input = `Find documents

Check deadline

Gather forms`

        const result = parseSteps(input)

        expect(result).toEqual([
            'Find documents',
            'Check deadline',
            'Gather forms'
        ])
    })

    it('should limit to 5 steps maximum', () => {
        const input = `1. Step one
2. Step two
3. Step three
4. Step four
5. Step five
6. Step six
7. Step seven`

        const result = parseSteps(input)

        expect(result).toHaveLength(5)
        expect(result[4]).toBe('Step five')
    })

    it('should filter out very long lines (over 200 chars)', () => {
        const longLine = 'A'.repeat(250)
        const input = `1. Short step
2. ${longLine}
3. Another short step`

        const result = parseSteps(input)

        expect(result).toEqual([
            'Short step',
            'Another short step'
        ])
    })

    it('should handle mixed formats', () => {
        const input = `1. First numbered
- Bullet point
* Another bullet
Plain line`

        const result = parseSteps(input)

        expect(result).toEqual([
            'First numbered',
            'Bullet point',
            'Another bullet',
            'Plain line'
        ])
    })
})
