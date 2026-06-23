import React from 'react';
import { usePendingInvites, useAcceptWorkspaceInvite, useRejectWorkspaceInvite } from '../hooks/invites';
import { Loader, MailOpen, Check, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export function InvitesTab() {
    const { data: invites, isPending } = usePendingInvites();
    const { mutate: acceptInvite, isPending: isAccepting } = useAcceptWorkspaceInvite();
    const { mutate: rejectInvite, isPending: isRejecting } = useRejectWorkspaceInvite();

    const handleAccept = (token: string) => {
        acceptInvite(token, {
            onSuccess: () => toast.success("Invite accepted successfully!"),
            onError: (error: any) => toast.error(error.message || "Failed to accept invite")
        });
    };

    const handleReject = (id: string) => {
        rejectInvite(id, {
            onSuccess: () => toast.success("Invite rejected"),
            onError: (error: any) => toast.error(error.message || "Failed to reject invite")
        });
    };

    return (
        <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Pending Invites</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isPending ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader className="w-6 h-6 text-indigo-400 animate-spin" />
                    </div>
                ) : !invites || invites.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-zinc-500 py-12 text-sm">
                        <MailOpen className="w-10 h-10 mb-4 opacity-20" />
                        You have no pending workspace invites.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invites.map((invite) => (
                            <div key={invite.id} className="flex flex-col p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors gap-3">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start space-x-3 min-w-0 flex-1">
                                        <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                            <Building2 className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-medium text-zinc-200 truncate">
                                                {invite.workspace.name}
                                            </span>
                                            <span className="text-xs text-zinc-400 truncate mt-0.5">
                                                Invited by {invite.createdBy.name || invite.createdBy.email}
                                            </span>
                                            <span className="text-[10px] text-zinc-600 mt-1">
                                                {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <button
                                        onClick={() => handleAccept(invite.token)}
                                        disabled={isAccepting || isRejecting}
                                        className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-all disabled:opacity-50"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Accept
                                    </button>
                                    <button
                                        onClick={() => handleReject(invite.id)}
                                        disabled={isAccepting || isRejecting}
                                        className="flex-1 flex items-center justify-center gap-1.5 h-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-md transition-all disabled:opacity-50"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
