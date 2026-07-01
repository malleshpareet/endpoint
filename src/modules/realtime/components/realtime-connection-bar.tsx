import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlugZap, Plug, AlertCircle, Link2, Link2Off } from 'lucide-react'
import React, { useState, useCallback, useEffect } from 'react'
import { useWsStore } from '../hooks/useWs'

const RealtimeConnectionBar = () => {
  const { 
    status, 
    isConnected, 
    error, 
    url: connectedUrl, 
    reconnectAttempts, 
    maxReconnectAttempts,
    connect,
    disconnect
  } = useWsStore()
  
  const [url, setUrl] = useState(connectedUrl || '')

  useEffect(() => {
    setUrl(connectedUrl || '')
  }, [connectedUrl])

  const onConnect = useCallback(() => {
    if (!url.trim()) return

    if (isConnected) {
      disconnect()
    } else {
      connect(url, {
        onOpen: () => console.log('Connected to:', url),
        onClose: () => console.log('Disconnected'),
        onError: (e) => console.error('WebSocket error:', e),
        onMessage: (e) => console.log('Message:', e.data),
        autoReconnect: true,
        reconnectDelay: 3000
      })
    }
  }, [url, isConnected, connect, disconnect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onConnect()
  }, [onConnect])

  const statusConfig = {
    connected: {
      dot: 'bg-emerald-400',
      label: 'Connected',
      labelClass: 'text-emerald-400',
      btnClass: 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20',
      btnText: 'Disconnect',
      icon: <Link2Off size={14} />,
    },
    connecting: {
      dot: 'bg-amber-400 animate-pulse',
      label: 'Connecting…',
      labelClass: 'text-amber-400',
      btnClass: 'bg-muted text-muted-foreground border border-border cursor-not-allowed',
      btnText: 'Connecting…',
      icon: <PlugZap size={14} className="animate-pulse" />,
    },
    reconnecting: {
      dot: 'bg-amber-400 animate-pulse',
      label: `Reconnecting (${reconnectAttempts}/${maxReconnectAttempts})`,
      labelClass: 'text-amber-400',
      btnClass: 'bg-muted text-muted-foreground border border-border cursor-not-allowed',
      btnText: 'Reconnecting…',
      icon: <PlugZap size={14} className="animate-pulse" />,
    },
    error: {
      dot: 'bg-red-400',
      label: error || 'Error',
      labelClass: 'text-red-400',
      btnClass: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20',
      btnText: 'Retry',
      icon: <Link2 size={14} />,
    },
    disconnected: {
      dot: 'bg-zinc-500',
      label: 'Disconnected',
      labelClass: 'text-zinc-400',
      btnClass: 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/20',
      btnText: 'Connect',
      icon: <Link2 size={14} />,
    },
  }

  const cfg = statusConfig[status] || statusConfig.disconnected
  const isDisabled = status === 'connecting' || status === 'reconnecting'

  return (
    <div className="flex items-center gap-3">
      {/* Protocol badge */}
      <div className="shrink-0 px-2.5 py-1.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-xs font-mono font-semibold text-violet-400 select-none">
        WS
      </div>

      {/* URL Input */}
      <div className="relative flex-1">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ws://localhost:8080 or wss://echo.websocket.org"
          disabled={isDisabled || isConnected}
          className="font-mono text-sm h-9 pr-3 bg-muted/40 border-border/60 focus-visible:ring-violet-500/30 placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Status indicator */}
      <div className="shrink-0 flex items-center gap-1.5 text-xs min-w-0">
        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className={`${cfg.labelClass} truncate max-w-28 hidden sm:block`}>{cfg.label}</span>
      </div>

      {/* Action button */}
      <Button
        type="button"
        size="sm"
        onClick={onConnect}
        disabled={isDisabled}
        className={`shrink-0 h-9 px-4 text-xs font-medium gap-1.5 rounded-md transition-all ${cfg.btnClass}`}
      >
        {cfg.icon}
        {cfg.btnText}
      </Button>
    </div>
  )
}

export default RealtimeConnectionBar