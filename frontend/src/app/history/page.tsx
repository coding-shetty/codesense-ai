"use client";

import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/sidebar';
import { Calendar, FileCode2, BarChart4 } from 'lucide-react';

export default function HistoryDashboard() {
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPastHistory() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/analyze/history/default-local-user');
        const payload = await res.json();
        if (payload.status === "success") {
          setHistoryItems(payload.data);
        }
      } catch (err) {
        console.error("Could not fetch user history database records:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPastHistory();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Code Evaluation Logs</h1>
          <p className="text-xs text-zinc-500">Review past analytical pipeline reports generated locally or via cloud vaults.</p>
        </div>

        {loading ? (
          <div className="text-xs font-mono text-zinc-600 animate-pulse">
            Querying relational log trees...
          </div>
        ) : historyItems.length > 0 ? (
          <div className="border border-zinc-800/80 rounded-xl bg-zinc-900/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="bg-zinc-900/50 border-b border-zinc-800 text-zinc-400 font-medium">
                <tr>
                  <th className="p-4">Resource Frame</th>
                  <th className="p-4">Language Matrix</th>
                  <th className="p-4">Overall Quality Score</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono text-zinc-300">
                {historyItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-4 flex items-center space-x-2">
                      <FileCode2 size={14} className="text-indigo-400" />
                      <span className="font-sans font-medium text-zinc-200">{item.file_name}</span>
                    </td>
                    <td className="p-4 text-zinc-400">{item.language}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-emerald-400 font-bold">
                        {item.score}/100
                      </span>
                    </td>
                    <td className="p-4 text-zinc-500 text-[11px] flex items-center space-x-1">
                      <Calendar size={12} />
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-dashed border-zinc-800 p-12 rounded-2xl text-center max-w-md mx-auto space-y-2 mt-12">
            <BarChart4 className="mx-auto text-zinc-700" size={24} />
            <h3 className="text-xs font-semibold text-zinc-400">Zero Local Records</h3>
            <p className="text-[11px] text-zinc-600">
              You haven't executed any automated compilation tracks yet. Run your first analysis from the engine room.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}