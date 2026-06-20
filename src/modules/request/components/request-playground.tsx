"use client";


import { useRequestPlaygroundStore } from "../store/useRequestStore";
import { useState } from "react";
import { toast } from "sonner";
import SaveRequestToCollectionModal from "@/modules/collections/components/add-request-modal";
import { REST_METHOD } from "@prisma/client";

import Image from "next/image";
import { useSaveRequest } from "../hooks/request";
import TabBar from "./tab-bar";
import { useHotkeys } from "react-hotkeys-hook";
import RequestEditor from "./request-editor";

export default function PlaygroundPage() {
  const { tabs, activeTabId, addTab } = useRequestPlaygroundStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const { mutateAsync, isPending } = useSaveRequest(activeTab?.requestId!);
  const [showSaveModal, setShowSaveModal] = useState(false);


  const getCurrentRequestData = () => {
    if (!activeTab) {
      return {
        name: "Untitled Request",
        method: REST_METHOD.GET as REST_METHOD,
        url: " "
      };
    }

    return {
      name: activeTab.title || "Untitled Request",
      method: (activeTab.method as REST_METHOD) || REST_METHOD.GET,
      url: activeTab.url || " "
    };
  };

  useHotkeys(
    "ctrl+s, meta+s",
    async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!activeTab) {
        toast.error("No active request to save");
        return;
      }

      if (activeTab.collectionId) {

        try {
          await mutateAsync({
            url: activeTab.url || " ",
            method: activeTab.method as REST_METHOD,
            name: activeTab.title || "Untitled Request",
            body: activeTab.body,
            headers: activeTab.headers,
            parameters: activeTab.parameters,
          });
          toast.success("Request updated");
        } catch (err) {
          console.error("Failed to update request:", err);
          toast.error("Failed to update request");
        }
      } else {

        setShowSaveModal(true);
      }
    },
    { preventDefault: true, enableOnFormTags: true },
    [activeTab]
  );


  useHotkeys(
    "ctrl+g, meta+shift+g",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      addTab();
      toast.success("New request created");
    },
    {
      preventDefault: true,
      enableOnFormTags: true,
    },
    [activeTab]
  );

  if (!activeTab) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-[#0d0d0f] gap-6">
        <Image
          src="/logo__2_-removebg-preview.png"
          alt="EndPoint"
          width={40}
          height={40}
          className="object-contain opacity-60"
        />
        <div className="text-center">
          <p className="text-sm font-medium text-zinc-400 mb-1">No request open</p>
          <p className="text-xs text-zinc-600">Open a saved request or create a new one</p>
        </div>
        <div className="flex flex-col gap-2 min-w-[220px]">
          <div className="flex items-center justify-between gap-8 px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-zinc-500">New request</span>
            <span className="flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] text-zinc-400 rounded border border-white/[0.08]">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] text-zinc-400 rounded border border-white/[0.08]">G</kbd>
            </span>
          </div>
          <div className="flex items-center justify-between gap-8 px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06]">
            <span className="text-xs text-zinc-500">Save request</span>
            <span className="flex items-center gap-0.5">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] text-zinc-400 rounded border border-white/[0.08]">Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/[0.06] text-zinc-400 rounded border border-white/[0.08]">S</kbd>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TabBar />
      <div className="flex-1 overflow-auto">
        <RequestEditor />
      </div>

      {/* Save Request Modal */}
      <SaveRequestToCollectionModal
        isModalOpen={showSaveModal}
        setIsModalOpen={setShowSaveModal}
        requestData={getCurrentRequestData()}
        initialName={getCurrentRequestData().name}
      />
    </div>
  );
}