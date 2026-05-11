import { useRef, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import CentralOrb from './CentralOrb'
import MessageBubble from './MessageBubble'
import useArvusStore from '../stores/useArvusStore'
import { motion } from 'framer-motion'

export default function ChatView() {
  const { messages, isThinking } = useArvusStore()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isThinking])

  return (
    <div className="flex-grow overflow-y-auto relative" style={{ paddingBottom: '100px' }}>
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <CentralOrb />
        </div>
      ) : (
        <div className="p-6 space-y-4 max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} message={msg} index={idx} />
            ))}
          </AnimatePresence>

          {/* Thinking indicator */}
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex justify-start"
            >
              <div
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl"
                style={{
                  background: 'rgba(13, 13, 20, 0.7)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(30, 30, 50, 0.6)',
                }}
              >
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ background: '#6366f1' }}
                      animate={{
                        y: [0, -6, 0],
                        opacity: [0.4, 1, 0.4],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
                <span className="text-xs ml-1" style={{ color: '#64648a' }}>
                  ARVUS is thinking...
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
