'use client'

import dynamic from 'next/dynamic'
import { WORKSHEETS } from '@/lib/worksheets'
import { SECTION_THEMES } from '@/lib/section-themes'
import { ChatPanel } from './chat/ChatPanel'
import { useSessionStore } from '@/store/sessionStore'

const WheelOfLife = dynamic(() => import('./worksheets/WheelOfLife').then(m => ({ default: m.WheelOfLife })), { ssr: false })
const ByronKatie = dynamic(() => import('./worksheets/ByronKatie').then(m => ({ default: m.ByronKatie })), { ssr: false })
const FreedomStory = dynamic(() => import('./worksheets/FreedomStory').then(m => ({ default: m.FreedomStory })), { ssr: false })

interface WorksheetCardProps {
  activeIndex: number
}

const CUSTOM_WORKSHEETS: Record<string, React.ComponentType> = {
  ws02: WheelOfLife,
  ws06: ByronKatie,
  ws08: FreedomStory,
}

// WS07 uses standard ChatPanel but auto-sends when enough context exists
const AUTO_SEND_SLUGS = ['ws07']

export function WorksheetCard({ activeIndex }: WorksheetCardProps) {
  const clampedIndex = Math.min(Math.max(0, activeIndex), WORKSHEETS.length - 1)
  const ws = WORKSHEETS[clampedIndex]
  const CustomComponent = CUSTOM_WORKSHEETS[ws.slug]
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const shouldAutoSend = AUTO_SEND_SLUGS.includes(ws.slug) &&
    ['ws01', 'ws02', 'ws03', 'ws04', 'ws05', 'ws06'].filter((s) => completedAnswers[s]).length >= 3

  const theme = SECTION_THEMES[ws.section] ?? SECTION_THEMES['The Mirror']

  return (
    <div
      className="gradient-border"
      style={{
        background: `linear-gradient(135deg, ${theme.accent}4d 0%, rgba(255,255,255,0.08) 40%, ${theme.accent}26 100%)`,
        transition: 'background 1s ease',
      }}
    >
      <div className="card-inner p-10 min-h-[540px] flex flex-col">
        {/* Top highlight line - matches section theme */}
        <div
          className="h-[2px] w-16 rounded-full mb-8 transition-colors duration-500"
          style={{ background: `linear-gradient(90deg, ${theme.accent}, #00d4aa)` }}
        />

        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${theme.accent}33 0%, ${theme.accent}26 100%)`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.1)`,
              border: `1px solid ${theme.accent}33`,
            }}
          >
            {ws.id}
          </div>
          <div>
            <h2
              className="text-2xl font-semibold leading-tight text-white"
              style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '-0.01em' }}
            >
              {ws.title}
            </h2>
            <p
              className="text-xs font-medium mt-1 uppercase tracking-wider transition-colors duration-500"
              style={{ color: `${theme.accent}99` }}
            >
              {ws.section}
            </p>
          </div>
        </div>

        <div
          className="h-px mb-6"
          style={{
            background: `linear-gradient(90deg, ${theme.accent}26 0%, rgba(255,255,255,0.05) 50%, transparent 100%)`,
          }}
        />

        <div className="flex-1 min-h-0">
          {CustomComponent ? (
            <CustomComponent />
          ) : (
            <ChatPanel worksheetSlug={ws.slug} worksheetTitle={ws.title} autoSend={shouldAutoSend} />
          )}
        </div>
      </div>
    </div>
  )
}
