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
import { Send } from 'lucide-react'
import { useRunDirectRequest } from '../hooks/request'
import { toast } from 'sonner'
import { useWorkspaceStore } from '@/modules/layout/stores'

import { Box } from 'lucide-react'
import { useEnvironments } from '@/modules/environments/hooks/environments'

interface Props {
  tab: RequestTab,
  updateTab: (id: string, data: Partial<RequestTab>) => void;
}

const RequestBar = ({ tab, updateTab }: Props) => {
  const { selectedWorkspace, activeEnvironmentId, setActiveEnvironmentId } = useWorkspaceStore();
  const { data: environments } = useEnvironments(selectedWorkspace?.id);
  const { mutateAsync, isPending, isError } = useRunDirectRequest();
  const requestColorMap: Record<string, string> = {
    GET: "text-green-500",
    POST: "text-blue-500",
    PUT: "text-yellow-500",
    DELETE: "text-red-500",
  };

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
        environmentId: activeEnvironmentId,
        workspaceId: selectedWorkspace?.id,
        collectionId: tab.collectionId
      });

      toast.success('Request sent successfully!');
    } catch (error) {
      toast.error('Failed to send request.');
    }
  }

  return (
    <div className='flex flex-row items-center justify-between bg-zinc-900 rounded-md px-2 py-2 w-full'>
      <div className="flex flex-row items-center gap-2 flex-1">
        <Select
          value={tab.method}
          onValueChange={(value) => updateTab(tab.id, { method: value })}
        >
          <SelectTrigger className={`w-24 ${requestColorMap[tab.method] || "text-gray-500"}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="GET" className="text-green-500">GET</SelectItem>
              <SelectItem value="POST" className="text-blue-500">POST</SelectItem>
              <SelectItem value="PUT" className="text-yellow-500">PUT</SelectItem>
              <SelectItem value="DELETE" className="text-red-500">DELETE</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <VariableInput
          value={tab.url || ''}
          onChange={(e) => updateTab(tab.id, { url: e.target.value })}
          placeholder="Enter URL"
          className="flex-1 bg-zinc-800 rounded-md border border-zinc-700"
        />
      </div>

      <div className="flex items-center space-x-2 ml-4">
        <Select
          value={activeEnvironmentId || "no-env"}
          onValueChange={(val) => setActiveEnvironmentId(val === "no-env" ? null : val)}
        >
          <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-xs h-9">
            <Box className="w-3 h-3 mr-2 text-zinc-400" />
            <SelectValue placeholder="No Environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-env" className="text-zinc-500 italic">No Environment</SelectItem>
            {environments?.map((env) => (
              <SelectItem key={env.id} value={env.id}>{env.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type='submit'
          onClick={onSendRequest}
          disabled={isPending || !tab.url}
          className="text-white font-bold bg-indigo-500 hover:bg-indigo-600 h-9"
        >
          <Send className="mr-2 w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  )
}

export default RequestBar