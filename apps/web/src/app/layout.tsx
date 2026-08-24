import React from 'react';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata = {
  title: 'Talora — Class & Group Coordination Platform',
  description: 'API-first university class coordination, group formation, and submission management platform.',
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
