'use client'

import { useState, useEffect } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { ChatPanel } from '../chat/ChatPanel'
import { IntentionCards } from '../IntentionCards'
import { TransformationMirror } from '../TransformationMirror'
import { EmotionalArcDisplay } from '../EmotionalCheckin'

export function FreedomStory() {
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const saveCompletedAnswer = useSessionStore((s) => s.saveCompletedAnswer)
  const getChatMessages = useSessionStore((s) => s.getChatMessages)

  const [storyText, setStoryText] = useState(completedAnswers.ws08_story ?? '')
  const [viewMode, setViewMode] = useState<'chat' | 'story'>(
    completedAnswers.ws08_story ? 'story' : 'chat'
  )
  const [revealing, setRevealing] = useState(false)
  const [revealedLines, setRevealedLines] = useState<string[]>([])

  // Count how many worksheets have been completed for readiness indicator
  const completedCount = ['ws01', 'ws02', 'ws03', 'ws04', 'ws05', 'ws06', 'ws07'].filter(
    (slug) => completedAnswers[slug]
  ).length

  const hasEnoughContext = completedCount >= 3

  // When switching to story mode, try to extract story from latest AI messages
  // and trigger cinematic reveal if it's the first time
  useEffect(() => {
    if (viewMode === 'story' && !storyText) {
      const messages = getChatMessages('ws08')
      const lastAI = messages
        .filter((m) => m.role === 'assistant')
        .pop()
      if (lastAI?.text) {
        // Trigger cinematic reveal for first-time story view
        setRevealing(true)
        const lines = lastAI.text.split('\n').filter((l) => l.trim())
        let current = 0
        let doneTimer: ReturnType<typeof setTimeout>
        const interval = setInterval(() => {
          if (current < lines.length) {
            setRevealedLines((prev) => [...prev, lines[current]])
            current++
          } else {
            clearInterval(interval)
            setStoryText(lastAI.text)
            doneTimer = setTimeout(() => setRevealing(false), 500)
          }
        }, 150)
        return () => {
          clearInterval(interval)
          clearTimeout(doneTimer)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  function saveStory() {
    if (storyText.trim()) {
      saveCompletedAnswer('ws08_story', storyText)
      saveCompletedAnswer('ws08', storyText)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2" role="tablist">
        <button
          type="button"
          onClick={() => setViewMode('chat')}
          role="tab"
          aria-selected={viewMode === 'chat'}
          className="h-8 px-4 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
          style={{
            background: viewMode === 'chat' ? 'rgba(99,91,255,0.2)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${viewMode === 'chat' ? 'rgba(99,91,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: viewMode === 'chat' ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
          }}
        >
          Coaching
        </button>
        <button
          type="button"
          onClick={() => setViewMode('story')}
          role="tab"
          aria-selected={viewMode === 'story'}
          className="h-8 px-4 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
          style={{
            background: viewMode === 'story' ? 'rgba(99,91,255,0.2)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${viewMode === 'story' ? 'rgba(99,91,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
            color: viewMode === 'story' ? '#a5b4fc' : 'rgba(255,255,255,0.4)',
          }}
        >
          My Story
        </button>
      </div>

      {/* Readiness indicator */}
      {!hasEnoughContext && viewMode === 'chat' && (
        <div
          className="rounded-lg px-4 py-3 text-xs text-white/40"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {completedCount}/7 worksheets completed. Complete more worksheets for a richer Freedom Story.
        </div>
      )}

      {viewMode === 'chat' ? (
        <ChatPanel
          worksheetSlug="ws08"
          worksheetTitle="Freedom Story"
          autoSend={hasEnoughContext}
        />
      ) : (
        <div className="space-y-4">
          {/* Cinematic reveal mode */}
          {revealing ? (
            <div className="min-h-[300px] flex flex-col justify-center px-2">
              <div
                className="h-[2px] w-12 rounded-full mx-auto mb-8"
                style={{ background: 'linear-gradient(90deg, #635bff, #00d4aa)' }}
              />
              <div className="space-y-4">
                {revealedLines.map((line, i) => (
                  <p
                    key={i}
                    className="text-[15px] text-white/80 font-light leading-relaxed text-center story-reveal-line"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Editable story area */}
              <div
                className="rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,91,255,0.08) 0%, rgba(0,212,170,0.05) 100%)',
                  padding: '1px',
                }}
              >
                <textarea
                  value={storyText}
                  onChange={(e) => setStoryText(e.target.value)}
                  placeholder="Your Freedom Story will appear here after your coaching session. You can also write or edit it directly."
                  aria-label="Your Freedom Story"
                  rows={12}
                  className="w-full rounded-[calc(0.75rem-1px)] px-5 py-4 bg-transparent text-[15px] text-white/90 placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a] resize-none leading-[1.8] font-light"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
                  }}
                />
              </div>

              {storyText.trim() && (
                <button
                  type="button"
                  onClick={saveStory}
                  className="h-10 px-6 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080f1a]"
                  style={{
                    background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
                    boxShadow: '0 2px 8px rgba(99,91,255,0.3)',
                  }}
                >
                  Save Story
                </button>
              )}

              {/* Emotional arc */}
              <EmotionalArcDisplay />

              {/* Intention cards */}
              <IntentionCards />

              {/* Transformation mirror */}
              <TransformationMirror />
            </>
          )}
        </div>
      )}
    </div>
  )
}
