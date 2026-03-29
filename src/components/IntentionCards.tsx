'use client'

import { useMemo, useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'

function extractIntentions(completedAnswers: Record<string, string>): string[] {
  const story = completedAnswers.ws08_story ?? completedAnswers.ws08 ?? ''
  const blueprint = completedAnswers.ws07 ?? ''
  const perfectLife = completedAnswers.ws05 ?? ''

  const allText = [story, blueprint, perfectLife].join('\n')
  if (!allText.trim()) return []

  // Extract sentences that feel like commitments/intentions
  const sentences = allText
    .split(/[.!]\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && s.length < 200)
    .filter((s) => {
      const lower = s.toLowerCase()
      return (
        lower.startsWith('i ') ||
        lower.startsWith('my ') ||
        lower.startsWith('every ') ||
        lower.includes('i am ') ||
        lower.includes('i know ') ||
        lower.includes('i choose ') ||
        lower.includes('i wake ') ||
        lower.includes('i do ') ||
        lower.includes('i believe')
      )
    })

  // Deduplicate similar sentences
  const unique: string[] = []
  for (const s of sentences) {
    const isDupe = unique.some((u) => {
      const overlap = u.split(' ').filter((w) => s.includes(w)).length
      return overlap > u.split(' ').length * 0.5
    })
    if (!isDupe) unique.push(s.endsWith('.') ? s : s + '.')
  }

  return unique.slice(0, 10)
}

export function IntentionCards() {
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const intentions = useMemo(() => extractIntentions(completedAnswers), [completedAnswers])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  if (intentions.length < 3) return null

  const gradients = [
    'linear-gradient(135deg, rgba(99,91,255,0.12) 0%, rgba(124,58,237,0.08) 100%)',
    'linear-gradient(135deg, rgba(0,212,170,0.1) 0%, rgba(52,211,153,0.06) 100%)',
    'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(217,119,6,0.06) 100%)',
    'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(217,119,6,0.05) 100%)',
  ]

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] rounded"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        {intentions.length} daily intentions
      </button>

      {expanded && (
        <div className="mt-4" style={{ animation: 'fade-in-up 0.5s ease-out' }}>
          {/* Current card */}
          <div
            className="rounded-xl p-6 text-center relative card-float"
            style={{
              background: gradients[currentIndex % gradients.length],
              border: '1px solid rgba(99,91,255,0.12)',
              minHeight: 120,
              animationDelay: `${currentIndex * 200}ms`,
            }}
          >
            <p className="text-[10px] text-white/20 uppercase tracking-wider mb-4">
              Day {currentIndex + 1} of {intentions.length}
            </p>
            <p className="text-[15px] text-white/80 font-light leading-relaxed italic">
              &ldquo;{intentions[currentIndex]}&rdquo;
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
              className="text-white/30 hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#635bff] rounded"
              aria-label="Previous intention"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {intentions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentIndex(i)}
                  className="cursor-pointer focus-visible:outline-2 focus-visible:outline-[#635bff] rounded-full"
                  aria-label={`Intention ${i + 1}`}
                >
                  <div
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{
                      width: i === currentIndex ? 12 : 6,
                      background: i === currentIndex ? '#635bff' : 'rgba(255,255,255,0.1)',
                    }}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentIndex(Math.min(intentions.length - 1, currentIndex + 1))}
              disabled={currentIndex === intentions.length - 1}
              className="text-white/30 hover:text-white/60 disabled:opacity-20 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#635bff] rounded"
              aria-label="Next intention"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
