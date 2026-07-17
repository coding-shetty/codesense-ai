"use client";

import React, { useState } from 'react';
import { Key, ShieldCheck, CheckCircle2, AlertTriangle, Cpu } from 'lucide-react';

export default function AdvancedSettingsView() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [isVaulting, setIsVaulting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const submitVaultKey = async () => {
    if (!apiKey.trim()) return;
    setIsVaulting(true);
    setStatusMsg("");
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/settings/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: "default-local-user",
          provider: provider,
          api_key: apiKey
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setStatusMsg("Credentials encrypted and saved successfully.");
        setApiKey("");
      } else {
        setStatusMsg("Vault synchronization rejected.");
      }
    } catch (err) {
      setStatusMsg("Failed to connect to the backend security vault service.");
    } finally {
      setIsVaulting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">System Infrastructure Vault</h1>
          <p className="text-xs text-zinc-500">Manage hardware routing arrays, backend configurations, and zero-leak cryptographic credentials.</p>
        </div>

        <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xl space-y-6 shadow-xl">
          <div className="flex items-center space-x-3 text-sm font-semibold border-b border-zinc-800 pb-3">
            <Key size={16} className="text-indigo-400" />
            <span>Cryptographic Target Provisioner</span>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Target Hardware Engine Infrastructure</label>
              <select 
                value={provider} 
                onChange={(e) => setProvider(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all text-zinc-200"
              >
                <option value="openai">OpenAI Production Clusters</option>
                <option value="anthropic">Anthropic Claude Engines</option>
                <option value="gemini">Google Gemini Web Pipeline</option>
                <option value="openrouter">OpenRouter Unified Aggregator</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">Secret Security Key Input</label>
              <input 
                type="password" 
                placeholder="sk-........................................" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all text-zinc-200"
              />
            </div>

            <button
              onClick={submitVaultKey}
              disabled={isVaulting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-lg transition-all"
            >
              {isVaulting ? "Encrypting Storage..." : "Vault Matrix Credentials"}
            </button>
          </div>

          {statusMsg && (
            <div className="p-3 bg-zinc-950/80 border border-zinc-800/60 rounded-xl flex items-center space-x-2 text-[11px] font-mono text-zinc-400 animate-fadeIn">
              <ShieldCheck size={14} className="text-green-400" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Local Hardware Orchestrator Status Cards */}
        <div className="p-6 rounded-2xl border border-zinc-800/40 bg-zinc-900/10 space-y-4 shadow-md">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400">
            <Cpu size={14} />
            <span>Automated Edge Fallback Array Status</span>
          </div>
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            If no API key matches a request, the analysis pipeline automatically routes computation to your local engine loop via 
            <code className="mx-1 px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-zinc-300">Ollama (qwen2.5-coder)</code>. 
            This local pipeline keeps your processing 100% free and offline.
          </p>
        </div>
      </div>
    </div>
  );
}