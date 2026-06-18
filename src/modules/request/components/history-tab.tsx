import React, { useMemo } from 'react';
import { useWorkspaceHistory } from '../hooks/history';
import { ChevronDown, ChevronRight, History } from 'lucide-react';
import { useRequestPlaygroundStore } from '../store/useRequestStore';
import { cn } from '@/lib/utils';

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

  const requestColorMap: Record<string, string> = {
    GET: "text-green-500",
    POST: "text-blue-500",
    PUT: "text-yellow-500",
    DELETE: "text-red-500",
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
                        className="flex items-center space-x-3 text-xs py-1.5 px-2 hover:bg-zinc-800 rounded cursor-pointer group"
                      >
                        <span className={cn("font-bold w-12 text-right shrink-0", requestColorMap[run.request.method] || "text-zinc-500")}>
                          {run.request.method}
                        </span>
                        <span className="truncate text-zinc-300 group-hover:text-white flex-1" title={run.request.url}>
                          {run.request.url}
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
