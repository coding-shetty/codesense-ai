"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, FileCode, Sliders, History } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Analysis Engine', href: '/', icon: Cpu },
    { name: 'Repo Ingest', href: '/repository', icon: FileCode },
    { name: 'Scan History', href: '/history', icon: History },
    { name: 'API Keys Vault', href: '/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/60 bg-zinc-900/30 backdrop-blur-xl flex flex-col p-6 h-screen">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 text-white">Ω</div>
        <span className="font-semibold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">CodeSense AI</span>
      </div>
      
      <nav className="space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={cn(
                "w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all mb-1",
                isActive 
                  ? "bg-zinc-800 text-zinc-100" 
                  : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
              )}>
                <item.icon size={14} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="text-[10px] text-zinc-600 font-mono text-center">
          CodeSense Core v1.0
        </div>
      </div>
    </aside>
  );
}