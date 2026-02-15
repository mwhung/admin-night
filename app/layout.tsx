import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Night | Focus, Conquer, Flow",
  description: "A calm space for life admin tasks. Focus together, finish together. No confetti.",
};

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/navigation/site-header"
import { FloatingNav } from "@/components/layout/navigation/floating-nav"
import { SessionPauseBubble } from "@/components/features/session"

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        {GA_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
