'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { useSessionStore } from '@/store/sessionStore'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

interface ChatPanelProps {
  worksheetSlug: string
  worksheetTitle: string
  autoSend?: boolean
}

function getTextFromMessage(message: UIMessage): string {
  return (
    message.parts
      ?.filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
      .map((p) => p.text)
      .join('') ?? ''
  )
}

export function ChatPanel({ worksheetSlug, worksheetTitle, autoSend }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoSentRef = useRef(false)
  const completedAnswers = useSessionStore((s) => s.completedAnswers)
  const saveChatMessages = useSessionStore((s) => s.saveChatMessages)
  const storedMessages = useSessionStore((s) => s.chatMessages[worksheetSlug])
  const storedMessagesRef = useRef(storedMessages)
  const prevSlugRef = useRef(worksheetSlug)
  // Sync ref when slug changes (not on every store update, to avoid mid-stream resets)
  if (prevSlugRef.current !== worksheetSlug) {
    prevSlugRef.current = worksheetSlug
    storedMessagesRef.current = storedMessages
  }
  const [input, setInput] = useState('')

  // Restore messages from storage or start with intro (computed once per slug)
  const initialMessages = useMemo((): UIMessage[] => {
    const stored = storedMessagesRef.current
    if (stored && stored.length > 0) {
      return stored.map((m) => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text' as const, text: m.text }],
      }))
    }
    return [
      {
        id: `system-intro-${worksheetSlug}`,
        role: 'assistant' as const,
        parts: [{ type: 'text' as const, text: getIntroMessage(worksheetSlug, worksheetTitle) }],
      },
    ]
  }, [worksheetSlug, worksheetTitle])

  const completedAnswersJson = JSON.stringify(completedAnswers)
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { worksheetSlug, completedAnswers: JSON.parse(completedAnswersJson) },
      }),
    [worksheetSlug, completedAnswersJson]
  )

  const { messages, sendMessage, status, error } = useChat({
    id: `worksheet-${worksheetSlug}`,
    transport,
    messages: initialMessages,
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Persist messages to sessionStorage whenever they change (and not loading)
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const toStore = messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        text: getTextFromMessage(m),
      }))
      saveChatMessages(worksheetSlug, toStore)
    }
  }, [messages, isLoading, worksheetSlug, saveChatMessages])

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  // Auto-send for synthesis worksheets (WS07, WS08)
  useEffect(() => {
    if (autoSend && !autoSentRef.current && messages.length === 1 && !isLoading) {
      // Don't re-send if store already has user messages from a previous session
      const stored = storedMessagesRef.current
      if (stored && stored.some((m) => m.role === 'user')) return
      autoSentRef.current = true
      // Small delay so the intro message renders first
      const timer = setTimeout(() => {
        sendMessage({
          text: 'Please begin. Synthesise everything from my prior worksheets.',
        })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [autoSend, messages.length, isLoading, sendMessage])

  async function handleSubmit() {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    await sendMessage({ text })
  }

  return (
    <div className="flex flex-col" style={{ height: '440px' }}>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-1 -mr-1 scroll-smooth chat-scroll"
        style={{ minHeight: 0 }}
      >
        <MessageList messages={messages} isLoading={isLoading} />
        {error && (
          <div className="mx-2 mt-2 rounded-lg px-4 py-3 text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            Something went wrong. Please try again.
          </div>
        )}
      </div>
      <div className="pt-3 shrink-0">
        <ChatInput
          input={input}
          setInput={setInput}
          onSubmit={handleSubmit}
          disabled={isLoading}
        />
      </div>
    </div>
  )
}

function getIntroMessage(slug: string, title: string): string {
  const intros: Record<string, string> = {
    ws01: "Let's start with something powerful. Over the last 3 years, what are you genuinely proud of? We'll work through 8 life areas, one at a time. For each one, finish this sentence: \"I am so glad I...\"\n\nLet's begin with Health & Fitness. Looking back over the past 3 years -- what's the one thing you did for your health that you're genuinely glad about?",
    ws02: "Time to get honest. The Wheel of Life is a snapshot -- rate each area from 1 to 10. A 1 means it's in crisis. A 10 means it's exactly where you want it.\n\nUse the chart to score each area, then come back and tell me -- which scores surprised you? Which one stings a little?",
    ws03: "You've seen where you are. Now let's define where you're going.\n\nFor each life area, I want you to describe what a perfect 10 looks like. Not vaguely -- specifically. What does your 10 in Health & Fitness actually look like? What time do you wake up? What can your body do? Be concrete.",
    ws04: "Most people start with what they want to HAVE. But having follows doing, and doing follows being.\n\nSo let's start with BE. Looking at your 10s from the last worksheet -- who is the version of you that lives that life? Not what they do or have. Who are they? What do they believe about themselves?",
    ws05: "Close your eyes for a second. It's 3 years from now and everything went right. You're living those 10s.\n\nHow do you know? Finish this sentence: \"I know I am successful when...\"\n\nGive me your first one. Make it specific enough that I could see it if I was watching your life.",
    ws06: "Here's the hard one. What's the belief that keeps you stuck?\n\nNot a situation. A BELIEF. Something you tell yourself about who you are or what's possible. The thought that runs in the background of every decision you make, especially the ones where you hold back.\n\nWhat is it?",
    ws07: "I've been listening to everything you've shared across all your worksheets. Now I'm going to synthesise it all into your Freedom Blueprint.\n\nI'll build your mirror, surface your patterns, name your blind spots, give you five priority moves, and leave you with one challenge.\n\nLet me begin...",
    ws08: "Everything you've done leads to this. I'm going to write your Freedom Story -- a first-person narrative of the life you're building. Written in your voice, in present tense, as if it's already true.\n\nThis is the page you'll read every morning. Let me draft it, and then we'll refine it until it feels like a punch in the chest.",
  }

  return intros[slug] ?? `Let's work through ${title}. Tell me what's on your mind.`
}
