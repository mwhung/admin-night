import { SiteHeader } from "@/components/navigation/site-header"
import { FloatingNav } from "@/components/navigation/floating-nav"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen w-full bg-background font-sans">
            <SiteHeader />
            <main className="flex-1 w-full pb-24">
                {children}
            </main>
            <FloatingNav />
        </div>
    )
}
