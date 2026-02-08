import { timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

const INTERNAL_API_KEY_HEADER = 'x-internal-api-key'
const BEARER_PREFIX = 'Bearer '

function secureCompare(value: string, expected: string): boolean {
    const valueBuffer = Buffer.from(value)
    const expectedBuffer = Buffer.from(expected)

    if (valueBuffer.length !== expectedBuffer.length) {
        return false
    }

    return timingSafeEqual(valueBuffer, expectedBuffer)
}

export function isInternalApiRequest(request: NextRequest): boolean {
    const expectedKey = process.env.INTERNAL_API_KEY
    if (!expectedKey || expectedKey.trim().length === 0) {
        return false
    }

    const headerKey = request.headers.get(INTERNAL_API_KEY_HEADER)
    const authorization = request.headers.get('authorization')
    const bearerKey = authorization?.startsWith(BEARER_PREFIX)
        ? authorization.slice(BEARER_PREFIX.length)
        : null

    const providedKey = headerKey ?? bearerKey
    if (!providedKey) {
        return false
    }

    return secureCompare(providedKey, expectedKey)
}

export function getRequiredInternalApiKey(): string {
    const key = process.env.INTERNAL_API_KEY?.trim()
    if (!key) {
        throw new Error('INTERNAL_API_KEY is not configured')
    }
    return key
}

export function withInternalApiAuth(headers?: HeadersInit): Headers {
    const result = new Headers(headers)
    result.set(INTERNAL_API_KEY_HEADER, getRequiredInternalApiKey())
    return result
}
