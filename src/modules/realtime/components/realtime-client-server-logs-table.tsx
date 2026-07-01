import React, { useState, useEffect, useRef } from 'react'
import { useWsStore } from '../hooks/useWs'
import { Trash2, Copy, ArrowUpRight, ArrowDownLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const RealtimeClientServerLogsTable = () => {
  const { messages, clearMessages } = useWsStore()
  const [selectedIndex, setSelectedIndex] = useState<number>(-1)
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive and nothing selected
  useEffect(() => {
    if (messages.length > 0 && selectedIndex === -1) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages.length, selectedIndex])

  const formatTimestamp = (ts: Date) =>
    new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    }).format(ts)

  const formatData = (data: any) => {
    if (typeof data === 'string') {
      try { return JSON.stringify(JSON.parse(data), null, 2) } catch { return data }
    }
    return JSON.stringify(data, null, 2)
  }

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text).catch(console.error)
  }

  const selectedMessage = selectedIndex >= 0 ? messages[selectedIndex] : null

  return (
    <div className="flex flex-col h-full rounded-lg border border-border/60 overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-muted/30 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">Message Logs</span>
          {messages.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
              {messages.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedIndex >= 0 && (
            <button
              onClick={() => setSelectedIndex(-1)}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={11} />
              Deselect
            </button>
          )}
          <button
            onClick={clearMessages}
            disabled={messages.length === 0}
            title="Clear all"
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30"
          >
            <Trash2 size={11} />
            Clear
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Message list */}
        <div
          ref={listRef}
          className={`overflow-y-auto flex-1 min-w-0 ${selectedMessage ? 'border-r border-border/60' : ''}`}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground select-none">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-xs">No messages yet</span>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {messages.map((msg, i) => {
                const isSent = msg.type === 'sent'
                const isSelected = selectedIndex === i
                const preview = typeof msg.data === 'string' ? msg.data : JSON.stringify(msg.data)

                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedIndex(isSelected ? -1 : i)}
                    className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-violet-500/8 border-l-2 border-violet-500'
                        : 'hover:bg-muted/40 border-l-2 border-transparent'
                    }`}
                  >
                    {/* Direction icon */}
                    <div className={`shrink-0 mt-0.5 p-1 rounded ${isSent ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`}>
                      {isSent
                        ? <ArrowUpRight size={12} className="text-blue-400" />
                        : <ArrowDownLeft size={12} className="text-emerald-400" />
                      }
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[11px] font-medium ${isSent ? 'text-blue-400' : 'text-emerald-400'}`}>
                          {isSent ? 'Sent' : 'Received'}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatTimestamp(msg.timestamp)}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">#{i + 1}</span>
                      </div>
                      <div className="text-[12px] text-muted-foreground font-mono truncate">
                        {preview}
                      </div>
                    </div>

                    {/* Copy button - shows on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        copyText(msg.raw || preview)
                      }}
                      className="shrink-0 p-1 rounded text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-all"
                      title="Copy"
                    >
                      <Copy size={11} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Detail panel — shows when a message is selected */}
        {selectedMessage && (
          <div className="w-80 shrink-0 flex flex-col overflow-hidden">
            {/* Detail header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/60 bg-muted/20 shrink-0">
              <span className="text-xs font-medium text-foreground">
                Message #{selectedIndex + 1}
              </span>
              <button
                onClick={() => copyText(selectedMessage.raw || formatData(selectedMessage.data))}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Copy size={11} />
                Copy
              </button>
            </div>

            {/* Metadata */}
            <div className="px-3 py-2 border-b border-border/40 bg-muted/10 shrink-0 space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Direction</span>
                <span className={selectedMessage.type === 'sent' ? 'text-blue-400' : 'text-emerald-400'}>
                  {selectedMessage.type === 'sent' ? '↑ Sent' : '↓ Received'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Time</span>
                <span className="text-foreground font-mono">{formatTimestamp(selectedMessage.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Size</span>
                <span className="text-foreground font-mono">
                  {(selectedMessage.raw || JSON.stringify(selectedMessage.data)).length} bytes
                </span>
              </div>
            </div>

            {/* Raw data */}
            <div className="flex-1 overflow-auto p-3">
              <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap break-words leading-relaxed">
                {formatData(selectedMessage.data)}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between px-4 py-1.5 border-t border-border/40 bg-muted/20 shrink-0">
          <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <ArrowUpRight size={10} className="text-blue-400" />
              {messages.filter(m => m.type === 'sent').length} sent
            </span>
            <span className="flex items-center gap-1">
              <ArrowDownLeft size={10} className="text-emerald-400" />
              {messages.filter(m => m.type === 'received').length} received
            </span>
          </div>
          {selectedIndex >= 0 && (
            <span className="text-[10px] text-muted-foreground">
              {selectedIndex + 1} / {messages.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default RealtimeClientServerLogsTable