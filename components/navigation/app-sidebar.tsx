'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Inbox,
    Moon as MoonIcon,
    Settings,
    LogOut,
    Play,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navItems = [
    {
        title: 'Admin Night',
        href: '/admin-mode',
        icon: MoonIcon,
        highlight: true
    },
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard
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
        <div className="flex flex-col h-full w-64 border-r bg-card text-card-foreground">
            <div className="p-6">
                <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                    Admin Night
                </h1>
                <p className="text-xs text-muted-foreground mt-1">Focus & Conquer</p>
            </div>

            <div className="flex-1 px-3 py-4 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            pathname === item.href
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        <item.icon className="size-4" />
                        {item.title}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10" size="sm">
                    <LogOut className="size-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
