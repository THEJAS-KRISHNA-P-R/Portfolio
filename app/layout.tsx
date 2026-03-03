import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"; // Using proper Next.js names
import "./globals.css";
import ClientLayout from "./ClientLayout";
import { getThemeCSSVars } from '@/lib/portfolioTheme';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Thejas Krishna P R | 3D Portfolio",
  description: "Full-Stack Developer & CS Student. Drive around my interactive 3D portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cssVars = getThemeCSSVars();

  return (
    <html lang="en" style={cssVars as React.CSSProperties}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-body bg-bg text-text`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
