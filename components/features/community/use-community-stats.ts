import { useEffect, useState } from 'react'
import type { CommunityStatsResponse } from '@/lib/contracts/community-stats'

export function useCommunityStats() {
    const [stats, setStats] = useState<CommunityStatsResponse | null>(null)

    useEffect(() => {
        let isCancelled = false
        const controller = new AbortController()

        const fetchStats = async () => {
            try {
                const statsRes = await fetch('/api/community/stats', { signal: controller.signal })
                if (!statsRes.ok || isCancelled) {
                    return
                }

                const payload = (await statsRes.json()) as CommunityStatsResponse
                setStats(payload)
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return
                }

                console.error('Failed to fetch community stats', err)
            }
        }

        fetchStats()

        return () => {
            isCancelled = true
            controller.abort()
        }
    }, [])

    return {
        stats,
    }
}
