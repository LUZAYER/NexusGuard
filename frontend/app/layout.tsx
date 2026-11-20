import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexusGuard — Autonomous Financial Crime Intelligence & Real-Time AML Defense",
    template: "%s | NexusGuard",
  },
  description:
    "Enterprise-grade financial crime intelligence platform combining sub-25ms machine learning, graph link forensics, millisecond behavioral biometrics, and autonomous AI investigations across digital banking and Mobile Financial Services.",
  keywords: [
    "NexusGuard",
    "Financial Crime Intelligence",
    "Fraud Detection",
    "Anti-Money Laundering",
    "Mobile Financial Services",
    "MFS",
    "AgentOps",
    "Graph Forensics",
    "Regulatory Compliance",
    "BFIU",
    "FATF",
  ],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "128x128" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col relative">
        <AppProviders>
          <div className="relative z-10 flex-1 flex flex-col">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
