import { WORKSHEETS } from '@/lib/worksheets'
import { COACHING_SYSTEM_PROMPT } from './system-base'
import { WORKSHEET_PROMPTS } from './worksheet-prompts'

export function buildSystemPrompt(
  worksheetSlug: string,
  completedAnswers: Record<string, string>
): string {
  const worksheetPrompt = WORKSHEET_PROMPTS[worksheetSlug]
  if (!worksheetPrompt) {
    return COACHING_SYSTEM_PROMPT
  }

  const priorContext = buildPriorContext(worksheetSlug, completedAnswers)

  return [
    COACHING_SYSTEM_PROMPT,
    worksheetPrompt,
    priorContext,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function buildPriorContext(
  currentSlug: string,
  completedAnswers: Record<string, string>
): string {
  const currentIndex = WORKSHEETS.findIndex((w) => w.slug === currentSlug)
  if (currentIndex <= 0) return ''

  const priorWorksheets = WORKSHEETS.slice(0, currentIndex)
  const entries: string[] = []

  for (const ws of priorWorksheets) {
    const summary = completedAnswers[ws.slug]
    if (summary) {
      entries.push(`### ${ws.title} (${ws.slug})\n${summary}`)
    }
  }

  if (entries.length === 0) return ''

  return `## Context from prior worksheets

The user has already completed these worksheets. Use this context to draw connections, spot patterns, and challenge inconsistencies. Reference their earlier answers when relevant.

${entries.join('\n\n')}`
}
