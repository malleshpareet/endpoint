"use client";

import React from "react";
import { useWsStore } from '@/modules/realtime/hooks/useWs';

export function WebSocketSidebar({
  workspaces,
  activeSessionId,
  onSelect,
  onCreate,
}: {
  workspaces: any[];
  activeSessionId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
}) {
  const { isConnected } = useWsStore();
  
  return (
    <div className="w-64 border-r border-border/50 bg-[#0c0c0e] flex flex-col h-full">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h2 className="text-sm font-semibold text-white">Saved Sessions</h2>
        <button
          onClick={onCreate}
          className="text-xs bg-violet-500 hover:bg-violet-600 text-white px-2 py-1 rounded"
        >
          + New
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {workspaces.map((ws) => (
          <div
            key={ws.id}
            onClick={() => onSelect(ws.id)}
            className={`px-4 py-2 cursor-pointer text-sm border-b border-border/10 flex items-center justify-between ${
              activeSessionId === ws.id ? "bg-violet-500/10 text-violet-400 border-l-2 border-l-violet-500" : "text-slate-400 hover:bg-white/5"
            }`}
          >
            <span>{ws.name}</span>
            {isConnected(ws.id) && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Connected" />
            )}
          </div>
        ))}
        {workspaces.length === 0 && (
          <div className="p-4 text-xs text-slate-500">No saved sessions.</div>
        )}
      </div>
    </div>
  );
}
