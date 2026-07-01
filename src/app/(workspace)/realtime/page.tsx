"use client";

import RealtimeConnectionBar from '@/modules/realtime/components/realtime-connection-bar';
import RealtimeMessageEditor from '@/modules/realtime/components/realtime-message-editor';
import React from 'react'

const RealtimePage = () => {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Page Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
        <div className="flex items-center justify-center w-8 h-8 rounded-md bg-violet-500/10 border border-violet-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <line x1="12" y1="20" x2="12.01" y2="20"/>
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">WebSocket</h1>
          <p className="text-xs text-muted-foreground">Connect to a server and start testing realtime messages</p>
        </div>
      </div>

      {/* Connection Bar */}
      <div className="px-6 py-3 border-b border-border/50">
        <RealtimeConnectionBar />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6 pt-4 min-h-0">
        <RealtimeMessageEditor />
      </div>
    </div>
  )
}

export default RealtimePage