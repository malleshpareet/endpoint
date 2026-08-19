import { create } from 'zustand'
import { subscribeWithSelector, persist } from 'zustand/middleware'

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting'

export type WsMessage = {
    id: string
    type: 'sent' | 'received'
    data: any
    timestamp: Date
    raw?: string
}

export type WsOptions = {
    onOpen?: (ev: Event) => void
    onMessage?: (ev: MessageEvent) => void
    onClose?: (ev: CloseEvent) => void
    onError?: (ev: Event | Error) => void
    autoReconnect?: boolean
    reconnectDelay?: number
}

export type WsConnectionState = {
    ws: WebSocket | null
    url: string | null
    status: ConnectionStatus
    error: string | null
    messages: WsMessage[]
    options: WsOptions
    reconnectAttempts: number
    maxReconnectAttempts: number
    reconnectTimeoutId: number | null
    draftMessage: string
}

interface WsStore {
    connections: Record<string, WsConnectionState>

    // Core actions
    initSession: (sessionId: string, initialUrl: string | null, initialDraft: string) => void
    connect: (sessionId: string, url: string, options?: WsOptions) => void
    disconnect: (sessionId: string, code?: number, reason?: string) => void
    send: (sessionId: string, data: string | object) => boolean
    clearMessages: (sessionId: string) => void
    setDraftMessage: (sessionId: string, message: string) => void
    setUrl: (sessionId: string, url: string | null) => void

    // Internal actions
    setStatus: (sessionId: string, status: ConnectionStatus) => void
    addMessage: (sessionId: string, message: Omit<WsMessage, 'id' | 'timestamp'>) => void
    handleReconnect: (sessionId: string) => void
    restoreConnections: () => void

    // Getters
    getConnection: (sessionId: string | null) => WsConnectionState | undefined
    isConnected: (sessionId: string | null) => boolean
    isConnecting: (sessionId: string | null) => boolean
    isReconnecting: (sessionId: string | null) => boolean
}

const createInitialConnectionState = (url: string | null = null, draftMessage: string = ''): WsConnectionState => ({
    ws: null,
    url,
    status: 'disconnected',
    error: null,
    messages: [],
    options: {},
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectTimeoutId: null,
    draftMessage,
})

export const useWsStore = create<WsStore>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
        connections: {},

        initSession: (sessionId: string, initialUrl: string | null, initialDraft: string) => {
            const state = get()
            if (!state.connections[sessionId]) {
                set(state => ({
                    connections: {
                        ...state.connections,
                        [sessionId]: createInitialConnectionState(initialUrl, initialDraft)
                    }
                }))
            }
        },

        getConnection: (sessionId: string | null) => {
            if (!sessionId) return undefined;
            return get().connections[sessionId];
        },
        
        isConnected: (sessionId: string | null) => {
            if (!sessionId) return false;
            return get().connections[sessionId]?.status === 'connected';
        },
        
        isConnecting: (sessionId: string | null) => {
            if (!sessionId) return false;
            return get().connections[sessionId]?.status === 'connecting';
        },
        
        isReconnecting: (sessionId: string | null) => {
            if (!sessionId) return false;
            return get().connections[sessionId]?.status === 'reconnecting';
        },

        connect: (sessionId: string, url: string, options: WsOptions = {}) => {
            const state = get()
            let conn = state.connections[sessionId]
            
            if (!conn) {
                get().initSession(sessionId, url, '')
                conn = get().connections[sessionId]
            }

            if (conn.ws) {
                conn.ws.close()
            }

            if (conn.reconnectTimeoutId) {
                clearTimeout(conn.reconnectTimeoutId)
            }

            set(state => ({
                connections: {
                    ...state.connections,
                    [sessionId]: {
                        ...(state.connections[sessionId] || createInitialConnectionState(url, '')),
                        url,
                        options,
                        status: 'connecting',
                        error: null,
                        reconnectAttempts: 0
                    }
                }
            }))

            try {
                const ws = new WebSocket(url)

                ws.onopen = (event) => {
                    console.log('WebSocket connected to:', url)
                    set(state => ({
                        connections: {
                            ...state.connections,
                            [sessionId]: {
                                ...state.connections[sessionId],
                                ws,
                                status: 'connected',
                                error: null,
                                reconnectAttempts: 0
                            }
                        }
                    }))
                    options.onOpen?.(event)
                }

                ws.onmessage = (event) => {
                    console.log('WebSocket message received:', event.data)
                    get().addMessage(sessionId, {
                        type: 'received',
                        data: event.data,
                        raw: event.data
                    })
                    options.onMessage?.(event)
                }

                ws.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason)
                    
                    set(state => ({
                        connections: {
                            ...state.connections,
                            [sessionId]: {
                                ...state.connections[sessionId],
                                ws: null
                            }
                        }
                    }))
                    options.onClose?.(event)

                    const updatedConn = get().connections[sessionId]
                    if (updatedConn.options.autoReconnect && event.code !== 1000) {
                        get().handleReconnect(sessionId)
                    } else {
                        get().setStatus(sessionId, 'disconnected')
                    }
                }

                ws.onerror = (event) => {
                    console.error('WebSocket error:', event)
                    set(state => ({
                        connections: {
                            ...state.connections,
                            [sessionId]: {
                                ...state.connections[sessionId],
                                status: 'error',
                                error: 'Connection error occurred'
                            }
                        }
                    }))
                    options.onError?.(event)
                }

            } catch (error) {
                console.error('Failed to create WebSocket:', error)
                set(state => ({
                    connections: {
                        ...state.connections,
                        [sessionId]: {
                            ...state.connections[sessionId],
                            status: 'error',
                            error: error instanceof Error ? error.message : 'Failed to create WebSocket'
                        }
                    }
                }))
                options.onError?.(error as Error)
            }
        },

        disconnect: (sessionId: string, code = 1000, reason = '') => {
            const conn = get().connections[sessionId]
            if (!conn) return

            if (conn.reconnectTimeoutId) {
                clearTimeout(conn.reconnectTimeoutId)
            }

            if (conn.ws) {
                conn.ws.close(code, reason)
            }

            set(state => ({
                connections: {
                    ...state.connections,
                    [sessionId]: {
                        ...state.connections[sessionId],
                        ws: null,
                        status: 'disconnected',
                        reconnectTimeoutId: null,
                        reconnectAttempts: 0
                    }
                }
            }))
        },

        send: (sessionId: string, data: string | object) => {
            const conn = get().connections[sessionId]
            if (!conn?.ws || conn.ws.readyState !== WebSocket.OPEN) {
                console.warn('WebSocket is not connected')
                return false
            }

            try {
                const message = typeof data === 'string' ? data : JSON.stringify(data)
                conn.ws.send(message)

                get().addMessage(sessionId, {
                    type: 'sent',
                    data,
                    raw: message
                })

                console.log('WebSocket message sent:', message)
                return true
            } catch (error) {
                console.error('Failed to send message:', error)
                set(state => ({
                    connections: {
                        ...state.connections,
                        [sessionId]: {
                            ...state.connections[sessionId],
                            error: 'Failed to send message'
                        }
                    }
                }))
                return false
            }
        },

        clearMessages: (sessionId: string) => set(state => ({
            connections: {
                ...state.connections,
                [sessionId]: {
                    ...state.connections[sessionId],
                    messages: []
                }
            }
        })),

        setDraftMessage: (sessionId: string, message: string) => set(state => ({
            connections: {
                ...state.connections,
                [sessionId]: {
                    ...state.connections[sessionId],
                    draftMessage: message
                }
            }
        })),

        setUrl: (sessionId: string, url: string | null) => set(state => ({
            connections: {
                ...state.connections,
                [sessionId]: {
                    ...state.connections[sessionId],
                    url
                }
            }
        })),

        setStatus: (sessionId: string, status: ConnectionStatus) => set(state => ({
            connections: {
                ...state.connections,
                [sessionId]: {
                    ...state.connections[sessionId],
                    status
                }
            }
        })),

        addMessage: (sessionId: string, message: Omit<WsMessage, 'id' | 'timestamp'>) => {
            const newMessage: WsMessage = {
                ...message,
                id: crypto.randomUUID(),
                timestamp: new Date()
            }

            set(state => {
                const conn = state.connections[sessionId]
                if (!conn) return state
                return {
                    connections: {
                        ...state.connections,
                        [sessionId]: {
                            ...conn,
                            messages: [...(conn.messages || []), newMessage].slice(-100)
                        }
                    }
                }
            })
        },

        handleReconnect: (sessionId: string) => {
            const conn = get().connections[sessionId]
            if (!conn) return

            if (conn.reconnectAttempts >= conn.maxReconnectAttempts) {
                console.log('Max reconnection attempts reached')
                set(state => ({
                    connections: {
                        ...state.connections,
                        [sessionId]: {
                            ...state.connections[sessionId],
                            status: 'error',
                            error: 'Max reconnection attempts reached'
                        }
                    }
                }))
                return
            }

            const delay = (conn.options.reconnectDelay || 3000) * Math.pow(1.5, conn.reconnectAttempts)

            set(state => ({
                connections: {
                    ...state.connections,
                    [sessionId]: {
                        ...state.connections[sessionId],
                        status: 'reconnecting',
                        reconnectAttempts: conn.reconnectAttempts + 1
                    }
                }
            }))

            console.log(`Reconnecting ${sessionId} in ${delay}ms (attempt ${conn.reconnectAttempts + 1}/${conn.maxReconnectAttempts})`)

            const timeoutId = window.setTimeout(() => {
                const updatedConn = get().connections[sessionId]
                if (updatedConn?.url) {
                    get().connect(sessionId, updatedConn.url, updatedConn.options)
                }
            }, delay)

            set(state => ({
                connections: {
                    ...state.connections,
                    [sessionId]: {
                        ...state.connections[sessionId],
                        reconnectTimeoutId: timeoutId
                    }
                }
            }))
        },

        restoreConnections: () => {
            const state = get()
            Object.entries(state.connections).forEach(([sessionId, conn]) => {
                if (conn.status === 'connected' || conn.status === 'connecting' || conn.status === 'reconnecting') {
                    if (conn.url) {
                        console.log(`Auto-reconnecting session ${sessionId}...`)
                        // Important: reset attempts when auto-reconnecting on load
                        get().connect(sessionId, conn.url, { ...conn.options })
                    }
                }
            })
        }
    }),
    {
        name: 'ws-connections-storage',
        partialize: (state) => ({
            connections: Object.fromEntries(
                Object.entries(state.connections).map(([id, conn]) => [
                    id,
                    {
                        ...conn,
                        ws: null, // Don't persist WebSocket objects
                        reconnectTimeoutId: null, // Don't persist timeout IDs
                        // Keep a limited number of messages to prevent localstorage bloat
                        messages: conn.messages ? conn.messages.slice(-50) : []
                    }
                ])
            )
        })
    }
    ))
)