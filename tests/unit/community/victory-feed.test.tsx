import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { VictoryFeed } from '@/components/features/community/victory-feed'

describe('VictoryFeed', () => {
    it('renders API-driven entries instead of static sample copy', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-02-09T12:00:00.000Z'))

        render(
            <VictoryFeed
                showHeading={false}
                victories={[
                    {
                        id: 'victory-1',
                        message: 'A real community release was recorded.',
                        resolvedAt: '2026-02-09T11:45:00.000Z',
                    },
                ]}
            />,
        )

        expect(screen.getAllByText('A real community release was recorded.').length).toBeGreaterThan(0)
        expect(screen.queryByText('Someone just settled a recurring bill.')).toBeNull()

        vi.useRealTimers()
    })

    it('shows an explicit empty state when no victories are available', () => {
        render(<VictoryFeed showHeading={false} victories={[]} />)

        expect(screen.getAllByText('No community releases have been recorded yet.').length).toBeGreaterThan(0)
        expect(screen.getByText('No recent data')).toBeTruthy()
    })
})
