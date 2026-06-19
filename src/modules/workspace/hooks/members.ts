import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceMembers, updateWorkspaceMemberRole } from "../actions/members";
import { MEMBER_ROLE } from "@prisma/client";

export function useWorkspaceMembers(workspaceId: string | undefined) {
    return useQuery({
        queryKey: ["workspace_members", workspaceId],
        queryFn: async () => {
            if (!workspaceId) return [];
            return getWorkspaceMembers(workspaceId);
        },
        enabled: !!workspaceId
    });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ memberId, newRole }: { memberId: string, newRole: MEMBER_ROLE }) => {
            return updateWorkspaceMemberRole(workspaceId, memberId, newRole);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace_members", workspaceId] });
        }
    });
}
