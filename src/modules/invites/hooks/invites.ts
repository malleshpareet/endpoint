"use client";

import { useMutation , useQuery , useQueryClient } from "@tanstack/react-query";
import {
    generateWorkspaceInvite,
    acceptWorkspaceInvite,
    getAllWorkspaceMembers,
    inviteUserByEmail
} from "@/modules/invites/actions";

export const useInviteUserByEmail = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (email: string) => {
      const res = await inviteUserByEmail(workspaceId, email);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", workspaceId],
      });
    },
  });
};

export const useGenerateWorkspaceInvite = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await generateWorkspaceInvite(workspaceId);
      if (res?.error) throw new Error(res.error);
      return res.link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspace-invites", workspaceId],
      });
    },
  });
};

export const useAcceptWorkspaceInvite = () => {
  return useMutation({
    mutationFn: (token: string) => acceptWorkspaceInvite(token),
  });
  
};

export const useGetWorkspaceMemebers = (workspaceId: string) => {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: async () => getAllWorkspaceMembers(workspaceId),
    enabled: !!workspaceId,
  });
};