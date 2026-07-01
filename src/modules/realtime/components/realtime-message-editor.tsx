import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Copy, Trash2, RotateCcw } from 'lucide-react'
import { useWsStore } from '../hooks/useWs'
import Editor from '@monaco-editor/react'
import { toast } from 'sonner'
import RealtimeClientServerLogsTable from './realtime-client-server-logs-table'

const RealtimeMessageEditor = () => {
  const { 
    send, 
    status,
    isConnected, 
    draftMessage, 
    setDraftMessage, 
    messages 
  } = useWsStore()
  
  const [isSending, setIsSending] = useState(false)
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  useEffect(() => {
    if (!draftMessage) {
      const initial = '{\n  "type": "message",\n  "content": "Hello WebSocket!",\n  "timestamp": "' + new Date().toISOString() + '"\n}'
      setDraftMessage(initial)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (status !== 'connected') {
      toast.info('WebSocket is not connected')
      return
    }
    if (!draftMessage?.trim()) {
      toast.info('Message is empty')
      return
    }

    setIsSending(true)
    try {
      let messageToSend: any
      try {
        messageToSend = JSON.parse(draftMessage)
      } catch {
        messageToSend = draftMessage
      }

      const success = send(messageToSend)
      if (success) {
        toast.success('Message sent')
      } else {
        toast.error('Failed to send')
      }
    } catch (err) {
      toast.error('Error: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsSending(false)
    }
  }, [draftMessage, send, status])

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: true
    })

    editor.updateOptions({
      fontSize: 13,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true,
      lineNumbers: 'on',
      renderLineHighlight: 'line',
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 3,
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleSendMessage()
    })
  }, [handleSendMessage])

  const handleFormatJSON = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(draftMessage), null, 2)
      setDraftMessage(formatted)
      editorRef.current?.setValue(formatted)
    } catch {
      toast.error('Invalid JSON')
    }
  }, [draftMessage, setDraftMessage])

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(draftMessage)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'))
  }, [draftMessage])

  const handleClearMessage = useCallback(() => {
    const empty = '{\n  \n}'
    setDraftMessage(empty)
    editorRef.current?.setValue(empty)
    editorRef.current?.focus()
  }, [setDraftMessage])

  return (
    <div className="flex flex-col gap-3 h-full min-h-0">
      {/* Editor panel */}
      <div className="flex flex-col rounded-lg border border-border/60 overflow-hidden bg-[#1e1e1e] shrink-0">
        {/* Editor toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Message Body</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono">JSON</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleFormatJSON}
              title="Format JSON"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <RotateCcw size={11} />
              <span>Format</span>
            </button>
            <button
              onClick={handleCopyMessage}
              title="Copy"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
            >
              <Copy size={11} />
              <span>Copy</span>
            </button>
            <button
              onClick={handleClearMessage}
              title="Clear"
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={11} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <Editor
          height="160px"
          language="json"
          theme="vs-dark"
          value={draftMessage}
          onChange={(val) => setDraftMessage(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            lineNumbers: 'on',
            renderWhitespace: 'none',
            contextmenu: true,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            scrollbar: { verticalScrollbarSize: 4, horizontalScrollbarSize: 4 },
          }}
          loading={
            <div className="w-full h-40 bg-[#1e1e1e] flex items-center justify-center">
              <span className="text-zinc-500 text-xs">Loading editor…</span>
            </div>
          }
        />

        {/* Send bar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-border/40 bg-zinc-900/80">
          <span className="text-[11px] text-zinc-500">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Ctrl</kbd>
            {' + '}
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Enter</kbd>
            {' to send • JSON validation enabled'}
          </span>
          <Button
            onClick={handleSendMessage}
            disabled={status !== 'connected' || isSending}
            size="sm"
            className="h-7 px-3 text-xs gap-1.5 bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40"
          >
            <Send size={12} />
            {isSending ? 'Sending…' : 'Send'}
          </Button>
        </div>
      </div>

      {/* Logs panel */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <RealtimeClientServerLogsTable />
      </div>
    </div>
  )
}

export default RealtimeMessageEditor