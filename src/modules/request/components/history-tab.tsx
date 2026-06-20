import React, { useMemo } from 'react';
import { useWorkspaceHistory } from '../hooks/history';
import { ChevronDown, ChevronRight, History } from 'lucide-react';
import { useRequestPlaygroundStore } from '../store/useRequestStore';
import { sanitizeString } from '@/lib/sanitize';

function getGroupLabel(dateString: string) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
}

export const HistoryTab = ({ workspaceId }: { workspaceId?: string }) => {
  const { data: history, isLoading } = useWorkspaceHistory(workspaceId);
  const { openRequestTab } = useRequestPlaygroundStore();
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const groupedHistory = useMemo(() => {
    if (!history) return {};
    return history.reduce((acc, run) => {
      const groupKey = getGroupLabel(run.createdAt.toString());
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(run);
      return acc;
    }, {} as Record<string, typeof history>);
  }, [history]);

  // Initially expand Today and Yesterday
  React.useEffect(() => {
    if (Object.keys(groupedHistory).length > 0 && Object.keys(expandedGroups).length === 0) {
      setExpandedGroups({
        'Today': true,
        'Yesterday': true
      });
    }
  }, [groupedHistory, expandedGroups]);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const methodColors: Record<string, { text: string; bg: string }> = {
    GET:    { text: "text-emerald-400", bg: "bg-emerald-500/10" },
    POST:   { text: "text-blue-400",   bg: "bg-blue-500/10" },
    PUT:    { text: "text-amber-400",  bg: "bg-amber-500/10" },
    DELETE: { text: "text-red-400",    bg: "bg-red-500/10" },
    PATCH:  { text: "text-purple-400", bg: "bg-purple-500/10" },
  };

  const handleRunClick = (run: any) => {
    openRequestTab({
      id: run.request.id,
      name: run.request.name || 'History Run',
      method: run.request.method,
      url: run.request.url,
      body: run.request.body,
      headers: run.request.headers,
      parameters: run.request.parameters,
      collectionId: run.request.collectionId,
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-300 rounded-md overflow-hidden p-4">
      <div className="flex flex-col space-y-4 mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center">
            <History className="w-5 h-5 mr-2 text-orange-500" />
            History
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">Loading history...</div>
        ) : history?.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500 text-sm">No request history</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedHistory).map(([dateLabel, runs]) => (
              <div key={dateLabel} className="space-y-1">
                <div 
                  className="flex items-center text-sm font-medium text-zinc-400 cursor-pointer hover:text-zinc-200 py-1"
                  onClick={() => toggleGroup(dateLabel)}
                >
                  {expandedGroups[dateLabel] ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
                  {dateLabel}
                </div>
                
                {expandedGroups[dateLabel] && (
                  <div className="flex flex-col space-y-0.5 ml-2">
                    {runs.map((run: any) => (
                      <div 
                        key={run.id}
                        onClick={() => handleRunClick(run)}
                        className="flex items-center gap-2 text-xs py-1.5 px-2 hover:bg-white/[0.04] rounded cursor-pointer group"
                      >
                        {/* Method badge */}
                        {(() => {
                          const color = methodColors[run.request.method] ?? { text: "text-zinc-400", bg: "bg-zinc-700/20" };
                          return (
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-1 py-0.5 rounded shrink-0 ${color.text} ${color.bg}`}>
                              {run.request.method}
                            </span>
                          );
                        })()}

                        {/* URL — show resolved URL if available, else template */}
                        <span
                          className="truncate text-zinc-400 group-hover:text-zinc-200 flex-1 font-mono text-[11px] transition-colors"
                          title={sanitizeString(run.resolvedUrl || run.request.url || '')}
                        >
                          {sanitizeString(run.resolvedUrl || run.request.url || '')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
