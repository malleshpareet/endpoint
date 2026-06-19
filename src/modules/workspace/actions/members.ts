"use server"

import db from "@/lib/db";
import { currentUser } from "@/modules/authentication/actions";
import { MEMBER_ROLE } from "@prisma/client";export async function getWorkspaceMembers(workspaceId: string) {
  try {
    const members = await db.workspaceMember.findMany({
      where: {
        workspaceId: workspaceId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        workspace: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        role: 'asc' // ADMIN first, then EDITOR, then VIEWER
      }
    });

    return members;
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    return [];
  }
}

export async function updateWorkspaceMemberRole(workspaceId: string, memberId: string, newRole: MEMBER_ROLE) {
  try {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    // Check if current user is an ADMIN in this workspace
    const currentUserMembership = await db.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId: workspaceId
        }
      }
    });

    if (!currentUserMembership || currentUserMembership.role !== 'ADMIN') {
      throw new Error("Only workspace Admins can change roles.");
    }

    // Ensure they aren't changing their own role to prevent an admin from locking themselves out accidentally
    if (currentUserMembership.id === memberId) {
      throw new Error("You cannot change your own role.");
    }

    const updatedMember = await db.workspaceMember.update({
      where: {
        id: memberId,
        workspaceId: workspaceId // Security check
      },
      data: {
        role: newRole
      }
    });

    return { success: true, member: updatedMember };
  } catch (error: any) {
    console.error("Error updating member role:", error);
    return { success: false, error: error.message || "Failed to update role" };
  }
}
