'use client'

import { useState } from 'react'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { useSessionStore } from '@/store/sessionStore'
import { ChatPanel } from '../chat/ChatPanel'

const LIFE_AREAS = [
  'Health',
  'Relationships',
  'Career',
  'Finance',
  'Fun',
  'Growth',
  'Environment',
  'Family',
] as const

interface AreaScore {
  area: string
  score: number
  aspirational?: number
}

export function WheelOfLife() {
  const saveCompletedAnswer = useSessionStore((s) => s.saveCompletedAnswer)
  const existingAnswers = useSessionStore((s) => s.completedAnswers)
  const aspirationalScoresRaw = useSessionStore((s) => s.aspirationalScores)
  const saveAspirationalScores = useSessionStore((s) => s.saveAspirationalScores)

  const savedScores = existingAnswers.ws02_scores
  let initialScores: AreaScore[]
  try {
    initialScores = savedScores
      ? JSON.parse(savedScores)
      : LIFE_AREAS.map((area) => ({ area, score: 5 }))
  } catch {
    initialScores = LIFE_AREAS.map((area) => ({ area, score: 5 }))
  }

  let initialAspirational: AreaScore[] | null = null
  try {
    initialAspirational = aspirationalScoresRaw ? JSON.parse(aspirationalScoresRaw) : null
  } catch {
    initialAspirational = null
  }

  const [scores, setScores] = useState<AreaScore[]>(initialScores)
  const [locked, setLocked] = useState(!!savedScores)
  const [showAspirational, setShowAspirational] = useState(!!initialAspirational)
  const [aspirationalScores, setAspirationalScores] = useState<AreaScore[]>(
    initialAspirational ?? LIFE_AREAS.map((area) => ({ area, score: 8 }))
  )
  const [aspirationalLocked, setAspirationalLocked] = useState(!!initialAspirational)

  // Check if story is complete (triggers before/after option)
  const hasStory = !!(existingAnswers.ws08_story ?? existingAnswers.ws08)

  function updateScore(index: number, score: number) {
    if (locked) return
    const next = [...scores]
    next[index] = { ...next[index], score }
    setScores(next)
  }

  function lockScores() {
    setLocked(true)
    saveCompletedAnswer('ws02_scores', JSON.stringify(scores))
    const summary = scores.map((s) => `${s.area}: ${s.score}/10`).join(', ')
    saveCompletedAnswer('ws02', `Wheel of Life scores: ${summary}`)
  }

  function updateAspirational(index: number, score: number) {
    if (aspirationalLocked) return
    const next = [...aspirationalScores]
    next[index] = { ...next[index], score }
    setAspirationalScores(next)
  }

  function lockAspirational() {
    setAspirationalLocked(true)
    saveAspirationalScores(JSON.stringify(aspirationalScores))
  }

  // Merge data for overlay chart
  const overlayData = scores.map((s, i) => ({
    area: s.area,
    current: s.score,
    aspirational: aspirationalScores[i]?.score ?? 8,
  }))

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          {showAspirational ? (
            <RadarChart data={overlayData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(99,91,255,0.15)" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="area" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={6} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} />
              <Radar dataKey="current" stroke="#635bff" fill="url(#radarGradient)" fillOpacity={0.3} strokeWidth={2} />
              <Radar dataKey="aspirational" stroke="#00d4aa" fill="url(#aspirationalGradient)" fillOpacity={0.15} strokeWidth={2} strokeDasharray="4 4" />
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#635bff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00d4aa" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="aspirationalGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.1} />
                </linearGradient>
              </defs>
            </RadarChart>
          ) : (
            <RadarChart data={scores} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(99,91,255,0.15)" strokeDasharray="3 3" />
              <PolarAngleAxis dataKey="area" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tickCount={6} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} />
              <Radar dataKey="score" stroke="#635bff" fill="url(#radarGradientSingle)" fillOpacity={0.3} strokeWidth={2} />
              <defs>
                <linearGradient id="radarGradientSingle" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#635bff" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#00d4aa" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </RadarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend for overlay mode */}
      {showAspirational && (
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-[#635bff]" />
            <span className="text-white/40">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-0.5 w-4 bg-[#00d4aa]" style={{ borderTop: '1px dashed #00d4aa' }} />
            <span className="text-white/40">Aspirational</span>
          </div>
        </div>
      )}

      {/* Score Sliders */}
      {!locked && (
        <div className="space-y-3">
          {scores.map((item, i) => (
            <div key={item.area} className="flex items-center gap-3">
              <span className="w-24 text-xs text-white/50 text-right shrink-0">
                {item.area}
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={item.score}
                onChange={(e) => updateScore(i, Number(e.target.value))}
                aria-label={`${item.area} score`}
                className="flex-1 h-1 appearance-none rounded-full cursor-pointer accent-[#635bff]"
                style={{
                  background: `linear-gradient(90deg, #635bff ${(item.score - 1) * 11.1}%, rgba(255,255,255,0.08) ${(item.score - 1) * 11.1}%)`,
                }}
              />
              <span
                className="w-7 text-center text-sm font-semibold"
                style={{
                  color: item.score <= 3 ? '#ff6b6b' : item.score <= 6 ? '#ffd93d' : '#00d4aa',
                }}
              >
                {item.score}
              </span>
            </div>
          ))}

          <button
            type="button"
            onClick={lockScores}
            className="w-full mt-4 h-10 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080f1a]"
            style={{
              background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
              boxShadow: '0 2px 8px rgba(99,91,255,0.3)',
            }}
          >
            Lock Scores & Discuss
          </button>
        </div>
      )}

      {/* Before/After: aspirational scoring (after story is complete) */}
      {locked && hasStory && !showAspirational && (
        <button
          type="button"
          onClick={() => setShowAspirational(true)}
          className="w-full h-9 rounded-lg text-xs font-medium text-white/40 hover:text-white/60 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
          style={{
            background: 'rgba(0,212,170,0.05)',
            border: '1px solid rgba(0,212,170,0.1)',
          }}
        >
          Score your aspirational wheel -- where do you want to be?
        </button>
      )}

      {/* Aspirational sliders */}
      {showAspirational && !aspirationalLocked && (
        <div className="space-y-3">
          <p className="text-xs text-white/30 text-center">
            Now that you&apos;ve done this work, where do you want each area to be?
          </p>
          {aspirationalScores.map((item, i) => (
            <div key={item.area} className="flex items-center gap-3">
              <span className="w-24 text-xs text-white/50 text-right shrink-0">
                {item.area}
              </span>
              <input
                type="range"
                min={1}
                max={10}
                value={item.score}
                onChange={(e) => updateAspirational(i, Number(e.target.value))}
                aria-label={`${item.area} aspirational score`}
                className="flex-1 h-1 appearance-none rounded-full cursor-pointer accent-[#00d4aa]"
                style={{
                  background: `linear-gradient(90deg, #00d4aa ${(item.score - 1) * 11.1}%, rgba(255,255,255,0.08) ${(item.score - 1) * 11.1}%)`,
                }}
              />
              <span className="w-7 text-center text-sm font-semibold text-[#00d4aa]">
                {item.score}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={lockAspirational}
            className="w-full mt-4 h-10 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#00d4aa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080f1a]"
            style={{
              background: 'linear-gradient(135deg, #00d4aa 0%, #059669 100%)',
              boxShadow: '0 2px 8px rgba(0,212,170,0.3)',
            }}
          >
            Lock Aspirational Scores
          </button>
        </div>
      )}

      {/* Chat after scores locked */}
      {locked && !showAspirational && (
        <div className="min-h-[200px]">
          <ChatPanel worksheetSlug="ws02" worksheetTitle="Wheel of Life" />
        </div>
      )}
      {locked && showAspirational && aspirationalLocked && (
        <div className="min-h-[200px]">
          <ChatPanel worksheetSlug="ws02" worksheetTitle="Wheel of Life" />
        </div>
      )}
    </div>
  )
}
