import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from '@/components/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Todo AI Workflow",
    template: "%s | Todo AI Workflow",
  },
  description: "A modern PWA todo application with AI workflow integration",
  keywords: ["todo", "productivity", "PWA", "AI", "workflow"],
  authors: [{ name: "Todo AI Team" }],
  creator: "Todo AI Team",
  publisher: "Todo AI Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Todo AI Workflow",
  },
  openGraph: {
    type: "website",
    siteName: "Todo AI Workflow",
    title: {
      default: "Todo AI Workflow",
      template: "%s | Todo AI Workflow",
    },
    description: "A modern PWA todo application with AI workflow integration",
  },
  twitter: {
    card: "summary",
    title: {
      default: "Todo AI Workflow",
      template: "%s | Todo AI Workflow",
    },
    description: "A modern PWA todo application with AI workflow integration",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
