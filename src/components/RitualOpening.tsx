'use client'

import { useState, useEffect, useRef } from 'react'
import { useHydrated } from '@/hooks/useHydrated'
import { useSessionStore } from '@/store/sessionStore'

interface RitualOpeningProps {
  children: React.ReactNode
}

export function RitualOpening({ children }: RitualOpeningProps) {
  const hydrated = useHydrated()
  const hasCompleted = useSessionStore((s) => s.hasCompletedRitual)
  const setComplete = useSessionStore((s) => s.setRitualComplete)
  const [phase, setPhase] = useState<'waiting' | 'visible' | 'exiting' | 'done'>('waiting')
  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (!hydrated) return
    if (hasCompleted) {
      setPhase('done')
      return
    }
    if (phase === 'waiting') {
      const timer = setTimeout(() => setPhase('visible'), 300)
      return () => clearTimeout(timer)
    }
  }, [hydrated, hasCompleted, phase])

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [])

  function handleBegin() {
    setPhase('exiting')
    exitTimerRef.current = setTimeout(() => {
      setComplete()
      setPhase('done')
    }, 800)
  }

  if (!hydrated) return null
  if (phase === 'done') return <>{children}</>

  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      style={{
        opacity: phase === 'exiting' ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
      }}
    >
      <div
        className="max-w-lg text-center"
        style={{
          opacity: phase === 'visible' ? 1 : 0,
          transform: phase === 'visible' ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Accent line */}
        <div
          className="h-[2px] w-16 rounded-full mx-auto mb-10"
          style={{ background: 'linear-gradient(90deg, #635bff, #00d4aa)' }}
        />

        {/* Date */}
        <p className="text-xs text-white/30 uppercase tracking-[0.25em] mb-8">
          {today}
        </p>

        {/* Title */}
        <h1
          className="text-5xl font-semibold text-white mb-4"
          style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '-0.02em' }}
        >
          Freedom Blueprint
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-white/40 font-light mb-4 leading-relaxed">
          AI-coached personal transformation
        </p>

        {/* The invitation */}
        <p className="text-[17px] text-white/60 font-light leading-relaxed mb-12 max-w-sm mx-auto">
          Eight worksheets. One deep conversation with yourself.
          This is your time to go deep.
        </p>

        {/* Begin button */}
        <button
          type="button"
          onClick={handleBegin}
          className="h-12 px-10 rounded-xl text-sm font-semibold text-white cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
          style={{
            background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,91,255,0.5), 0 8px 32px rgba(99,91,255,0.25)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(122,115,255,0.8), 0 12px 40px rgba(99,91,255,0.4)'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,91,255,0.5), 0 8px 32px rgba(99,91,255,0.25)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Begin
        </button>

        {/* Bottom accent */}
        <div className="mt-16">
          <div
            className="h-px w-24 mx-auto"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(99,91,255,0.2), transparent)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
