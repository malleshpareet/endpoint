import { useQuery } from "@tanstack/react-query";
import { getWorkspaceActivity } from "../actions/activity";

export function useWorkspaceActivity(workspaceId: string) {
    return useQuery({
        queryKey: ["workspace-activity", workspaceId],
        queryFn: async () => {
            const result = await getWorkspaceActivity(workspaceId);
            if (!result.success) throw new Error(result.error);
            return result.data;
        },
        enabled: !!workspaceId,
        refetchInterval: 10000, // Refetch every 10 seconds to keep feed fresh
    });
}
