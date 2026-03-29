'use client'

import { WORKSHEETS } from '@/lib/worksheets'
import { useSessionStore } from '@/store/sessionStore'

export function ProgressBar() {
  const activeIndex = useSessionStore((s) => s.activeWorksheetIndex)
  const setActive = useSessionStore((s) => s.setActiveWorksheet)

  return (
    <div className="mb-8 flex items-center gap-1.5 justify-center">
      {WORKSHEETS.map((ws, i) => (
        <button
          key={ws.id}
          type="button"
          onClick={() => setActive(i)}
          title={`${ws.id}. ${ws.title}`}
          className="relative h-6 flex items-center justify-center cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
          aria-label={`Worksheet ${ws.id}: ${ws.title}`}
        >
          <div
            className="rounded-full transition-all duration-300"
            style={{
              width: i === activeIndex ? 28 : 8,
              height: 8,
              background:
                i === activeIndex
                  ? 'linear-gradient(90deg, #635bff, #7c3aed)'
                  : i < activeIndex
                    ? '#635bff'
                    : 'rgba(255,255,255,0.1)',
              boxShadow:
                i === activeIndex
                  ? '0 0 12px rgba(99,91,255,0.5)'
                  : 'none',
            }}
          />
        </button>
      ))}
    </div>
  )
}
