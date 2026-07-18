import React from 'react';
import './globals.css'; // Verify this file imports Tailwind styles

export const metadata = {
  title: 'CodeSense AI - High Performance Code Analytics Platform',
  description: 'Deterministic AST Metrics and Adaptive Stream Reasoning Interface Studio Layout Engine.',
};

export default function SystemRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark selection:bg-indigo-500/30 selection:text-indigo-200">
      <body className="bg-zinc-950 text-zinc-50 antialiased overflow-hidden min-h-screen relative">
        {/* Subtle premium background glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="relative z-10 w-full h-full">
          {children}
        </div>
      </body>
    </html>
  );
}