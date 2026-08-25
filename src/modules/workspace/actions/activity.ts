"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function logWorkspaceActivity(
    workspaceId: string,
    action: string,
    entityId?: string,
    entityName?: string,
    details?: any
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const activity = await prisma.workspaceActivity.create({
            data: {
                workspaceId,
                userId: session.user.id,
                action,
                entityId,
                entityName,
                details: details ? JSON.parse(JSON.stringify(details)) : undefined,
            },
        });

        return { success: true, activity };
    } catch (error: any) {
        console.error("Error logging workspace activity:", error);
        return { success: false, error: error.message };
    }
}

export async function getWorkspaceActivity(workspaceId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        // Verify the user is a member of this workspace
        const membership = await prisma.workspaceMember.findUnique({
            where: {
                userId_workspaceId: {
                    userId: session.user.id,
                    workspaceId,
                },
            },
        });

        if (!membership) {
            return { success: false, error: "You do not have access to this workspace's activity" };
        }

        const activities = await prisma.workspaceActivity.findMany({
            where: { workspaceId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            take: 50,
        });

        return { success: true, data: activities };
    } catch (error: any) {
        console.error("Error fetching workspace activity:", error);
        return { success: false, error: error.message };
    }
}
