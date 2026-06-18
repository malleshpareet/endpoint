"use server";

import db from "@/lib/db";

export const getEnvironments = async (workspaceId: string) => {

  return await db.environment.findMany({
    where: { workspaceId },
  });
};

export const createEnvironment = async (workspaceId: string, name: string) => {

  return await db.environment.create({
    data: {
      workspaceId,
      name,
      values: [],
    },
  });
};

export const updateEnvironment = async (id: string, name: string, values: any) => {

  return await db.environment.update({
    where: { id },
    data: { name, values },
  });
};

export const deleteEnvironment = async (id: string) => {

  return await db.environment.delete({
    where: { id },
  });
};

export const getWorkspaceGlobals = async (workspaceId: string) => {

  const workspace = await db.workspace.findUnique({
    where: { id: workspaceId },
    select: { globalVariables: true } as any
  });

  return (workspace as any)?.globalVariables || [];
};

export const updateWorkspaceGlobals = async (workspaceId: string, globalVariables: any) => {

  return await db.workspace.update({
    where: { id: workspaceId },
    data: { globalVariables } as any,
  });
};
