import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/layout/Providers";
import { ThreeDBackground } from "@/components/layout/ThreeDBackground";
import { PremiumNavbar } from "@/components/layout/PremiumNavbar";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CareerAI Pro - Premium AI Resume Builder & AI Mock Interview Simulator",
  description: "Create professional ATS-optimized resumes, practice AI-powered mock interviews with real-time analytics, and generate cover letters or personal portfolios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="font-sans antialiased text-slate-900 bg-slate-50 dark:bg-dark-500 dark:text-slate-100 min-h-screen flex flex-col">
        <Providers>
          <ThreeDBackground />
          <PremiumNavbar />
          <main className="flex-grow pt-16 z-10 relative">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
