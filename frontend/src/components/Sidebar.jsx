import { Terminal, Brain, Database, Activity, Settings, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import useArvusStore from '../stores/useArvusStore'

const navItems = [
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'terminal', icon: Terminal, label: 'Terminal' },
  { id: 'memory', icon: Brain, label: 'Memory' },
  { id: 'monitor', icon: Activity, label: 'Monitor' },
]

export default function Sidebar() {
  const { activeView, setActiveView, wsStatus } = useArvusStore()

  return (
    <motion.div
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-[68px] flex flex-col items-center py-5 glass-strong z-30 relative"
      style={{ borderRight: '1px solid rgba(30, 30, 50, 0.6)' }}
    >
      {/* ARVUS Logo */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg cursor-pointer relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #6366f1 100%)',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.4), 0 4px 12px rgba(0,0,0,0.3)',
        }}
      >
        <span className="relative z-10">A</span>
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
            backgroundSize: '200% 200%',
            animation: 'shimmer 3s ease-in-out infinite',
          }}
        />
      </motion.div>

      {/* Connection indicator */}
      <div className="mt-3 mb-2">
        <div className={wsStatus === 'connected' ? 'status-dot-online' : 'status-dot-offline'} />
      </div>

      {/* Nav Items */}
      <div className="flex flex-col items-center gap-2 flex-grow pt-2">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          const Icon = item.icon
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300 group"
              style={{
                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                color: isActive ? '#818cf8' : '#64648a',
                boxShadow: isActive ? '0 0 16px rgba(99, 102, 241, 0.2)' : 'none',
              }}
              title={item.label}
            >
              <Icon size={21} strokeWidth={isActive ? 2.2 : 1.8} />
              {isActive && (
                <motion.div
                  layoutId="sidebar-indicator"
                  className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                  style={{ background: 'linear-gradient(180deg, #6366f1, #8b5cf6)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {/* Tooltip */}
              <div className="absolute left-14 px-2.5 py-1 rounded-md text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap"
                style={{ background: 'rgba(13,13,20,0.95)', border: '1px solid rgba(30,30,50,0.8)', color: '#c4c4de' }}>
                {item.label}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Bottom — Settings & Database */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <motion.button
          onClick={() => setActiveView('settings')}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className="w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-300"
          style={{
            background: activeView === 'settings' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
            color: activeView === 'settings' ? '#818cf8' : '#64648a',
          }}
          title="Settings"
        >
          <Settings size={21} strokeWidth={1.8} />
        </motion.button>
      </div>
    </motion.div>
  )
}
