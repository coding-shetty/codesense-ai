"use client";

import React, { useState } from "react";
import { Copy, Download, Check, FileText } from "lucide-react";

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
    const file = new Blob([content], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = "codesense_engineering_report.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  /**
   * Simple markdown → React elements renderer.
   * Handles: ## / ### headings, bullet lists, code blocks, bold/italic inline,
   * inline code, and plain paragraphs.
   */
  const renderMarkdown = (text: string) => {
    const blocks = text.split("\n\n");
    return blocks.map((block, bIdx) => {
      const trimmed = block.trim();
      if (!trimmed) return null;

      // ── Fenced code block ────────────────────────────────────────────────
      if (trimmed.startsWith("```")) {
        const codeLines = trimmed.split("\n").filter((l) => !l.startsWith("```"));
        return (
          <pre
            key={bIdx}
            className="bg-zinc-950/80 p-3 rounded-lg border border-zinc-800/60 font-mono text-[11px] text-zinc-400 overflow-x-auto whitespace-pre"
          >
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
      }

      // ── Heading 3 ───────────────────────────────────────────────────────
      if (trimmed.startsWith("### ")) {
        return (
          <h3
            key={bIdx}
            className="text-xs font-bold text-indigo-400 mt-4 uppercase tracking-wide font-mono"
          >
            {renderInline(trimmed.slice(4))}
          </h3>
        );
      }

      // ── Heading 2 ───────────────────────────────────────────────────────
      if (trimmed.startsWith("## ")) {
        return (
          <h2
            key={bIdx}
            className="text-sm font-semibold text-zinc-100 mt-5 border-l-2 border-indigo-500 pl-2 tracking-tight"
          >
            {renderInline(trimmed.slice(3))}
          </h2>
        );
      }

      // ── Heading 1 ───────────────────────────────────────────────────────
      if (trimmed.startsWith("# ")) {
        return (
          <h1
            key={bIdx}
            className="text-base font-bold text-zinc-50 mt-6 tracking-tight"
          >
            {renderInline(trimmed.slice(2))}
          </h1>
        );
      }

      // ── Bullet list ─────────────────────────────────────────────────────
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <ul key={bIdx} className="list-disc pl-5 space-y-1.5 text-zinc-300">
            {trimmed.split("\n").map((item, i) => {
              const liText = item.replace(/^[-*]\s+/, "").trim();
              if (!liText) return null;
              return (
                <li key={i} className="marker:text-indigo-500">
                  {renderInline(liText)}
                </li>
              );
            })}
          </ul>
        );
      }

      // ── Numbered list ───────────────────────────────────────────────────
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <ol key={bIdx} className="list-decimal pl-5 space-y-1.5 text-zinc-300">
            {trimmed.split("\n").map((item, i) => {
              const liText = item.replace(/^\d+\.\s+/, "").trim();
              if (!liText) return null;
              return (
                <li key={i} className="marker:text-indigo-400">
                  {renderInline(liText)}
                </li>
              );
            })}
          </ol>
        );
      }

      // ── Plain paragraph ─────────────────────────────────────────────────
      return (
        <p key={bIdx} className="text-zinc-300 whitespace-pre-line font-normal leading-relaxed">
          {renderInline(trimmed)}
        </p>
      );
    });
  };

  /**
   * Render inline markdown: **bold**, *italic*, `code`, and plain text.
   */
  const renderInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    // Match **bold**, *italic*, `code`, and plain text
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;

    while ((match = regex.exec(text)) !== null) {
      // Push text before the match
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }
      if (match[2]) {
        parts.push(
          <strong key={key++} className="text-zinc-100 font-semibold">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        parts.push(
          <em key={key++} className="text-zinc-200 italic">
            {match[3]}
          </em>
        );
      } else if (match[4]) {
        parts.push(
          <code
            key={key++}
            className="px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[11px] font-mono text-indigo-300"
          >
            {match[4]}
          </code>
        );
      }
      lastIndex = match.index + match[0].length;
    }
    // Push remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className="w-full h-full flex flex-col space-y-4">
      {/* Action Toolbar */}
      {content && (
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center space-x-2 text-zinc-400">
            <FileText size={14} className="text-indigo-400" />
            <span className="text-[11px] font-medium uppercase font-mono tracking-wider">
              Analysis Report
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md border border-zinc-800 transition-all"
              title="Copy Report"
            >
              {copied ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
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
          <div className="space-y-4 font-sans">{renderMarkdown(content)}</div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-600 text-[11px] italic text-center p-6 space-y-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 animate-pulse">
              ⚡
            </div>
            <span>
              Ready for analysis. Press &quot;Run Analysis&quot; to stream the AI
              review matrix.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
