import React from 'react';
import '@/app/globals.css'; // Verify this file imports Tailwind styles

export const metadata = {
  title: 'CodeSense AI - High Performance Code Analytics Platform',
  description: 'Deterministic AST Metrics and Adaptive Stream Reasoning Interface Studio Layout Engine.',
};

export default function SystemRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark selection:bg-indigo-500/30 selection:text-indigo-200">
      <body className="bg-zinc-950 text-zinc-50 antialiased overflow-hidden min-h-screen">
        {children}
      </body>
    </html>
  );
}