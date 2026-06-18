"use client";

import Modal from "@/components/ui/modal";
import { useRenameRequest } from "@/modules/request/hooks/request";
import React, { useState } from "react";
import { toast } from "sonner";

const EditRequestModal = ({
  isModalOpen,
  setIsModalOpen,
  requestId,
  initialName,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  requestId: string;
  initialName: string;
}) => {
  const [name, setName] = useState(initialName);
  const { mutateAsync, isPending } = useRenameRequest(requestId, name);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    try {
      await mutateAsync();
      toast.success("Request renamed successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to rename request");
      console.error("Failed to rename request:", err);
    }
  };

  return (
    <Modal
      title="Rename Request"
      description="Enter a new name for your request"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
      submitText={isPending ? "Saving..." : "Save Changes"}
      submitVariant="default"
    >
      <div className="space-y-4">
        <input
          className="w-full p-2 border rounded bg-transparent"
          placeholder="Request name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default EditRequestModal;
