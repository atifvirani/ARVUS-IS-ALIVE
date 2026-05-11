import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Server, Palette, Globe } from 'lucide-react'
import { useState } from 'react'
import useArvusStore from '../stores/useArvusStore'

const permissionLevels = [
  { id: 'LOW', label: 'Low', desc: 'Read-only access', color: '#34d399' },
  { id: 'MEDIUM', label: 'Medium', desc: 'File modifications allowed', color: '#fbbf24' },
  { id: 'HIGH', label: 'High', desc: 'System commands enabled', color: '#f97316' },
  { id: 'CRITICAL', label: 'Critical', desc: 'Full admin access', color: '#f43f5e' },
]

export default function SettingsPanel() {
  const { setActiveView } = useArvusStore()
  const [activePermission, setActivePermission] = useState('HIGH')
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [backendUrl, setBackendUrl] = useState('ws://localhost:8000/ws')

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="h-full overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2
            className="text-lg font-semibold"
            style={{
              background: 'linear-gradient(135deg, #e4e4ef, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Settings
          </h2>
          <button
            onClick={() => setActiveView('chat')}
            className="p-2 rounded-xl transition-colors duration-200"
            style={{ color: '#64648a', background: 'rgba(30, 30, 50, 0.3)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e4e4ef'; e.currentTarget.style.background = 'rgba(30, 30, 50, 0.6)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#64648a'; e.currentTarget.style.background = 'rgba(30, 30, 50, 0.3)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Security Level */}
        <SettingsSection icon={Shield} title="Permission Level" description="Controls what ARVUS is allowed to execute on your system">
          <div className="grid grid-cols-2 gap-2">
            {permissionLevels.map((level) => (
              <button
                key={level.id}
                onClick={() => setActivePermission(level.id)}
                className="flex flex-col items-start p-3 rounded-xl transition-all duration-200 text-left"
                style={{
                  background: activePermission === level.id ? `${level.color}10` : 'rgba(13, 13, 20, 0.4)',
                  border: `1px solid ${activePermission === level.id ? `${level.color}40` : 'rgba(30, 30, 50, 0.4)'}`,
                  boxShadow: activePermission === level.id ? `0 0 12px ${level.color}15` : 'none',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: level.color }} />
                  <span className="text-xs font-semibold" style={{ color: activePermission === level.id ? level.color : '#8a8aaa' }}>
                    {level.label}
                  </span>
                </div>
                <span className="text-[10px]" style={{ color: '#4a4a6a' }}>{level.desc}</span>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Connection Settings */}
        <SettingsSection icon={Server} title="Connection" description="Backend and LLM service configuration">
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#64648a' }}>
                Ollama URL
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors duration-200"
                style={{
                  background: 'rgba(13, 13, 20, 0.6)',
                  border: '1px solid rgba(30, 30, 50, 0.5)',
                  color: '#e4e4ef',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider mb-1.5 block" style={{ color: '#64648a' }}>
                WebSocket URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-xs outline-none transition-colors duration-200"
                style={{
                  background: 'rgba(13, 13, 20, 0.6)',
                  border: '1px solid rgba(30, 30, 50, 0.5)',
                  color: '#e4e4ef',
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>
        </SettingsSection>

        {/* About */}
        <SettingsSection icon={Globe} title="About ARVUS" description="Personal Local AI Operating System">
          <div className="space-y-2 text-xs" style={{ color: '#8a8aaa' }}>
            <div className="flex justify-between">
              <span>Version</span>
              <span className="font-mono" style={{ color: '#818cf8' }}>0.1.0-alpha</span>
            </div>
            <div className="flex justify-between">
              <span>Framework</span>
              <span className="font-mono" style={{ color: '#818cf8' }}>React 19 + Vite</span>
            </div>
            <div className="flex justify-between">
              <span>Backend</span>
              <span className="font-mono" style={{ color: '#818cf8' }}>FastAPI + Ollama</span>
            </div>
            <div className="flex justify-between">
              <span>Memory</span>
              <span className="font-mono" style={{ color: '#818cf8' }}>SQLite + ChromaDB</span>
            </div>
          </div>
        </SettingsSection>
      </div>
    </motion.div>
  )
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: 'rgba(13, 13, 20, 0.4)',
        border: '1px solid rgba(30, 30, 50, 0.4)',
      }}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} style={{ color: '#818cf8' }} />
        <h3 className="text-sm font-semibold" style={{ color: '#d4d4e8' }}>{title}</h3>
      </div>
      <p className="text-[11px] mb-3" style={{ color: '#4a4a6a' }}>{description}</p>
      {children}
    </div>
  )
}
