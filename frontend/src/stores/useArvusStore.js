import { create } from 'zustand'

const useArvusStore = create((set, get) => ({
  // ── Connection State ──
  wsStatus: 'disconnected', // 'connected' | 'disconnected' | 'reconnecting'
  wsRef: null,
  setWsStatus: (status) => set({ wsStatus: status }),
  setWsRef: (ref) => set({ wsRef: ref }),

  // ── Chat State ──
  messages: [],
  isThinking: false,
  activeView: 'chat', // 'chat' | 'terminal' | 'memory' | 'monitor' | 'settings'
  
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsThinking: (val) => set({ isThinking: val }),
  setActiveView: (view) => set({ activeView: view }),
  clearMessages: () => set({ messages: [] }),

  // ── Orb State ──
  orbState: 'idle', // 'idle' | 'thinking' | 'executing'
  setOrbState: (state) => set({ orbState: state }),

  // ── System Status ──
  systemStatus: {
    cpu: 0,
    ram: 0,
    disk: 0,
    uptime: '0:00:00',
    ollamaStatus: 'unknown',
    ollamaModel: '',
    dbStatus: 'unknown',
    browserStatus: 'unknown',
  },
  setSystemStatus: (status) => set((state) => ({
    systemStatus: { ...state.systemStatus, ...status }
  })),

  // ── UI State ──
  isTerminalOpen: false,
  isSettingsOpen: false,
  inputFocused: false,
  terminalLogs: [],

  toggleTerminal: () => set((state) => ({ isTerminalOpen: !state.isTerminalOpen })),
  setTerminalOpen: (val) => set({ isTerminalOpen: val }),
  toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
  setSettingsOpen: (val) => set({ isSettingsOpen: val }),
  setInputFocused: (val) => set({ inputFocused: val }),
  addTerminalLog: (log) => set((state) => ({
    terminalLogs: [...state.terminalLogs, { text: log, timestamp: Date.now() }]
  })),
  clearTerminalLogs: () => set({ terminalLogs: [] }),

  // ── Send Message Action ──
  sendMessage: (content) => {
    const { wsRef, wsStatus } = get()
    if (!content.trim() || !wsRef || wsStatus !== 'connected') return false

    const userMsg = { role: 'user', content }
    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
      orbState: 'thinking',
    }))
    
    wsRef.send(JSON.stringify({ content }))
    return true
  },

  // ── Handle Incoming Message ──
  handleWsMessage: (data) => {
    if (data.type === 'response') {
      set((state) => ({
        messages: [...state.messages, { role: data.role, content: data.content }],
        isThinking: false,
        orbState: 'idle',
      }))
      
      // Check if there's tool observation in the response to log
      if (data.content && data.content.includes('[Observation:')) {
        const obsMatch = data.content.match(/\[Observation:\s?([\s\S]*?)\]/g)
        if (obsMatch) {
          obsMatch.forEach((obs) => {
            const text = obs.replace(/\[Observation:\s?|\]$/g, '')
            get().addTerminalLog(text)
          })
        }
      }
    } else if (data.type === 'tool_execution') {
      set({ orbState: 'executing' })
      get().addTerminalLog(data.content || 'Executing tool...')
    } else if (data.type === 'status_update') {
      get().setSystemStatus(data.status)
    }
  },

  // ── Fetch System Status ──
  fetchSystemStatus: async () => {
    try {
      const res = await fetch('http://localhost:8000/api/status')
      if (res.ok) {
        const data = await res.json()
        set({ systemStatus: data })
      }
    } catch {
      // Backend not available — silently fail
    }
  },
}))

export default useArvusStore
