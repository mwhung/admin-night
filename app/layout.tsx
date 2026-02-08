import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Night | Focus, Conquer, Flow",
  description: "A therapeutic space for your personal admin tasks. Focus together, finish together.",
};

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/navigation/site-header"
import { FloatingNav } from "@/components/layout/navigation/floating-nav"
import { SessionPauseBubble } from "@/components/features/session"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plusJakartaSans.variable} antialiased`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen w-full bg-background font-sans">
            <SiteHeader />
            <main className="flex-1 min-h-0 w-full pb-[var(--layout-main-bottom-reserve)]">
              {children}
            </main>
            <SessionPauseBubble />
            <FloatingNav />
          </div>
        </Providers>
      </body>
    </html>
  );
}
