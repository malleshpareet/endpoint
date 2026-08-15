import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  addRequestToCollection,
  getAllRequestFromCollection,
  Request,
  run,
  runDirect,
  saveRequest,
  deleteRequest,
  renameRequest,
  prepareBrowserRequest,
  saveBrowserResponse
} from "../actions";
import { useRequestPlaygroundStore } from "../store/useRequestStore";

export function useAddRequestToCollection(collectionId: string) {
  const queryClient = useQueryClient();
  const { updateTabFromSavedRequest, activeTabId } = useRequestPlaygroundStore();
  return useMutation({
    mutationFn: async (value: Request) => addRequestToCollection(collectionId, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests", collectionId] });
      // @ts-ignore
      updateTabFromSavedRequest(activeTabId!, data);
    },
  });
}

export function useGetAllRequestFromCollection(collectionId: string) {

  return useQuery({
    queryKey: ["requests", collectionId],
    queryFn: async () => getAllRequestFromCollection(collectionId),
  });
}

export function useSaveRequest(id: string) {
  const { updateTabFromSavedRequest, activeTabId } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (value: Request) => saveRequest(id, value),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });

      // @ts-ignore
      updateTabFromSavedRequest(activeTabId!, data);
    },
  });
}

export function useRunRequest(requestId: string, environmentId?: string | null) {

  const { setResponseViewerData, activeTabId } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await run(requestId, environmentId || undefined),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      if (activeTabId) {
        //@ts-ignore
        setResponseViewerData(activeTabId, data);
      }
    },
  });
}

export function useRunDirectRequest() {
  const { setResponseViewerData, activeTabId } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (requestData: any) => await runDirect(requestData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      if (activeTabId) {
        setResponseViewerData(activeTabId, data as any);
      }
    },
  });
}

export function useRunBrowserRequest() {
  const { setResponseViewerData, activeTabId } = useRequestPlaygroundStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (requestData: any) => {
      const prep = await prepareBrowserRequest(requestData);
      if (!prep.success) {
        return { success: false, error: prep.error };
      }
      
      const { requestConfig, context } = prep;
      if (!requestConfig) {
        return { success: false, error: 'Request configuration is missing' };
      }
      let resultData: any = null;
      const start = performance.now();
      
      let axiosData: any = requestConfig.body;
      const axiosHeaders: Record<string, string> = { ...(requestConfig.headers || {}) };
      const ct = requestConfig.bodyContentType || '';

      if (ct === 'multipart/form-data' && Array.isArray(requestConfig.body)) {
        const formData = new FormData();
        for (const item of requestConfig.body) {
          if (!item.key) continue;
          if (item.type === 'file' && item.value) {
            try {
              const [header, base64] = item.value.split(',');
              const mimeMatch = header.match(/data:([^;]+)/);
              const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
              const binaryStr = atob(base64);
              const binary = new Uint8Array(binaryStr.length);
              for (let i = 0; i < binaryStr.length; i++) {
                binary[i] = binaryStr.charCodeAt(i);
              }
              const blob = new Blob([binary], { type: mime });
              formData.append(item.key, blob, item.fileName || item.key);
            } catch (e) {
              console.error('Failed to decode file for key:', item.key, e);
            }
          } else {
            formData.append(item.key, item.value ?? '');
          }
        }
        axiosData = formData;
        delete axiosHeaders['Content-Type'];
        delete axiosHeaders['content-type'];
      } else if (ct === 'application/x-www-form-urlencoded' && Array.isArray(requestConfig.body)) {
        const params = new URLSearchParams();
        for (const item of requestConfig.body) {
          if (item.key) params.append(item.key, item.value ?? '');
        }
        axiosData = params.toString();
        axiosHeaders['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (ct === 'application/json') {
        if (!axiosHeaders['Content-Type'] && !axiosHeaders['content-type']) {
          axiosHeaders['Content-Type'] = 'application/json';
        }
        if (typeof axiosData === 'string') {
          try {
            axiosData = JSON.parse(axiosData);
          } catch(e) {}
        }
      }

      try {
        const res = await axios({
           method: requestConfig.method,
           url: requestConfig.url,
           headers: axiosHeaders,
           params: requestConfig.params,
           data: axiosData,
           validateStatus: () => true
        });
        const end = performance.now();
        const duration = end - start;
        const size = res.headers && res.headers["content-length"] ? parseInt(String(res.headers["content-length"])) : new TextEncoder().encode(JSON.stringify(res.data)).length;
        
        resultData = {
          status: res.status,
          statusText: res.statusText,
          headers: (res.headers as any)?.toJSON ? (res.headers as any).toJSON() : res.headers,
          data: res.data,
          duration: Math.round(duration),
          size,
          resolvedUrl: requestConfig?.url
        };
      } catch (err: any) {
        const end = performance.now();
        resultData = {
          error: err.message,
          data: `Request Error: ${err.message}`,
          duration: Math.round(end - start),
          resolvedUrl: requestConfig?.url
        };
      }
      
      const finalRes = await saveBrowserResponse(requestData, context, resultData);
      return finalRes;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      queryClient.invalidateQueries({ queryKey: ["environments"] });
      if (activeTabId) {
        setResponseViewerData(activeTabId, data as any);
      }
    },
  });
}

export function useDeleteRequest(requestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await deleteRequest(requestId);
      if (res?.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}

export function useRenameRequest(requestId: string, name: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => renameRequest(requestId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
    },
  });
}
