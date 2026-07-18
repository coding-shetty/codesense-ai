"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Cpu, FileCode, Sliders, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Analysis Engine', href: '/', icon: Cpu },
    { name: 'Repo Ingest', href: '/repository', icon: FileCode },
    { name: 'Scan History', href: '/history', icon: History },
    { name: 'API Keys Vault', href: '/settings', icon: Sliders },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-zinc-950/40 backdrop-blur-md flex flex-col p-6 h-screen relative z-20">
      <div className="flex items-center space-x-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/20 text-white font-mono">Ω</div>
        <span className="font-semibold text-sm tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-100 to-zinc-400">CodeSense AI</span>
      </div>
      
      <nav className="space-y-1.5 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="block relative">
              <div className={cn(
                "relative w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all mb-1 overflow-hidden z-10",
                isActive 
                  ? "text-indigo-200" 
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              )}>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-600/10 border-l-2 border-indigo-500 z-[-1]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <item.icon size={14} className={cn(isActive ? "text-indigo-400" : "text-zinc-400")} />
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