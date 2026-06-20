import { Button } from '@/components/ui/button';
import { Archive, Clock, Code, Share2, Users, ExternalLink, HelpCircle, Plus, Search, Upload, Loader, Box } from 'lucide-react';
import React, { useState } from 'react';
import { useCollections } from '@/modules/collections/hooks/collections';
import CreateCollection from './create-collection';
import EmptyCollections from './empty-collections';
import CollectionFolder from './collection-folder';
import EnvironmentsTab from '@/modules/environments/components/environments-tab';
import { HistoryTab } from '@/modules/request/components/history-tab';
import { MembersTab } from '@/modules/workspace/components/members-tab';
import { useRequestPlaygroundStore } from '@/modules/request/store/useRequestStore';
import CodeSnippetTab from '@/modules/request/components/code-snippet-tab';
import { Hint } from '@/components/ui/hint';


interface Props {
    currentWorkspace: any
}

const TabbedSidebar = ({ currentWorkspace }: Props) => {
    const [activeTab, setActiveTab] = useState('Collections');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: collections, isPending, isError } = useCollections(currentWorkspace?.id);
    const { activeTabId } = useRequestPlaygroundStore();

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
                                <button className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-all">
                                    <HelpCircle className="w-3.5 h-3.5" />
                                </button>
                                <button className="w-6 h-6 flex items-center justify-center rounded text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.05] transition-all">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                            </div>
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

                        {/* New button */}
                        <div className="px-4 py-2 border-b border-white/[0.06]">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors py-1"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>New</span>
                            </button>
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
                                <EmptyCollections />
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