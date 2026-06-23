"use server"

import db from "@/lib/db"
import { env } from "@/lib/env"
import { currentUser } from "@/modules/authentication/actions"
import { MEMBER_ROLE } from "@prisma/client"
import { randomBytes } from "crypto"
import { verifyWorkspaceRole } from "@/modules/workspace/actions/permissions"
import { pusherServer } from "@/lib/pusher"

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

export const inviteUserByEmail = async (workspaceId: string, email: string) => {
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
        email,
        createdById: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), 
      }
    })

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`

    const { sendInviteEmail } = await import("@/lib/mail");
    await sendInviteEmail(email, inviteLink, workspace.name, user.name || user.email || "Someone");

    // Trigger Pusher event
    await pusherServer.trigger(
      `user-${email.replace(/[@.]/g, '-')}`,
      'new_invite',
      { workspaceName: workspace.name, inviterName: user.name || user.email || "Someone" }
    );

    return { success: true }
  } catch (error: any) {
    console.error("Error sending invite email:", error);
    return { success: false, error: error.message };
  }
}

export const getPendingInvites = async () => {
  const user = await currentUser();
  if (!user || !user.email) return [];

  const invites = await db.workspaceInvite.findMany({
    where: { 
      email: user.email,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    },
    include: {
      workspace: true,
      createdBy: true,
    }
  });

  return invites;
}

export const rejectWorkspaceInvite = async (inviteId: string) => {
  const user = await currentUser();
  if (!user || !user.email) throw new Error("Unauthorized");

  const invite = await db.workspaceInvite.findUnique({
    where: { id: inviteId }
  });

  if (!invite) throw new Error("Invite not found");
  if (invite.email !== user.email) throw new Error("Unauthorized");

  await db.workspaceInvite.delete({
    where: { id: inviteId }
  });

  return { success: true };
}