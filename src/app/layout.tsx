import type { Metadata, Viewport } from "next";
import Script from "next/script"; 
import "@/styles/globals.css";
import { satoshi } from "@/styles/fonts";
import TopNavbar from "@/components/layout/Navbar/TopNavbar";
import Footer from "@/components/layout/Footer";
import HolyLoader from "holy-loader";
import Providers from "./providers";

// --- RABINDRA STORE SEO & METADATA ---
export const metadata: Metadata = {
  title: "Rabindra Store | Simraungadh Wholesale",
  description: "Order bulk groceries, grains, and daily essentials at live market rates. Fast local delivery in Simraungadh.",
};

export const viewport: Viewport = {
  themeColor: "#16a34a", 
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${satoshi.className} bg-slate-50 antialiased text-slate-900`}>
        <HolyLoader color="#16a34a" /> 
        
        {/* Splash Screen Completely Removed */}

        <Providers>
          <TopNavbar />
          <main>
            {children}
          </main>
        </Providers>
        
        <Footer />

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