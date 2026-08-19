"use server";

import db from "@/lib/db";
import { verifyWorkspaceRole } from "@/modules/workspace/actions/permissions";
import { revalidatePath } from "next/cache";

export async function createWebSocketRequest(
  workspaceId: string,
  data: {
    name: string;
    url?: string;
    format?: string;
  }
) {
  try {
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "EDITOR"]);

    const wsReq = await db.webSocketRequest.create({
      data: {
        name: data.name,
        url: data.url !== undefined ? data.url : "",
        format: data.format || "JSON",
        workspaceId,
        headers: "[]",
        body: "{}",
      },
    });

    revalidatePath(`/dashboard/workspace/${workspaceId}`);
    return { success: true, data: wsReq };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateWebSocketRequest(
  workspaceId: string,
  requestId: string,
  data: {
    name?: string;
    url?: string;
    format?: string;
    headers?: any;
    body?: any;
  }
) {
  try {
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "EDITOR"]);

    const wsReq = await db.webSocketRequest.update({
      where: { id: requestId },
      data,
    });

    revalidatePath(`/dashboard/workspace/${workspaceId}`);
    return { success: true, data: wsReq };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteWebSocketRequest(workspaceId: string, requestId: string) {
  try {
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "EDITOR"]);

    await db.webSocketRequest.delete({
      where: { id: requestId },
    });

    revalidatePath(`/dashboard/workspace/${workspaceId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getWebSocketRequest(workspaceId: string, requestId: string) {
  try {
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "EDITOR", "VIEWER"]);

    const wsReq = await db.webSocketRequest.findUnique({
      where: { id: requestId },
    });

    if (!wsReq) throw new Error("WebSocket request not found");

    return { success: true, data: wsReq };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllWebSocketRequests(workspaceId: string) {
  try {
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "EDITOR", "VIEWER"]);

    const wsReqs = await db.webSocketRequest.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" }
    });

    return { success: true, data: wsReqs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
