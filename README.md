# Freedom Blueprint

An AI-coached personal development web app that guides you through 8 structured worksheets covering life areas, identity, and personal growth. Claude acts as a deep coach -- pushing back on surface answers, drawing connections across your life areas, and synthesising everything into a Freedom Story you read every morning.

Based on the Wisdom Consulting Group's Freedom Blueprint methodology.

## What It Does

You work through 8 worksheets in 4 phases, with an AI coach that challenges vague answers and connects themes across your responses:

| Phase | Worksheets | What Happens |
|-------|-----------|--------------|
| **The Mirror** | The Opening Question, Wheel of Life, Define Your 10 | Reflect on your last 3 years, score 8 life areas, define what a 10/10 looks like |
| **Identity** | BE Identity Statement, Your Perfect Life | Build your identity through BE x DO x HAVE, write present-tense success statements |
| **The Release** | What Keeps You Stuck | Use Byron Katie's 4 questions to examine the belief holding you back |
| **The Blueprint** | Freedom Blueprint, Freedom Story | AI synthesises everything into your blueprint, then writes your daily Freedom Story |

### Key Features

- **Deep coaching, not cheerleading** -- the AI pushes back on vague answers, challenges cliches, and asks the questions you're avoiding
- **Interactive Wheel of Life** -- radar chart scoring with visual comparison between current and aspirational states
- **Byron Katie integration** -- structured 4-question belief examination with turnaround
- **AI synthesis** -- your blueprint and Freedom Story are generated from everything you shared across all worksheets
- **PDF export** -- download your complete Freedom Story as a printable PDF
- **Session persistence** -- all progress saved to localStorage, survives page refreshes and browser restarts
- **Immersive design** -- dark OLED theme with animated ambient backgrounds, section-specific colour palettes, ceremonial transitions between phases, and premium typography

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x | Full-stack React framework |
| React | 19.x | UI library |
| TypeScript | 5.x | Type safety |
| Vercel AI SDK | 6.x | Streaming chat UI (`useChat` hook) |
| @ai-sdk/anthropic | 3.x | Claude API provider |
| Claude Sonnet 4 | API | Coaching LLM |
| Recharts | 3.x | Radar chart (Wheel of Life) |
| @react-pdf/renderer | 4.x | PDF generation |
| Zustand | 5.x | State management with localStorage persistence |
| Tailwind CSS | 4.x | Utility-first styling |

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- An Anthropic API key ([get one here](https://console.anthropic.com))

### Install and Run

```bash
# Clone or unzip the project
cd freedom-blueprint

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local and add your Anthropic API key

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

```bash
# Install Vercel CLI (if you don't have it)
npm i -g vercel

# Deploy (follow the prompts)
vercel

# Or deploy straight to production
vercel --prod
```

Set `ANTHROPIC_API_KEY` in your Vercel project's environment variables (Settings > Environment Variables). Mark it as **Sensitive**.

## Project Structure

```
freedom-blueprint/
  src/
    app/
      api/chat/route.ts          # Claude streaming API endpoint
      page.tsx                    # Home -- worksheet experience
      read/page.tsx               # Morning read -- Freedom Story viewer
      layout.tsx                  # Root layout, fonts, metadata
      globals.css                 # Design tokens, animations, Tailwind
    components/
      WorksheetShell.tsx          # Main orchestrator -- transitions, gateways
      WorksheetCard.tsx           # Renders correct component per worksheet
      RitualOpening.tsx           # First-load ceremony
      AmbientBackground.tsx       # Animated gradient blobs (theme-aware)
      EmotionalCheckin.tsx        # 1-5 emotional check before each worksheet
      JourneyMap.tsx              # Progress visualisation
      ShellHeader.tsx             # Section header
      chat/
        ChatPanel.tsx             # Chat container with message state
        MessageList.tsx           # Renders messages with streaming
        ChatInput.tsx             # Text input
      worksheets/
        WheelOfLife.tsx           # Interactive radar chart (Recharts)
        ByronKatie.tsx            # 4-question belief examination form
        FreedomStory.tsx          # Story display, edit, PDF export
    lib/
      worksheets.ts              # Worksheet definitions and config
      section-themes.ts          # Theme colours, transitions, gateways
      prompts/
        system-base.ts           # Base coaching personality
        worksheet-prompts.ts     # Per-worksheet coaching instructions
        context-builder.ts       # Builds system prompt with prior context
    store/
      sessionStore.ts            # Zustand store with localStorage persist
    hooks/
      useHydrated.ts             # SSR hydration safety hook
```

## How It Works

1. **User opens the app** -- RitualOpening ceremony plays, setting the tone
2. **Worksheet loads** -- ChatPanel initialises with the worksheet's intro question
3. **User chats with coach** -- messages stream via `/api/chat` using Claude Sonnet 4
4. **Coach builds context** -- each worksheet's system prompt includes summaries from all prior worksheets, so the coach can draw connections
5. **Section transitions** -- moving between phases triggers ceremonial gateways with wisdom quotes and guided breathing
6. **Synthesis** -- WS07 auto-triggers when enough worksheets are complete, producing your blueprint
7. **Freedom Story** -- WS08 generates a first-person narrative from all your work, exportable as PDF
8. **Morning read** -- `/read` page displays your story in a premium reading layout

All data stays in your browser's localStorage. Nothing is stored on a server. The only external call is to the Claude API for coaching responses.

## Customisation

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for detailed guides on:

- Changing the coaching personality and style
- Adding, removing, or modifying worksheets
- Customising themes, colours, and animations
- Swapping the AI model
- Changing fonts and typography

## Using Claude Code

This project includes a `CLAUDE.md` file that gives Claude Code full context about the codebase. You can use Claude Code to customise worksheets and prompts conversationally, add features, debug issues, and deploy.

See [SETUP.md](SETUP.md) for a step-by-step Claude Code setup guide.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key (server-side only) |

The API key is **never** exposed to the client. It's only used in the `/api/chat` server route.

## Security

- API key is server-side only (never prefixed with `NEXT_PUBLIC_`)
- Rate limiting: 20 requests/minute per IP
- Input validation: worksheet slugs allowlisted, message count capped, answer lengths truncated
- Security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`
- All user data stays in localStorage (no server-side storage, no analytics, no cookies)

## License

MIT
