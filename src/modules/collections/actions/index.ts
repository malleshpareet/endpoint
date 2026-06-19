"use server";

import db from "@/lib/db";
import { verifyWorkspaceRole } from "@/modules/workspace/actions/permissions";export const createCollection = async (workspaceId: string, name: string) => {
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