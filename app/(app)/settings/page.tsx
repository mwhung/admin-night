'use client'

import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
    return (
        <div className="container mx-auto p-8 max-w-4xl min-h-screen">
            <div className="space-y-0.5 mb-8">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator className="mb-8" />

            <div className="grid gap-8">
                <div className="p-12 text-center border border-dashed rounded-lg text-muted-foreground">
                    Settings functionality coming soon...
                </div>
            </div>
        </div>
    )
}
