import prisma from "../configs/prisma.js";
import { clerkClient } from "@clerk/express";

// Ensure a user record exists in our database using Clerk data
const ensureUser = async (userId) => {
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (existingUser) return existingUser;

    const clerkUser = await clerkClient.users.getUser(userId);

    return prisma.user.upsert({
        where: { id: userId },
        update: {},
        create: {
            id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.local`,
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
            image: clerkUser.imageUrl || "",
        },
    });
};

// Clerk paginates organization memberships, so walk every page to avoid
// silently missing workspaces (and wrongly treating them as deleted).
const getAllOrganizationMemberships = async (userId) => {
    const memberships = [];
    const limit = 100;
    let offset = 0;

    while (true) {
        const { data } = await clerkClient.users.getOrganizationMembershipList({ userId, limit, offset });
        memberships.push(...data);

        if (data.length < limit) break;
        offset += limit;
    }

    return memberships;
};

// Keep our database in sync with Clerk (the user and their organizations/workspaces)
const syncUserAndWorkspaces = async (userId) => {
    await ensureUser(userId);

    const memberships = await getAllOrganizationMemberships(userId);

    for (const membership of memberships) {
        const org = membership.organization;

        // The organization creator owns the workspace. Create the owner first so the
        // foreign key is always valid, otherwise fall back to the current user.
        let ownerId = org.createdBy || userId;
        if (ownerId !== userId) {
            try {
                await ensureUser(ownerId);
            } catch (error) {
                ownerId = userId;
            }
        }

        const slug = org.slug || org.id;

        await prisma.workspace.upsert({
            where: { id: org.id },
            update: { name: org.name, slug, image_url: org.imageUrl || "" },
            create: {
                id: org.id,
                name: org.name,
                slug,
                image_url: org.imageUrl || "",
                ownerId,
            },
        });

        await prisma.workspaceMember.upsert({
            where: { userId_workspaceId: { userId, workspaceId: org.id } },
            update: {},
            create: {
                userId,
                workspaceId: org.id,
                role: membership.role === "org:admin" ? "ADMIN" : "MEMBER",
            },
        });
    }

    // Drop workspaces this user can see that no longer exist in Clerk, otherwise
    // workspaces deleted in Clerk keep reappearing in the app.
    await prisma.workspace.deleteMany({
        where: {
            members: { some: { userId } },
            id: { notIn: memberships.map((membership) => membership.organization.id) },
        },
    });
};

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
    try {

        const { userId } = await req.auth();

        // Sync with Clerk so the local database reflects the user's organizations
        try {
            await syncUserAndWorkspaces(userId);
        } catch (error) {
            console.log("Clerk sync failed:", error.message);
        }

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: { some: { userId: userId } }
            },
            include: {
                members: { include: { user: true } },
                projects: {
                    include: {
                        tasks: { include: { assignee: true, comments: { include: { user: true } } } },
                        members: { include: { user: true } }
                    }
                },
                owner: true
            }
        });
        res.json({ workspaces });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};

// Delete workspace
export const deleteWorkspace = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { id } = req.params;

        const workspace = await prisma.workspace.findUnique({
            where: { id },
            include: { members: true },
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // Only allow workspace admins to delete
        const isAdmin = workspace.members.some(
            (member) => member.userId === userId && member.role === "ADMIN"
        );

        if (!isAdmin) {
            return res.status(403).json({ message: "Only workspace admins can delete a workspace" });
        }

        // Delete in Clerk first. If this fails the organization still exists, and the
        // next sync would recreate the workspace, so we must surface the error instead
        // of silently keeping it around.
        await clerkClient.organizations.deleteOrganization(id);

        // Delete in Prisma (cascading will handle projects/tasks/members)
        await prisma.workspace.delete({ where: { id } });

        res.json({ message: "Workspace deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.code || error.message });
    }
};
