import React, { useState } from 'react';
import ScriptEditor from "./script-editor";
import { RequestTab } from "../store/useRequestStore";

interface Props {
  tab: RequestTab;
  updateTab: (id: string, data: Partial<RequestTab>) => void;
}

const ScriptsTab = ({ tab, updateTab }: Props) => {
  const [activeSubTab, setActiveSubTab] = useState<'pre-request' | 'post-response'>('pre-request');

  const handlePreRequestChange = (script: string) => {
    updateTab(tab.id, { preRequestScript: script });
  };

  const handleTestScriptChange = (script: string) => {
    updateTab(tab.id, { testScript: script });
  };

  return (
    <div className="flex flex-1 h-full w-full min-h-0">
      {/* Left Sidebar */}
      <div className="w-48 border-r border-zinc-800 bg-[#0d0d0f] flex flex-col p-2 gap-1 shrink-0">
        <button
          onClick={() => setActiveSubTab('pre-request')}
          className={`text-left px-3 py-2 text-[13px] rounded-md transition-colors ${
            activeSubTab === 'pre-request' 
              ? 'bg-[#27272a] text-zinc-200 font-medium' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          Pre-request
        </button>
        <button
          onClick={() => setActiveSubTab('post-response')}
          className={`text-left px-3 py-2 text-[13px] rounded-md transition-colors ${
            activeSubTab === 'post-response' 
              ? 'bg-[#27272a] text-zinc-200 font-medium' 
              : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
          }`}
        >
          Post-response
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 min-w-0 h-full flex flex-col bg-[#0d0d0f]">
        {activeSubTab === 'pre-request' && (
          <ScriptEditor
            initialData={tab.preRequestScript || ''}
            onSubmit={handlePreRequestChange}
            placeholder="// Write JavaScript code to execute before the request is sent."
          />
        )}
        {activeSubTab === 'post-response' && (
          <ScriptEditor
            initialData={tab.testScript || ''}
            onSubmit={handleTestScriptChange}
            placeholder="// Use JavaScript to write tests, extract variables, and modify data."
          />
        )}
      </div>
    </div>
  );
};

export default ScriptsTab;
