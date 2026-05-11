import { Wifi, WifiOff, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import useArvusStore from '../stores/useArvusStore'

export default function Header() {
  const { wsStatus, systemStatus } = useArvusStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (d) => d.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
  })

  return (
    <header
      className="h-14 flex items-center justify-between px-6 glass-strong z-20 relative"
      style={{ borderBottom: '1px solid rgba(30, 30, 50, 0.5)' }}
    >
      {/* Left — Title */}
      <div className="flex items-center gap-3">
        <h1
          className="text-base font-semibold tracking-wide"
          style={{
            background: 'linear-gradient(135deg, #e4e4ef 0%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          ARVUS
        </h1>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
          v0.1
        </span>
      </div>

      {/* Center — Context Breadcrumb */}
      <div className="hidden md:flex items-center gap-4 text-xs" style={{ color: '#64648a' }}>
        <div className="flex items-center gap-1.5">
          <div className={systemStatus.ollamaStatus === 'online' ? 'status-dot-online' : 'status-dot-offline'}
            style={{ width: 6, height: 6 }} />
          <span>Ollama{systemStatus.ollamaModel ? `: ${systemStatus.ollamaModel}` : ''}</span>
        </div>
        <div style={{ width: 1, height: 12, background: 'rgba(30,30,50,0.8)' }} />
        <div className="flex items-center gap-1.5">
          <div className={systemStatus.dbStatus === 'online' ? 'status-dot-online' : 'status-dot-offline'}
            style={{ width: 6, height: 6 }} />
          <span>Local DB</span>
        </div>
        <div style={{ width: 1, height: 12, background: 'rgba(30,30,50,0.8)' }} />
        <div className="flex items-center gap-1.5">
          <div className="status-dot-online" style={{ width: 6, height: 6 }} />
          <span>Terminal</span>
        </div>
      </div>

      {/* Right — Connection & Time */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64648a' }}>
          <Clock size={13} />
          <span className="font-mono">{formatTime(time)}</span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            background: wsStatus === 'connected'
              ? 'rgba(52, 211, 153, 0.1)'
              : wsStatus === 'reconnecting'
                ? 'rgba(251, 191, 36, 0.1)'
                : 'rgba(244, 63, 94, 0.1)',
            color: wsStatus === 'connected' ? '#34d399' : wsStatus === 'reconnecting' ? '#fbbf24' : '#f43f5e',
            border: `1px solid ${wsStatus === 'connected' ? 'rgba(52,211,153,0.2)' : wsStatus === 'reconnecting' ? 'rgba(251,191,36,0.2)' : 'rgba(244,63,94,0.2)'}`,
          }}
        >
          {wsStatus === 'connected' ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span>{wsStatus === 'connected' ? 'Online' : wsStatus === 'reconnecting' ? 'Reconnecting' : 'Offline'}</span>
        </div>
      </div>
    </header>
  )
}
