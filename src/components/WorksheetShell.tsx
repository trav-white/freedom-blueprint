'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useHydrated } from '@/hooks/useHydrated'
import { useSessionStore } from '@/store/sessionStore'
import { WORKSHEETS } from '@/lib/worksheets'
import { SECTION_GATEWAYS, WISDOM_QUOTES, getSectionTransitionKey } from '@/lib/section-themes'
import { ShellHeader } from './ShellHeader'
import { JourneyMap } from './JourneyMap'
import { WorksheetCard } from './WorksheetCard'
import { WorksheetNav } from './WorksheetNav'
import { EmotionalCheckin } from './EmotionalCheckin'

function CeremonialGateway({ message, quote, onComplete }: {
  message: string
  quote?: { text: string; author: string }
  onComplete: () => void
}) {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setStage(4)
      return
    }
    const delays = [300, 700, 2800, 3400]
    const timers = delays.map((delay, i) =>
      setTimeout(() => setStage(i + 1), delay)
    )
    return () => timers.forEach(t => clearTimeout(t))
  }, [])

  return (
    <div className="text-center max-w-md">
      {/* Accent line */}
      <div
        className="h-[2px] w-12 rounded-full mx-auto mb-8"
        style={{
          background: 'linear-gradient(90deg, #635bff, #00d4aa)',
          opacity: stage >= 1 ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />

      {/* Quote */}
      {quote && (
        <div
          className="mb-12"
          style={{
            opacity: stage >= 2 ? 1 : 0,
            transform: stage >= 2 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.6s ease-out',
          }}
        >
          <p
            className="text-base text-white/40 font-light italic leading-relaxed"
            style={{ fontFamily: 'var(--font-cormorant), serif' }}
          >
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-xs text-white/20 mt-3">
            -- {quote.author}
          </p>
        </div>
      )}

      {/* Gateway message */}
      <p
        className="text-2xl text-white/70 font-light leading-relaxed mb-10"
        style={{
          fontFamily: 'var(--font-cormorant), serif',
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'all 0.6s ease-out',
        }}
      >
        {message}
      </p>

      {/* Continue button */}
      <div style={{ opacity: stage >= 4 ? 1 : 0, transition: 'opacity 0.4s ease-out' }}>
        <button
          type="button"
          onClick={onComplete}
          className="h-10 px-8 rounded-lg text-sm font-medium text-white/70 hover:text-white cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

type BreathPhase = 'intro' | 'inhale' | 'hold' | 'exhale'

function GuidedBreathing({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<BreathPhase>('intro')
  const [showContinue, setShowContinue] = useState(false)
  const [animating, setAnimating] = useState(false)
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const autoTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const cycleRef = useRef(0)

  useEffect(() => {
    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShowContinue(true)
      return
    }
    phaseTimerRef.current = setTimeout(() => {
      setAnimating(true)
      setPhase('inhale')
    }, 1500)
    autoTimerRef.current = setTimeout(onComplete, 20000)
  }, [onComplete])

  useEffect(() => {
    if (phase === 'intro') return
    const durations: Record<string, number> = { inhale: 4000, hold: 2000, exhale: 4000 }
    const nextMap: Record<string, BreathPhase> = { inhale: 'hold', hold: 'exhale', exhale: 'inhale' }

    phaseTimerRef.current = setTimeout(() => {
      const next = nextMap[phase]
      if (next === 'inhale') {
        cycleRef.current += 1
        if (cycleRef.current >= 1) setShowContinue(true)
      }
      setPhase(next)
    }, durations[phase])

    return () => { if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current) }
  }, [phase])

  function handleContinue() {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current)
    onComplete()
  }

  const phaseText = phase === 'intro' ? 'Take a moment' :
    phase === 'inhale' ? 'Breathe in...' :
    phase === 'hold' ? 'Hold...' :
    'Breathe out...'

  return (
    <div className="text-center" style={{ animation: 'fade-in 0.5s ease-out' }}>
      <div
        className="h-20 w-20 rounded-full mx-auto mb-8"
        style={{
          background: 'radial-gradient(circle, rgba(99,91,255,0.2) 0%, rgba(99,91,255,0.05) 70%)',
          border: '1px solid rgba(99,91,255,0.15)',
          animation: animating ? 'guided-breathe 10s ease-in-out infinite' : undefined,
        }}
      />
      <p className="text-sm text-white/40 font-light transition-opacity duration-300">
        {phaseText}
      </p>
      {showContinue && (
        <button
          type="button"
          onClick={handleContinue}
          className="mt-8 text-xs text-white/20 hover:text-white/40 cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-[#635bff] rounded"
          style={{ animation: 'fade-in 0.5s ease-out' }}
        >
          Continue
        </button>
      )}
    </div>
  )
}

type TransitionState =
  | { type: 'none' }
  | { type: 'breathing' }
  | { type: 'gateway'; message: string; quote?: { text: string; author: string } }
  | { type: 'checkin' }

export function WorksheetShell() {
  const hydrated = useHydrated()
  const activeIndex = useSessionStore((s) => s.activeWorksheetIndex)
  const emotionalCheckins = useSessionStore((s) => s.emotionalCheckins)
  const [visible, setVisible] = useState(true)
  const [displayIndex, setDisplayIndex] = useState(activeIndex)
  const [transition, setTransition] = useState<TransitionState>({ type: 'none' })
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const visibleTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current)
      if (visibleTimerRef.current) clearTimeout(visibleTimerRef.current)
    }
  }, [])

  // Handle worksheet transitions with breathing pauses and section gateways
  useEffect(() => {
    if (displayIndex !== activeIndex && transition.type === 'none') {
      const fromSection = WORKSHEETS[displayIndex]?.section
      const toSection = WORKSHEETS[activeIndex]?.section

      // Check if we're crossing a section boundary
      if (fromSection && toSection && fromSection !== toSection) {
        const key = getSectionTransitionKey(fromSection, toSection)
        if (key) {
          const gateway = SECTION_GATEWAYS[key]
          const quote = WISDOM_QUOTES[key]
          setPendingIndex(activeIndex)
          setVisible(false)
          transitionTimerRef.current = setTimeout(() => {
            setTransition({ type: 'gateway', message: gateway.message, quote })
          }, 200)
          return
        }
      }

      // Standard breathing pause between worksheets
      setPendingIndex(activeIndex)
      setVisible(false)
      transitionTimerRef.current = setTimeout(() => {
        setTransition({ type: 'breathing' })
      }, 200)
    }
  }, [activeIndex, displayIndex, transition.type])

  const completeTransition = useCallback(() => {
    const target = pendingIndex ?? activeIndex
    const targetSlug = WORKSHEETS[target]?.slug
    if (!targetSlug) return

    const hasCheckin = emotionalCheckins[targetSlug]

    if (!hasCheckin && transition.type !== 'checkin') {
      setTransition({ type: 'checkin' })
      return
    }

    setTransition({ type: 'none' })
    setDisplayIndex(target)
    setPendingIndex(null)
    visibleTimerRef.current = setTimeout(() => setVisible(true), 50)
  }, [pendingIndex, activeIndex, emotionalCheckins, transition.type])

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-3 w-24 rounded bg-white/5" />
            <div className="h-10 w-72 rounded bg-white/5" />
            <div className="h-4 w-48 rounded bg-white/[0.03]" />
          </div>
          <div className="flex justify-between px-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-8 w-8 rounded-full bg-white/[0.04]" />
            ))}
          </div>
          <div className="gradient-border">
            <div className="card-inner h-[380px]" />
          </div>
        </div>
      </main>
    )
  }

  const currentSection = WORKSHEETS[displayIndex].section

  // Ceremonial section gateway
  if (transition.type === 'gateway') {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <CeremonialGateway
          message={transition.message}
          quote={transition.quote}
          onComplete={completeTransition}
        />
      </main>
    )
  }

  // Guided breathing pause
  if (transition.type === 'breathing') {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <GuidedBreathing onComplete={completeTransition} />
      </main>
    )
  }

  // Emotional check-in
  if (transition.type === 'checkin') {
    return (
      <main className="mx-auto max-w-2xl px-6 pt-24 pb-16 flex items-center justify-center min-h-[80vh]">
        <EmotionalCheckin
          worksheetSlug={WORKSHEETS[pendingIndex ?? activeIndex]?.slug}
          onComplete={completeTransition}
        />
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl px-6 pt-28 pb-20">
      <ShellHeader sectionName={currentSection} />
      <JourneyMap />
      <div
        className="transition-all duration-300 ease-out"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.995)',
        }}
      >
        <WorksheetCard activeIndex={displayIndex} />
      </div>
      <WorksheetNav />
    </main>
  )
}
