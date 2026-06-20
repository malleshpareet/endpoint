"use server";

import db from "@/lib/db";
import { verifyWorkspaceRole } from "@/modules/workspace/actions/permissions";
import { ParsedCollection } from "@/lib/httply-parser";

export const createCollection = async (workspaceId: string, name: string) => {
  await verifyWorkspaceRole(workspaceId, ['ADMIN', 'EDITOR']);

  const collection = await db.collection.create({
    data: {
      name,
      workspace: {
        connect: {
          id: workspaceId,
        },
      },
    },
  });

  return collection;
};

export const getCollections = async (workspaceId: string) => {
  const collections = await db.collection.findMany({
    where: {
      workspaceId,
    },
  });

  return collections;
};


export const deleteCollection = async (collectionId: string) => {
  try {
    const collection = await db.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new Error("Collection not found");
    await verifyWorkspaceRole(collection.workspaceId, ['ADMIN']);

    await db.collection.delete({
      where: {
        id: collectionId,
      },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const editCollection = async (collectionId: string, name: string, variables?: any) => {
  const collection = await db.collection.findUnique({ where: { id: collectionId } });
  if (!collection) throw new Error("Collection not found");
  await verifyWorkspaceRole(collection.workspaceId, ['ADMIN', 'EDITOR']);

  const data: any = { name };
  if (variables !== undefined) {
    data.variables = variables;
  }
  await db.collection.update({
    where: {
      id: collectionId,
    },
    data,
  });
};

export const importCollectionAction = async (workspaceId: string, parsedData: ParsedCollection) => {
  try {
    await verifyWorkspaceRole(workspaceId, ['ADMIN', 'EDITOR']);

    // Check if name exists, fallback to name+timestamp
    let finalName = parsedData.name || "Imported Collection";
    const existing = await db.collection.findFirst({
      where: { workspaceId, name: finalName }
    });
    if (existing) {
      finalName = `${finalName} (Imported ${new Date().toLocaleTimeString()})`;
    }

    // Use a transaction
    const result = await db.$transaction(async (tx) => {
      const collection = await tx.collection.create({
        data: {
          name: finalName,
          workspaceId,
        }
      });

      if (parsedData.requests && parsedData.requests.length > 0) {
        const requestsData = parsedData.requests.map(req => ({
          collectionId: collection.id,
          name: req.name,
          method: req.method,
          url: req.url,
          headers: req.headers || undefined,
          parameters: req.parameters || undefined,
          authorization: req.authorization || undefined,
          body: req.body || undefined,
        }));
        
        await tx.request.createMany({
          data: requestsData
        });
      }
      return collection;
    });

    return { success: true, collectionId: result.id, count: parsedData.requests?.length || 0 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const importToExistingCollectionAction = async (collectionId: string, parsedData: ParsedCollection) => {
  try {
    const collection = await db.collection.findUnique({ where: { id: collectionId } });
    if (!collection) throw new Error("Collection not found");
    await verifyWorkspaceRole(collection.workspaceId, ['ADMIN', 'EDITOR']);

    if (parsedData.requests && parsedData.requests.length > 0) {
      const requestsData = parsedData.requests.map(req => ({
        collectionId: collection.id,
        name: req.name,
        method: req.method,
        url: req.url,
        headers: req.headers || undefined,
        parameters: req.parameters || undefined,
        authorization: req.authorization || undefined,
        body: req.body || undefined,
      }));
      
      await db.request.createMany({
        data: requestsData
      });
    }

    return { success: true, count: parsedData.requests?.length || 0 };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};