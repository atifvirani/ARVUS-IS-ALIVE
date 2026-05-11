import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, Command } from 'lucide-react'
import { motion } from 'framer-motion'
import useArvusStore from '../stores/useArvusStore'

export default function CommandInput() {
  const [input, setInput] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef(null)
  const { sendMessage, isThinking, wsStatus, setInputFocused } = useArvusStore()

  // Ctrl+K to focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleSend = useCallback(() => {
    if (!input.trim() || isThinking) return
    const sent = sendMessage(input)
    if (sent) setInput('')
  }, [input, isThinking, sendMessage])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFocus = () => {
    setFocused(true)
    setInputFocused(true)
  }

  const handleBlur = () => {
    setFocused(false)
    setInputFocused(false)
  }

  const isDisabled = wsStatus !== 'connected'

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
      className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-20"
    >
      <div className={`gradient-border-wrapper ${focused ? 'focused' : ''}`}>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-full"
          style={{
            background: 'rgba(10, 10, 18, 0.9)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Left icons */}
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 rounded-lg transition-colors duration-200"
              style={{ color: '#4a4a6a' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4a4a6a'}
              title="Attach file (coming soon)"
            >
              <Paperclip size={16} />
            </button>
            <button
              className="p-1.5 rounded-lg transition-colors duration-200"
              style={{ color: '#4a4a6a' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#818cf8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#4a4a6a'}
              title="Voice input (coming soon)"
            >
              <Mic size={16} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: 'rgba(30, 30, 50, 0.6)' }} />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={isDisabled}
            placeholder={
              isDisabled
                ? 'Connecting to ARVUS backend...'
                : isThinking
                  ? 'ARVUS is thinking...'
                  : 'Ask ARVUS to execute a task, write code, or explore the web...'
            }
            className="flex-grow bg-transparent text-sm outline-none placeholder:text-zinc-600"
            style={{
              color: '#e4e4ef',
              fontFamily: 'var(--font-ui)',
              caretColor: '#818cf8',
            }}
          />

          {/* Right — shortcut hint + send */}
          <div className="flex items-center gap-2">
            {!focused && (
              <div
                className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-xs"
                style={{ background: 'rgba(30, 30, 50, 0.5)', color: '#4a4a6a', border: '1px solid rgba(30,30,50,0.6)' }}
              >
                <Command size={10} />
                <span>K</span>
              </div>
            )}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={!input.trim() || isThinking || isDisabled}
              className="p-2 rounded-full transition-all duration-300"
              style={{
                background: input.trim() && !isDisabled
                  ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                  : 'rgba(30, 30, 50, 0.5)',
                color: input.trim() && !isDisabled ? 'white' : '#4a4a6a',
                boxShadow: input.trim() && !isDisabled
                  ? '0 0 16px rgba(99, 102, 241, 0.3)'
                  : 'none',
                cursor: input.trim() && !isDisabled ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
