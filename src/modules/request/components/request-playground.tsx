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
      <div className="flex flex-col h-full items-center justify-center bg-black gap-8">
        {/* Logo */}
        <Image
          src="/logo__2_-removebg-preview.png"
          alt="Logo"
          width={80}
          height={80}
          className="object-contain"
        />

        {/* Keyboard shortcuts — no card bg */}
        <div className="space-y-3" style={{ minWidth: 240 }}>
          <div className="flex items-center justify-between gap-10">
            <kbd
              className="px-2.5 py-1 rounded-md text-[12px] font-mono font-medium"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
                letterSpacing: "0.03em",
              }}
            >
              Ctrl+G
            </kbd>
            <span className="text-white font-semibold text-[14px]">New Request</span>
          </div>
          <div className="flex items-center justify-between gap-10">
            <kbd
              className="px-2.5 py-1 rounded-md text-[12px] font-mono font-medium"
              style={{
                background: "rgba(99,102,241,0.12)",
                color: "#818cf8",
                border: "1px solid rgba(99,102,241,0.2)",
                letterSpacing: "0.03em",
              }}
            >
              Ctrl+S
            </kbd>
            <span className="text-white font-semibold text-[14px]">Save Request</span>
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