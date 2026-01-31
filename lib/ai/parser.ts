/**
 * Parse steps from AI response
 * Handles various formats: numbered lists, bullet points, plain lines
 */
export function parseSteps(content: string | null): string[] {
    if (!content) return []

    // Split by common delimiters
    const lines = content
        .split(/\n/)
        .map(line => line.trim())
        .filter(Boolean)

    // Remove numbering, bullets, and clean up
    const steps = lines
        .map(line => {
            // Remove common prefixes: "1.", "1)", "-", "*", "•"
            return line
                .replace(/^[\d]+[.)]\s*/, '')
                .replace(/^[-*•]\s*/, '')
                .trim()
        })
        .filter(step => step.length > 0 && step.length < 200)

    // Return max 5 steps
    return steps.slice(0, 5)
}
