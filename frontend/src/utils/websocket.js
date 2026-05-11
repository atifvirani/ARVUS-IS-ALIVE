import useArvusStore from '../stores/useArvusStore'

const WS_URL = 'ws://localhost:8000/ws'
const MAX_RECONNECT_DELAY = 10000
const INITIAL_RECONNECT_DELAY = 1000

let reconnectTimeout = null
let reconnectDelay = INITIAL_RECONNECT_DELAY
let ws = null

export function connectWebSocket() {
  const store = useArvusStore.getState()
  
  // Clean up existing connection
  if (ws) {
    ws.onclose = null
    ws.onerror = null
    ws.onmessage = null
    ws.close()
  }

  store.setWsStatus('reconnecting')
  
  ws = new WebSocket(WS_URL)

  ws.onopen = () => {
    console.log('[ARVUS] WebSocket connected')
    reconnectDelay = INITIAL_RECONNECT_DELAY
    useArvusStore.getState().setWsStatus('connected')
    useArvusStore.getState().setWsRef(ws)
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      useArvusStore.getState().handleWsMessage(data)
    } catch (err) {
      console.error('[ARVUS] Failed to parse WebSocket message:', err)
    }
  }

  ws.onerror = (err) => {
    console.error('[ARVUS] WebSocket error:', err)
  }

  ws.onclose = () => {
    console.log('[ARVUS] WebSocket disconnected')
    useArvusStore.getState().setWsStatus('disconnected')
    useArvusStore.getState().setWsRef(null)
    useArvusStore.getState().setOrbState('idle')
    useArvusStore.getState().setIsThinking(false)
    
    // Schedule reconnect with exponential backoff
    scheduleReconnect()
  }
}

function scheduleReconnect() {
  if (reconnectTimeout) clearTimeout(reconnectTimeout)
  
  reconnectTimeout = setTimeout(() => {
    console.log(`[ARVUS] Attempting reconnection (delay: ${reconnectDelay}ms)...`)
    useArvusStore.getState().setWsStatus('reconnecting')
    connectWebSocket()
    reconnectDelay = Math.min(reconnectDelay * 1.5, MAX_RECONNECT_DELAY)
  }, reconnectDelay)
}

export function disconnectWebSocket() {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }
  if (ws) {
    ws.onclose = null
    ws.close()
    ws = null
  }
  useArvusStore.getState().setWsStatus('disconnected')
  useArvusStore.getState().setWsRef(null)
}
