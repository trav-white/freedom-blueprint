'use client'

import { useEffect, useState, useMemo } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { useHydrated } from '@/hooks/useHydrated'
import { AmbientBackground } from '@/components/AmbientBackground'
import Link from 'next/link'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function MorningReadPage() {
  const hydrated = useHydrated()
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [revealedParagraphs, setRevealedParagraphs] = useState<number>(0)
  const [allRevealed, setAllRevealed] = useState(false)

  const story = completedAnswers.ws08_story ?? completedAnswers.ws08 ?? ''
  const paragraphs = useMemo(
    () => story.split('\n').filter((l) => l.trim()),
    [story]
  )

  // Progressive paragraph reveal
  useEffect(() => {
    if (!story || allRevealed) return
    const timer = setInterval(() => {
      setRevealedParagraphs((prev) => {
        if (prev >= paragraphs.length) {
          clearInterval(timer)
          setAllRevealed(true)
          return prev
        }
        return prev + 1
      })
    }, 900)
    return () => clearInterval(timer)
  }, [story, paragraphs.length, allRevealed])

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen()
    }
  }

  function revealAll() {
    setRevealedParagraphs(paragraphs.length)
    setAllRevealed(true)
  }

  if (!hydrated) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse h-6 w-48 rounded bg-white/5" />
      </main>
    )
  }

  if (!story) {
    return (
      <>
        <AmbientBackground />
        <main className="flex flex-col items-center justify-center min-h-screen px-6 gap-6">
          <p className="text-white/40 text-lg">No Freedom Story yet.</p>
          <p className="text-white/25 text-sm max-w-md text-center">
            Complete the worksheets and have your AI coach write your Freedom Story first.
          </p>
          <Link
            href="/"
            className="h-10 px-6 rounded-lg text-sm font-semibold text-white flex items-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080f1a]"
            style={{
              background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
              boxShadow: '0 2px 8px rgba(99,91,255,0.3)',
            }}
          >
            Go to Worksheets
          </Link>
        </main>
      </>
    )
  }

  return (
    <>
      {/* Warm ambient background for morning read */}
      <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#0f0d08' }}>
        <div
          className="gradient-blob absolute top-[-20%] left-[10%] h-[80vh] w-[80vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(217,119,6,0.08) 0%, transparent 70%)',
            animation: 'gradient-shift 25s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="gradient-blob absolute bottom-[-10%] right-[10%] h-[60vh] w-[60vh] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)',
            animation: 'gradient-shift-2 30s ease-in-out infinite',
            filter: 'blur(80px)',
          }}
        />
      </div>

      <main className="flex flex-col items-center justify-center min-h-screen px-6 py-16">
        {/* Top bar */}
        <div className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-white/30 hover:text-white/50 transition-colors text-sm focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f0d08] rounded"
          >
            Back
          </Link>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="text-white/30 hover:text-white/50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0f0d08] rounded"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {isFullscreen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
              )}
            </svg>
          </button>
        </div>

        {/* Story content */}
        {/* Warm glow behind text area */}
        <div
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-[5] pointer-events-none"
          style={{
            width: '600px',
            height: '800px',
            background: 'radial-gradient(ellipse, rgba(217,119,6,0.04) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <article className="max-w-lg w-full">
          {/* Greeting */}
          <div className="mb-16 text-center" style={{ animation: 'fade-in 1s ease-out' }}>
            <p className="text-sm font-light mb-6" style={{ color: 'rgba(217,119,6,0.4)' }}>
              {getGreeting()}, Trav
            </p>
            <div
              className="h-[2px] w-12 rounded-full mx-auto mb-6"
              style={{ background: 'linear-gradient(90deg, rgba(217,119,6,0.3), rgba(251,191,36,0.2))' }}
            />
            <h1
              className="text-3xl font-semibold text-white mb-2"
              style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '-0.02em' }}
            >
              My Freedom Story
            </h1>
            <p className="text-xs uppercase tracking-widest" style={{ color: 'rgba(217,119,6,0.3)' }}>
              Read every morning
            </p>
          </div>

          {/* Story text with paragraph-by-paragraph reveal */}
          <div className="space-y-6 morning-read-text" style={{ fontFamily: 'var(--font-crimson), serif' }}>
            {paragraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-[22px] leading-[2.2] font-light transition-all duration-700"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  opacity: i < revealedParagraphs ? 1 : 0,
                  transform: i < revealedParagraphs ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Tap to reveal all */}
          {!allRevealed && (
            <button
              type="button"
              onClick={revealAll}
              className="mt-8 text-xs text-white/15 hover:text-white/30 transition-colors cursor-pointer mx-auto block focus-visible:outline-2 focus-visible:outline-[#635bff] rounded"
            >
              Show all
            </button>
          )}

          {/* Bottom accent + date */}
          <div className="mt-20 text-center" style={{ opacity: allRevealed ? 1 : 0, transition: 'opacity 1s ease' }}>
            <div
              className="h-[1px] w-16 mx-auto mb-6"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(217,119,6,0.2), transparent)',
              }}
            />
            <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'rgba(217,119,6,0.2)' }}>
              {new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </article>
      </main>
    </>
  )
}
