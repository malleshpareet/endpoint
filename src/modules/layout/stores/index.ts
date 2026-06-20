import { create } from "zustand";
import { persist } from "zustand/middleware";

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

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      selectedWorkspace: null,
      setSelectedWorkspace: (workspace) =>
        set(() => ({ selectedWorkspace: workspace })),
      activeEnvironmentId: null,
      setActiveEnvironmentId: (id) =>
        set(() => ({ activeEnvironmentId: id })),
    }),
    {
      name: "workspace-storage",
    }
  )
);