"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Copy, Link as LinkIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


import { toast } from "sonner";
import { Hint } from "@/components/ui/hint";
import { useWorkspaceStore } from "../stores";
import { useGenerateWorkspaceInvite, useGetWorkspaceMemebers } from "@/modules/invites/hooks/invites";
import { useSession } from "@/lib/auth-client";

const InviteMember = () => {
  const [inviteLink, setInviteLink] = useState("");
  const { selectedWorkspace } = useWorkspaceStore();

  const { mutateAsync, isPending } = useGenerateWorkspaceInvite(
    selectedWorkspace?.id || ""
  );

  const { data: workspaceMembers, isLoading } = useGetWorkspaceMemebers(
    selectedWorkspace?.id || ""
  );

  const { data: session } = useSession();

  if (selectedWorkspace?.name === "Personal Workspace") {
    return (
      <Hint label="Cannot invite to Personal Workspace">
        <span className="inline-block cursor-not-allowed">
          <Button disabled className="border border-zinc-700 bg-zinc-800/50 text-zinc-600 pointer-events-none">
            <UserPlus className="size-4 text-emerald-400" />
          </Button>
        </span>
      </Hint>
    );
  }

  const currentUserMember = workspaceMembers?.find((m: any) => m.user.id === session?.user?.id);
  const isCurrentUserAdmin = currentUserMember?.role === 'ADMIN';

  const generateInviteLink = async () => {
    if (!selectedWorkspace?.id) {
      toast.error("Please select a workspace first");
      return;
    }
    try {
      const response = await mutateAsync();
      setInviteLink(response || "");
      toast.success("Invite link generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate invite link");
    }
  };

  const copyToClipboard = async () => {
    if (inviteLink) {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard");
    }
  };

  return (
    <DropdownMenu>
      <Hint label="Invite Member">
        <DropdownMenuTrigger asChild>
          <Button className="border border-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-400 hover:text-emerald-300">
            <UserPlus className="size-4 text-emerald-400" />
          </Button>
        </DropdownMenuTrigger>
      </Hint>

      <DropdownMenuContent className="w-80 rounded-xl" align="end">
        <div className="p-4">
          <DropdownMenuLabel>Invite to {selectedWorkspace?.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Members Avatars */}
          <div className="flex items-center -space-x-2 overflow-visible mb-3 px-1">
            {isLoading ? (
              <p className="text-xs text-muted-foreground">Loading members...</p>
            ) : (
              workspaceMembers?.map((member: any) => (
                <Hint key={member.id} label={member.user.name || "Unknown User"}>
                  <Avatar className="border-2 border-background size-8">
                    <AvatarImage src={member.user.image || ""} />
                    <AvatarFallback>
                      {member.user.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                </Hint>
              ))
            )}
          </div>

          {/* Invite Link Input */}
          <div className="flex gap-2 items-center">
            <Input
              value={inviteLink}
              placeholder="Generate an invite link..."
              readOnly
            />
            <Button
              variant="outline"
              size="icon"
              onClick={copyToClipboard}
              disabled={!inviteLink}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          {/* Generate Button */}
          <Button
            className="mt-3 w-full bg-emerald-500 hover:bg-emerald-600 text-white"
            onClick={generateInviteLink}
            disabled={isPending}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            {isPending ? "Generating..." : "Generate Link"}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InviteMember;