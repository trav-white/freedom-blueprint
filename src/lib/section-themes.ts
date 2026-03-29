export interface SectionTheme {
  primary: string
  secondary: string
  tertiary: string
  accent: string
  warmth: number // 0 = cool/introspective, 1 = warm/open
  blobScale: number // 0.7 = smaller/tighter, 1.3 = larger/expansive
  blobBlur: number // blur amount in px
  blobSpeed: number // animation duration multiplier (1 = normal, 1.5 = slower)
  bgBase: string // base background color for the section
}

export const SECTION_THEMES: Record<string, SectionTheme> = {
  'The Mirror': {
    primary: 'rgba(99,91,255,0.4)',
    secondary: 'rgba(124,58,237,0.3)',
    tertiary: 'rgba(0,212,170,0.12)',
    accent: '#635bff',
    warmth: 0,
    blobScale: 0.85,
    blobBlur: 70,
    blobSpeed: 1,
    bgBase: '#080f1a',
  },
  'Identity': {
    primary: 'rgba(139,92,246,0.35)',
    secondary: 'rgba(217,119,6,0.12)',
    tertiary: 'rgba(251,191,36,0.08)',
    accent: '#8b5cf6',
    warmth: 0.33,
    blobScale: 1.0,
    blobBlur: 60,
    blobSpeed: 0.9,
    bgBase: '#0a0f1a',
  },
  'The Release': {
    primary: 'rgba(0,212,170,0.3)',
    secondary: 'rgba(99,91,255,0.15)',
    tertiary: 'rgba(52,211,153,0.12)',
    accent: '#00d4aa',
    warmth: 0.66,
    blobScale: 1.15,
    blobBlur: 50,
    blobSpeed: 0.8,
    bgBase: '#0a1015',
  },
  'The Blueprint': {
    primary: 'rgba(251,191,36,0.2)',
    secondary: 'rgba(217,119,6,0.15)',
    tertiary: 'rgba(99,91,255,0.12)',
    accent: '#f59e0b',
    warmth: 1,
    blobScale: 1.3,
    blobBlur: 80,
    blobSpeed: 1.2,
    bgBase: '#0f0d08',
  },
}

export const SECTION_GATEWAYS: Record<string, { message: string; from: string; to: string }> = {
  'The Mirror->Identity': {
    from: 'The Mirror',
    to: 'Identity',
    message: "You've held up the mirror. Now let's talk about who you're becoming.",
  },
  'Identity->The Release': {
    from: 'Identity',
    to: 'The Release',
    message: "You know who you want to be. Now let's release what's been holding you back.",
  },
  'The Release->The Blueprint': {
    from: 'The Release',
    to: 'The Blueprint',
    message: "You've let go of the weight. Now let's build the life you deserve.",
  },
}

export const WISDOM_QUOTES: Record<string, { text: string; author: string }> = {
  'The Mirror->Identity': {
    text: 'The privilege of a lifetime is to become who you truly are.',
    author: 'Carl Jung',
  },
  'Identity->The Release': {
    text: 'The cave you fear to enter holds the treasure you seek.',
    author: 'Joseph Campbell',
  },
  'The Release->The Blueprint': {
    text: 'What lies behind us and what lies before us are tiny matters compared to what lies within us.',
    author: 'Ralph Waldo Emerson',
  },
}

export function getSectionTransitionKey(fromSection: string, toSection: string): string | null {
  const key = `${fromSection}->${toSection}`
  return key in SECTION_GATEWAYS ? key : null
}
