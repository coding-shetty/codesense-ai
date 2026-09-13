"use client";

import React, { useState, useCallback } from "react";
import Sidebar from "../components/sidebar";
import CodeCanvas from "../components/editor";
import PipelineVisualizer from "../components/pipeline-visualizer";
import ReportView from "../components/report-view";
import { streamCodeAnalysis } from "../lib/api-client";
import { useKeyboardShortcut } from "../hooks/use-keyboard";
import { Play, ShieldAlert, Sparkles, Flame } from "lucide-react";

export default function EngineeringDashboard() {
  const [sourceCode, setSourceCode] = useState<string>(
    `def compute_hash(payload):\n    # Deep nesting smell check\n    for item in payload:\n        if item['valid'] == True:\n            if 'secret' in item:\n                # Critical bug: Hardcoded access vector token\n                auth_key = "AI_KEY_SECRET_V1_TOKEN"\n                return auth_key\n    return None`
  );

  const [fileName, setFileName] = useState<string>("crypto_service.py");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineStage, setPipelineStage] = useState<
    "idle" | "parsing" | "scanning" | "generation" | "complete"
  >("idle");
  const [metrics, setMetrics] = useState<any>(null);
  const [aiReportStream, setAiReportStream] = useState<string>("");
  const [mentorMode, setMentorMode] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const runAnalysisPipeline = useCallback(async () => {
    if (!sourceCode.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAiReportStream("");
    setMetrics(null);
    setAnalysisError(null);
    setPipelineStage("parsing");

    await streamCodeAnalysis(sourceCode, fileName, mentorMode, {
      onMetrics: (data: any) => {
        setPipelineStage("scanning");
        setMetrics(data);
      },
      onStatus: () => {
        setPipelineStage("generation");
      },
      onChunk: (chunk: string) => {
        setAiReportStream((prev) => prev + chunk);
      },
      onError: (err: string) => {
        console.error("Pipeline failure:", err);
        setAnalysisError(err);
        setIsAnalyzing(false);
        setPipelineStage("idle");
      },
    });

    setIsAnalyzing(false);
    setPipelineStage("complete");
  }, [sourceCode, fileName, mentorMode, isAnalyzing]);

  // Bind premium 'Cmd+Enter' or 'Ctrl+Enter' key shortcut behavior
  useKeyboardShortcut("Enter", true, runAnalysisPipeline);

  // Derive the Monaco language from the filename extension
  const extToLanguage: Record<string, string> = {
    py: "python",
    js: "javascript",
    ts: "typescript",
    jsx: "javascript",
    tsx: "typescript",
    go: "go",
    rs: "rust",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    rb: "ruby",
    php: "php",
    swift: "swift",
    kt: "kotlin",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
    html: "html",
    css: "css",
    sql: "sql",
    sh: "shell",
    md: "markdown",
  };
  const fileExt = fileName.includes(".") ? fileName.split(".").pop() || "" : "";
  const editorLanguage = extToLanguage[fileExt] || "plaintext";

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans antialiased overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Monaco Editor Canvas */}
        <section className="flex-1 p-6 flex flex-col space-y-4 h-full">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold tracking-tight">
                Code Evaluation Studio
              </h1>
              <p className="text-[11px] text-zinc-500">
                Run safe, isolated AST diagnostics and streaming AI reasoning matrices
                instantly.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-zinc-900/60 border border-zinc-800 rounded-lg">
                <span className="text-[10px] uppercase font-mono text-zinc-400">
                  Mentor Engine
                </span>
                <input
                  type="checkbox"
                  checked={mentorMode}
                  onChange={(e) => setMentorMode(e.target.checked)}
                  className="w-6 h-3.5 accent-indigo-500 cursor-pointer"
                />
              </div>

              <button
                onClick={runAnalysisPipeline}
                disabled={isAnalyzing}
                className="flex items-center space-x-1.5 px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-950 font-semibold text-xs rounded-lg shadow-md transition-all"
              >
                <Play size={10} fill="currentColor" />
                <span>{isAnalyzing ? "Processing..." : "Run Analysis"}</span>
              </button>
            </div>
          </div>

          {/* Filename input */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="filename.py"
              className="w-56 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-1.5 text-[11px] font-mono text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition-all"
            />
            <span className="text-[10px] text-zinc-600 font-mono">
              Detected: {editorLanguage}
            </span>
          </div>

          <div className="flex-1 relative">
            <CodeCanvas
              language={editorLanguage}
              value={sourceCode}
              onChange={(val: string | undefined) => setSourceCode(val || "")}
            />
          </div>
        </section>

        {/* Right Side: Analytical Output Inspector */}
        <section className="w-[460px] border-l border-zinc-800/60 bg-zinc-900/10 backdrop-blur-3xl p-6 flex flex-col space-y-5 overflow-y-auto h-full">
          <PipelineVisualizer currentStage={pipelineStage} />

          {analysisError && (
            <div className="p-4 rounded-xl border border-red-900/40 bg-red-950/20 text-xs text-red-400 font-mono space-y-1">
              <div className="font-semibold text-red-300">Pipeline Error</div>
              <div className="text-[11px]">{analysisError}</div>
            </div>
          )}

          {metrics && (
            <div className="space-y-3 animate-fadeIn">
              {/* Complexity Metric Dashboard Card */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start space-x-3">
                <Sparkles className="text-indigo-400 mt-0.5" size={14} />
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold">
                    Cyclomatic Branch Weight:{" "}
                    {metrics.complexity.cyclomatic_complexity}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    {metrics.complexity.rating}
                  </div>
                </div>
              </div>

              {/* AST Structure Card */}
              {metrics.ast_structure && (
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 flex items-start space-x-3">
                  <Sparkles className="text-indigo-400 mt-0.5" size={14} />
                  <div className="space-y-1.5 w-full">
                    <div className="text-xs font-semibold">
                      Structural Code Signatures
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-400 mt-1">
                      <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/50 flex justify-between">
                        <span>Functions:</span>
                        <span className="text-indigo-400 font-bold">
                          {metrics.ast_structure.function_declarations}
                        </span>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/50 flex justify-between">
                        <span>Classes:</span>
                        <span className="text-indigo-400 font-bold">
                          {metrics.ast_structure.class_declarations}
                        </span>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/50 flex justify-between">
                        <span>Loops:</span>
                        <span className="text-indigo-400 font-bold">
                          {metrics.ast_structure.loops_count}
                        </span>
                      </div>
                      <div className="bg-zinc-950/60 p-2 rounded border border-zinc-800/50 flex justify-between">
                        <span>Max Depth:</span>
                        <span className="text-indigo-400 font-bold">
                          {metrics.ast_structure.max_indentation_depth}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Alerts Stack */}
              {metrics.findings && metrics.findings.length > 0 && (
                <div className="p-4 rounded-xl bg-red-950/10 border border-red-900/20 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-red-400">
                    <ShieldAlert size={12} />
                    <span>
                      Security Scanner Highlights ({metrics.findings.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {metrics.findings.map((item: any, i: number) => (
                      <div
                        key={i}
                        className="text-[10px] font-mono text-zinc-400 bg-zinc-950/50 p-2 rounded border border-red-950/20 flex items-start space-x-1"
                      >
                        <Flame
                          size={12}
                          className="text-red-500 shrink-0 mt-0.5"
                        />
                        <span>
                          Line {item.line}: {item.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI Blueprint Container Section */}
          <div className="flex-1 bg-zinc-900/30 rounded-xl p-4 border border-zinc-800/40 overflow-hidden flex flex-col shadow-inner">
            <ReportView content={aiReportStream} />
          </div>
        </section>
      </main>
    </div>
  );
}
