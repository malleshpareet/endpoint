import React from 'react';
import { Bell, Loader, Check, X, Building2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { usePendingInvites, useAcceptWorkspaceInvite, useRejectWorkspaceInvite } from '@/modules/invites/hooks/invites';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hint } from '@/components/ui/hint';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = React.useState(false);
    const { data: invites, isPending } = usePendingInvites();

    const handleNotificationClick = () => {
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('open-invites-tab'));
    };

    const pendingCount = invites?.length || 0;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <Hint label="Notifications" side="bottom">
                <PopoverTrigger asChild>
                    <button className="relative flex items-center justify-center w-8 h-8 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-all focus:outline-none">
                        <Bell className="w-4 h-4" />
                        {pendingCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse ring-2 ring-[#0f0f11]" />
                        )}
                    </button>
                </PopoverTrigger>
            </Hint>
            <PopoverContent align="end" className="w-80 p-0 bg-[#0f0f11] border border-white/[0.1] shadow-2xl">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                    <span className="text-sm font-medium text-white">Notifications</span>
                    {pendingCount > 0 && (
                        <span className="text-xs text-zinc-400">{pendingCount} pending</span>
                    )}
                </div>

                <ScrollArea className="max-h-[300px]">
                    {isPending ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader className="w-4 h-4 text-indigo-400 animate-spin" />
                        </div>
                    ) : pendingCount === 0 ? (
                        <div className="flex flex-col items-center justify-center text-zinc-500 py-8 text-sm px-4 text-center">
                            <Bell className="w-8 h-8 mb-3 opacity-20" />
                            <p>You have no new notifications.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {invites?.map((invite) => (
                                <button 
                                    key={invite.id} 
                                    onClick={handleNotificationClick}
                                    className="flex flex-col p-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors gap-3 w-full text-left focus:outline-none focus:bg-white/[0.03]"
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="w-8 h-8 rounded-md bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0 mt-0.5">
                                            <Building2 className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <p className="text-sm text-zinc-200 leading-snug">
                                                <span className="font-medium text-white">{invite.createdBy.name || invite.createdBy.email}</span> invited you to join <span className="font-medium text-white">{invite.workspace.name}</span>
                                            </p>
                                            <span className="text-[10px] text-zinc-500 mt-1">
                                                {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
