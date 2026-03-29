## Project

**Freedom Blueprint** -- AI-coached personal development web app

A web app that guides users through 8 structured worksheets covering life areas, identity, and personal growth. Claude acts as a deep coach -- pushing back on surface answers, drawing connections across worksheets, and synthesising everything into a Freedom Story for daily reading.

Based on the Wisdom Consulting Group's Freedom Blueprint methodology.

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Full-stack React framework |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Vercel AI SDK (`ai`) | 6.x | Streaming chat UI via `useChat` hook |
| `@ai-sdk/anthropic` | 3.x | Claude API provider |
| Claude Sonnet 4 | API | Coaching LLM |
| Recharts | 3.x | Radar chart (Wheel of Life) |
| `@react-pdf/renderer` | 4.x | PDF generation |
| Zustand | 5.x | State management with localStorage persistence |
| Tailwind CSS | 4.x | Utility-first styling (CSS-first config, no `tailwind.config.ts`) |

## Architecture

### Pages
- `/` (page.tsx) -- Main worksheet experience. Single-page app with Zustand routing via `activeWorksheetIndex`
- `/read` (read/page.tsx) -- Morning read page for the completed Freedom Story
- `/api/chat` (route.ts) -- POST endpoint that streams Claude responses for coaching

### Data Flow
1. User interacts with worksheet (chat or custom UI)
2. Messages sent to `/api/chat` with `worksheetSlug` and `completedAnswers` from prior worksheets
3. Server builds system prompt: base coaching prompt + worksheet-specific prompt + prior context
4. Claude streams response back via Vercel AI SDK's `streamText` + `toUIMessageStreamResponse`
5. All state persisted to localStorage via Zustand persist middleware

### Key Directories
- `src/lib/prompts/` -- All AI coaching prompts (system-base, worksheet-specific, context builder)
- `src/lib/worksheets.ts` -- Worksheet definitions (titles, sections, slugs)
- `src/lib/section-themes.ts` -- Visual themes per section (colours, animations, gateways, quotes)
- `src/store/sessionStore.ts` -- Zustand store shape and persistence config
- `src/components/worksheets/` -- Custom worksheet UIs (WheelOfLife radar, ByronKatie form, FreedomStory)
- `src/components/chat/` -- Chat UI (ChatPanel, MessageList, ChatInput)

### Worksheets (8 total, 4 sections)
| # | Title | Section | Slug | UI Type |
|---|-------|---------|------|---------|
| 1 | The Opening Question | The Mirror | ws01 | Chat |
| 2 | Wheel of Life | The Mirror | ws02 | Custom (radar chart) + Chat |
| 3 | Define Your 10 | The Mirror | ws03 | Chat |
| 4 | BE Identity Statement | Identity | ws04 | Chat |
| 5 | Your Perfect Life | Identity | ws05 | Chat |
| 6 | What Keeps You Stuck | The Release | ws06 | Custom (Byron Katie form) + Chat |
| 7 | Freedom Blueprint | The Blueprint | ws07 | Chat (auto-sends synthesis prompt) |
| 8 | Freedom Story | The Blueprint | ws08 | Custom (story display + edit + PDF export) |

### Section Transitions
- **Same section**: Guided breathing pause
- **Section boundary**: Ceremonial gateway (wisdom quote + transition message)
- **Before each worksheet**: Emotional check-in (1-5 scale)

## Conventions

### Styling
- Tailwind CSS v4 with CSS-first config (design tokens in `globals.css`, no `tailwind.config.ts`)
- Dark OLED theme with animated ambient backgrounds
- Three font families: Inter (body), Cormorant Garamond (headings), Crimson Pro (reading page)
- CSS variables for fonts: `--font-inter`, `--font-cormorant`, `--font-crimson`

### State
- All client state in Zustand store (`src/store/sessionStore.ts`)
- Persisted to localStorage under key `freedom-blueprint-session`
- Store version 2 with migration logic for backward compatibility
- No server-side state or database

### API
- Single API route: `POST /api/chat`
- Rate limited: 20 req/min per IP (in-memory, resets on cold start)
- Input validation: slug allowlist, message cap (50), answer length truncation (5000 chars)
- Model: `claude-sonnet-4-20250514` (change in `route.ts`)

### Environment
- `ANTHROPIC_API_KEY` in `.env.local` (server-only, never `NEXT_PUBLIC_`)
- Template provided in `.env.example`

### Security
- Security headers in `next.config.ts` (nosniff, DENY framing, strict referrer, no camera/mic/geo)
- Prompt injection guard: `VALID_ANSWER_KEYS` allowlist on completedAnswers keys
- No cookies, no analytics, no server-side storage of user data

## Key Files for Customisation

| What to change | File |
|----------------|------|
| Coaching personality | `src/lib/prompts/system-base.ts` |
| Per-worksheet coaching | `src/lib/prompts/worksheet-prompts.ts` |
| Worksheet list/order | `src/lib/worksheets.ts` |
| Theme colours/animations | `src/lib/section-themes.ts` |
| AI model | `src/app/api/chat/route.ts` (line with `anthropic(...)`) |
| Fonts | `src/app/layout.tsx` |
| Animations/keyframes | `src/app/globals.css` |
| State shape | `src/store/sessionStore.ts` |
| Rate limits | `src/app/api/chat/route.ts` (constants at top) |

## Documentation

- `README.md` -- Project overview, quick start, tech stack
- `SETUP.md` -- Step-by-step Claude Code setup and deployment guide
- `CUSTOMIZATION.md` -- Detailed guide for all customisation points
- `.env.example` -- Environment variable template
