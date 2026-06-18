"use client";

import Modal from "@/components/ui/modal";
import { useDeleteRequest } from "@/modules/request/hooks/request";
import { useRequestPlaygroundStore } from "@/modules/request/store/useRequestStore";
import React from "react";
import { toast } from "sonner";

const DeleteRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  requestId,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestId: string;
}) => {
  const { mutateAsync, isPending } = useDeleteRequest(requestId);
  const { tabs, closeTab } = useRequestPlaygroundStore();

  const handleDelete = async () => {
    try {
      await mutateAsync();
      toast.success("Request deleted successfully");
      
      // Close the tab if it's currently open
      const tabToClose = tabs.find(t => t.requestId === requestId);
      if (tabToClose) {
        closeTab(tabToClose.id);
      }

      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete request");
      console.error("Failed to delete request:", err);
    }
  };

  return (
    <Modal
      title="Delete Request"
      description="Are you sure you want to delete this request? This action cannot be undone."
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleDelete}
      submitText={isPending ? "Deleting..." : "Delete"}
      submitVariant="destructive"
    >
      <p className="text-sm text-zinc-500">
        Once deleted, this request's configuration and saved data will be permanently removed.
      </p>
    </Modal>
  );
};

export default DeleteRequestModal;
