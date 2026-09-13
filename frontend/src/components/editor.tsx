"use client";

import React from "react";
import Editor from "@monaco-editor/react";

interface CodeCanvasProps {
  value: string;
  onChange: (val: string | undefined) => void;
  language: string;
}

export default function CodeCanvas({ value, onChange, language }: CodeCanvasProps) {
  // Derive a display-friendly file extension from the language
  const langToExt: Record<string, string> = {
    python: "py",
    javascript: "js",
    typescript: "ts",
    go: "go",
    rust: "rs",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    ruby: "rb",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    json: "json",
    yaml: "yaml",
    html: "html",
    css: "css",
    sql: "sql",
    shell: "sh",
    markdown: "md",
    plaintext: "txt",
  };
  const ext = langToExt[language] || language.slice(0, 3);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono text-zinc-400">
            workspace_canvas.{ext}
          </span>
        </div>
      </div>
      <Editor
        height="calc(100% - 40px)"
        theme="vs-dark"
        language={language}
        value={value}
        onChange={onChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, Menlo, Courier New, monospace",
          lineNumbers: "on",
          roundedSelection: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
