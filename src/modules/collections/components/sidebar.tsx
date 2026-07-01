import { Button } from '@/components/ui/button';
import { Archive, Clock, Code, Share2, Users, ExternalLink, HelpCircle, Plus, Search, Upload, Loader, Box, Mail, Copy, Check, Link2 } from 'lucide-react';
import React, { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useCollections } from '@/modules/collections/hooks/collections';
import CreateCollection from './create-collection';
import EmptyCollections from './empty-collections';
import CollectionFolder from './collection-folder';
import EnvironmentsTab from '@/modules/environments/components/environments-tab';
import { HistoryTab } from '@/modules/request/components/history-tab';
import { MembersTab } from '@/modules/workspace/components/members-tab';
import { InvitesTab } from '@/modules/invites/components/invites-tab';
import { useRequestPlaygroundStore } from '@/modules/request/store/useRequestStore';
import CodeSnippetTab from '@/modules/request/components/code-snippet-tab';
import { Hint } from '@/components/ui/hint';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { parsePostmanCollection } from '@/lib/httply-parser';
import { importCollectionAction } from '../actions';
import { generateWorkspaceInvite } from '@/modules/invites/actions';


interface Props {
    currentWorkspace: any
}

const TabbedSidebar = ({ currentWorkspace }: Props) => {
    const [activeTab, setActiveTab] = useState('Collections');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImporting, setIsImporting] = useState(false);
    const queryClient = useQueryClient();

    const handleOpenShare = async () => {
        setShareLink(null);
        setLinkCopied(false);
        setIsShareOpen(true);
        if (!currentWorkspace?.id) return;
        setIsGeneratingLink(true);
        const result = await generateWorkspaceInvite(currentWorkspace.id);
        setIsGeneratingLink(false);
        if (result.success && result.link) {
            setShareLink(result.link);
        } else {
            toast.error(result.error || 'Could not generate invite link.');
            setIsShareOpen(false);
        }
    };

    const handleCopyShareLink = () => {
        if (!shareLink) return;
        navigator.clipboard.writeText(shareLink).then(() => {
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }).catch(() => toast.error('Failed to copy link.'));
    };

    const { data: collections, isPending, isError } = useCollections(currentWorkspace?.id);
    const { activeTabId } = useRequestPlaygroundStore();

    React.useEffect(() => {
        const handleOpenInvites = () => setActiveTab('Invites');
        window.addEventListener('open-invites-tab', handleOpenInvites);
        return () => window.removeEventListener('open-invites-tab', handleOpenInvites);
    }, []);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        const reader = new FileReader();
        
        reader.onload = async (event) => {
            try {
                const jsonString = event.target?.result as string;
                const parsedCollection = parsePostmanCollection(jsonString);
                
                const toastId = toast.loading(`Importing ${parsedCollection.requests.length} requests...`);
                
                const result = await importCollectionAction(currentWorkspace?.id, parsedCollection);
                
                if (result.success) {
                    toast.success(`Successfully imported ${result.count} requests!`, { id: toastId });
                    queryClient.invalidateQueries({ queryKey: ["collections", currentWorkspace?.id] });
                } else {
                    toast.error(`Import failed: ${result.error}`, { id: toastId });
                }
            } catch (error: any) {
                toast.error(`Invalid format: ${error.message}`);
            } finally {
                setIsImporting(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        
        reader.readAsText(file);
    };

    if (isPending) return (
        <div className="flex-1 flex items-center justify-center">
            <Loader className="w-4 h-4 text-zinc-500 animate-spin" />
        </div>
    )

    const sidebarItems = [
        { icon: Archive, label: 'Collections' },
        { icon: Box, label: 'Environments' },
        { icon: Clock, label: 'History' },
        { icon: Users, label: 'Team' },
        { icon: Mail, label: 'Invites' },
    ];

    if (activeTabId) {
        sidebarItems.push({ icon: Code, label: 'Code' });
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Collections':
                return (
                    <div className="h-full bg-[#0f0f11] text-zinc-100 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                            <div className="flex items-center gap-1.5 text-xs">
                                <span className="text-zinc-500">{currentWorkspace?.name}</span>
                                <span className="text-zinc-700">›</span>
                                <span className="font-medium text-zinc-300">Collections</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Hint label="Help" side="bottom">
                                    <button
                                        onClick={() => setIsHelpOpen(true)}
                                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-all"
                                    >
                                        <HelpCircle className="w-3.5 h-3.5" />
                                    </button>
                                </Hint>
                                <Hint label="Share workspace" side="bottom">
                                    <button
                                        onClick={handleOpenShare}
                                        className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-all"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </Hint>

                            {/* Share Modal */}
                            {isShareOpen && (
                                <div
                                    className="fixed inset-0 z-50 flex items-center justify-center"
                                    onClick={() => setIsShareOpen(false)}
                                >
                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                                    <div
                                        className="relative w-full max-w-sm mx-4 rounded-2xl border p-6"
                                        style={{
                                            background: "rgba(13,13,15,0.99)",
                                            borderColor: "rgba(255,255,255,0.08)",
                                            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px rgba(0,0,0,0.8)",
                                        }}
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                                                    <Link2 className="w-3.5 h-3.5 text-indigo-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[13.5px] font-semibold text-white/90 leading-tight">Invite to workspace</h3>
                                                    <p className="text-[11px] text-zinc-600 leading-tight mt-0.5">Link expires in 7 days</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setIsShareOpen(false)}
                                                className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        {/* QR Code area */}
                                        <div
                                            className="flex items-center justify-center rounded-xl p-5 mb-4"
                                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                                        >
                                            {isGeneratingLink ? (
                                                <div className="flex flex-col items-center gap-3 py-4">
                                                    <Loader className="w-5 h-5 text-indigo-400 animate-spin" />
                                                    <p className="text-[11.5px] text-zinc-600">Generating invite link...</p>
                                                </div>
                                            ) : shareLink ? (
                                                <div className="p-2 rounded-lg" style={{ background: "#fff" }}>
                                                    <QRCodeSVG
                                                        value={shareLink}
                                                        size={160}
                                                        bgColor="#ffffff"
                                                        fgColor="#0d0d0f"
                                                        level="M"
                                                    />
                                                </div>
                                            ) : null}
                                        </div>

                                        {/* Link row */}
                                        {shareLink && (
                                            <div
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 mb-5"
                                                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                                            >
                                                <span className="flex-1 text-[11px] text-zinc-500 truncate font-mono">
                                                    {shareLink}
                                                </span>
                                                <button
                                                    onClick={handleCopyShareLink}
                                                    className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                                                    style={{
                                                        background: linkCopied ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
                                                        border: linkCopied ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.08)",
                                                        color: linkCopied ? "rgb(129,140,248)" : "rgba(255,255,255,0.6)",
                                                    }}
                                                >
                                                    {linkCopied
                                                        ? <><Check className="w-3 h-3" /> Copied!</>
                                                        : <><Copy className="w-3 h-3" /> Copy</>
                                                    }
                                                </button>
                                            </div>
                                        )}

                                        {/* Footer note */}
                                        <p className="text-[11px] text-zinc-600 text-center">
                                            Anyone with this link can join <span className="text-zinc-400">{currentWorkspace?.name}</span> as a viewer.
                                        </p>
                                    </div>
                                </div>
                            )}
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
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                                                    <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                                                </div>
                                                <h3 className="text-[14px] font-semibold text-white/90">Collections — Help</h3>
                                            </div>
                                            <button
                                                onClick={() => setIsHelpOpen(false)}
                                                className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-white/[0.06] transition-all text-lg leading-none"
                                            >
                                                ×
                                            </button>
                                        </div>

                                        {/* Body */}
                                        <div className="space-y-4 text-[13px] text-zinc-400 leading-relaxed">
                                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                                <p className="text-zinc-300 font-medium mb-1">📁 What are Collections?</p>
                                                <p>Collections are groups of saved API requests. They help you organise, reuse, and share requests with your team.</p>
                                            </div>
                                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                                <p className="text-zinc-300 font-medium mb-1">➕ Creating a Collection</p>
                                                <p>Click <span className="text-white/70">New</span> to create a collection, then add requests inside it. You can nest folders for better organisation.</p>
                                            </div>
                                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                                <p className="text-zinc-300 font-medium mb-1">📤 Importing Collections</p>
                                                <p>Use <span className="text-white/70">Import</span> to load a Postman-format <code className="text-indigo-300/80 bg-indigo-500/10 px-1 rounded text-[11px]">.json</code> collection directly into your workspace.</p>
                                            </div>
                                            <div className="p-3 rounded-lg border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.06)" }}>
                                                <p className="text-zinc-300 font-medium mb-1">👥 Sharing with Team</p>
                                                <p>Collections are shared across all members of your workspace automatically. Invite teammates from the <span className="text-white/70">Team</span> tab.</p>
                                            </div>
                                        </div>

                                        {/* Footer */}
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
                        </div>

                        {/* Search */}
                        <div className="px-4 py-2 border-b border-white/[0.06]">
                            <div className="relative flex items-center">
                                <Search className="absolute left-2.5 w-3.5 h-3.5 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="Search collections..."
                                    className="w-full bg-[#1a1a1e] border border-white/[0.07] rounded-md pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.15] transition-colors"
                                />
                            </div>
                        </div>

                        {/* New & Import buttons */}
                        <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-between">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>New</span>
                            </button>
                            <button
                                onClick={handleImportClick}
                                disabled={isImporting}
                                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1 disabled:opacity-50"
                            >
                                {isImporting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                <span>Import</span>
                            </button>
                            <input 
                                type="file" 
                                accept=".json" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                        </div>

                        {/* Collections list */}
                        <div className="flex-1 overflow-y-auto">
                            {collections && collections.length > 0 ? (
                                collections.map((collection) => (
                                    <div className='px-3 py-2 border-b border-white/[0.04] w-full' key={collection.id}>
                                        <CollectionFolder collection={collection} />
                                    </div>
                                ))
                            ) : (
                                <EmptyCollections onImportClick={handleImportClick} />
                            )}
                        </div>
                    </div>
                );

            case 'Environments':
                return <EnvironmentsTab />;

            case 'History':
                return <HistoryTab workspaceId={currentWorkspace?.id} />;

            case 'Team':
                return <MembersTab workspaceId={currentWorkspace?.id} />;

            case 'Invites':
                return <InvitesTab />;

            case 'Code':
                return <CodeSnippetTab />;
            default:
                return <div className="p-4 text-zinc-500 text-sm">Select a tab</div>;
        }
    };

    return (
        <div className="flex h-full bg-[#0f0f11] w-full overflow-hidden">
            {/* Icon tab strip */}
            <div className="w-11 flex-shrink-0 border-r border-white/[0.06] flex flex-col items-center py-3 gap-1">
                {sidebarItems.map((item, index) => {
                    const isActive = activeTab === item.label;
                    return (
                        <Hint label={item.label} key={index} side="left">
                            <button
                                onClick={() => setActiveTab(item.label)}
                                className={`relative w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 ${
                                    isActive
                                        ? 'text-white bg-indigo-500/20'
                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05]'
                                }`}
                            >
                                {isActive && (
                                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-l-full bg-indigo-400" />
                                )}
                                <item.icon className="w-3.5 h-3.5" />
                            </button>
                        </Hint>
                    );
                })}
            </div>

            {/* Tab content */}
            <div className="flex-1 min-w-0 overflow-hidden">
                {renderTabContent()}
            </div>

            <CreateCollection
                workspaceId={currentWorkspace?.id}
                isModalOpen={isModalOpen}
                setIsModalOpen={setIsModalOpen}
            />
        </div>
    );
};

export default TabbedSidebar;