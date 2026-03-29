'use client'

import { useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'

export function TransformationMirror() {
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const [visible, setVisible] = useState(false)

  const earlyText = completedAnswers.ws01 ?? ''
  const lateText = completedAnswers.ws07 ?? completedAnswers.ws08 ?? ''

  if (!earlyText || !lateText) return null

  // Truncate for display
  const early = earlyText.length > 400 ? earlyText.slice(0, 400) + '...' : earlyText
  const late = lateText.length > 400 ? lateText.slice(0, 400) + '...' : lateText

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="flex items-center gap-2 text-xs text-white/30 hover:text-white/50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] rounded"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
        {visible ? 'Hide' : 'See'} your transformation
      </button>

      {visible && (
        <div
          className="mt-4 grid grid-cols-2 gap-4"
          style={{ animation: 'fade-in-up 0.5s ease-out' }}
        >
          {/* Early language */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <p className="text-[10px] text-white/25 uppercase tracking-wider mb-3">
              Where you started
            </p>
            <p className="text-xs text-white/40 font-light leading-relaxed whitespace-pre-wrap">
              {early}
            </p>
          </div>

          {/* Evolved language */}
          <div
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(180deg, rgba(99,91,255,0.06) 0%, rgba(0,212,170,0.03) 100%)',
              border: '1px solid rgba(99,91,255,0.12)',
            }}
          >
            <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: 'rgba(0,212,170,0.5)' }}>
              Where you are now
            </p>
            <p className="text-xs text-white/60 font-light leading-relaxed whitespace-pre-wrap">
              {late}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
