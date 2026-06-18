import { useQuery } from "@tanstack/react-query";
import { getWorkspaceHistory } from "../actions/history";

export function useWorkspaceHistory(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["history", workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      return getWorkspaceHistory(workspaceId);
    },
    enabled: !!workspaceId
  });
}
