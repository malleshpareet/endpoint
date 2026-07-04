"use client";
import { X, Plus } from "lucide-react";
import { useState } from "react";
import { useRequestPlaygroundStore } from "../store/useRequestStore";
import AddNameModal from "./add-name-modal";

const methodColors: Record<string, { text: string; bg: string }> = {
  GET:    { text: "text-emerald-400", bg: "bg-emerald-500/10" },
  POST:   { text: "text-blue-400",    bg: "bg-blue-500/10" },
  PUT:    { text: "text-amber-400",   bg: "bg-amber-500/10" },
  DELETE: { text: "text-red-400",     bg: "bg-red-500/10" },
  PATCH:  { text: "text-purple-400",  bg: "bg-purple-500/10" },
  QUERY:  { text: "text-pink-400",    bg: "bg-pink-500/10" },
};

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, addTab, closeTab } =
    useRequestPlaygroundStore();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedTabId, setSelectedTabId] = useState<string | null>(null);

  const onDoubleClick = (tabId: string) => {
    setSelectedTabId(tabId);
    setRenameModalOpen(true);
  };

  return (
    <>
      <div className="flex items-center h-9 border-b border-white/[0.06] bg-[#111113] overflow-x-auto overflow-y-hidden">
        <div className="flex items-center min-w-0 flex-1">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const color = methodColors[tab.method] ?? { text: "text-zinc-400", bg: "bg-zinc-700/20" };
            return (
              <div
                key={tab.id}
                onDoubleClick={() => onDoubleClick(tab.id)}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-1.5 px-3 h-9 cursor-pointer shrink-0 border-r border-white/[0.05] transition-colors max-w-[180px] ${
                  isActive
                    ? "bg-[#0d0d0f] text-zinc-200"
                    : "text-zinc-500 hover:text-zinc-400 hover:bg-white/[0.03]"
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-sm" />
                )}

                {/* Method badge */}
                <span className={`text-[10px] font-bold uppercase tracking-wide px-1 py-0.5 rounded ${color.text} ${color.bg} shrink-0`}>
                  {tab.method}
                </span>

                {/* Tab title */}
                <span className="text-xs truncate font-medium">
                  {tab.title}
                </span>

                {/* Unsaved dot */}
                {tab.unsavedChanges && (
                  <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 group-hover:hidden" />
                )}

                {/* Close button */}
                <button
                  className="hidden group-hover:flex items-center justify-center w-4 h-4 rounded hover:bg-white/10 text-zinc-500 hover:text-red-400 transition-all ml-auto shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add tab */}
        <button
          onClick={addTab}
          className="flex items-center justify-center w-8 h-9 text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.05] transition-all shrink-0 border-l border-white/[0.05]"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {selectedTabId && (
        <AddNameModal
          isModalOpen={renameModalOpen}
          setIsModalOpen={setRenameModalOpen}
          tabId={selectedTabId}
        />
      )}
    </>
  );
}