import React from 'react';
import { useWorkspaceMembers, useUpdateWorkspaceMemberRole } from '../hooks/members';
import { Loader, User, HelpCircle, ExternalLink, ShieldAlert, Edit2, Eye } from 'lucide-react';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MEMBER_ROLE } from '@prisma/client';

interface MembersTabProps {
    workspaceId: string;
}

export function MembersTab({ workspaceId }: MembersTabProps) {
    const { data: members, isPending } = useWorkspaceMembers(workspaceId);
    const { data: session } = useSession();
    const { mutate: updateRole, isPending: isUpdating } = useUpdateWorkspaceMemberRole(workspaceId);

    const currentUserMember = members?.find(m => m.user.id === session?.user?.id);
    const isCurrentUserAdmin = currentUserMember?.role === 'ADMIN';

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN':
                return <ShieldAlert className="w-3 h-3 text-red-400" />;
            case 'EDITOR':
                return <Edit2 className="w-3 h-3 text-blue-400" />;
            case 'VIEWER':
            default:
                return <Eye className="w-3 h-3 text-emerald-400" />;
        }
    };

    return (
        <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Team Members</span>
                </div>
                <div className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-zinc-300 cursor-pointer" />
                    <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-zinc-300 cursor-pointer" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isPending ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                ) : !members || members.length === 0 ? (
                    <div className="text-center text-zinc-500 py-8 text-sm">
                        No members found in this workspace.
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                            {members[0]?.workspace?.name} Workspace
                        </div>
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors">
                                <div className="flex items-center space-x-3">
                                    {member.user.image ? (
                                        <Image 
                                            src={member.user.image} 
                                            alt={member.user.name || "User"} 
                                            width={32} 
                                            height={32} 
                                            className="rounded-full border border-zinc-700"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                            <User className="w-4 h-4 text-zinc-400" />
                                        </div>
                                    )}
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-zinc-200">
                                            {member.user.name || member.user.email}
                                        </span>
                                        <span className="text-xs text-zinc-500">
                                            {member.user.email}
                                        </span>
                                    </div>
                                </div>
                                {isCurrentUserAdmin && member.id !== currentUserMember?.id ? (
                                    <Select 
                                        defaultValue={member.role} 
                                        onValueChange={(val) => updateRole({ memberId: member.id, newRole: val as MEMBER_ROLE })}
                                        disabled={isUpdating}
                                    >
                                        <SelectTrigger className="h-7 text-[10px] uppercase font-medium bg-zinc-800 border-zinc-700 w-[110px]">
                                            <div className="flex items-center space-x-1.5">
                                                {getRoleIcon(member.role)}
                                                <SelectValue />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN" title="Can fully manage workspace, members, and requests">
                                                <div className="flex items-center space-x-2">
                                                    {getRoleIcon('ADMIN')}
                                                    <span>Admin</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="EDITOR" title="Can create, edit, and run APIs but cannot delete">
                                                <div className="flex items-center space-x-2">
                                                    {getRoleIcon('EDITOR')}
                                                    <span>Editor</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="VIEWER" title="Can only view and run APIs">
                                                <div className="flex items-center space-x-2">
                                                    {getRoleIcon('VIEWER')}
                                                    <span>Viewer</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/50">
                                        {getRoleIcon(member.role)}
                                        <span className="text-[10px] font-medium text-zinc-300 tracking-wide uppercase">
                                            {member.role}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
