import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/app/providers";

import "@/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GitRoll Chat",
  description: "Unlock Opportunities in Your Network",
};

export default function AuthLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-neutral-900 bg-neutral-50 dark:text-neutral-50 dark:bg-neutral-900`}
      >
        <Providers>
          <main className="relative mx-auto mb-16 max-w-4xl px-8 py-24">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
