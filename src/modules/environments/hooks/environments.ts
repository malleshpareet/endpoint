import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEnvironments, createEnvironment, updateEnvironment, deleteEnvironment, getWorkspaceGlobals, updateWorkspaceGlobals } from "../actions";

export function useEnvironments(workspaceId?: string) {
  return useQuery({
    queryKey: ["environments", workspaceId],
    queryFn: async () => getEnvironments(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, name, type, collectionId }: { workspaceId: string; name: string; type?: "GLOBAL" | "COLLECTION"; collectionId?: string | null }) =>
      createEnvironment(workspaceId, name, type, collectionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["environments", variables.workspaceId] });
    },
  });
}

export function useUpdateEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, values }: { id: string; name: string; values: any }) =>
      updateEnvironment(id, name, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });
}

export function useDeleteEnvironment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEnvironment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["environments"] });
    },
  });
}

export function useWorkspaceGlobals(workspaceId?: string) {
  return useQuery({
    queryKey: ["globalVariables", workspaceId],
    queryFn: async () => getWorkspaceGlobals(workspaceId!),
    enabled: !!workspaceId,
  });
}

export function useUpdateWorkspaceGlobals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, globals }: { workspaceId: string; globals: any }) =>
      updateWorkspaceGlobals(workspaceId, globals),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["globalVariables", variables.workspaceId] });
    },
  });
}
