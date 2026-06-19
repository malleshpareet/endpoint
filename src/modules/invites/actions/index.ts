"use server"

import db from "@/lib/db"
import { env } from "@/lib/env"
import { currentUser } from "@/modules/authentication/actions"
import { MEMBER_ROLE } from "@prisma/client"
import { randomBytes } from "crypto"
import { verifyWorkspaceRole } from "@/modules/workspace/actions/permissions"

export const generateWorkspaceInvite = async (workspaceId: string) => {
  try {
    await verifyWorkspaceRole(workspaceId, ['ADMIN']);

    const token = randomBytes(16).toString("hex")
    const user = await currentUser()
    if(!user) throw new Error("Unauthorized")
    
    const workspace = await db.workspace.findUnique({ where: { id: workspaceId } })
    if (!workspace) throw new Error("Workspace not found")
    if (workspace.name === "Personal Workspace") throw new Error("Cannot invite to Personal Workspace")

    const invite = await db.workspaceInvite.create({
      data: {
        workspaceId,
        token,
        createdById: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), 
      }
    })

    return { success: true, link: `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}` }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const acceptWorkspaceInvite = async (token: string) => {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const invite = await db.workspaceInvite.findUnique({
    where: { token },
  });

  if (!invite) throw new Error("Invalid invite");

  if (!invite.expiresAt || invite.expiresAt < new Date()) throw new Error("Invite expired");

  await db.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: invite.workspaceId,
      role: MEMBER_ROLE.VIEWER,
    },
  });

  await db.workspaceInvite.delete({
    where: { id: invite.id },
  });

  
  return { success: true };
};

export const getAllWorkspaceMembers = async (workspaceId: string) => {
  return await db.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
  });
};