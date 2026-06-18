"use client";

import Modal from "@/components/ui/modal";
import { useEditCollection } from "../hooks/collections";
import React, { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const EditCollectionModal = ({
  isModalOpen,
  setIsModalOpen,
  collectionId,
  initialName,
  initialVariables,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  collectionId: string;
  initialName: string;
  initialVariables?: any;
}) => {
  const [name, setName] = useState(initialName);
  const [variables, setVariables] = useState<any[]>(
    Array.isArray(initialVariables) && initialVariables.length > 0
      ? initialVariables
      : [{ key: "", initialValue: "", currentValue: "" }]
  );

  const { mutateAsync, isPending } = useEditCollection(collectionId);

  const handleVariableChange = (index: number, field: string, value: string) => {
    const newVars = [...variables];
    newVars[index][field] = value;

    if (index === variables.length - 1 && value !== "") {
      newVars.push({ key: "", initialValue: "", currentValue: "" });
    }

    setVariables(newVars);
  };

  const handleRemoveVariable = (index: number) => {
    const newVars = variables.filter((_, i) => i !== index);
    if (newVars.length === 0) {
      newVars.push({ key: "", initialValue: "", currentValue: "" });
    }
    setVariables(newVars);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const cleanVars = variables.filter(v => v.key.trim() !== "");
    try {
      await mutateAsync({ name, variables: cleanVars });
      toast.success("Collection updated successfully");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("Failed to update collection");
      console.error("Failed to update collection:", err);
    }
  };

  return (
    <Modal
      title="Edit Collection"
      description="Rename your collection"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSubmit={handleSubmit}
      submitText={isPending ? "Saving..." : "Save Changes"}
      submitVariant="default"
    >
      <div className="space-y-6">
        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Collection Name</label>
          <Input
            className="w-full bg-zinc-800 border-zinc-700"
            placeholder="Collection name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-zinc-400 mb-2 block">Collection Variables</label>
          <div className="border border-zinc-800 rounded-md max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-zinc-500 font-medium">Variable</TableHead>
                  <TableHead className="text-zinc-500 font-medium">Initial Value</TableHead>
                  <TableHead className="text-zinc-500 font-medium">Current Value</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variables.map((v, index) => (
                  <TableRow key={index} className="border-zinc-800 hover:bg-transparent group">
                    <TableCell className="p-2 text-center text-zinc-600">
                      {index + 1}
                    </TableCell>
                    <TableCell className="p-2">
                      <Input 
                        value={v.key} 
                        onChange={(e) => handleVariableChange(index, "key", e.target.value)}
                        placeholder="Variable"
                        className="bg-transparent border-transparent hover:border-zinc-700 focus:border-indigo-500 h-8 rounded-sm text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input 
                        value={v.initialValue} 
                        onChange={(e) => handleVariableChange(index, "initialValue", e.target.value)}
                        placeholder="Initial"
                        className="bg-transparent border-transparent hover:border-zinc-700 focus:border-indigo-500 h-8 rounded-sm text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Input 
                        value={v.currentValue} 
                        onChange={(e) => handleVariableChange(index, "currentValue", e.target.value)}
                        placeholder="Current"
                        className="bg-transparent border-transparent hover:border-zinc-700 focus:border-indigo-500 h-8 rounded-sm text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveVariable(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditCollectionModal;