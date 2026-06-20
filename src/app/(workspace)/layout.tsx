import { SidebarProvider } from '@/components/ui/sidebar'
import { currentUser } from '@/modules/authentication/actions'
import Header from '@/modules/layout/components/header'

import { initializeWorkspace } from '@/modules/workspace/actions'
import TabbedLeftPanel from '@/modules/workspace/components/tabbed-left-panel'
import React from 'react'
import { redirect } from 'next/navigation'

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
    const user = await currentUser()
    
    if (!user) {
        redirect("/sign-in")
    }

    const workspace = await initializeWorkspace()

    
    return (
        <>
            {/* @ts-ignore */}
            <Header user={user}/>
            <main className='max-h-[calc(100vh-3.5rem)] h-[calc(100vh-3.5rem)] flex flex-1 overflow-hidden'>
                <div className="flex h-full w-full">
                    <div className="w-11 flex-shrink-0 border-r border-white/[0.06] bg-[#0f0f11]">
                        <TabbedLeftPanel />
                    </div>
                    <div className="flex-1 bg-[#0d0d0f] overflow-hidden">
                        {children}
                    </div>
                </div>
            </main>
        </>
    )
}

export default RootLayout