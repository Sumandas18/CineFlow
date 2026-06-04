import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import BubblesBackground from "@/components/ui/BubblesBackground";

export const metadata: Metadata = {
  title: "CineFlow",
  description: "AI-powered cinematic reel generation platform.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%239333ea' /%3E%3Cstop offset='100%25' stop-color='%23ec4899' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='24' height='24' rx='5' fill='url(%23g)' /%3E%3Cg stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' fill='none' transform='translate(2, 2) scale(0.83)'%3E%3Cpath d='M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z'/%3E%3Cpath d='M20 3v4'/%3E%3Cpath d='M22 5h-4'/%3E%3Cpath d='M4 17v2'/%3E%3Cpath d='M5 18H3'/%3E%3C/g%3E%3C/svg%3E",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gradient-to-b from-[#25103a] via-[#140824] to-[#0a0510] text-white antialiased`} suppressHydrationWarning>
        <BubblesBackground />
        <div className="z-10 relative">
          {children}
        </div>
      </body>
    </html>
  );
}
