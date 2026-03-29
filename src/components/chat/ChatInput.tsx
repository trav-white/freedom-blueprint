'use client'

import { useRef, useEffect } from 'react'

interface ChatInputProps {
  input: string
  setInput: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function ChatInput({ input, setInput, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [input])

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="relative">
      <div
        className="rounded-xl transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(99,91,255,0.15) 0%, rgba(255,255,255,0.04) 40%, rgba(0,212,170,0.1) 100%)',
          padding: '1px',
        }}
      >
        <div
          className="flex items-end gap-2 rounded-[calc(0.75rem-1px)] px-4 py-3"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Share what's on your mind..."
            aria-label="Type your response to the coach"
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent text-[15px] text-white placeholder:text-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a] rounded disabled:opacity-50 leading-[1.6]"
          />
          <button
            type="button"
            onClick={onSubmit}
            disabled={!input.trim() || disabled}
            aria-label="Send message"
            className="shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#635bff] focus-visible:ring-offset-1 focus-visible:ring-offset-[#080f1a]"
            style={{
              background: input.trim() && !disabled
                ? 'linear-gradient(135deg, #635bff 0%, #7c3aed 100%)'
                : 'rgba(255,255,255,0.05)',
              boxShadow: input.trim() && !disabled
                ? '0 2px 8px rgba(99,91,255,0.3)'
                : 'none',
            }}
          >
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
