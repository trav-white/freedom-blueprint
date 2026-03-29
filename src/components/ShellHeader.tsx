'use client'

import Link from 'next/link'
import { ExportButton } from './export/ExportButton'
import { useSessionStore } from '@/store/sessionStore'
import { SECTION_THEMES } from '@/lib/section-themes'
import { ThemeConstellation } from './ThemeConstellation'

interface ShellHeaderProps {
  sectionName: string
}

export function ShellHeader({ sectionName }: ShellHeaderProps) {
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const hasStory = !!(completedAnswers.ws08_story ?? completedAnswers.ws08)
  const theme = SECTION_THEMES[sectionName] ?? SECTION_THEMES['The Mirror']

  return (
    <header className="mb-16">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="h-px w-6 transition-colors duration-500"
            style={{ background: `linear-gradient(90deg, ${theme.accent}, transparent)` }}
          />
          <p
            className="text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-500"
            style={{ color: theme.accent }}
          >
            {sectionName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeConstellation />
          {hasStory && (
            <Link
              href="/read"
              className="h-9 px-5 rounded-lg text-xs font-medium text-white/50 hover:text-white/80 transition-all duration-200 flex items-center focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
              }}
            >
              Morning Read
            </Link>
          )}
          <ExportButton />
        </div>
      </div>
      <h1
        className="text-gradient text-5xl font-semibold leading-[1.1]"
        style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '-0.02em' }}
      >
        Freedom Blueprint
      </h1>
      <p className="text-base text-white/50 mt-3 font-light">
        AI-coached personal transformation
      </p>
    </header>
  )
}
