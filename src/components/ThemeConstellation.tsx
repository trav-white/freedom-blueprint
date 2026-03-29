'use client'

import { useMemo, useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'

// Common themes to detect across worksheet answers
const THEME_PATTERNS: { theme: string; patterns: RegExp[] }[] = [
  { theme: 'Control', patterns: [/\bcontrol\b/i, /\bin charge\b/i, /\bmanage\b/i, /\blet go\b/i] },
  { theme: 'Freedom', patterns: [/\bfreedom\b/i, /\bfree\b/i, /\bindependen/i, /\bautonomy\b/i] },
  { theme: 'Family', patterns: [/\bfamily\b/i, /\bkids?\b/i, /\bchildren\b/i, /\bpartner\b/i, /\bwife\b/i, /\bhusband\b/i] },
  { theme: 'Health', patterns: [/\bhealth\b/i, /\bfit\b/i, /\bexercis/i, /\bbody\b/i, /\benergy\b/i, /\bwellbeing\b/i] },
  { theme: 'Identity', patterns: [/\bidentity\b/i, /\bwho I am\b/i, /\bbecome\b/i, /\bbelieve\b/i, /\bself\b/i] },
  { theme: 'Growth', patterns: [/\bgrowth\b/i, /\blearn/i, /\bdevelop/i, /\bimprove\b/i, /\bevolv/i] },
  { theme: 'Purpose', patterns: [/\bpurpose\b/i, /\bmeaning/i, /\bwhy\b/i, /\bmission\b/i, /\bimpact\b/i] },
  { theme: 'Fear', patterns: [/\bfear\b/i, /\bafraid\b/i, /\bscared\b/i, /\banxi/i, /\bworr/i] },
  { theme: 'Balance', patterns: [/\bbalance\b/i, /\bprioritie?s\b/i, /\btrade.?off/i, /\bboundari/i] },
  { theme: 'Success', patterns: [/\bsuccess/i, /\bachiev/i, /\bgoal/i, /\bambiti/i, /\bresult/i] },
  { theme: 'Money', patterns: [/\bmoney\b/i, /\bfinance?\b/i, /\bwealth\b/i, /\bincome\b/i, /\bsalary\b/i] },
  { theme: 'Time', patterns: [/\btime\b/i, /\bmorning\b/i, /\broutine\b/i, /\bdaily\b/i, /\bschedule\b/i] },
]

interface DetectedTheme {
  theme: string
  count: number
  worksheets: string[]
}

function detectThemes(completedAnswers: Record<string, string>): DetectedTheme[] {
  const results: Map<string, { count: number; worksheets: Set<string> }> = new Map()

  for (const [slug, text] of Object.entries(completedAnswers)) {
    if (slug.endsWith('_scores') || slug.endsWith('_responses') || slug.endsWith('_story')) continue
    for (const { theme, patterns } of THEME_PATTERNS) {
      const matches = patterns.some((p) => p.test(text))
      if (matches) {
        const existing = results.get(theme) ?? { count: 0, worksheets: new Set() }
        existing.count++
        existing.worksheets.add(slug)
        results.set(theme, existing)
      }
    }
  }

  return Array.from(results.entries())
    .map(([theme, data]) => ({ theme, count: data.count, worksheets: Array.from(data.worksheets) }))
    .filter((t) => t.worksheets.length >= 2) // Only show themes that span 2+ worksheets
    .sort((a, b) => b.count - a.count)
    .slice(0, 8) // Top 8 themes
}

export function ThemeConstellation() {
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const [expanded, setExpanded] = useState(false)
  const themes = useMemo(() => detectThemes(completedAnswers), [completedAnswers])

  if (themes.length < 2) return null

  const maxCount = Math.max(...themes.map((t) => t.count))

  // Position nodes in a constellation pattern
  const positions = [
    { x: 120, y: 40 }, { x: 200, y: 60 }, { x: 80, y: 80 },
    { x: 180, y: 100 }, { x: 50, y: 120 }, { x: 150, y: 130 },
    { x: 220, y: 140 }, { x: 100, y: 150 },
  ]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-[10px] text-white/25 hover:text-white/40 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff] rounded"
        aria-label="Toggle theme constellation"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="5" r="2" />
          <circle cx="6" cy="14" r="2" />
          <circle cx="18" cy="14" r="2" />
          <line x1="12" y1="7" x2="6" y2="12" />
          <line x1="12" y1="7" x2="18" y2="12" />
          <line x1="6" y1="14" x2="18" y2="14" strokeDasharray="2 2" />
        </svg>
        {themes.length} themes emerging
      </button>

      {expanded && (
        <div
          className="absolute top-8 left-0 z-30 rounded-xl p-4"
          style={{
            background: 'linear-gradient(180deg, rgba(8,15,26,0.95) 0%, rgba(8,15,26,0.98) 100%)',
            border: '1px solid rgba(99,91,255,0.15)',
            backdropFilter: 'blur(20px)',
            width: 280,
            animation: 'fade-in 0.3s ease-out',
          }}
        >
          <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">
            Patterns across your worksheets
          </p>
          <svg width={280} height={170} className="overflow-visible">
            {/* Connection lines between themes */}
            {themes.map((t1, i) =>
              themes.slice(i + 1).map((t2, j) => {
                const shared = t1.worksheets.filter((w) => t2.worksheets.includes(w))
                if (shared.length === 0) return null
                const p1 = positions[i]
                const p2 = positions[i + j + 1]
                if (!p1 || !p2) return null
                return (
                  <line
                    key={`${t1.theme}-${t2.theme}`}
                    x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                    stroke="rgba(99,91,255,0.15)"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                  />
                )
              })
            )}
            {/* Theme nodes */}
            {themes.map((t, i) => {
              const pos = positions[i]
              if (!pos) return null
              const size = 4 + (t.count / maxCount) * 6
              const opacity = 0.4 + (t.count / maxCount) * 0.6
              return (
                <g key={t.theme}>
                  <circle
                    cx={pos.x} cy={pos.y} r={size}
                    fill={`rgba(99,91,255,${opacity * 0.3})`}
                    stroke={`rgba(99,91,255,${opacity})`}
                    strokeWidth={1}
                    className="constellation-node"
                    style={{ animationDelay: `${i * 400}ms` }}
                  />
                  <text
                    x={pos.x} y={pos.y + size + 12}
                    fill={`rgba(255,255,255,${0.3 + opacity * 0.3})`}
                    fontSize={10}
                    textAnchor="middle"
                    fontWeight={t.count > 2 ? 500 : 300}
                  >
                    {t.theme}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>
      )}
    </div>
  )
}
