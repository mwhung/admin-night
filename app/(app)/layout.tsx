import { AppSidebar } from "@/components/navigation/app-sidebar"
import { SiteHeader } from "@/components/navigation/site-header"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-screen w-full bg-background overflow-hidden font-sans">
            <SiteHeader />
            <div className="flex-1 flex overflow-hidden relative">
                <aside className="hidden md:block h-full flex-shrink-0 z-40">
                    <AppSidebar />
                </aside>
                <main className="flex-1 overflow-y-auto h-full w-full">
                    {children}
                </main>
            </div>
        </div>
    )
}
