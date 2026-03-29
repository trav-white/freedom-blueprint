import { streamText, convertToModelMessages } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { buildSystemPrompt } from '@/lib/prompts/context-builder'
import { WORKSHEETS } from '@/lib/worksheets'

export const maxDuration = 60

const VALID_SLUGS = new Set<string>(WORKSHEETS.map((w) => w.slug))
const VALID_ANSWER_KEYS = new Set<string>([
  ...VALID_SLUGS,
  ...Array.from(VALID_SLUGS).map((s) => `${s}_scores`),
  ...Array.from(VALID_SLUGS).map((s) => `${s}_story`),
  ...Array.from(VALID_SLUGS).map((s) => `${s}_responses`),
])
const MAX_MESSAGES = 50
const MAX_ANSWER_LENGTH = 5000

// Simple in-memory rate limiter (per-deployment, resets on cold start)
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 20 // 20 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(ip) ?? []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length === 0) {
    rateLimitMap.delete(ip)
  }
  if (recent.length >= RATE_LIMIT_MAX) return true
  recent.push(now)
  rateLimitMap.set(ip, recent)
  return false
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { messages, worksheetSlug, completedAnswers } = body

  if (!Array.isArray(messages) || messages.length > MAX_MESSAGES) {
    return new Response(JSON.stringify({ error: 'Invalid messages' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const slug = typeof worksheetSlug === 'string' && VALID_SLUGS.has(worksheetSlug)
    ? worksheetSlug
    : 'ws01'

  const sanitizedAnswers: Record<string, string> = {}
  if (completedAnswers && typeof completedAnswers === 'object') {
    for (const [key, val] of Object.entries(completedAnswers as Record<string, unknown>)) {
      if (typeof val === 'string' && VALID_ANSWER_KEYS.has(key)) {
        sanitizedAnswers[key] = val.slice(0, MAX_ANSWER_LENGTH)
      }
    }
  }

  const systemPrompt = buildSystemPrompt(slug, sanitizedAnswers)

  try {
    const modelMessages = await convertToModelMessages(messages)
    const result = streamText({
      model: anthropic('claude-sonnet-4-20250514'),
      system: systemPrompt,
      messages: modelMessages,
    })
    return result.toUIMessageStreamResponse()
  } catch (err) {
    console.error('Chat API error:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to generate response' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
