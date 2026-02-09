
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { SessionRuntimeProvider } from '@/components/features/session'

export function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 60 * 1000,
            },
        },
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
                storageKey="admin-night:theme"
            >
                <SessionRuntimeProvider>
                    {children}
                </SessionRuntimeProvider>
            </ThemeProvider>
        </QueryClientProvider>
    )
}
