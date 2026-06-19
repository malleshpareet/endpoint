import React from "react";
import { RequestTab } from "../store/useRequestStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import KeyValueFormEditor from "./key-value-form";
import AuthorizationEditor from "./authorization-editor";

import { toast } from "sonner";
import BodyEditor from "./body-editor";

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
    toast.success("Headers updated successfully")
  };

  const handleParametersChange = (data: { key: string; value: string; enabled?: boolean }[]) => {

    const filteredParams = data.filter((item) =>
      item.enabled !== false && (item.key.trim() || item.value.trim())
    );
    updateTab(tab.id, { parameters: JSON.stringify(filteredParams) });
    toast.success("Parameters updated successfully")
  };

  const handleBodyChange = (data: { contentType: string; body?: string }) => {
    updateTab(tab.id, { body: data.body || '' });
    toast.success("Body updated successfully")
  };

  const handleAuthorizationChange = (authString: string) => {
    updateTab(tab.id, { authorization: authString });
  };

  return (
    <Tabs
      defaultValue="parameters"
      className="bg-zinc-950/30 rounded-xl border border-zinc-800/50 shadow-inner w-full flex flex-col h-full overflow-hidden"
    >
      <div className="p-4 pb-0">
        <TabsList className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 p-1 rounded-full w-full justify-between gap-1 shadow-sm">
          <TabsTrigger 
            value="parameters" 
            className="flex-1 rounded-full data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-500 data-[state=active]:shadow-sm transition-all duration-300 py-1.5 text-zinc-400 font-medium"
          >
            Parameters
          </TabsTrigger>
          <TabsTrigger 
            value="authorization" 
            className="flex-1 rounded-full data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-500 data-[state=active]:shadow-sm transition-all duration-300 py-1.5 text-zinc-400 font-medium"
          >
            Authorization
          </TabsTrigger>
          <TabsTrigger 
            value="headers" 
            className="flex-1 rounded-full data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-500 data-[state=active]:shadow-sm transition-all duration-300 py-1.5 text-zinc-400 font-medium"
          >
            Headers
          </TabsTrigger>
          <TabsTrigger 
            value="body" 
            className="flex-1 rounded-full data-[state=active]:bg-orange-500/15 data-[state=active]:text-orange-500 data-[state=active]:shadow-sm transition-all duration-300 py-1.5 text-zinc-400 font-medium"
          >
            Body
          </TabsTrigger>
        </TabsList>
      </div>

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

      <TabsContent value="body">
        <BodyEditor
          initialData={getBodyData()}
          onSubmit={handleBodyChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default RequestEditorArea;