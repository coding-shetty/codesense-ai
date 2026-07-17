"use client";

import React from 'react';
import { Layers, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

interface PipelineVisualizerProps {
  currentStage: 'idle' | 'parsing' | 'scanning' | 'generation' | 'complete';
}

export default function PipelineVisualizer({ currentStage }: PipelineVisualizerProps) {
  const steps = [
    { stage: 'parsing', label: 'AST Parsing', icon: Layers, desc: 'Keyword Density' },
    { stage: 'scanning', label: 'Static Scan', icon: ShieldCheck, desc: 'Regex Sanity Check' },
    { stage: 'generation', label: 'AI Reasoning', icon: Cpu, desc: 'Streaming Tokens' },
  ];

  return (
    <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-4 shadow-sm backdrop-blur-md">
      <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-3 flex items-center space-x-2">
        <Activity size={12} className="text-indigo-400" />
        <span>Live Analysis Execution Pipeline</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {steps.map((step, idx) => {
          const isCurrent = currentStage === step.stage;
          const isDone = 
            (currentStage === 'scanning' && idx < 1) || 
            (currentStage === 'generation' && idx < 2) || 
            currentStage === 'complete';

          return (
            <div 
              key={step.stage} 
              className={cn(
                "p-3 rounded-lg border transition-all duration-300",
                isCurrent ? "bg-indigo-950/20 border-indigo-500/50 shadow-md shadow-indigo-500/5" :
                isDone ? "bg-zinc-900/60 border-emerald-500/30 opacity-80" : 
                "bg-zinc-950/40 border-zinc-900 opacity-40"
              )}
            >
              <div className="flex items-center space-x-2">
                <step.icon size={14} className={isCurrent ? "text-indigo-400 animate-pulse" : isDone ? "text-emerald-400" : "text-zinc-600"} />
                <span className="text-xs font-medium">{step.label}</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono mt-1">{step.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}