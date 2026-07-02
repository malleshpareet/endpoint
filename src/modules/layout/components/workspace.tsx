"use client";

import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/hint";
import { Loader, Plus, User, Trash } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useWorkspaces } from "@/modules/workspace/hooks/workspace";
import { useWorkspaceStore } from "../stores";
import CreateWorkspace from "./create-workspace";
import DeleteWorkspaceModal from "./delete-workspace";


import { UserProps } from "../types";

const WorkSpace = ({ user }: { user?: UserProps }) => {
  const { data: workspaces, isLoading } = useWorkspaces();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceStore();


  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0]);
    }
  }, [workspaces, selectedWorkspace, setSelectedWorkspace]);


  if (isLoading) {
    return <Loader className="animate-spin size-4 text-indigo-400" />;
  }

  if (!workspaces || workspaces.length === 0) {
    return <div>No workspace found</div>;
  }

  return (
    <>
      <Hint label="Change Workspace">
        <Select
          value={selectedWorkspace?.id}
          onValueChange={(id) => {
            const ws = workspaces.find((w) => w.id === id);
            if (ws) setSelectedWorkspace(ws);
          }}
        >
          <SelectTrigger className="border border-indigo-400 bg-indigo-400/10 hover:bg-indigo-400/20 text-indigo-400 hover:text-indigo-300 flex flex-row items-center space-x-1">
            <User className="size-4 text-indigo-400" />
            <span className="text-sm text-indigo-400 font-semibold">
              <SelectValue placeholder="Select workspace" />
            </span>
          </SelectTrigger>
          <SelectContent position="popper" align="start" sideOffset={5}>
            {workspaces.map((ws) => {
              const isInvited = user && ws.ownerId !== user.id;
              return (
                <SelectItem key={ws.id} value={ws.id}>
                  {ws.name} {isInvited && <span className="text-xs text-indigo-400 opacity-80 ml-2">(Invited)</span>}
                </SelectItem>
              );
            })}
            <Separator className="my-1" />
            <div className="p-2 flex items-center justify-between w-full relative z-20">
              <span className="text-sm font-semibold text-zinc-600">
                My Workspaces
              </span>

              <div className="flex space-x-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="relative z-30 h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={14} className="text-indigo-400" />
                </Button>
                {selectedWorkspace?.name !== "Personal Workspace" && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="relative z-30 h-7 w-7 hover:bg-red-400/10 hover:border-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      const isInvited = user && selectedWorkspace?.ownerId !== user.id;
                      if (isInvited) {
                        toast.error("You cannot delete an invited workspace.");
                        return;
                      }
                      setIsDeleteModalOpen(true);
                    }}
                  >
                    <Trash size={14} className="text-red-400" />
                  </Button>
                )}
              </div>
            </div>
          </SelectContent>
        </Select>
      </Hint>

      <CreateWorkspace isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      {selectedWorkspace && (
        <DeleteWorkspaceModal 
          isModalOpen={isDeleteModalOpen} 
          setIsModalOpen={setIsDeleteModalOpen} 
          workspaceId={selectedWorkspace.id} 
          workspaceName={selectedWorkspace.name}
        />
      )}
    </>
  );
};

export default WorkSpace;