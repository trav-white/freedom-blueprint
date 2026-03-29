'use client'

import { useSessionStore } from '@/store/sessionStore'
import { WORKSHEETS } from '@/lib/worksheets'
import { SECTION_THEMES } from '@/lib/section-themes'

export function AmbientBackground() {
  const activeIndex = useSessionStore((s) => s.activeWorksheetIndex)

  const section = WORKSHEETS[Math.min(activeIndex, WORKSHEETS.length - 1)]?.section ?? 'The Mirror'
  const theme = SECTION_THEMES[section] ?? SECTION_THEMES['The Mirror']

  const scale = theme.blobScale
  const blur = theme.blobBlur
  const speed = theme.blobSpeed

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden transition-colors duration-[2000ms]"
      style={{ backgroundColor: theme.bgBase }}
    >
      {/* Primary blob */}
      <div
        className="gradient-blob absolute top-[-30%] left-[-20%] rounded-full transition-all duration-[2000ms]"
        style={{
          height: `${90 * scale}vh`,
          width: `${90 * scale}vh`,
          background: `radial-gradient(circle, ${theme.primary} 0%, ${theme.primary.replace(/[\d.]+\)$/, '0.1)')} 40%, transparent 70%)`,
          animation: `gradient-shift ${18 * speed}s ease-in-out infinite`,
          filter: `blur(${blur}px)`,
        }}
      />
      {/* Secondary blob */}
      <div
        className="gradient-blob absolute top-[10%] right-[-20%] rounded-full transition-all duration-[2000ms]"
        style={{
          height: `${80 * scale}vh`,
          width: `${80 * scale}vh`,
          background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.secondary.replace(/[\d.]+\)$/, '0.05)')} 40%, transparent 70%)`,
          animation: `gradient-shift-2 ${23 * speed}s ease-in-out infinite`,
          filter: `blur(${blur}px)`,
        }}
      />
      {/* Tertiary blob */}
      <div
        className="gradient-blob absolute bottom-[-20%] left-[20%] rounded-full transition-all duration-[2000ms]"
        style={{
          height: `${70 * scale}vh`,
          width: `${70 * scale}vh`,
          background: `radial-gradient(circle, ${theme.tertiary} 0%, ${theme.tertiary.replace(/[\d.]+\)$/, '0.03)')} 40%, transparent 70%)`,
          animation: `gradient-shift-3 ${20 * speed}s ease-in-out infinite`,
          filter: `blur(${blur}px)`,
        }}
      />
      {/* Warmth glow - appears as sections progress */}
      <div
        className="gradient-blob absolute top-[40%] left-[40%] rounded-full transition-all duration-[2000ms]"
        style={{
          height: `${40 * scale}vh`,
          width: `${40 * scale}vh`,
          background: `radial-gradient(circle, rgba(251,191,36,${theme.warmth * 0.08}) 0%, transparent 70%)`,
          animation: `gradient-shift ${30 * speed}s ease-in-out infinite`,
          filter: `blur(${blur + 20}px)`,
        }}
      />
    </div>
  )
}
