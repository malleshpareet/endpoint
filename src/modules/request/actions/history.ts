"use server"

import db from "@/lib/db";


export async function getWorkspaceHistory(workspaceId: string) {
  try {
    const history = await db.requestRun.findMany({
      where: {
        request: {
          collection: {
            workspaceId: workspaceId
          }
        }
      },
      select: {
        id: true,
        status: true,
        statusText: true,
        durationMs: true,
        resolvedUrl: true,
        createdAt: true,
        request: {
          select: {
            id: true,
            url: true,
            method: true,
            name: true,
            headers: true,
            parameters: true,
            body: true,
            collectionId: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 100
    });
    return history;
  } catch (error) {
    console.error("Failed to fetch history:", error);
    return [];
  }
}
