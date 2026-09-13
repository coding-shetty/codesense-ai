"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  ShieldCheck,
  Cpu,
  Sliders,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Sidebar from "../../components/sidebar";
import { apiUrl, apiHeaders } from "../../lib/config";

export default function AdvancedSettingsView() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [isVaulting, setIsVaulting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  // Settings preferences state
  const [defaultProvider, setDefaultProvider] = useState("ollama");
  const [defaultModel, setDefaultModel] = useState("qwen2.5-coder");
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [prefStatusMsg, setPrefStatusMsg] = useState("");

  // Key vault check status
  const [vaultStatus, setVaultStatus] = useState<Record<string, boolean>>({
    openai: false,
    gemini: false,
    openrouter: false,
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch(
        apiUrl("/api/v1/settings/default-local-user"),
        { headers: apiHeaders() }
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const payload = await res.json();
      if (payload.status === "success" && payload.data) {
        setDefaultProvider(payload.data.default_provider);
        setDefaultModel(payload.data.default_model);
        if (payload.data.vault_status) {
          setVaultStatus(payload.data.vault_status);
        }
      }
    } catch (err) {
      console.error("Failed to load settings preferences from backend vault:", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const submitVaultKey = async () => {
    if (!apiKey.trim()) return;
    setIsVaulting(true);
    setStatusMsg("");

    try {
      const res = await fetch(apiUrl("/api/v1/settings/keys"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          user_id: "default-local-user",
          provider: provider,
          api_key: apiKey,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setStatusMsg("Credentials encrypted and saved successfully.");
        setApiKey("");
        await fetchSettings(); // Refresh vaulted status
      } else {
        setStatusMsg("Vault synchronization rejected.");
      }
    } catch (err) {
      setStatusMsg("Failed to connect to the backend security vault service.");
    } finally {
      setIsVaulting(false);
    }
  };

  const submitPreferences = async () => {
    setIsSavingPref(true);
    setPrefStatusMsg("");
    try {
      const res = await fetch(apiUrl("/api/v1/settings/update"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          user_id: "default-local-user",
          default_provider: defaultProvider,
          default_model: defaultModel,
        }),
      });
      const data = await res.json();
      if (data.status === "success") {
        setPrefStatusMsg("Active preferences updated successfully.");
      } else {
        setPrefStatusMsg("Preferences update rejected.");
      }
    } catch (err) {
      setPrefStatusMsg("Failed to sync preferences with database.");
    } finally {
      setIsSavingPref(false);
    }
  };

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              System Infrastructure Vault
            </h1>
            <p className="text-xs text-zinc-500">
              Manage hardware routing arrays, backend configurations, and zero-leak cryptographic
              credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Key Vault configuration box */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xl space-y-6 shadow-xl">
              <div className="flex items-center space-x-3 text-sm font-semibold border-b border-zinc-800 pb-3">
                <Key size={16} className="text-indigo-400" />
                <span>Cryptographic Target Provisioner</span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Target Hardware Engine Infrastructure
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all text-zinc-200"
                  >
                    <option value="openai">OpenAI Production Clusters</option>
                    <option value="gemini">Google Gemini Web Pipeline</option>
                    <option value="openrouter">OpenRouter Unified Aggregator</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Secret Security Key Input
                  </label>
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
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-lg transition-all"
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

            {/* Active Preferences Panel */}
            <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/20 backdrop-blur-xl space-y-6 shadow-xl">
              <div className="flex items-center space-x-3 text-sm font-semibold border-b border-zinc-800 pb-3">
                <Sliders size={16} className="text-indigo-400" />
                <span>Active Routing Configurations</span>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Default Model Provider
                  </label>
                  <select
                    value={defaultProvider}
                    onChange={(e) => setDefaultProvider(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all text-zinc-200"
                  >
                    <option value="ollama">Ollama (Offline Local Fallback)</option>
                    <option value="openai">OpenAI Production</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="openrouter">OpenRouter Aggregator</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                    Default Active Model
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. gpt-4o, gemini-1.5-flash"
                    value={defaultModel}
                    onChange={(e) => setDefaultModel(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-all text-zinc-200"
                  />
                </div>

                <button
                  onClick={submitPreferences}
                  disabled={isSavingPref}
                  className="w-full px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-950 disabled:opacity-50 font-medium text-xs rounded-lg shadow-lg transition-all"
                >
                  {isSavingPref ? "Saving Preferences..." : "Apply Global Preferences"}
                </button>
              </div>

              {prefStatusMsg && (
                <div className="p-3 bg-zinc-950/80 border border-zinc-800/60 rounded-xl flex items-center space-x-2 text-[11px] font-mono text-zinc-400 animate-fadeIn">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span>{prefStatusMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Vault Vaulted Status Checklist */}
          <div className="p-6 rounded-2xl border border-zinc-800/60 bg-zinc-900/10 space-y-4 shadow-md">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
              API Key Vault Status Matrix
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
              {Object.entries(vaultStatus).map(([prov, vaulted]) => (
                <div
                  key={prov}
                  className="p-3 rounded-lg border border-zinc-900 bg-zinc-950/50 flex items-center justify-between"
                >
                  <span className="capitalize">{prov}</span>
                  {vaulted ? (
                    <span className="flex items-center space-x-1 text-[10px] text-green-400">
                      <CheckCircle2 size={12} />
                      <span>Vaulted</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-[10px] text-zinc-600">
                      <XCircle size={12} />
                      <span>Empty</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Local Hardware Orchestrator Status Cards */}
          <div className="p-6 rounded-2xl border border-zinc-800/40 bg-zinc-900/10 space-y-4 shadow-md">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-400">
              <Cpu size={14} />
              <span>Automated Edge Fallback Array Status</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              If no API key matches a request, the analysis pipeline automatically routes
              computation to your local engine loop via{" "}
              <code className="mx-1 px-1 py-0.5 bg-zinc-900 border border-zinc-800 rounded font-mono text-zinc-300">
                Ollama (qwen2.5-coder)
              </code>
              . This local pipeline keeps your processing 100% free and offline.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
