import React from "react";
import { RequestTab } from "../store/useRequestStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import KeyValueFormEditor from "./key-value-form";
import AuthorizationEditor from "./authorization-editor";

import { toast } from "sonner";
import BodyEditor from "./body-editor";
import ScriptsTab from "./scripts-tab";

interface Props {
  tab: RequestTab;
  updateTab: (id: string, data: Partial<RequestTab>) => void;
}

const RequestEditorArea = ({ tab, updateTab }: Props) => {


  const parseKeyValueData = (jsonString?: string) => {
    if (!jsonString) return [];
    try {
      return JSON.parse(jsonString);
    } catch {
      return [];
    }
  };


  const getHeadersData = () => {
    const parsed = parseKeyValueData(tab.headers);
    return parsed.length > 0 ? parsed : [{ key: "", value: "", enabled: true }];
  };


  const getParametersData = () => {
    const parsed = parseKeyValueData(tab.parameters);
    return parsed.length > 0 ? parsed : [{ key: "", value: "", enabled: true }];
  };

  const getBodyData = () => {
    return {
      contentType: 'application/json' as const,
      body: tab.body || ''
    };
  };

  const handleHeadersChange = (data: { key: string; value: string; enabled?: boolean }[]) => {

    const filteredHeaders = data.filter((item) =>
      item.enabled !== false && (item.key.trim() || item.value.trim())
    );
    updateTab(tab.id, { headers: JSON.stringify(filteredHeaders) });
  };

  const handleParametersChange = (data: { key: string; value: string; enabled?: boolean }[]) => {

    const filteredParams = data.filter((item) =>
      item.enabled !== false && (item.key.trim() || item.value.trim())
    );
    updateTab(tab.id, { parameters: JSON.stringify(filteredParams) });
  };

  const handleBodyChange = (data: { contentType: string; body?: string }) => {
    updateTab(tab.id, { body: data.body || '' });
  };

  const handleAuthorizationChange = (authString: string) => {
    updateTab(tab.id, { authorization: authString });
  };

  return (
    <Tabs
      defaultValue="parameters"
      className="bg-[#0d0d0f] rounded-none border-0 w-full flex flex-col h-full overflow-hidden"
    >
      <TabsList className="border-b border-white/[0.06] bg-[#111113] px-2 flex items-center gap-0.5 rounded-none h-auto w-full justify-start p-0">
        {(["parameters", "authorization", "headers", "body", "scripts"] as const).map((val) => (
          <TabsTrigger
            key={val}
            value={val}
            className="relative px-3 py-2 text-xs font-medium text-zinc-500
              data-[state=active]:text-zinc-200 data-[state=active]:bg-transparent
              data-[state=inactive]:bg-transparent
              rounded-none border-0 shadow-none
              after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px]
              after:rounded-t-sm
              data-[state=active]:after:bg-indigo-500
              data-[state=inactive]:after:bg-transparent
              hover:text-zinc-400 transition-colors capitalize"
          >
            {val.charAt(0).toUpperCase() + val.slice(1)}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="parameters" >
        <KeyValueFormEditor
          initialData={getParametersData()}
          onSubmit={handleParametersChange}
          placeholder={{
            key: "Parameter Name",
            value: "Parameter Value",
            description: "URL Parameter",
          }}
        />
      </TabsContent>

      <TabsContent value="authorization">
        <AuthorizationEditor
          initialData={tab.authorization}
          onSubmit={handleAuthorizationChange}
        />
      </TabsContent>

      <TabsContent value="headers">
        <KeyValueFormEditor
          initialData={getHeadersData()}
          onSubmit={handleHeadersChange}
          placeholder={{
            key: "Header Name",
            value: "Header Value",
            description: "HTTP Header",
          }}
        />
      </TabsContent>

      <TabsContent value="body" className="p-0 h-full overflow-hidden flex-1 data-[state=active]:flex">
        <BodyEditor
          initialData={getBodyData()}
          onSubmit={handleBodyChange}
        />
      </TabsContent>

      <TabsContent value="scripts" className="p-0 h-full overflow-hidden flex-1 data-[state=active]:flex flex-col">
        <ScriptsTab tab={tab} updateTab={updateTab} />
      </TabsContent>
    </Tabs>
  );
};

export default RequestEditorArea;