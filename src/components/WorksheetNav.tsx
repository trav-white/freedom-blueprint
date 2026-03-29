'use client'

import { WORKSHEETS } from '@/lib/worksheets'
import { useSessionStore } from '@/store/sessionStore'

export function WorksheetNav() {
  const activeIndex = useSessionStore((s) => s.activeWorksheetIndex)
  const setActive = useSessionStore((s) => s.setActiveWorksheet)
  const markComplete = useSessionStore((s) => s.markComplete)
  const saveCompletedAnswer = useSessionStore((s) => s.saveCompletedAnswer)
  const getChatMessages = useSessionStore((s) => s.getChatMessages)
  const completedAnswers = useSessionStore((s) => s.completedAnswers)

  const isFirst = activeIndex === 0
  const isLast = activeIndex === WORKSHEETS.length - 1
  const currentSlug = WORKSHEETS[activeIndex].slug

  function handleBack() {
    if (!isFirst) setActive(activeIndex - 1)
  }

  function handleNext() {
    markComplete(activeIndex)

    // Auto-save summary from chat if not already saved
    if (!completedAnswers[currentSlug]) {
      const messages = getChatMessages(currentSlug)
      if (messages.length > 0) {
        // Grab last few AI messages as summary context
        const aiMessages = messages
          .filter((m) => m.role === 'assistant')
          .slice(-2)
          .map((m) => m.text)
          .join('\n\n')

        if (aiMessages) {
          // Truncate to ~2000 chars to keep within token limits for system prompt
          const summary = aiMessages.length > 2000
            ? aiMessages.slice(0, 2000) + '...'
            : aiMessages
          saveCompletedAnswer(currentSlug, summary)
        }
      }
    }

    if (!isLast) {
      setActive(activeIndex + 1)
    }
  }

  return (
    <div className="mt-10 flex justify-between items-center">
      {!isFirst ? (
        <button
          type="button"
          onClick={handleBack}
          className="group h-10 px-5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          <span className="flex items-center gap-2">
            <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </span>
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={handleNext}
        className="group h-10 px-7 rounded-lg text-sm font-semibold text-white transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"
        style={{
          background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,91,255,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(99,91,255,0.2)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(122,115,255,0.8), inset 0 1px 0 rgba(255,255,255,0.15), 0 8px 24px rgba(99,91,255,0.35)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.3), 0 0 0 1px rgba(99,91,255,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 16px rgba(99,91,255,0.2)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <span className="flex items-center gap-2">
          {isLast ? 'Complete' : 'Continue'}
          {!isLast && (
            <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}
