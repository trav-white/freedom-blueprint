'use client'

import { WORKSHEETS } from '@/lib/worksheets'
import { useSessionStore } from '@/store/sessionStore'
import { SECTION_THEMES } from '@/lib/section-themes'

const SECTIONS = ['The Mirror', 'Identity', 'The Release', 'The Blueprint'] as const

export function JourneyMap() {
  const activeIndex = useSessionStore((s) => s.activeWorksheetIndex)
  const setActive = useSessionStore((s) => s.setActiveWorksheet)
  const worksheets = useSessionStore((s) => s.worksheets)

  const activeWs = WORKSHEETS[activeIndex]

  // Group worksheets by section
  const sectionGroups = SECTIONS.map((section) => ({
    section,
    worksheets: WORKSHEETS.map((ws, i) => ({ ...ws, index: i })).filter(
      (ws) => ws.section === section
    ),
    theme: SECTION_THEMES[section],
  }))

  return (
    <div className="mb-8">
      {/* Section labels + worksheet nodes */}
      <div className="flex items-start justify-between gap-1">
        {sectionGroups.map((group) => {
          const isActiveSection = group.worksheets.some((ws) => ws.index === activeIndex)
          const completedCount = group.worksheets.filter((ws) => worksheets[ws.index]?.isComplete).length
          const progress = group.worksheets.length > 0 ? (completedCount / group.worksheets.length) * 100 : 0

          return (
            <div key={group.section} className="flex-1 text-center">
              {/* Section label */}
              <p
                className="font-semibold uppercase tracking-[0.15em] mb-3 transition-all duration-500"
                style={{
                  fontSize: isActiveSection ? '11px' : '9px',
                  color: isActiveSection
                    ? group.theme.accent
                    : 'rgba(255,255,255,0.2)',
                }}
              >
                {group.section}
              </p>

              {/* Worksheet nodes */}
              <div className="flex items-center justify-center gap-1.5">
                {group.worksheets.map((ws) => {
                  const isActive = ws.index === activeIndex
                  const isComplete = worksheets[ws.index]?.isComplete

                  return (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => setActive(ws.index)}
                      title={`${ws.id}. ${ws.title}`}
                      className="relative flex items-center justify-center cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
                      aria-label={`Worksheet ${ws.id}: ${ws.title}`}
                    >
                      <div
                        className="rounded-full transition-all duration-300 flex items-center justify-center"
                        style={{
                          width: isActive ? 28 : 10,
                          height: 10,
                          background: isActive
                            ? `linear-gradient(90deg, ${group.theme.accent}, ${group.theme.accent}dd)`
                            : isComplete
                              ? group.theme.accent
                              : 'rgba(255,255,255,0.08)',
                          boxShadow: isActive
                            ? `0 0 14px ${group.theme.accent}66, 0 0 28px ${group.theme.accent}22`
                            : 'none',
                          animation: isActive ? 'pulse-glow 3s ease-in-out infinite' : undefined,
                        }}
                      >
                        {isComplete && !isActive && (
                          <svg className="h-2 w-2 text-white" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M10.28 2.28L4.5 8.06 1.72 5.28a.75.75 0 00-1.06 1.06l3.5 3.5a.75.75 0 001.06 0l6.5-6.5a.75.75 0 00-1.06-1.06z" />
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Section progress bar */}
              <div
                className="h-[2px] mx-auto mt-2 rounded-full overflow-hidden transition-all duration-500"
                style={{
                  width: '60%',
                  background: 'rgba(255,255,255,0.03)',
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${group.theme.accent}, ${group.theme.accent}88)`,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Active worksheet title */}
      {activeWs && (
        <p
          className="text-center text-xs text-white/30 mt-3 font-light transition-opacity duration-300"
          style={{ animation: 'fade-in 0.3s ease-out' }}
          key={activeIndex}
        >
          {activeWs.id}. {activeWs.title}
        </p>
      )}
    </div>
  )
}
