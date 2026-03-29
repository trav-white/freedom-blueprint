'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import type { UIMessage } from 'ai'

interface MessageListProps {
  messages: UIMessage[]
  isLoading: boolean
}

// Detect cross-worksheet references in AI messages
const REFERENCE_PATTERNS = [
  /(?:in |from |during |back in |earlier in )(?:worksheet |WS|ws)\s*0?[1-8]/gi,
  /(?:you (?:said|mentioned|shared|wrote|told me)|earlier you|you previously)/gi,
  /(?:looking at|referring to|connects? to) (?:your |the )(?:wheel|opening|identity|perfect life|byron|blueprint)/gi,
]

function hasConnectionReference(text: string): boolean {
  return REFERENCE_PATTERNS.some((p) => p.test(text))
}

// Split text into segments, marking referenced sections
function highlightConnections(text: string): React.ReactNode[] {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const isRef = REFERENCE_PATTERNS.some((p) => {
      p.lastIndex = 0
      return p.test(line)
    })
    // Reset lastIndex for global patterns
    REFERENCE_PATTERNS.forEach((p) => { p.lastIndex = 0 })

    if (isRef) {
      return (
        <span key={i}>
          {i > 0 && '\n'}
          <span className="connection-thread inline-block">{line}</span>
        </span>
      )
    }
    return <span key={i}>{i > 0 && '\n'}{line}</span>
  })
}

function IntroMessage({ text, isRestored }: { text: string; isRestored: boolean }) {
  const [prepared, setPrepared] = useState(isRestored)
  const [revealStep, setRevealStep] = useState(isRestored ? Infinity : 0)
  const prepareTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const revealTimerRef = useRef<ReturnType<typeof setInterval>>(null)

  // Find natural break positions (after ". " or "\n\n")
  const breakpoints = useMemo(() => {
    const points: number[] = []
    const regex = /\.\s|\n\n/g
    let match
    while ((match = regex.exec(text)) !== null) {
      points.push(match.index + match[0].length)
    }
    if (points.length === 0 || points[points.length - 1] < text.length) {
      points.push(text.length)
    }
    return points
  }, [text])

  // Respect prefers-reduced-motion
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPrepared(true)
      setRevealStep(Infinity)
    }
  }, [])

  // Prepare phase (800ms thinking dots before text starts)
  useEffect(() => {
    if (prepared || isRestored) return
    prepareTimerRef.current = setTimeout(() => {
      setPrepared(true)
      setRevealStep(1)
    }, 800)
    return () => { if (prepareTimerRef.current) clearTimeout(prepareTimerRef.current) }
  }, [prepared, isRestored])

  // Reveal phase (400ms per sentence after the first)
  useEffect(() => {
    if (!prepared || isRestored) return
    revealTimerRef.current = setInterval(() => {
      setRevealStep(prev => {
        const next = prev + 1
        if (next >= breakpoints.length && revealTimerRef.current) {
          clearInterval(revealTimerRef.current)
        }
        return next
      })
    }, 400)
    return () => { if (revealTimerRef.current) clearInterval(revealTimerRef.current) }
  }, [prepared, isRestored, breakpoints.length])

  // Not prepared -- show thinking dots
  if (!prepared) {
    return (
      <div className="flex items-center gap-1.5" role="status">
        <span className="sr-only">Coach is preparing...</span>
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse" />
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse [animation-delay:150ms]" />
        <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse [animation-delay:300ms]" />
      </div>
    )
  }

  const isRevealing = revealStep < breakpoints.length

  if (!isRevealing) {
    return <div className="whitespace-pre-wrap">{text}</div>
  }

  const visibleLength = breakpoints[revealStep - 1] ?? 0

  return (
    <div className="whitespace-pre-wrap">
      {text.slice(0, visibleLength)}
      <span className="animate-pulse text-white/40 ml-0.5">|</span>
    </div>
  )
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const initialCountRef = useRef(messages.length)
  const isRestored = initialCountRef.current > 1

  if (messages.length === 0) return null

  return (
    <div className="space-y-4 mb-4" role="log" aria-live="polite">
      {messages.map((message) => {
        const text = message.parts
          ?.filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
          .map((p) => p.text)
          .join('') ?? ''

        if (!text) return null

        const isUser = message.role === 'user'
        const isCoach = !isUser
        const isIntro = isCoach && message.id.startsWith('system-intro-')
        const hasRef = isCoach && !isIntro && hasConnectionReference(text)

        return (
          <div
            key={message.id}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            {/* Coach avatar */}
            {isCoach && (
              <div className="shrink-0 mr-2 mt-1">
                <div
                  className="h-7 w-7 rounded-full flex items-center justify-center coach-glow"
                  style={{
                    background: 'radial-gradient(circle, rgba(217,119,6,0.2) 0%, rgba(217,119,6,0.08) 70%)',
                    border: '1px solid rgba(217,119,6,0.2)',
                  }}
                >
                  <svg className="h-3 w-3 text-amber-400/60" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-[1.7] ${
                isUser ? 'text-white' : 'text-white/80'
              }`}
              style={
                isUser
                  ? {
                      background: 'linear-gradient(135deg, rgba(99,91,255,0.25) 0%, rgba(124,58,237,0.2) 100%)',
                      border: '1px solid rgba(99,91,255,0.2)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                    }
                  : {
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                      border: `1px solid ${hasRef ? 'rgba(0,212,170,0.12)' : 'rgba(255,255,255,0.06)'}`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                    }
              }
            >
              {isIntro ? (
                <IntroMessage text={text} isRestored={isRestored} />
              ) : (
                <div className="whitespace-pre-wrap">
                  {isCoach && hasRef ? highlightConnections(text) : text}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {isLoading && messages[messages.length - 1]?.role === 'user' && (
        <div className="flex justify-start">
          {/* Coach avatar for loading */}
          <div className="shrink-0 mr-2 mt-1">
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center coach-glow"
              style={{
                background: 'radial-gradient(circle, rgba(217,119,6,0.2) 0%, rgba(217,119,6,0.08) 70%)',
                border: '1px solid rgba(217,119,6,0.2)',
              }}
            >
              <svg className="h-3 w-3 text-amber-400/60" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </div>
          </div>
          <div
            className="rounded-2xl px-4 py-3"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-1.5" role="status">
              <span className="sr-only">Coach is thinking...</span>
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse" aria-hidden="true" />
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse [animation-delay:150ms]" aria-hidden="true" />
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400/40 animate-pulse [animation-delay:300ms]" aria-hidden="true" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
