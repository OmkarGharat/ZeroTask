import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import Script from 'next/script'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'ZeroTask - Task Management App',
  description: 'Organize your tasks, track goals, and stay productive with ZeroTask',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Script id="console-mute" strategy="beforeInteractive">
          {`
            (function() {
              const originalLog = console.log;
              console.log = function(...args) {
                if (args.some(arg => typeof arg === 'string' && arg.includes('[Heyday Reading]'))) {
                  return;
                }
                originalLog.apply(console, args);
              };
              const originalInfo = console.info;
              console.info = function(...args) {
                if (args.some(arg => typeof arg === 'string' && arg.includes('[Heyday Reading]'))) {
                  return;
                }
                originalInfo.apply(console, args);
              };
              const originalWarn = console.warn;
              console.warn = function(...args) {
                if (args.some(arg => typeof arg === 'string' && arg.includes('[Heyday Reading]'))) {
                  return;
                }
                originalWarn.apply(console, args);
              };
            })();
          `}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
