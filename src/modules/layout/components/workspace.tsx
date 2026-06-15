"use client";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { Loader, Plus, User } from "lucide-react";
import React, { useEffect, useState } from "react";

// import CreateWorkspace from "./create-workspace";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";




const WorkSpace = () => {
//   const { data: workspaces, isLoading } = useWorkspaces();
  const [isModalOpen, setIsModalOpen] = useState(false);

//   const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceStore();


//   useEffect(() => {
//     if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
//       setSelectedWorkspace(workspaces[0]);
//     }
//   }, [workspaces, selectedWorkspace, setSelectedWorkspace]);

 
//   if (isLoading) {
//     return <Loader className="animate-spin size-4 text-indigo-400" />;
//   }

//   if (!workspaces || workspaces.length === 0) {
//     return <div>No workspace found</div>;
//   }

  return (
    <>
      <Hint label="Change Workspace">
        <Button className="border border-indigo-400 bg-indigo-400/10
        hover:bg-indigo-400/20 text-indigo-400 hover:text-indigo-300 flex flex-row">
        <User className="size-4 text-indigo-400"/>
        <span className="text sm text-indigo-400 font semi-bold">
                Personal Workspace
        </span>
        </Button>
       
      </Hint>

      {/* <CreateWorkspace isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} /> */}
    </>
  );
};

export default WorkSpace;