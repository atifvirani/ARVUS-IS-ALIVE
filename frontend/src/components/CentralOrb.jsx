import { motion } from 'framer-motion'
import useArvusStore from '../stores/useArvusStore'

export default function CentralOrb() {
  const { orbState, wsStatus } = useArvusStore()

  const isThinking = orbState === 'thinking'
  const isExecuting = orbState === 'executing'
  const isOnline = wsStatus === 'connected'

  // Orb config per state
  const orbConfig = {
    idle: {
      scale: [1, 1.06, 1],
      rotate: [0, 360],
      glow: 'rgba(99, 102, 241, 0.3)',
      glowSize: '60px',
      color1: '#6366f1',
      color2: '#8b5cf6',
      duration: 6,
      rotateDuration: 40,
    },
    thinking: {
      scale: [1, 1.12, 0.96, 1.08, 1],
      rotate: [0, 360],
      glow: 'rgba(99, 102, 241, 0.5)',
      glowSize: '80px',
      color1: '#818cf8',
      color2: '#a78bfa',
      duration: 1.5,
      rotateDuration: 4,
    },
    executing: {
      scale: [1, 1.15, 0.9, 1.1, 1],
      rotate: [0, 360],
      glow: 'rgba(52, 211, 153, 0.5)',
      glowSize: '100px',
      color1: '#34d399',
      color2: '#6366f1',
      duration: 0.8,
      rotateDuration: 2,
    },
  }

  const config = orbConfig[orbState] || orbConfig.idle

  return (
    <div className="flex flex-col items-center justify-center gap-6 select-none">
      {/* Outer ring container */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Expanding shockwave rings */}
        {(isThinking || isExecuting) && (
          <>
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `1px solid ${config.color1}`,
                opacity: 0.3,
                animation: 'orb-ring-expand 2s ease-out infinite',
              }}
            />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                border: `1px solid ${config.color2}`,
                opacity: 0.2,
                animation: 'orb-ring-expand 2s ease-out infinite 0.7s',
              }}
            />
          </>
        )}

        {/* Orbit ring */}
        <motion.div
          className="absolute inset-2 rounded-full"
          style={{
            border: `1px dashed rgba(99, 102, 241, ${isThinking ? 0.4 : 0.15})`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: config.rotateDuration, repeat: Infinity, ease: 'linear' }}
        >
          {/* Orbiting particle */}
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{
              background: config.color1,
              boxShadow: `0 0 8px ${config.color1}`,
            }}
          />
        </motion.div>

        {/* Second orbit */}
        <motion.div
          className="absolute inset-5 rounded-full"
          style={{
            border: `1px dashed rgba(139, 92, 246, ${isThinking ? 0.3 : 0.1})`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: config.rotateDuration * 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: config.color2,
              boxShadow: `0 0 6px ${config.color2}`,
            }}
          />
        </motion.div>

        {/* Main Orb */}
        <motion.div
          className="relative w-20 h-20 rounded-full flex items-center justify-center"
          animate={{
            scale: config.scale,
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            background: `radial-gradient(circle at 35% 35%, ${config.color1}, ${config.color2} 60%, rgba(6, 6, 10, 0.8) 100%)`,
            boxShadow: `
              0 0 ${config.glowSize} ${config.glow},
              0 0 ${parseInt(config.glowSize) * 2}px ${config.glow.replace(/[\d.]+\)$/, '0.1)')},
              inset 0 0 20px rgba(255,255,255,0.1)
            `,
          }}
        >
          {/* Inner shine */}
          <div
            className="absolute w-6 h-6 rounded-full"
            style={{
              top: '18%',
              left: '22%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)',
            }}
          />

          {/* Core dot */}
          <motion.div
            className="w-3 h-3 rounded-full"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              background: 'white',
              boxShadow: '0 0 12px rgba(255,255,255,0.5)',
            }}
          />
        </motion.div>
      </div>

      {/* Status Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center space-y-1.5"
      >
        <p className="text-sm font-medium" style={{ color: isOnline ? '#818cf8' : '#64648a' }}>
          {isExecuting
            ? 'Executing Task...'
            : isThinking
              ? 'Processing...'
              : isOnline
                ? 'ARVUS is online and ready'
                : 'Waiting for connection...'
          }
        </p>
        <p className="text-xs" style={{ color: '#4a4a6a' }}>
          {isOnline ? 'Type a command below or use Ctrl+K to focus' : 'Attempting to connect to backend...'}
        </p>
      </motion.div>
    </div>
  )
}
