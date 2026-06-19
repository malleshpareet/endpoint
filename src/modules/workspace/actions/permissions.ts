"use server";

import db from "@/lib/db";
import { currentUser } from "@/modules/authentication/actions";
import { MEMBER_ROLE } from "@prisma/client";

export async function verifyWorkspaceRole(workspaceId: string, allowedRoles: MEMBER_ROLE[]) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized: You must be logged in.");

  const membership = await db.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId,
      },
    },
  });

  if (!membership) {
    throw new Error("Unauthorized: You are not a member of this workspace.");
  }

  if (!allowedRoles.includes(membership.role)) {
    throw new Error(`Forbidden: Your role (${membership.role}) does not have permission to perform this action.`);
  }

  return { user, membership };
}
