import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Brain, Clock, Database, Hash } from 'lucide-react'
import useArvusStore from '../stores/useArvusStore'

export default function MemoryViewer() {
  const { messages } = useArvusStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('history') // 'history' | 'semantic'

  // Filter messages based on search
  const filteredMessages = messages.filter((msg) =>
    !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full overflow-hidden flex flex-col"
    >
      <div className="max-w-3xl mx-auto w-full p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg font-semibold"
            style={{
              background: 'linear-gradient(135deg, #e4e4ef, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Memory Explorer
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-xl" style={{ background: 'rgba(13, 13, 20, 0.5)', border: '1px solid rgba(30,30,50,0.4)' }}>
          {[
            { id: 'history', label: 'Conversation History', icon: Clock },
            { id: 'semantic', label: 'Semantic Memory', icon: Brain },
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#818cf8' : '#64648a',
                  boxShadow: activeTab === tab.id ? '0 0 8px rgba(99,102,241,0.1)' : 'none',
                }}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
          style={{
            background: 'rgba(13, 13, 20, 0.5)',
            border: '1px solid rgba(30, 30, 50, 0.4)',
          }}
        >
          <Search size={14} style={{ color: '#4a4a6a' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="flex-grow bg-transparent text-xs outline-none"
            style={{ color: '#e4e4ef', caretColor: '#818cf8' }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: '#64648a', background: 'rgba(30,30,50,0.4)' }}>
              Clear
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#4a4a6a' }}>
            <Hash size={11} />
            <span>{filteredMessages.length} entries</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#4a4a6a' }}>
            <Database size={11} />
            <span>Session memory</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto space-y-2 pb-24">
          {activeTab === 'history' ? (
            filteredMessages.length > 0 ? (
              filteredMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="p-3 rounded-xl"
                  style={{
                    background: msg.role === 'user' ? 'rgba(99, 102, 241, 0.05)' : 'rgba(13, 13, 20, 0.4)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(30, 30, 50, 0.4)'}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: msg.role === 'user' ? '#6366f1' : '#34d399' }}
                    />
                    <span className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: msg.role === 'user' ? '#818cf8' : '#34d399' }}>
                      {msg.role}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed line-clamp-3" style={{ color: '#8a8aaa' }}>
                    {msg.content.substring(0, 200)}{msg.content.length > 200 ? '...' : ''}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <Brain size={32} style={{ color: '#1e1e32' }} />
                <p className="text-xs mt-3" style={{ color: '#4a4a6a' }}>
                  {searchQuery ? 'No matching memories found' : 'No conversation history yet. Start chatting!'}
                </p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Database size={32} style={{ color: '#1e1e32' }} />
              <p className="text-xs mt-3" style={{ color: '#4a4a6a' }}>
                Semantic memory search queries the ChromaDB vector store
              </p>
              <p className="text-[10px] mt-1" style={{ color: '#2a2a44' }}>
                Requires backend connection to search past conversations
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
