'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    History,
    Inbox,
    Moon as MoonIcon,
    Settings,
    LogOut,
    Play,
    Orbit
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
    {
        title: 'Focus',
        href: '/admin-mode',
        icon: MoonIcon,
    },
    {
        title: 'History',
        href: '/history',
        icon: History
    },
    {
        title: 'Community',
        href: '/community',
        icon: Orbit
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings
    }
]

export function AppSidebar() {
    const pathname = usePathname()

    return (
        <div className="group flex flex-col h-full w-16 hover:w-64 border-r bg-card text-card-foreground transition-all duration-500 ease-in-out overflow-hidden z-[100] pt-4">
            <div className="flex-1 px-3 py-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-4 px-2 py-2.5 rounded-xl transition-all duration-300",
                            pathname === item.href
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="size-5 flex-shrink-0" />
                        <span className="text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                            {item.title}
                        </span>
                    </Link>
                ))}
            </div>

            <div className="p-3 border-t">
                <Button variant="ghost" className="w-full justify-start gap-4 px-2 hover:bg-destructive/10 hover:text-destructive group-hover:px-3 transition-all" size="sm">
                    <LogOut className="size-5 flex-shrink-0" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">Sign Out</span>
                </Button>
            </div>
        </div>
    )
}
