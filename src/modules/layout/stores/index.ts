import { create } from "zustand";

type Workspace = {
  id: string;
  name: string;
};

interface WorkspaceState {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
  activeEnvironmentId: string | null;
  setActiveEnvironmentId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  selectedWorkspace: null,
  setSelectedWorkspace: (workspace) =>
    set(() => ({ selectedWorkspace: workspace })),
  activeEnvironmentId: null,
  setActiveEnvironmentId: (id) =>
    set(() => ({ activeEnvironmentId: id })),
}));