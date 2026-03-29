export const WORKSHEETS = [
  { id: 1, title: 'The Opening Question', section: 'The Mirror', slug: 'ws01' },
  { id: 2, title: 'Wheel of Life', section: 'The Mirror', slug: 'ws02' },
  { id: 3, title: 'Define Your 10', section: 'The Mirror', slug: 'ws03' },
  { id: 4, title: 'BE Identity Statement', section: 'Identity', slug: 'ws04' },
  { id: 5, title: 'Your Perfect Life', section: 'Identity', slug: 'ws05' },
  { id: 6, title: 'What Keeps You Stuck', section: 'The Release', slug: 'ws06' },
  { id: 7, title: 'Freedom Blueprint', section: 'The Blueprint', slug: 'ws07' },
  { id: 8, title: 'Freedom Story', section: 'The Blueprint', slug: 'ws08' },
] as const

export type WorksheetId = (typeof WORKSHEETS)[number]['id']

export const WORKSHEET_PLACEHOLDERS: Record<number, string> = {
  1: 'Reflect on the last 3 years across 8 life areas. Your AI coach will guide you through \'I am so glad I...\' prompts to uncover what matters most.',
  2: 'Score each life area from 1 to 10 and see your results as a radar chart. This creates the honest snapshot your blueprint builds from.',
  3: 'Describe what a 10 out of 10 looks like in each area. Your coach will push you past vague answers into specifics you can actually act on.',
  4: 'Build your identity through the BE x DO x HAVE framework. Who do you need to become to close the gap between where you are and your 10?',
  5: 'Write \'I know I am successful when...\' statements in present tense. Your coach will challenge you to make each one concrete and measurable.',
  6: 'Use Byron Katie\'s four questions to examine the belief holding you back. Then turn it around and find evidence for the opposite.',
  7: 'Your coach synthesises everything into your mirror, patterns, blind spots, five priority moves, and the challenge that ties it all together.',
  8: 'All of your work becomes a one-page story you read every morning. Written in your voice, with your words, about the life you are building.',
}
