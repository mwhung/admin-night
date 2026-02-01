'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Moon, BarChart3, Settings } from 'lucide-react'

const navItems = [
    {
        title: 'Focus',
        href: '/admin-mode',
        icon: Moon,
    },
    {
        title: 'Insights',
        href: '/dashboard',
        icon: BarChart3,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
]

export function FloatingNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                        bg-card/80 backdrop-blur-xl 
                        rounded-full px-2 py-2
                        border border-border/50 
                        shadow-2xl shadow-primary/10
                        flex items-center gap-1
                        animate-in fade-in slide-in-from-bottom-4 duration-500">
            {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-300",
                            "text-sm font-medium",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                    >
                        <item.icon className="size-4" />
                        <span className={cn(
                            "transition-all duration-300",
                            isActive ? "opacity-100" : "opacity-0 w-0 overflow-hidden sm:opacity-100 sm:w-auto"
                        )}>
                            {item.title}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
