import { useState, useCallback } from 'react'
import { Terminal, Copy, Check } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MessageBubble({ message, index }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-2xl rounded-2xl px-5 py-3.5 space-y-2"
        style={isUser ? {
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #7c3aed 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)',
        } : {
          background: 'rgba(13, 13, 20, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(30, 30, 50, 0.6)',
          color: '#d4d4e8',
        }}
      >
        <MessageContent content={message.content} isUser={isUser} />
      </div>
    </motion.div>
  )
}

function MessageContent({ content, isUser }) {
  if (isUser) {
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
  }

  // Parse content for observations and code blocks
  const parts = parseContent(content)

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {parts.map((part, i) => {
        if (part.type === 'observation') {
          return <ObservationBlock key={i} content={part.content} />
        }
        if (part.type === 'code') {
          return <CodeBlock key={i} language={part.language} code={part.content} />
        }
        return part.content ? (
          <p key={i} className="whitespace-pre-wrap">{part.content}</p>
        ) : null
      })}
    </div>
  )
}

function parseContent(text) {
  const parts = []
  let remaining = text

  while (remaining.length > 0) {
    // Check for code blocks first
    const codeMatch = remaining.match(/```(\w*)\n?([\s\S]*?)```/)
    const obsMatch = remaining.match(/\[Observation:\s?([\s\S]*?)\]/)

    let firstMatch = null
    let matchType = null

    if (codeMatch && (!obsMatch || codeMatch.index < obsMatch.index)) {
      firstMatch = codeMatch
      matchType = 'code'
    } else if (obsMatch) {
      firstMatch = obsMatch
      matchType = 'observation'
    }

    if (!firstMatch) {
      if (remaining.trim()) {
        parts.push({ type: 'text', content: remaining.trim() })
      }
      break
    }

    // Text before the match
    const before = remaining.substring(0, firstMatch.index).trim()
    if (before) {
      parts.push({ type: 'text', content: before })
    }

    if (matchType === 'code') {
      parts.push({
        type: 'code',
        language: firstMatch[1] || 'plaintext',
        content: firstMatch[2].trim(),
      })
    } else {
      parts.push({
        type: 'observation',
        content: firstMatch[1].trim(),
      })
    }

    remaining = remaining.substring(firstMatch.index + firstMatch[0].length)
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

function ObservationBlock({ content }) {
  return (
    <div
      className="rounded-xl p-3.5 my-1.5"
      style={{
        background: 'rgba(6, 6, 10, 0.6)',
        border: '1px solid rgba(52, 211, 153, 0.2)',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2"
        style={{ color: 'rgba(52, 211, 153, 0.6)' }}>
        <Terminal size={12} />
        <span className="text-[10px] font-bold uppercase tracking-widest">System Observation</span>
      </div>
      <pre
        className="whitespace-pre-wrap text-xs"
        style={{
          color: '#34d399',
          fontFamily: 'var(--font-mono)',
          lineHeight: 1.6,
        }}
      >
        {content}
      </pre>
    </div>
  )
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [code])

  return (
    <div className="code-block my-2">
      <div className="code-block-header">
        <div className="flex items-center gap-1.5">
          <div className="code-dot code-dot-red" />
          <div className="code-dot code-dot-yellow" />
          <div className="code-dot code-dot-green" />
        </div>
        <span className="text-[10px] uppercase tracking-wider ml-2 flex-grow"
          style={{ color: '#4a4a6a' }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors duration-200"
          style={{
            color: copied ? '#34d399' : '#4a4a6a',
            background: copied ? 'rgba(52,211,153,0.1)' : 'rgba(30,30,50,0.5)',
            border: `1px solid ${copied ? 'rgba(52,211,153,0.3)' : 'rgba(30,30,50,0.6)'}`,
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="code-block-body">
        <code>{code}</code>
      </div>
    </div>
  )
}
