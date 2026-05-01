import type { Metadata } from "next";
import { Inter, Fira_Code } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers";
import { Navbar } from "@/components/Navbar";

import { supabase } from "@/lib/supabase";

const inter = Inter({ subsets: ["latin", "vietnamese"], variable: '--font-sans' });
export const firaCode = Fira_Code({ subsets: ["latin"], variable: '--font-mono' });

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Le Duc Trong",
    description: "Software Engineering Student Portfolio",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${firaCode.variable} font-sans min-h-screen bg-background text-foreground flex flex-col`}>
        <AppProviders attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </AppProviders>
      </body>
    </html>
  );
}
