"use client";

import RealtimeConnectionBar from '@/modules/realtime/components/realtime-connection-bar';
import RealtimeMessageEditor from '@/modules/realtime/components/realtime-message-editor';
import { WebSocketSidebar } from '@/modules/websockets/components/websocket-sidebar';
import React, { useState, useEffect } from 'react'
import { getAllWebSocketRequests, createWebSocketRequest, updateWebSocketRequest, deleteWebSocketRequest } from '@/modules/websockets/actions';
import { getWorkspaces } from '@/modules/workspace/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWsStore } from '@/modules/realtime/hooks/useWs';
import { toast } from 'sonner';

const RealtimePage = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newWsName, setNewWsName] = useState("");
  const { initSession, getConnection, restoreConnections } = useWsStore();
  const activeConnection = activeSessionId ? getConnection(activeSessionId) : undefined;
  const currentUrl = activeConnection?.url;
  const draftMessage = activeConnection?.draftMessage || '';

  useEffect(() => {
    if (activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId);
      if (session) {
        let initialBody = '{\n  "type": "message",\n  "content": "Hello WebSocket!"\n}';
        if (session.body && session.body !== "{}" && session.body !== "[]") {
           initialBody = typeof session.body === 'string' ? session.body : JSON.stringify(session.body, null, 2);
        }
        initSession(activeSessionId, session.url, initialBody);
      }
    }
  }, [activeSessionId, sessions, initSession]);

  useEffect(() => {
    // Attempt to restore any previously connected WebSockets on page load
    restoreConnections();
    
    async function loadData() {
      const wsRes = await getWorkspaces();
      if (wsRes && wsRes.length > 0) {
        const wid = wsRes[0].id;
        setWorkspaceId(wid);
        const reqs = await getAllWebSocketRequests(wid);
        if (reqs.success && reqs.data) {
          setSessions(reqs.data);
          if (reqs.data.length > 0) {
            setActiveSessionId(reqs.data[0].id);
          }
        }
      }
    }
    loadData();
  }, []);

  const handleCreate = () => {
    setNewWsName("New WebSocket");
    setIsCreateModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    if (!workspaceId || !newWsName.trim()) return;
    const res = await createWebSocketRequest(workspaceId, { name: newWsName });
    if (res.success && res.data) {
      setSessions((prev) => [...prev, res.data]);
      setActiveSessionId(res.data.id);
      setIsCreateModalOpen(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceId || !activeSessionId) return;
    const res = await updateWebSocketRequest(workspaceId, activeSessionId, {
      url: currentUrl || "",
      body: draftMessage
    });
    if (res.success && res.data) {
      setSessions(prev => prev.map(s => s.id === activeSessionId ? res.data : s));
      toast.success("Saved session");
    } else {
      toast.error("Failed to save session");
    }
  };

  const handleDeleteClick = () => {
    if (!workspaceId || !activeSessionId) return;
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workspaceId || !activeSessionId) return;

    
    const res = await deleteWebSocketRequest(workspaceId, activeSessionId);
    if (res.success) {
      const newSessions = sessions.filter(s => s.id !== activeSessionId);
      setSessions(newSessions);
      if (newSessions.length > 0) {
        setActiveSessionId(newSessions[0].id);
      } else {
        setActiveSessionId(null);
      }
      toast.success("Deleted session");
      setIsDeleteModalOpen(false);
    } else {
      toast.error("Failed to delete session");
      setIsDeleteModalOpen(false);
    }
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "headline": "Httply - WebSocket Client",
    "description": "Connect to a server and start testing realtime messages.",
    "publisher": { "@type": "Organization", "name": "Httply" }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="flex h-full bg-background">
        <WebSocketSidebar
          workspaces={sessions}
          activeSessionId={activeSessionId}
          onSelect={setActiveSessionId}
          onCreate={handleCreate}
        />
        <div className="flex flex-col flex-1 h-full">
          {activeSessionId ? (
            <>
              {/* Page Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-violet-500/10 border border-violet-500/20">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
                      <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                      <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                      <line x1="12" y1="20" x2="12.01" y2="20"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-foreground">
                      {sessions.find(s => s.id === activeSessionId)?.name || "WebSocket"}
                    </h1>
                    <p className="text-xs text-muted-foreground">Connect to a server and start testing realtime messages</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSave}>Save</Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteClick}>Delete</Button>
                </div>
              </div>

              {/* Connection Bar */}
              <div className="px-6 py-3 border-b border-border/50">
                <RealtimeConnectionBar 
                  key={activeSessionId}
                  sessionId={activeSessionId}
                  defaultUrl={sessions.find(s => s.id === activeSessionId)?.url} 
                />
              </div>

              {/* Main content */}
              <div className="flex-1 overflow-hidden flex flex-col px-6 pb-6 pt-4 min-h-0">
                <RealtimeMessageEditor sessionId={activeSessionId} />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 h-full text-zinc-500">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-zinc-700">
                <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
                <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
                <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
                <line x1="12" y1="20" x2="12.01" y2="20"/>
              </svg>
              <h2 className="text-lg font-medium text-zinc-300">No WebSocket Session Selected</h2>
              <p className="text-sm mt-1 mb-4">Create a new session from the sidebar to start testing.</p>
              <Button onClick={handleCreate} variant="secondary">Create Session</Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create WebSocket</DialogTitle>
            <DialogDescription>Enter a name for your new WebSocket connection.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newWsName}
              onChange={(e) => setNewWsName(e.target.value)}
              placeholder="e.g. My API Socket"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleConfirmCreate();
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmCreate} disabled={!newWsName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default RealtimePage