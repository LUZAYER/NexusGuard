import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default: 'NexusGuard — Autonomous Financial Crime Intelligence & Real-Time AML Defense',
    template: '%s | NexusGuard',
  },
  description:
    'ML Assesses. Graphs Connect. AI Investigates. Humans Decide. Full-stack observability, real-time tracing, cost analytics, and enterprise governance for every LLM and agent framework.',
  openGraph: {
    type: 'website',
    siteName: 'NexusGuard',
    title: 'NexusGuard — Autonomous Financial Crime Intelligence & Real-Time AML Defense',
    description:
      'ML Assesses. Graphs Connect. AI Investigates. Humans Decide.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexusGuard — Autonomous Financial Crime Intelligence & Real-Time AML Defense',
    description: 'ML Assesses. Graphs Connect. AI Investigates. Humans Decide.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/icon.png', type: 'image/png', sizes: '128x128' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/logo.png',
    apple: '/apple-touch-icon.png',
  },
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased transition-colors">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
