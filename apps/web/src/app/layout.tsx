import React from 'react';
import './globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: 'Talora — Class & Group Coordination Platform',
  description: 'API-first university class coordination, group formation, and submission management platform.',
  manifest: '/manifest.json',
  themeColor: '#0d0d10',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Talora',
  },
};

import { Toaster } from '@/components/ui/Toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="system" enableSystem>
          {children}
          <Toaster position="bottom-right" theme="system" />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
