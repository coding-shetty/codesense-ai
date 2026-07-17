"use client";

import React, { useState } from 'react';
import { GitBranch, Terminal, RefreshCw, BarChart2 } from 'lucide-react';

export default function RepositoryExplorerView() {
  const [repoUrl, setRepoUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [repoMetrics, setRepoMetrics] = useState<any>(null);

  const executeRepoScan = async () => {
    if (!repoUrl.trim()) return;
    setIsScanning(true);
    setRepoMetrics(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/repo/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl })
      });
      const data = await res.json();
      setRepoMetrics(data);
    } catch (err) {
      console.error("Repository analytics scanning engine fault: ", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Repository Target Architecture Ingest</h1>
          <p className="text-xs text-zinc-500">Analyze full remote directories to evaluate system health, file distribution, and design structure.</p>
        </div>

        <div className="flex space-x-3 items-center bg-zinc-900/40 border border-zinc-800/80 p-2.5 rounded-xl shadow-inner">
          <GitBranch size={16} className="text-zinc-500 ml-2" />
          <input 
            type="text" 
            placeholder="github.com/username/target-repository-signature"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="flex-1 bg-transparent text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
          <button
            onClick={executeRepoScan}
            disabled={isScanning}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 text-xs font-medium rounded-lg transition-all shadow-md"
          >
            {isScanning ? <RefreshCw size={12} className="animate-spin"/> : <Terminal size={12}/>}
            <span>{isScanning ? "Scanning Matrix..." : "Extract Layout"}</span>
          </button>
        </div>

        {repoMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Health Card */}
            <div className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md space-y-3">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center space-x-2">
                <BarChart2 size={14} className="text-indigo-400" />
                <span>Architecture Health Core Report</span>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold text-zinc-100">{repoMetrics.health_score}%</div>
                <div className="text-xs text-zinc-400 font-mono">Module Configuration Vector: <span className="text-zinc-200 font-semibold">{repoMetrics.architecture_detected}</span></div>
                <div className="text-[11px] text-zinc-500">Calculated across {repoMetrics.total_files} active tracking files.</div>
              </div>
            </div>

            {/* Distribution Card */}
            <div className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md space-y-3">
              <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">File Extension Spectrum Map</div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                {Object.entries(repoMetrics.file_distribution).map(([key, value]: any) => (
                  <div key={key} className="flex items-center justify-between text-xs font-mono border-b border-zinc-900 pb-1">
                    <span className="text-zinc-500">.{key}</span>
                    <span className="text-zinc-300 font-semibold">{value} instances</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}