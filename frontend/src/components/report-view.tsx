"use client";

import React, { useState } from 'react';
import { Copy, Download, Check, FileText } from 'lucide-react';

interface ReportViewProps {
  content: string;
}

export default function ReportView({ content }: ReportViewProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!content) return;
    const element = document.createElement("a");
    const file = new Blob([content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "codesense_engineering_report.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Action Toolbar */}
      {content && (
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center space-x-2 text-zinc-400">
            <FileText size={14} className="text-indigo-400" />
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">Analysis Report</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={copyToClipboard}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md border border-zinc-800 transition-all"
              title="Copy Report"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
            <button 
              onClick={downloadMarkdown}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md border border-zinc-800 transition-all"
              title="Download Markdown"
            >
              <Download size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Styled Output Window */}
      <div className="flex-1 overflow-y-auto pr-1 text-xs leading-relaxed text-zinc-300 scrollbar-thin scrollbar-thumb-zinc-800">
        {content ? (
          <div className="space-y-4 font-sans">
            {content.split('\n\n').map((paragraph, index) => {
              const trimmed = paragraph.trim();
              if (!trimmed) return null;

              // Bullet Lists
              if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                return (
                  <ul key={index} className="list-disc pl-5 space-y-1.5 text-zinc-300">
                    {trimmed.split('\n').map((item, i) => (
                      <li key={i} className="marker:text-indigo-500">
                        {item.replace(/^[-*]\s+/, '')}
                      </li>
                    ))}
                  </ul>
                );
              }

              // Sub-headings (###)
              if (trimmed.startsWith('###')) {
                return (
                  <h3 key={index} className="text-xs font-bold text-indigo-400 mt-4 uppercase tracking-wide font-mono">
                    {trimmed.replace('###', '').trim()}
                  </h3>
                );
              }

              // Main headings (##)
              if (trimmed.startsWith('##')) {
                return (
                  <h2 key={index} className="text-sm font-semibold text-zinc-100 mt-5 border-l-2 border-indigo-500 pl-2 tracking-tight">
                    {trimmed.replace('##', '').trim()}
                  </h2>
                );
              }

              // Code blocks inside text
              if (trimmed.startsWith('```')) {
                const codeLines = trimmed.split('\n').filter(line => !line.startsWith('```'));
                return (
                  <pre key={index} className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-pre">
                    <code>{codeLines.join('\n')}</code>
                  </pre>
                );
              }

              // Standard Paragraphs
              return (
                <p key={index} className="text-zinc-300 whitespace-pre-line font-normal">
                  {trimmed}
                </p>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-[11px] italic text-center p-6 space-y-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 animate-pulse">
              ⚡
            </div>
            <span>Ready for analysis. Press "Run Analysis" to stream the AI review matrix.</span>
          </div>
        )}
      </div>
    </div>
  );
}