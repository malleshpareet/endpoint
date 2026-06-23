"use client";

import React, { useState } from "react";
import { useEnvironments, useCreateEnvironment, useUpdateEnvironment, useDeleteEnvironment, useWorkspaceGlobals, useUpdateWorkspaceGlobals } from "../hooks/environments";
import { useWorkspaceStore } from "@/modules/layout/stores";
import { useCollections } from "@/modules/collections/hooks/collections";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, Plus, Search, Copy, Trash2, Box, Save, Check } from "lucide-react";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Variable {
  key: string;
  initialValue: string;
  currentValue: string;
}

const EnvironmentsTab = () => {
  const { selectedWorkspace } = useWorkspaceStore();
  const { data: environments, isLoading } = useEnvironments(selectedWorkspace?.id);
  const { data: globalVariables } = useWorkspaceGlobals(selectedWorkspace?.id);

  const createEnv = useCreateEnvironment();
  const deleteEnv = useDeleteEnvironment();
  const { data: collections } = useCollections(selectedWorkspace?.id || "");

  const [activeView, setActiveView] = useState<string>("list"); // "list", "globals", or environment id
  const [searchTerm, setSearchTerm] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEnvName, setNewEnvName] = useState("New Environment");
  const [newEnvType, setNewEnvType] = useState<"GLOBAL" | "COLLECTION">("GLOBAL");
  const [newEnvCollectionId, setNewEnvCollectionId] = useState<string>("");

  const handleCreate = async () => {
    if (!selectedWorkspace) return;
    try {
      const res = await createEnv.mutateAsync({ 
        workspaceId: selectedWorkspace.id, 
        name: newEnvName,
        type: newEnvType,
        collectionId: newEnvType === "COLLECTION" ? newEnvCollectionId : undefined
      });
      setIsCreateOpen(false);
      setActiveView(res.id);
      toast.success("Environment created");
    } catch (e) {
      toast.error("Failed to create environment");
    }
  };

  const handleDuplicate = async (env: any) => {
    if (!selectedWorkspace) return;
    try {
      const res = await createEnv.mutateAsync({ workspaceId: selectedWorkspace.id, name: `${env.name} Copy` });
      // We would also need to copy variables, but the create hook currently doesn't accept values.
      // We can update it right after.
      toast.success("Environment duplicated");
    } catch (e) {
      toast.error("Failed to duplicate environment");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteEnv.mutateAsync(id);
      if (activeView === id) setActiveView("list");
      toast.success("Environment deleted");
    } catch (e) {
      toast.error("Failed to delete environment");
    }
  };

  if (activeView === "globals") {
    return <EnvironmentEditor env={{ id: "globals", name: "Globals", values: globalVariables || [] }} onBack={() => setActiveView("list")} isGlobals />;
  }

  const selectedEnv = environments?.find((e) => e.id === activeView);
  if (selectedEnv) {
    return <EnvironmentEditor env={selectedEnv} onBack={() => setActiveView("list")} />;
  }

  const filteredEnvs = environments?.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-300 rounded-md overflow-hidden p-4">
      <div className="flex flex-col space-y-4 mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center"><Box className="w-5 h-5 mr-2 text-orange-500" /> Environments</h2>
          <div className="flex items-center space-x-1">
            <Button onClick={() => setActiveView("globals")} size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-white" title="Globals">
              <Globe className="w-4 h-4" />
            </Button>
            <Button onClick={() => setIsCreateOpen(true)} size="icon" className="bg-orange-500 hover:bg-orange-600 text-white h-8 w-8" title="Create Environment">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search environments..." 
            className="pl-9 h-9 bg-zinc-800 border-zinc-700 w-full text-xs" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-500 font-medium">Name</TableHead>
              <TableHead className="text-zinc-500 font-medium w-32"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnvs?.map((env) => (
              <TableRow 
                key={env.id} 
                className="border-zinc-800 cursor-pointer hover:bg-zinc-800/50 transition-colors group"
                onClick={() => setActiveView(env.id)}
              >
                <TableCell className="font-medium text-zinc-200">
                  <div className="flex flex-col">
                    <span>{env.name}</span>
                    <span className="text-xs text-zinc-500 font-normal">
                      {env.type === "COLLECTION" ? "Collection specific" : "Global"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-zinc-400 hover:text-white" onClick={(e) => { e.stopPropagation(); handleDuplicate(env); }}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10" onClick={(e) => handleDelete(env.id, e)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredEnvs?.length === 0 && (
              <TableRow className="hover:bg-transparent border-none">
                <TableCell colSpan={2} className="text-center py-8 text-zinc-500">
                  No environments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border border-zinc-800 text-zinc-300">
          <DialogHeader>
            <DialogTitle>Create Environment</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newEnvName}
                onChange={(e) => setNewEnvName(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-zinc-200"
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={newEnvType} onValueChange={(val: any) => setNewEnvType(val)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                  <SelectItem value="GLOBAL">Global</SelectItem>
                  <SelectItem value="COLLECTION">Collection Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newEnvType === "COLLECTION" && (
              <div className="grid gap-2">
                <Label>Collection</Label>
                <Select value={newEnvCollectionId} onValueChange={setNewEnvCollectionId}>
                  <SelectTrigger className="bg-zinc-900 border-zinc-800 text-zinc-200">
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                    {collections?.map((col: any) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))}
                    {(!collections || collections.length === 0) && (
                      <SelectItem value="none" disabled>No collections available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)} className="hover:bg-zinc-800 hover:text-white">Cancel</Button>
            <Button onClick={handleCreate} disabled={newEnvType === "COLLECTION" && !newEnvCollectionId} className="bg-orange-500 hover:bg-orange-600 text-white">Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const EnvironmentEditor = ({ env, onBack, isGlobals = false }: { env: any; onBack: () => void; isGlobals?: boolean }) => {
  const [variables, setVariables] = useState<Variable[]>(
    Array.isArray(env.values) && env.values.length > 0 
      ? env.values 
      : [{ key: "", initialValue: "", currentValue: "" }]
  );
  const [name, setName] = useState(env.name);
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => {
    setVariables(
      Array.isArray(env.values) && env.values.length > 0 
        ? env.values 
        : [{ key: "", initialValue: "", currentValue: "" }]
    );
    setName(env.name);
  }, [env]);

  const { selectedWorkspace } = useWorkspaceStore();
  const updateEnv = useUpdateEnvironment();
  const updateGlobals = useUpdateWorkspaceGlobals();

  const handleVariableChange = (index: number, field: keyof Variable, value: string) => {
    const newVars = [...variables];
    newVars[index][field] = value;

    // Automatically add a new row if the last row is being typed into
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

  const handleAddRow = () => {
    setVariables([...variables, { key: "", initialValue: "", currentValue: "" }]);
  };

  const handleSave = async () => {
    const cleanVars = variables.filter(v => v.key.trim() !== "");
    
    try {
      if (isGlobals) {
        await updateGlobals.mutateAsync({ workspaceId: selectedWorkspace!.id, globals: cleanVars });
      } else {
        await updateEnv.mutateAsync({ id: env.id, name, values: cleanVars });
      }
      toast.success("Saved successfully");
    } catch (e) {
      toast.error("Failed to save");
    }
  };

  const filteredVars = variables.filter(v => 
    v.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.initialValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.currentValue.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.key === "" && v.initialValue === "" && v.currentValue === "") // always show empty rows
  );

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950 text-zinc-300 rounded-md overflow-hidden p-4">
      <div className="flex flex-col space-y-4 mb-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-0 text-zinc-400 hover:text-white -ml-2 px-2">
            ← Back
          </Button>
          <Button onClick={handleSave} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3">
            <Save className="w-4 h-4 mr-2" /> Save
          </Button>
        </div>
        
        {isGlobals ? (
          <div className="flex items-center text-lg font-semibold">
            <Globe className="w-5 h-5 mr-2 text-blue-400" />
            Globals
          </div>
        ) : (
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="text-lg font-semibold bg-transparent border-transparent hover:border-zinc-700 focus:border-orange-500 px-2 -ml-2 w-full"
            placeholder="Environment Name"
          />
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search variables..." 
            className="pl-9 h-9 bg-zinc-800 border-zinc-700 w-full text-xs" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-auto">
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
            {filteredVars.map((v, index) => (
              <TableRow key={index} className="border-zinc-800 hover:bg-transparent group">
                <TableCell className="p-2 text-center text-zinc-600">
                  {index + 1}
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    value={v.key} 
                    onChange={(e) => handleVariableChange(index, "key", e.target.value)}
                    placeholder="Add a new variable"
                    className="bg-transparent border-transparent hover:border-zinc-700 focus:border-orange-500 h-8 rounded-sm text-sm"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    value={v.initialValue} 
                    onChange={(e) => handleVariableChange(index, "initialValue", e.target.value)}
                    placeholder="Initial Value"
                    className="bg-transparent border-transparent hover:border-zinc-700 focus:border-orange-500 h-8 rounded-sm text-sm"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    value={v.currentValue} 
                    onChange={(e) => handleVariableChange(index, "currentValue", e.target.value)}
                    placeholder="Current Value"
                    className="bg-transparent border-transparent hover:border-zinc-700 focus:border-orange-500 h-8 rounded-sm text-sm"
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
        <div className="flex justify-center mt-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 hover:text-zinc-300 bg-zinc-900 hover:bg-zinc-800"
            onClick={handleAddRow}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentsTab;
