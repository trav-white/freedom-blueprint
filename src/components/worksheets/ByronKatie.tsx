'use client'

import { useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { ChatPanel } from '../chat/ChatPanel'

const STEPS = [
  {
    label: 'The Belief',
    question: 'What is the belief that keeps you stuck?',
    hint: 'Not a situation -- a belief. Something you tell yourself about who you are or what\'s possible.',
  },
  {
    label: 'Question 1',
    question: 'Is it true?',
    hint: 'A simple yes or no. Don\'t overthink it -- what\'s your gut response?',
  },
  {
    label: 'Question 2',
    question: 'Can you absolutely know that it\'s true?',
    hint: 'With 100% certainty, beyond any doubt -- can you know this is true?',
  },
  {
    label: 'Question 3',
    question: 'How do you react when you believe that thought?',
    hint: 'What happens inside you? How do you treat yourself and others? What do you avoid?',
  },
  {
    label: 'Question 4',
    question: 'Who would you be without that thought?',
    hint: 'Close your eyes. Imagine you could never think this thought again. Who are you? What changes?',
  },
  {
    label: 'The Turnaround',
    question: 'Turn the belief around. Find three pieces of evidence for the opposite.',
    hint: 'Take the exact opposite of your belief. Then find three real, specific examples from your life that prove the opposite is true.',
  },
] as const

export function ByronKatie() {
  const saveCompletedAnswer = useSessionStore((s) => s.saveCompletedAnswer)
  const existingAnswers = useSessionStore((s) => s.completedAnswers)

  const savedResponses = existingAnswers.ws06_responses
  let initialResponses: string[]
  try {
    initialResponses = savedResponses
      ? JSON.parse(savedResponses)
      : Array(STEPS.length).fill('')
  } catch {
    initialResponses = Array(STEPS.length).fill('')
  }

  const [responses, setResponses] = useState<string[]>(initialResponses)
  const [currentStep, setCurrentStep] = useState(
    savedResponses ? STEPS.length : 0
  )
  const [showChat, setShowChat] = useState(!!savedResponses)

  function submitStep() {
    const text = responses[currentStep]?.trim()
    if (!text) return

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // All steps done -- save and show chat
      saveCompletedAnswer('ws06_responses', JSON.stringify(responses))
      const summary = STEPS.map(
        (s, i) => `**${s.label}**: ${responses[i]}`
      ).join('\n')
      saveCompletedAnswer('ws06', summary)
      setShowChat(true)
    }
  }

  function updateResponse(value: string) {
    const next = [...responses]
    next[currentStep] = value
    setResponses(next)
  }

  if (showChat) {
    return (
      <div className="min-h-[300px]">
        <ChatPanel worksheetSlug="ws06" worksheetTitle="What Keeps You Stuck" />
      </div>
    )
  }

  const step = STEPS[currentStep]

  return (
    <div className="space-y-6">
      {/* Progress dots */}
      <div className="flex items-center gap-2 justify-center" role="progressbar" aria-valuenow={currentStep + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label={`Step ${currentStep + 1} of ${STEPS.length}`}>
        <span className="sr-only">Step {currentStep + 1} of {STEPS.length}</span>
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className="h-2 rounded-full transition-all duration-300"
            aria-hidden="true"
            style={{
              width: i === currentStep ? 24 : 8,
              background:
                i < currentStep
                  ? '#00d4aa'
                  : i === currentStep
                    ? '#635bff'
                    : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      {/* Step label */}
      <div className="text-center">
        <span className="text-xs font-medium uppercase tracking-wider text-[#635bff]/60">
          {step.label}
        </span>
      </div>

      {/* Question */}
      <p className="text-lg font-semibold text-white text-center leading-relaxed">
        {step.question}
      </p>
      <p className="text-sm text-white/40 text-center leading-relaxed">
        {step.hint}
      </p>

      {/* Answer area */}
      <div
        className="rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(99,91,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
          padding: '1px',
        }}
      >
        <textarea
          value={responses[currentStep]}
          onChange={(e) => updateResponse(e.target.value)}
          placeholder="Take your time with this one..."
          rows={4}
          aria-label={step.question}
          className="w-full rounded-[calc(0.75rem-1px)] px-4 py-3 bg-transparent text-[15px] text-white placeholder:text-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a] resize-none leading-[1.7]"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="h-9 px-4 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={submitStep}
          disabled={!responses[currentStep]?.trim()}
          className="h-9 px-6 rounded-lg text-sm font-semibold text-white cursor-pointer transition-all duration-200 disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
          style={{
            background: 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)',
            boxShadow: '0 2px 8px rgba(99,91,255,0.3)',
          }}
        >
          {currentStep === STEPS.length - 1 ? 'Discuss with Coach' : 'Next'}
        </button>
      </div>
    </div>
  )
}
