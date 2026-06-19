"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import TabbedSidebar from "@/modules/collections/components/sidebar";
import { useWorkspaceStore } from "@/modules/layout/stores";

import RequestPlayground from "@/modules/request/components/request-playground";



import { useGetWorkspace } from "@/modules/workspace/hooks/workspace";
import { Loader } from "lucide-react";

const Page = () => {
  const { selectedWorkspace } = useWorkspaceStore();
  const { data: currentWorkspace, isLoading } = useGetWorkspace( selectedWorkspace?.id!);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader className="animate-spin h-6 w-6 text-indigo-500" />
      </div>
    );
  }

return (
  <ResizablePanelGroup direction="horizontal">
    <ResizablePanel defaultSize={65} minSize={40}>
        <RequestPlayground />
    </ResizablePanel>

    <ResizableHandle withHandle />

    <ResizablePanel defaultSize={35} maxSize={40} minSize={25} className="flex overflow-hidden">
      <div className="flex-1 min-w-0 overflow-hidden">
        <TabbedSidebar currentWorkspace={currentWorkspace} />
      </div>
    </ResizablePanel>
  </ResizablePanelGroup>
)
};

export default Page;