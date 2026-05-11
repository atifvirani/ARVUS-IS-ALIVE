import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, X, Trash2 } from 'lucide-react'
import useArvusStore from '../stores/useArvusStore'

export default function TerminalDrawer() {
  const { isTerminalOpen, setTerminalOpen, terminalLogs, clearTerminalLogs } = useArvusStore()
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [terminalLogs])

  return (
    <AnimatePresence>
      {isTerminalOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 35 }}
          className="absolute bottom-0 left-0 right-0 z-30"
          style={{
            height: '45%',
            minHeight: 200,
          }}
        >
          <div
            className="w-full h-full flex flex-col glass-strong"
            style={{
              borderTop: '1px solid rgba(30, 30, 50, 0.8)',
              borderRadius: '16px 16px 0 0',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-2.5 shrink-0"
              style={{
                borderBottom: '1px solid rgba(30, 30, 50, 0.5)',
                background: 'rgba(10, 10, 18, 0.6)',
                borderRadius: '16px 16px 0 0',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Mac dots */}
                <div className="flex items-center gap-1.5">
                  <div className="code-dot code-dot-red" style={{ width: 10, height: 10 }} />
                  <div className="code-dot code-dot-yellow" style={{ width: 10, height: 10 }} />
                  <div className="code-dot code-dot-green" style={{ width: 10, height: 10 }} />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#64648a' }}>
                  <Terminal size={13} />
                  <span>ARVUS Terminal</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={clearTerminalLogs}
                  className="p-1.5 rounded-lg transition-colors duration-200"
                  style={{ color: '#4a4a6a' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#f43f5e'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4a4a6a'}
                  title="Clear logs"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => setTerminalOpen(false)}
                  className="p-1.5 rounded-lg transition-colors duration-200"
                  style={{ color: '#4a4a6a' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#e4e4ef'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#4a4a6a'}
                  title="Close terminal"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Terminal Body */}
            <div
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-4 terminal-output"
              style={{ background: 'rgba(6, 6, 10, 0.5)' }}
            >
              {terminalLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs" style={{ color: '#2a2a44' }}>
                    Terminal output will appear here when ARVUS executes tools...
                  </p>
                </div>
              ) : (
                terminalLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-1"
                  >
                    <span style={{ color: '#4a4a6a' }}>
                      [{new Date(log.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
                      })}]
                    </span>{' '}
                    <span style={{ color: '#34d399' }}>{log.text}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
