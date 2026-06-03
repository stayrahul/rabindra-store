import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script"; 
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import HolyLoader from "holy-loader";
import Providers from "./providers";
import LayoutShell from "@/components/layout/LayoutShell";

// --- RABINDRA STORE SEO & METADATA ---
export const metadata: Metadata = {
  title: "Rabindra Store | Premium Wholesale · Simraungadh",
  description: "Order bulk groceries, grains, oils, spices, and daily essentials at live wholesale rates. Fast same-day delivery in Simraungadh, Bara, Nepal.",
  keywords: ["wholesale", "Simraungadh", "bulk groceries", "grains", "oils", "Nepal", "B2B", "Rabindra Store"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rabindra Store",
  },
  openGraph: {
    title: "Rabindra Store | Premium Wholesale",
    description: "Simraungadh's premier wholesale infrastructure. Grains, oils, spices & more at unbeatable bulk rates.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${satoshi.className} bg-slate-50 antialiased text-slate-900`}>
        <Providers>
          <LayoutShell>
            <HolyLoader color="#4f46e5" />
            <Suspense fallback={<div className="h-screen bg-slate-50" />}>
              {children}
            </Suspense>
          </LayoutShell>
        </Providers>

        {/* --- GOOGLE ANALYTICS TAGS --- */}
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-R8WZYFHD1K" 
          strategy="afterInteractive" 
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R8WZYFHD1K');
          `}
        </Script>
        {/* --- GOOGLE ANALYTICS END --- */}
      </body>
    </html>
  );
}