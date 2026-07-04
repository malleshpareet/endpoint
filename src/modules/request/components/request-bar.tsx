import React from 'react'
import { RequestTab } from '../store/useRequestStore'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VariableInput } from './variable-input'
import { Button } from "@/components/ui/button"
import { Send, Loader2 } from 'lucide-react'
import { useRunDirectRequest } from '../hooks/request'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/modules/layout/stores'

import { Box } from 'lucide-react'
import { useEnvironments } from '@/modules/environments/hooks/environments'
import { parseCurl } from '../utils/curl-parser'

interface Props {
  tab: RequestTab,
  updateTab: (id: string, data: Partial<RequestTab>) => void;
}

const RequestBar = ({ tab, updateTab }: Props) => {
  const { selectedWorkspace, activeEnvironmentId, setActiveEnvironmentId } = useWorkspaceStore();
  const { data: environments } = useEnvironments(selectedWorkspace?.id);
  const { mutateAsync, isPending, isError } = useRunDirectRequest();

  const onSendRequest = async () => {
    try {
      const safeParse = (val: any, fallback: any = {}) => {
        if (!val) return fallback;
        if (typeof val !== 'string') return val;
        try { return JSON.parse(val); } catch (e) { return val; }
      };

      await mutateAsync({
        id: tab.requestId || tab.id,
        method: tab.method,
        url: tab.url,
        headers: safeParse(tab.headers),
        parameters: safeParse(tab.parameters),
        body: safeParse(tab.body, null),
        authorization: tab.authorization,
        environmentId: activeEnvironmentId,
        workspaceId: selectedWorkspace?.id,
        collectionId: tab.collectionId
      });

      toast.success('Request sent successfully!');
    } catch (error) {
      toast.error('Failed to send request');
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (text.trim().startsWith("curl ")) {
      const parsed = parseCurl(text);
      if (parsed) {
        e.preventDefault();
        
        let existingHeaders = [];
        try { existingHeaders = tab.headers ? JSON.parse(tab.headers) : []; } catch (e) {}
        
        const newHeaders = parsed.headers.map(h => ({ key: h.key, value: h.value, enabled: true }));
        const combinedHeaders = [
          ...existingHeaders.filter((eh: any) => !newHeaders.find(nh => nh.key.toLowerCase() === eh.key.toLowerCase())), 
          ...newHeaders
        ];

        updateTab(tab.id, {
          url: parsed.url,
          method: parsed.method as any,
          headers: JSON.stringify(combinedHeaders),
          body: parsed.body || tab.body
        });
        toast.success("Imported cURL command!");
      }
    }
  };


  const methodStyle: Record<string, string> = {
    GET: "text-emerald-400",
    POST: "text-blue-400",
    PUT: "text-amber-400",
    DELETE: "text-red-400",
    PATCH: "text-purple-400",
    QUERY: "text-pink-400",
  };

  return (
    <div className='flex items-center gap-2 bg-[#111113] border-b border-white/[0.06] px-3 py-2'>
      <div className="flex items-center gap-2 flex-1 bg-[#1a1a1e] border border-white/[0.08] rounded-md px-2 h-9 min-w-0">
        <Select
          value={tab.method}
          onValueChange={(value) => updateTab(tab.id, { method: value })}
        >
          <SelectTrigger className={`w-[76px] border-none bg-transparent shadow-none px-0 h-auto text-xs font-bold tracking-wide ${methodStyle[tab.method] || "text-zinc-400"}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1a1e] border border-white/[0.1] shadow-xl rounded-lg">
            <SelectGroup>
              <SelectItem value="GET" className="text-emerald-400 text-xs font-bold">GET</SelectItem>
              <SelectItem value="POST" className="text-blue-400 text-xs font-bold">POST</SelectItem>
              <SelectItem value="PUT" className="text-amber-400 text-xs font-bold">PUT</SelectItem>
              <SelectItem value="PATCH" className="text-purple-400 text-xs font-bold">PATCH</SelectItem>
              <SelectItem value="DELETE" className="text-red-400 text-xs font-bold">DELETE</SelectItem>
              <SelectItem value="QUERY" className="text-pink-400 text-xs font-bold">QUERY</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="w-px h-4 bg-white/[0.08] shrink-0" />

        <VariableInput
          value={tab.url || ''}
          onChange={(e) => updateTab(tab.id, { url: e.target.value })}
          onPaste={handlePaste}
          placeholder="Enter URL or paste a cURL command..."
          className="tour-request-url flex-1 bg-transparent border-none text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-0 focus:outline-none px-1 min-w-0"
        />
      </div>

      <Select
        value={activeEnvironmentId || "no-env"}
        onValueChange={(val) => setActiveEnvironmentId(val === "no-env" ? null : val)}
      >
        <SelectTrigger className="tour-environment-select w-36 bg-[#1a1a1e] border border-white/[0.08] text-zinc-400 text-xs h-9 rounded-md hover:border-white/[0.15] transition-colors">
          <Box className="w-3 h-3 mr-1.5 text-zinc-500 shrink-0" />
          <SelectValue placeholder="No Environment" />
        </SelectTrigger>
        <SelectContent className="bg-[#1a1a1e] border border-white/[0.1] shadow-xl rounded-lg">
          <SelectItem value="no-env" className="text-zinc-500 italic text-xs">No Environment</SelectItem>
          {environments?.map((env) => (
            <SelectItem key={env.id} value={env.id} className="text-xs">{env.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        type='submit'
        onClick={onSendRequest}
        disabled={isPending || !tab.url}
        className="tour-send-btn h-9 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-all disabled:opacity-40 gap-1.5"
      >
        {isPending ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-3 h-3" />
            Send
          </>
        )}
      </Button>
    </div>
  )
}

export default RequestBar