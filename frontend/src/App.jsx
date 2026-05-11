import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import ChatView from './components/ChatView'
import CommandInput from './components/CommandInput'
import TerminalDrawer from './components/TerminalDrawer'
import SystemWidgets from './components/SystemWidgets'
import SettingsPanel from './components/SettingsPanel'
import MemoryViewer from './components/MemoryViewer'
import useArvusStore from './stores/useArvusStore'
import { connectWebSocket, disconnectWebSocket } from './utils/websocket'

function App() {
  const { activeView, isTerminalOpen } = useArvusStore()

  // Initialize WebSocket on mount
  useEffect(() => {
    connectWebSocket()
    return () => disconnectWebSocket()
  }, [])

  const renderActiveView = () => {
    switch (activeView) {
      case 'chat':
        return <ChatView />
      case 'terminal':
        return <TerminalFullView />
      case 'memory':
        return <MemoryViewer />
      case 'monitor':
        return <MonitorFullView />
      case 'settings':
        return <SettingsPanel />
      default:
        return <ChatView />
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden relative" style={{ background: 'var(--arvus-bg)' }}>
      {/* Aurora Background */}
      <div className="aurora-bg">
        <div className="aurora-blob-3" />
      </div>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow relative z-10 overflow-hidden">
        {/* Header */}
        <Header />

        {/* Active View */}
        <div className="flex-grow flex overflow-hidden relative">
          {/* Main View */}
          <div className="flex-grow relative overflow-hidden">
            <AnimatePresence mode="wait">
              {renderActiveView()}
            </AnimatePresence>

            {/* Command Input — always visible on chat */}
            {activeView === 'chat' && <CommandInput />}

            {/* Terminal Drawer Overlay */}
            {activeView === 'chat' && <TerminalDrawer />}
          </div>

          {/* Right Panel — System Widgets (visible on chat & monitor views) */}
          {(activeView === 'chat' || activeView === 'monitor') && (
            <div
              className="hidden lg:block w-64 shrink-0 glass-strong overflow-hidden"
              style={{ borderLeft: '1px solid rgba(30, 30, 50, 0.5)' }}
            >
              <SystemWidgets />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Full-screen terminal view (separate from the drawer)
function TerminalFullView() {
  const { terminalLogs } = useArvusStore()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3"
        style={{ borderBottom: '1px solid rgba(30, 30, 50, 0.4)' }}>
        <div className="flex items-center gap-1.5">
          <div className="code-dot code-dot-red" />
          <div className="code-dot code-dot-yellow" />
          <div className="code-dot code-dot-green" />
        </div>
        <span className="text-xs font-medium" style={{ color: '#64648a' }}>ARVUS Terminal — Full View</span>
      </div>
      <div className="flex-grow overflow-y-auto p-5 terminal-output" style={{ background: 'rgba(6, 6, 10, 0.3)' }}>
        {terminalLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: '#2a2a44' }}>
              No terminal output yet. ARVUS will log tool executions here.
            </p>
          </div>
        ) : (
          terminalLogs.map((log, i) => (
            <div key={i} className="mb-1">
              <span style={{ color: '#4a4a6a' }}>
                [{new Date(log.timestamp).toLocaleTimeString('en-US', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                })}]
              </span>{' '}
              <span style={{ color: '#34d399' }}>{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Full-screen monitor view
function MonitorFullView() {
  return (
    <div className="h-full overflow-y-auto">
      <SystemWidgets />
    </div>
  )
}

export default App
