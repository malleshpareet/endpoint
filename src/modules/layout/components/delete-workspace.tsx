"use client";

import Modal from "@/components/ui/modal";
import { useDeleteWorkspace } from "@/modules/workspace/hooks/workspace";
import { useWorkspaceStore } from "../stores";
import React from "react";
import { toast } from "sonner";

const DeleteWorkspaceModal = ({
  isModalOpen,
  setIsModalOpen,
  workspaceId,
  workspaceName,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  workspaceId: string;
  workspaceName: string;
}) => {
  const { mutateAsync, isPending } = useDeleteWorkspace();
  const { selectedWorkspace, setSelectedWorkspace } = useWorkspaceStore();

  const handleDelete = async () => {
    try {
      await mutateAsync(workspaceId);
      toast.success("Workspace deleted successfully");
      
      // If the deleted workspace is the currently selected one, clear the selection
      if (selectedWorkspace?.id === workspaceId) {
        setSelectedWorkspace(null);
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete workspace");
      console.error("Failed to delete workspace:", err);
    }
  };

  return (
    <Modal
      title="Delete Workspace"
      description={`Are you sure you want to delete "${workspaceName}"? This action cannot be undone.`}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        All collections, requests, and members in this workspace will be permanently removed.
      </p>
    </Modal>
  );
};

export default DeleteWorkspaceModal;
