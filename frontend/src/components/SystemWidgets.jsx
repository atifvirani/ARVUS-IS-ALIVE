import { useEffect } from 'react'
import { Cpu, HardDrive, Activity, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import useArvusStore from '../stores/useArvusStore'

function ProgressRing({ value, size = 48, strokeWidth = 4, color = '#6366f1' }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="progress-ring">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(30, 30, 50, 0.5)"
        strokeWidth={strokeWidth}
      />
      <circle
        className="progress-ring-circle"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{
          filter: `drop-shadow(0 0 4px ${color}40)`,
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#e4e4ef"
        fontSize="11"
        fontWeight="600"
        fontFamily="var(--font-mono)"
      >
        {Math.round(value)}%
      </text>
    </svg>
  )
}

export default function SystemWidgets() {
  const { systemStatus, fetchSystemStatus, wsStatus } = useArvusStore()

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 5000)
    return () => clearInterval(interval)
  }, [fetchSystemStatus])

  const widgets = [
    {
      label: 'CPU',
      value: systemStatus.cpu,
      icon: Cpu,
      color: '#6366f1',
    },
    {
      label: 'RAM',
      value: systemStatus.ram,
      icon: Activity,
      color: '#8b5cf6',
    },
    {
      label: 'Disk',
      value: systemStatus.disk,
      icon: HardDrive,
      color: '#22d3ee',
    },
  ]

  const contexts = [
    { label: 'Terminal Access', status: 'on' },
    { label: 'Local DB', status: systemStatus.dbStatus === 'online' ? 'on' : 'off' },
    { label: 'Ollama LLM', status: systemStatus.ollamaStatus === 'online' ? 'on' : 'off' },
    { label: 'WebSocket', status: wsStatus === 'connected' ? 'on' : 'off' },
  ]

  return (
    <div className="h-full overflow-y-auto p-5 space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Section Title */}
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} style={{ color: '#818cf8' }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64648a' }}>
            System Vitals
          </h2>
        </div>

        {/* Progress Rings */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {widgets.map((w) => (
            <div
              key={w.label}
              className="flex flex-col items-center gap-2 p-3 rounded-xl"
              style={{
                background: 'rgba(13, 13, 20, 0.5)',
                border: '1px solid rgba(30, 30, 50, 0.5)',
              }}
            >
              <ProgressRing value={w.value} color={w.color} />
              <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#64648a' }}>
                {w.label}
              </span>
            </div>
          ))}
        </div>

        {/* Uptime */}
        <div
          className="flex items-center justify-between px-3 py-2.5 rounded-xl mb-5"
          style={{
            background: 'rgba(13, 13, 20, 0.5)',
            border: '1px solid rgba(30, 30, 50, 0.5)',
          }}
        >
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#64648a' }}>
            Uptime
          </span>
          <span className="text-xs font-mono font-medium" style={{ color: '#818cf8' }}>
            {systemStatus.uptime}
          </span>
        </div>

        {/* Active Context */}
        <div className="flex items-center gap-2 mb-3">
          <Activity size={14} style={{ color: '#818cf8' }} />
          <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#64648a' }}>
            Active Context
          </h2>
        </div>

        <div className="space-y-1.5">
          {contexts.map((ctx) => (
            <div
              key={ctx.label}
              className="flex items-center justify-between px-3 py-2 rounded-lg"
              style={{
                background: 'rgba(13, 13, 20, 0.3)',
                border: '1px solid rgba(30, 30, 50, 0.3)',
              }}
            >
              <span className="text-xs" style={{ color: '#8a8aaa' }}>{ctx.label}</span>
              <div className="flex items-center gap-1.5">
                <div className={ctx.status === 'on' ? 'status-dot-online' : 'status-dot-offline'}
                  style={{ width: 6, height: 6 }} />
                <span className="text-[10px] font-medium uppercase"
                  style={{ color: ctx.status === 'on' ? '#34d399' : '#f43f5e' }}>
                  {ctx.status === 'on' ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
