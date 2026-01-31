import { AppSidebar } from "@/components/navigation/app-sidebar"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen w-full bg-background overflow-hidden">
            <aside className="hidden md:block h-full flex-shrink-0">
                <AppSidebar />
            </aside>
            <main className="flex-1 overflow-y-auto h-full w-full">
                {children}
            </main>
        </div>
    )
}
