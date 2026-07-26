"use client";

import React, { useState } from 'react';
import { GitBranch, Terminal, RefreshCw, BarChart2, ShieldCheck, Activity, Layers, FileText } from 'lucide-react';
import Sidebar from '../../components/sidebar';

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
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Repository Target Architecture Ingest</h1>
            <p className="text-xs text-zinc-500">Analyze full remote directories to evaluate system health, security posture, and design structure.</p>
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
            <div className="space-y-6 animate-fadeIn">
              
              {/* Top Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                  title="Health Score" 
                  value={`${repoMetrics.health_score}/100`} 
                  color="text-emerald-400" 
                  border="border-emerald-500/20"
                  icon={<BarChart2 size={14} className="text-emerald-400" />}
                />
                <MetricCard 
                  title="Security Score" 
                  value={`${repoMetrics.security_score}/100`} 
                  color="text-cyan-400" 
                  border="border-cyan-500/20"
                  icon={<ShieldCheck size={14} className="text-cyan-400" />}
                />
                <MetricCard 
                  title="Maintainability" 
                  value={`${repoMetrics.maintainability_score}/100`} 
                  color="text-purple-400" 
                  border="border-purple-500/20"
                  icon={<Activity size={14} className="text-purple-400" />}
                />
                <MetricCard 
                  title="Documentation" 
                  value={`${repoMetrics.documentation_score}/100`} 
                  color="text-blue-400" 
                  border="border-blue-500/20"
                  icon={<FileText size={14} className="text-blue-400" />}
                />
              </div>

              {/* Middle Section Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Columns: Architecture & Frameworks */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Frameworks Card */}
                  <div className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md space-y-3">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center space-x-2">
                      <Layers size={14} className="text-indigo-400" />
                      <span>Detected Frameworks & Stack</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {repoMetrics.frameworks && repoMetrics.frameworks.length > 0 ? (
                        repoMetrics.frameworks.map((fw: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-medium text-indigo-300">
                            {fw}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-500 font-mono">Standard repository structural layout</span>
                      )}
                    </div>
                  </div>

                  {/* Architecture & Assessment Card */}
                  <div className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md space-y-3">
                    <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Architecture & System Overview</div>
                    <div className="text-sm font-mono text-zinc-200">{repoMetrics.architecture_detected}</div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Evaluated across <span className="text-zinc-200 font-semibold">{repoMetrics.total_files}</span> active source files. The codebase exhibits clear modular boundaries suited for automated static analysis and continuous delivery pipelines.
                    </p>
                  </div>

                </div>

                {/* Right Column: File Extension Spectrum Map */}
                <div className="p-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-md space-y-3">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">File Extension Spectrum</div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                    {repoMetrics.file_distribution && Object.entries(repoMetrics.file_distribution).map(([key, value]: any) => (
                      <div key={key} className="flex items-center justify-between text-xs font-mono border-b border-zinc-900/60 pb-1.5">
                        <span className="text-zinc-500">.{key}</span>
                        <span className="text-zinc-300 font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, color, border, icon }: { title: string; value: string | number; color: string; border: string; icon: React.ReactNode }) {
  return (
    <div className={`p-5 rounded-2xl border ${border} bg-zinc-900/20 backdrop-blur-md space-y-3 shadow-lg`}>
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide flex items-center space-x-2">
        {icon}
        <span>{title}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
