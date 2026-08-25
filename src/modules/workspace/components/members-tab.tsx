import React from 'react';
import { useWorkspaceMembers, useUpdateWorkspaceMemberRole, useRemoveWorkspaceMember } from '../hooks/members';
import { Loader, User, HelpCircle, ExternalLink, ShieldAlert, Edit2, Eye, UserX } from 'lucide-react';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Modal from '@/components/ui/modal';
import { Hint } from '@/components/ui/hint';
import { MEMBER_ROLE } from '@prisma/client';
import { useWorkspaceActivity } from '../hooks/activity';
import { formatDistanceToNow } from 'date-fns';

interface MembersTabProps {
    workspaceId: string;
}

export function MembersTab({ workspaceId }: MembersTabProps) {
    const { data: members, isPending } = useWorkspaceMembers(workspaceId);
    const { data: session } = useSession();
    const { mutate: updateRole, isPending: isUpdating } = useUpdateWorkspaceMemberRole(workspaceId);
    const { mutate: removeMember, isPending: isRemoving } = useRemoveWorkspaceMember(workspaceId);
    const { data: activities, isLoading: isActivitiesLoading } = useWorkspaceActivity(workspaceId);

    const [memberToRemove, setMemberToRemove] = React.useState<string | null>(null);
    const [isHelpOpen, setIsHelpOpen] = React.useState(false);
    const [isActivityOpen, setIsActivityOpen] = React.useState(false);

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
                    <Hint label="Manage workspace members and their roles" side="bottom">
                        <button onClick={() => setIsHelpOpen(true)} className="flex items-center justify-center">
                            <HelpCircle className="w-4 h-4 text-zinc-400 hover:text-zinc-300 cursor-pointer" />
                        </button>
                    </Hint>
                    <Hint label="View workspace activity" side="bottom">
                        <button onClick={() => setIsActivityOpen(true)} className="flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-zinc-400 hover:text-zinc-300 cursor-pointer" />
                        </button>
                    </Hint>
                </div>
            </div>

            {/* Help Modal */}
            {isHelpOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={() => setIsHelpOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-md mx-4 rounded-2xl border p-6"
                        style={{
                            background: "rgba(15,15,17,0.98)",
                            borderColor: "rgba(255,255,255,0.08)",
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.7)",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <h3 className="text-[14px] font-semibold text-white/90">Team Members — Help</h3>
                            </div>
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-4 text-[13px] text-zinc-400 leading-relaxed">
                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                <p className="text-zinc-300 font-medium mb-1">👥 Managing Members</p>
                                <p>Invite new members to your workspace, update their permissions, or remove them at any time.</p>
                            </div>
                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                <p className="text-zinc-300 font-medium mb-1">🛡️ Roles & Permissions</p>
                                <p><span className="text-white/70 font-medium">Admins</span> can manage all settings. <span className="text-white/70 font-medium">Editors</span> can edit requests. <span className="text-white/70 font-medium">Viewers</span> have read-only access.</p>
                            </div>
                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                <p className="text-zinc-300 font-medium mb-1">📩 Pending Invites</p>
                                <p>When you invite someone, they will receive an email. You can manage or revoke pending invites at the bottom of the members list.</p>
                            </div>
                        </div>
                        <div className="mt-5 pt-4 border-t flex justify-end" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-white/70 hover:text-white transition-colors"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                Got it
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Activity Modal */}
            {isActivityOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    onClick={() => setIsActivityOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-md mx-4 rounded-2xl border p-6"
                        style={{
                            background: "rgba(15,15,17,0.98)",
                            borderColor: "rgba(255,255,255,0.08)",
                            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px rgba(0,0,0,0.7)",
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                                    <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
                                </div>
                                <h3 className="text-[14px] font-semibold text-white/90">Workspace Activity</h3>
                            </div>
                            <button
                                onClick={() => setIsActivityOpen(false)}
                                className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all text-lg leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <div className="h-[300px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {isActivitiesLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader className="w-5 h-5 text-indigo-400 animate-spin" />
                                </div>
                            ) : !activities || activities.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-12 h-12 bg-white/[0.02] rounded-full flex items-center justify-center mb-4">
                                        <ExternalLink className="w-5 h-5 text-zinc-500" />
                                    </div>
                                    <p className="text-sm font-medium text-zinc-300 mb-1">No Activity Yet</p>
                                    <p className="text-xs text-zinc-500 max-w-[250px]">
                                        Activity will appear here once you start creating collections or inviting members.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity: any) => (
                                        <div key={activity.id} className="flex gap-3 p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.04)" }}>
                                            <div className="flex-shrink-0 mt-0.5">
                                                {activity.user.image ? (
                                                    <Image src={activity.user.image} alt={activity.user.name || ''} width={24} height={24} className="rounded-full" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold uppercase">
                                                        {activity.user.name?.charAt(0) || activity.user.email?.charAt(0) || '?'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs text-zinc-300 leading-snug">
                                                    <span className="font-semibold text-white/90">{activity.user.name}</span>{' '}
                                                    <span className="text-zinc-500">
                                                        {activity.action === "CREATED_COLLECTION" && "created collection"}
                                                        {activity.action === "DELETED_COLLECTION" && "deleted collection"}
                                                        {activity.action === "GENERATED_INVITE_LINK" && "generated"}
                                                        {activity.action === "ACCEPTED_INVITE" && "accepted invite for"}
                                                        {activity.action === "UPDATED_MEMBER_ROLE" && "updated role for"}
                                                        {activity.action === "REMOVED_MEMBER" && "removed member"}
                                                    </span>{' '}
                                                    <span className="text-indigo-400 font-medium">{activity.entityName}</span>
                                                </p>
                                                <p className="text-[10px] text-zinc-600 mt-1">
                                                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 pt-4 border-t flex justify-end" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                            <button
                                onClick={() => setIsActivityOpen(false)}
                                className="px-4 py-1.5 rounded-lg text-[12.5px] font-medium text-white/70 hover:text-white transition-colors"
                                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            <div key={member.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors gap-4">
                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div className="shrink-0">
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
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-zinc-200 truncate">
                                            {member.user.name || member.user.email}
                                        </span>
                                        <span className="text-xs text-zinc-500 truncate mt-0.5">
                                            {member.user.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    {isCurrentUserAdmin && member.id !== currentUserMember?.id ? (
                                        <div className="flex items-center space-x-2">
                                            <Select
                                                defaultValue={member.role}
                                                onValueChange={(val) => updateRole({ memberId: member.id, newRole: val as MEMBER_ROLE })}
                                                disabled={isUpdating || isRemoving}
                                            >
                                                <SelectTrigger className="h-7 text-[10px] uppercase font-medium bg-zinc-800 border-zinc-700 w-[110px]">
                                                    <SelectValue />
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
                                            <button
                                                onClick={() => setMemberToRemove(member.id)}
                                                disabled={isRemoving && memberToRemove === member.id}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors disabled:opacity-50"
                                                title="Remove member"
                                            >
                                                <UserX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700/50">
                                            {getRoleIcon(member.role)}
                                            <span className="text-[10px] font-medium text-zinc-300 tracking-wide uppercase">
                                                {member.role}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                title="Remove Member"
                description="Are you sure you want to remove this member from the workspace? They will lose access to all collections and APIs."
                isOpen={!!memberToRemove}
                onClose={() => setMemberToRemove(null)}
                onSubmit={() => {
                    if (memberToRemove) {
                        removeMember({ memberId: memberToRemove }, {
                            onSuccess: () => setMemberToRemove(null)
                        });
                    }
                }}
                submitText={isRemoving ? "Removing..." : "Remove Member"}
                submitVariant="destructive"
            />
        </div>
    );
}
