import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/ErrorFallback';
import { inter, spaceMono } from '@/lib/fonts-config';
import './globals.css';
import './theme.css';

export const metadata: Metadata = {
  title: 'Aether AI - Enterprise-Grade AI Platform',
  description: 'Enterprise-grade artificial intelligence platform built on DocsGPT & Hedera Token Service. Featuring carbon-negative operations, blockchain-verified API tracking, and advanced AI capabilities.',
  keywords: ['AI', 'Blockchain', 'Hedera', 'DocsGPT', 'Enterprise AI', 'Quantum Computing'],
  authors: [{ name: 'Aether AI Team' }],
  referrer: 'strict-origin-when-cross-origin',
  openGraph: {
    title: 'Aether AI - Enterprise-Grade AI Platform',
    description: 'Revolutionary AI platform powered by DocsGPT and Hedera blockchain technology',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aether AI',
    description: 'Enterprise-Grade AI Platform Built on DocsGPT & Hedera',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceMono.variable} font-sans antialiased`}>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'oklch(0.10 0 0 / 0.9)',
                border: '1px solid oklch(1 0 0 / 0.08)',
                color: 'oklch(0.95 0 0)',
                backdropFilter: 'blur(20px)',
              },
            }}
          />
        </ErrorBoundary>
      </body>
    </html>
  );
}
