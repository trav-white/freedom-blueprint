'use client'

import { useState, useRef, useEffect } from 'react'
import { useSessionStore } from '@/store/sessionStore'

const FEELINGS = [
  { value: 1, label: 'Heavy', color: '#94a3b8' },
  { value: 2, label: 'Uncertain', color: '#a78bfa' },
  { value: 3, label: 'Curious', color: '#635bff' },
  { value: 4, label: 'Clear', color: '#00d4aa' },
  { value: 5, label: 'Energised', color: '#fbbf24' },
] as const

interface EmotionalCheckinProps {
  worksheetSlug: string
  onComplete: () => void
}

export function EmotionalCheckin({ worksheetSlug, onComplete }: EmotionalCheckinProps) {
  const setCheckin = useSessionStore((s) => s.setEmotionalCheckin)
  const [selected, setSelected] = useState<number | null>(null)
  const [exiting, setExiting] = useState(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const completeTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
      if (completeTimerRef.current) clearTimeout(completeTimerRef.current)
    }
  }, [])

  function handleSelect(value: number) {
    setSelected(value)
    setCheckin(worksheetSlug, value)
    exitTimerRef.current = setTimeout(() => setExiting(true), 400)
    completeTimerRef.current = setTimeout(() => onComplete(), 800)
  }

  return (
    <div
      className="flex flex-col items-center justify-center py-8"
      style={{
        opacity: exiting ? 0 : 1,
        transform: exiting ? 'translateY(-10px)' : 'translateY(0)',
        transition: 'all 0.4s ease-out',
      }}
    >
      <p className="text-xs text-white/30 uppercase tracking-[0.2em] mb-6">
        Before we begin
      </p>
      <p className="text-lg text-white/70 font-light mb-8">
        How are you feeling right now?
      </p>

      <div className="flex items-center gap-3">
        {FEELINGS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => handleSelect(f.value)}
            className="flex flex-col items-center gap-2 cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] rounded-lg px-3 py-3"
            style={{
              opacity: selected === null ? 1 : selected === f.value ? 1 : 0.3,
              transform: selected === f.value ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={f.label}
          >
            <div
              className="h-10 w-10 rounded-full transition-all duration-200"
              style={{
                background: `radial-gradient(circle, ${f.color}40 0%, ${f.color}15 70%)`,
                border: `1.5px solid ${f.color}50`,
                boxShadow: selected === f.value ? `0 0 16px ${f.color}40` : 'none',
              }}
            />
            <span className="text-[10px] text-white/40">{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Small component for showing the emotional arc at the end
export function EmotionalArcDisplay() {
  const checkins = useSessionStore((s) => s.emotionalCheckins)
  const slugOrder = ['ws01', 'ws02', 'ws03', 'ws04', 'ws05', 'ws06', 'ws07', 'ws08']
  const points = slugOrder
    .map((slug, i) => ({ slug, value: checkins[slug], index: i }))
    .filter((p) => p.value !== undefined)

  if (points.length < 3) return null

  const width = 240
  const height = 60
  const padding = 12

  const pathData = points
    .map((p, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2)
      const y = height - padding - ((p.value! - 1) / 4) * (height - padding * 2)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')

  const colors = ['#94a3b8', '#a78bfa', '#635bff', '#00d4aa', '#fbbf24']

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-[10px] text-white/30 uppercase tracking-wider">Your emotional journey</p>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="arcGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="50%" stopColor="#635bff" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <path d={pathData} fill="none" stroke="url(#arcGradient)" strokeWidth={2} strokeLinecap="round" />
        {points.map((p, i) => {
          const x = padding + (i / (points.length - 1)) * (width - padding * 2)
          const y = height - padding - ((p.value! - 1) / 4) * (height - padding * 2)
          return (
            <circle
              key={p.slug}
              cx={x}
              cy={y}
              r={3}
              fill={colors[p.value! - 1]}
              opacity={0.8}
            />
          )
        })}
      </svg>
    </div>
  )
}
