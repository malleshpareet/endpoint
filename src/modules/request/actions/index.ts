"use server";

import db from "@/lib/db";
import { REST_METHOD } from "@prisma/client";

import axios, { AxiosRequestConfig } from "axios";

export type Request = {
  name: string;
  method: REST_METHOD;
  url: string;
  body?: string;
  headers?: string;
  parameters?: string;
};


export const addRequestToCollection = async (collectionId: string, value: Request) => {
  const request = await db.request.create({
    data: {
      collectionId,
      name: value.name,
      method: value.method,
      url: value.url,
      body: value.body,
      headers: value.headers,
      parameters: value.parameters,
    }
  });

  return request;
}



export const saveRequest = async (id: string, value: Request) => {

  console.log(value, id);
  const request = await db.request.update({
    where: {
      id: id
    },
    data: {
      name: value.name,
      method: value.method,
      url: value.url,
      body: value.body,
      headers: value.headers,
      parameters: value.parameters,
    },
  });

  return request;
}

export const getAllRequestFromCollection = async (collectionId: string) => {
  const requests = await db.request.findMany({
    where: {
      collectionId,
    },
  });
  return requests;
}

export const deleteRequest = async (id: string) => {
  await db.request.delete({
    where: {
      id,
    },
  });
}

export const renameRequest = async (id: string, name: string) => {
  const request = await db.request.update({
    where: {
      id,
    },
    data: {
      name,
    },
  });
  return request;
}

function resolveString(str: string, variables: any[]): string {
  if (!str || typeof str !== 'string' || !variables?.length) return str;
  return str.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const v = variables.find((v: any) => v.key === key || v.key === match);
    return v && v.currentValue !== undefined && v.currentValue !== "" ? String(v.currentValue) : (v && v.value !== undefined && v.value !== "" ? String(v.value) : match);
  });
}

function resolveObject(obj: any, variables: any[]): any {
  if (!obj || !variables?.length) return obj;
  if (typeof obj === 'string') return resolveString(obj, variables);
  if (Array.isArray(obj)) return obj.map(item => resolveObject(item, variables));
  if (typeof obj === 'object') {
    const newObj: any = {};
    for (const k in obj) {
      newObj[k] = resolveObject(obj[k], variables);
    }
    return newObj;
  }
  return obj;
}

function parseKeyValueArray(arr: any): Record<string, string> | undefined {
  if (!Array.isArray(arr)) return arr;
  const result: Record<string, string> = {};
  arr.forEach((item: any) => {
    if (item && item.key) {
      result[item.key] = item.value || "";
    }
  });
  return Object.keys(result).length > 0 ? result : undefined;
}

export async function sendRequest(req: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: any;
}) {
  const config: AxiosRequestConfig = {
    method: req.method,
    url: req.url,
    headers: req.headers,
    params: req.params,
    data: req.body,
    validateStatus: () => true, // ✅ capture errors too
  };

  const start = performance.now();
  try {
    const res = await axios(config);
    const end = performance.now();

    const duration = end - start;
    const size =
      res.headers["content-length"] ||
      new TextEncoder().encode(JSON.stringify(res.data)).length;

    console.log(res.data);

    return {
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(Object.entries(res.headers)),
      data: res.data,
      duration: Math.round(duration),
      size,
    };
  } catch (error: any) {
    const end = performance.now();
    return {
      error: error.message,
      duration: Math.round(end - start),
    };
  }
}


export async function run(requestId: string, environmentId?: string, localVariables: any[] = []) {
  try {
    const request = await db.request.findUnique({
      where: { id: requestId },
      include: {
        collection: {
          include: {
            workspace: true
          }
        }
      }
    });

    if (!request) {
      throw new Error(`Request with id ${requestId} not found`);
    }

    // 1. Global Variables
    let globalVars: any[] = [];
    if ((request.collection?.workspace as any)?.globalVariables) {
      const gv = (request.collection?.workspace as any).globalVariables;
      if (Array.isArray(gv)) globalVars = gv;
    }

    // 2. Environment Variables
    let envVars: any[] = [];
    if (environmentId) {
      const env = await db.environment.findUnique({ where: { id: environmentId } });
      if (env && Array.isArray(env.values)) {
        envVars = env.values;
      }
    }

    // 3. Collection Variables
    let collectionVars: any[] = [];
    if ((request.collection as any)?.variables) {
      const cv = (request.collection as any).variables;
      if (Array.isArray(cv)) collectionVars = cv;
    }

    // Merge by priority: Local > Collection > Environment > Global
    // We reverse the order so higher priority overrides lower priority.
    const mergedVarsMap = new Map<string, any>();
    
    globalVars.forEach(v => mergedVarsMap.set(v.key, v));
    envVars.forEach(v => mergedVarsMap.set(v.key, v));
    collectionVars.forEach(v => mergedVarsMap.set(v.key, v));
    localVariables.forEach(v => mergedVarsMap.set(v.key, v));

    const finalVariables = Array.from(mergedVarsMap.values());

    const requestConfig = {
      method: request.method,
      url: resolveString(request.url, finalVariables),
      headers: parseKeyValueArray(resolveObject(request.headers, finalVariables)),
      params: parseKeyValueArray(resolveObject(request.parameters, finalVariables)),
      body: resolveObject(request.body || undefined, finalVariables)
    };

    const result = await sendRequest(requestConfig);


    const requestRun = await db.requestRun.create({
      data: {
        requestId: request.id,
        status: result.status || 0,
        statusText: result.statusText || (result.error ? 'Error' : null),
        headers: result.headers || "",
        body: result.data ? (typeof result.data === 'string' ? result.data : JSON.stringify(result.data)) : null,
        durationMs: result.duration || 0
      }
    });


    if (result.data && !result.error) {
      await db.request.update({
        where: { id: request.id },
        data: {
          response: result.data,
          updatedAt: new Date()
        }
      });
    }

    return {
      success: true,
      requestRun,
      result
    };

  } catch (error: any) {
    try {
      const failedRun = await db.requestRun.create({
        data: {
          requestId,
          status: 0,
          statusText: 'Failed',
          headers: "",
          body: error.message,
          durationMs: 0
        }
      });

      return {
        success: false,
        error: error.message,
        requestRun: failedRun
      };
    } catch (dbError) {
      return {
        success: false,
        error: `Request failed: ${error.message}. DB save failed: ${(dbError as Error).message}`
      };
    }
  }
}


export async function runDirect(requestData: {
  id: string;
  method: string;
  url: string;
  headers?: Record<string, string>;
  parameters?: Record<string, any>;
  body?: any;
  environmentId?: string | null;
  workspaceId?: string;
  collectionId?: string;
  localVariables?: any[];
}) {
  try {
    let globalVars: any[] = [];
    let envVars: any[] = [];
    let collectionVars: any[] = [];

    if (requestData.workspaceId) {
      const workspace = await db.workspace.findUnique({ where: { id: requestData.workspaceId } });
      if (workspace && Array.isArray((workspace as any).globalVariables)) {
        globalVars = (workspace as any).globalVariables;
      }
    }

    if (requestData.environmentId) {
      const env = await db.environment.findUnique({ where: { id: requestData.environmentId } });
      if (env && Array.isArray(env.values)) {
        envVars = env.values;
      }
    }

    if (requestData.collectionId) {
      const collection = await db.collection.findUnique({ where: { id: requestData.collectionId } });
      if (collection && Array.isArray((collection as any).variables)) {
        collectionVars = (collection as any).variables;
      }
    }

    const mergedVarsMap = new Map<string, any>();
    globalVars.forEach(v => mergedVarsMap.set(v.key, v));
    envVars.forEach(v => mergedVarsMap.set(v.key, v));
    collectionVars.forEach(v => mergedVarsMap.set(v.key, v));
    (requestData.localVariables || []).forEach(v => mergedVarsMap.set(v.key, v));

    const finalVariables = Array.from(mergedVarsMap.values());

    const requestConfig = {
      method: requestData.method,
      url: resolveString(requestData.url, finalVariables),
      headers: parseKeyValueArray(resolveObject(requestData.headers, finalVariables)),
      params: parseKeyValueArray(resolveObject(requestData.parameters, finalVariables)),
      body: resolveObject(requestData.body, finalVariables)
    };

    const result = await sendRequest(requestConfig);

    let requestRun = null;
    const existingReq = await db.request.findUnique({ where: { id: requestData.id } });

    if (existingReq) {
      requestRun = await db.requestRun.create({
        data: {
          requestId: requestData.id,
          status: result.status || 0,
          statusText: result.statusText || (result.error ? 'Error' : null),
          headers: result.headers || "",
          body: result.data ? (typeof result.data === 'string' ? result.data : JSON.stringify(result.data)) : null,
          durationMs: result.duration || 0
        }
      });

      // Update request with latest response if successful
      if (result.data && !result.error) {
        await db.request.update({
          where: { id: requestData.id },
          data: {
            response: result.data,
            updatedAt: new Date()
          }
        });
      }
    }

    return {
      success: true,
      requestRun,
      result
    };

  } catch (error: any) {
    let failedRun = null;
    try {
      const existingReq = await db.request.findUnique({ where: { id: requestData.id } });
      if (existingReq) {
        failedRun = await db.requestRun.create({
          data: {
            requestId: requestData.id,
            status: 0,
            statusText: 'Failed',
            headers: "",
            body: error.message,
            durationMs: 0
          }
        });
      }
    } catch(e) {}

    return {
      success: false,
      error: error.message,
      requestRun: failedRun
    };
  }
}