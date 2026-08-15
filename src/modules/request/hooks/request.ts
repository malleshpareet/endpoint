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
      if (!prep.success || !prep.requestConfig) {
        return { success: false, error: prep.error || "Failed to prepare request config" };
      }

      const { requestConfig, context } = prep;
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
          } catch (e) { }
        }
      }

      try {
        let isTauri = false;
        try {
          isTauri = typeof window !== 'undefined' && !!(window as any).__TAURI_INTERNALS__;
        } catch(e) {}
        
        let finalStatus = 0;
        let finalStatusText = '';
        let finalHeaders: Record<string, string> = {};
        let finalData: any = null;

        if (isTauri) {
            const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
            
            let finalUrl = requestConfig.url;
            if (requestConfig.params && Object.keys(requestConfig.params).length > 0) {
               try {
                   const urlObj = new URL(finalUrl);
                   Object.entries(requestConfig.params).forEach(([k, v]) => urlObj.searchParams.append(k, String(v)));
                   finalUrl = urlObj.toString();
               } catch(e) {}
            }

            const isFormData = axiosData instanceof FormData;
            const isURLSearchParams = axiosData instanceof URLSearchParams;
            const isString = typeof axiosData === 'string';
            
            let body = ['GET', 'HEAD'].includes(requestConfig.method?.toUpperCase() || 'GET') ? undefined : axiosData;
            if (body && !isFormData && !isURLSearchParams && !isString) {
               body = JSON.stringify(body);
            }

            let tRes;
            try {
              tRes = await tauriFetch(finalUrl, {
                method: requestConfig.method,
                headers: axiosHeaders,
                body
              });
            } catch (err: any) {
              let isLocalhost = false;
              try {
                isLocalhost = new URL(finalUrl).hostname === 'localhost';
              } catch(e) {}
              
              if (isLocalhost) {
                const urlObj = new URL(finalUrl);
                try {
                  urlObj.hostname = '127.0.0.1';
                  tRes = await tauriFetch(urlObj.toString(), {
                    method: requestConfig.method,
                    headers: axiosHeaders,
                    body
                  });
                } catch (err2: any) {
                  try {
                    urlObj.hostname = '[::1]';
                    tRes = await tauriFetch(urlObj.toString(), {
                      method: requestConfig.method,
                      headers: axiosHeaders,
                      body
                    });
                  } catch (err3) {
                    throw err; 
                  }
                }
              } else {
                throw err;
              }
            }
            
            finalStatus = tRes.status;
            finalStatusText = tRes.statusText;
            tRes.headers.forEach((val, key) => { finalHeaders[key] = val; });
            
            try {
              finalData = await tRes.json();
            } catch(e) {
              finalData = await tRes.text();
            }
        } else {
          const res = await axios({
            method: requestConfig.method,
            url: requestConfig.url,
            headers: axiosHeaders,
            params: requestConfig.params,
            data: axiosData,
            validateStatus: () => true
          });
          finalStatus = res.status;
          finalStatusText = res.statusText;
          finalHeaders = Object.fromEntries(Object.entries(res.headers || {}));
          finalData = res.data;
        }

        const end = performance.now();
        const duration = end - start;
        const size = finalHeaders["content-length"] ? parseInt(String(finalHeaders["content-length"])) : new TextEncoder().encode(JSON.stringify(finalData)).length;

        resultData = {
          status: finalStatus,
          statusText: finalStatusText,
          headers: finalHeaders,
          data: finalData,
          duration: Math.round(duration),
          size,
          resolvedUrl: requestConfig?.url
        };
      } catch (err: any) {
        const end = performance.now();
        let errorMessage = err.message;
        let dataMessage = `Request Error: ${err.message}`;

        if (err.message === 'Network Error' && requestConfig?.url) {
          try {
            const urlObj = new URL(requestConfig.url);
            if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
              const corsWarning = "\n\nTip: If you are testing a local API, make sure CORS is enabled on your server.\nExample (Express/Node.js):\n// Middleware\napp.use(cors());";
              errorMessage += corsWarning;
              dataMessage += corsWarning;
            }
          } catch (e) { }
        }

        resultData = {
          error: errorMessage,
          data: dataMessage,
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
