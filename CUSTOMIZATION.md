# Customisation Guide

Everything in Freedom Blueprint is designed to be changed. This guide maps each customisation to the exact file and section you need to edit.

If you're using Claude Code, you can make most of these changes conversationally -- just describe what you want and Claude Code will know where to look.

---

## Coaching Personality

**File**: `src/lib/prompts/system-base.ts`

The `COACHING_SYSTEM_PROMPT` defines how the AI coach behaves across all worksheets. The default style is direct and challenging ("deep, not nice"). You can change the entire coaching philosophy here.

### What you can change

| Aspect | Current default | Example change |
|--------|----------------|----------------|
| Tone | Direct, challenging | Gentle, Socratic |
| Response length | 2-4 paragraphs | 1-2 paragraphs (shorter) |
| Probing style | Aggressive follow-ups | Open-ended questions |
| Praise | Minimal (anti-sycophancy) | Warm encouragement |
| Language | Plain, no jargon | Therapeutic vocabulary |
| Boundaries | Stay in worksheet scope | Allow tangents |

### Example: Gentler coach

Replace the "Anti-sycophancy" section with:

```
**Encouraging but honest.** Acknowledge effort and vulnerability. When someone shares something real, name it: "That took courage to say." But still guide them toward specificity -- "Can you tell me more about what that looks like day to day?"
```

---

## Worksheet-Specific Prompts

**File**: `src/lib/prompts/worksheet-prompts.ts`

Each worksheet has its own coaching instructions in `WORKSHEET_PROMPTS`. These tell the AI how to guide that specific exercise -- what questions to ask, what to push back on, and what output to produce.

### Structure

Each prompt has:
1. **Title and purpose** -- what the worksheet does
2. **How to coach** -- step-by-step instructions for the AI
3. **What to challenge** -- common surface answers to push past
4. **What to produce** -- the expected output format

### Adding a new worksheet prompt

Add a new key to the `WORKSHEET_PROMPTS` object matching your worksheet's slug:

```typescript
ws_new: `## Worksheet: Your New Worksheet

You are guiding the user through [exercise description].

### How to coach this worksheet

Start: "[opening question]"

[Step-by-step coaching instructions]`,
```

---

## Worksheets

**File**: `src/lib/worksheets.ts`

The `WORKSHEETS` array defines the order, titles, sections, and slugs for all worksheets.

### Current worksheets

```typescript
{ id: 1, title: 'The Opening Question',   section: 'The Mirror',     slug: 'ws01' }
{ id: 2, title: 'Wheel of Life',          section: 'The Mirror',     slug: 'ws02' }
{ id: 3, title: 'Define Your 10',         section: 'The Mirror',     slug: 'ws03' }
{ id: 4, title: 'BE Identity Statement',  section: 'Identity',       slug: 'ws04' }
{ id: 5, title: 'Your Perfect Life',      section: 'Identity',       slug: 'ws05' }
{ id: 6, title: 'What Keeps You Stuck',   section: 'The Release',    slug: 'ws06' }
{ id: 7, title: 'Freedom Blueprint',      section: 'The Blueprint',  slug: 'ws07' }
{ id: 8, title: 'Freedom Story',          section: 'The Blueprint',  slug: 'ws08' }
```

### To add a worksheet

1. Add an entry to `WORKSHEETS` in `worksheets.ts`
2. Add a placeholder description to `WORKSHEET_PLACEHOLDERS`
3. Add a coaching prompt to `WORKSHEET_PROMPTS` in `worksheet-prompts.ts`
4. If it needs a custom UI (not just chat), create a component in `src/components/worksheets/` and register it in `WorksheetCard.tsx`

### To remove a worksheet

1. Remove the entry from `WORKSHEETS`
2. Remove its placeholder and prompt
3. Check `WorksheetCard.tsx` for any custom component references
4. Update the `SECTION_THEMES` and `SECTION_GATEWAYS` in `section-themes.ts` if the removal changes section boundaries

### To reorder worksheets

Change the order in the `WORKSHEETS` array. The `id` values should stay sequential. The context builder automatically uses array order to determine "prior worksheets."

---

## Sections and Themes

**File**: `src/lib/section-themes.ts`

Each section has a visual theme that controls the animated background, card accents, and overall mood.

### Theme properties

```typescript
interface SectionTheme {
  primary: string       // Main gradient colour (rgba)
  secondary: string     // Secondary gradient colour
  tertiary: string      // Tertiary gradient colour
  accent: string        // Card border and highlight colour (hex)
  warmth: number        // 0 = cool/introspective, 1 = warm/open
  blobScale: number     // Background blob size (0.7 = small, 1.3 = large)
  blobBlur: number      // Blur amount in px
  blobSpeed: number     // Animation speed multiplier (1 = normal)
  bgBase: string        // Base background colour
}
```

### Current sections

| Section | Mood | Primary colour | Accent |
|---------|------|---------------|--------|
| The Mirror | Cool, introspective | Purple | `#635bff` |
| Identity | Warming | Violet | `#8b5cf6` |
| The Release | Opening | Teal | `#00d4aa` |
| The Blueprint | Warm, expansive | Amber | `#f59e0b` |

### To add a section

1. Add a new theme to `SECTION_THEMES`
2. Add gateway transitions to `SECTION_GATEWAYS` (what message shows when entering)
3. Add wisdom quotes to `WISDOM_QUOTES` (what quote shows at the transition)
4. Assign worksheets to the new section in `worksheets.ts`

### Section gateways

The `SECTION_GATEWAYS` object defines the message shown when transitioning between sections:

```typescript
'The Mirror->Identity': {
  from: 'The Mirror',
  to: 'Identity',
  message: "You've held up the mirror. Now let's talk about who you're becoming.",
}
```

### Wisdom quotes

Each transition also shows an inspirational quote:

```typescript
'The Mirror->Identity': {
  text: 'The privilege of a lifetime is to become who you truly are.',
  author: 'Carl Jung',
}
```

---

## AI Model

**File**: `src/app/api/chat/route.ts`

The default model is `claude-sonnet-4-20250514`. Change it on this line:

```typescript
model: anthropic('claude-sonnet-4-20250514'),
```

### Options

| Model | Characteristics | Best for |
|-------|----------------|----------|
| `claude-sonnet-4-20250514` | Smart, fast, cost-effective | General coaching (default) |
| `claude-opus-4-20250514` | Most capable, slower, expensive | Deep synthesis (WS07, WS08) |
| `claude-haiku-4-5-20251001` | Fastest, cheapest | Quick responses, simple worksheets |

### Using different models per worksheet

Modify the route to select the model based on `worksheetSlug`:

```typescript
const modelId = ['ws07', 'ws08'].includes(slug)
  ? 'claude-opus-4-20250514'    // Synthesis worksheets get the best model
  : 'claude-sonnet-4-20250514'  // Everything else uses Sonnet

const result = streamText({
  model: anthropic(modelId),
  // ...
})
```

---

## Fonts and Typography

**File**: `src/app/layout.tsx`

Three Google Fonts are loaded:

| Font | CSS Variable | Used for |
|------|-------------|----------|
| Inter | `--font-inter` | Body text, UI |
| Crimson Pro | `--font-crimson` | Story reading page (`/read`) |
| Cormorant Garamond | `--font-cormorant` | Headings, titles |

### To change a font

1. Import the new font from `next/font/google` in `layout.tsx`
2. Configure weights and subsets
3. Add the CSS variable to the `<html>` className
4. Update usage in components or `globals.css`

```typescript
import { YourFont } from 'next/font/google'

const yourFont = YourFont({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-your-name',
})
```

---

## Animations and Transitions

**File**: `src/app/globals.css`

All keyframe animations are defined in `globals.css`. The main ones:

| Animation | Used by | Effect |
|-----------|---------|--------|
| `blob-drift` | AmbientBackground | Slow-moving gradient blobs |
| `fade-in` | Various | Opacity 0 to 1 |
| `breathe` | GuidedBreathing | Pulsing circle |
| `reveal-line` | FreedomStory | Line-by-line text reveal |

### Respecting reduced motion

Add a `prefers-reduced-motion` media query for any animation:

```css
@media (prefers-reduced-motion: reduce) {
  .your-animated-element {
    animation: none;
  }
}
```

---

## State and Persistence

**File**: `src/store/sessionStore.ts`

The Zustand store persists to localStorage under the key `freedom-blueprint-session`.

### To add state fields

1. Add the field to the `SessionState` interface
2. Add a default value in the store creator
3. Add an action to update it
4. Update the `migrate` function to handle old state shapes that don't have the new field

### To change the storage key

Update the `name` property in the persist config:

```typescript
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'your-custom-storage-key',  // Change this
    version: 2,
    storage: createJSONStorage(() => localStorage),
  }
)
```

### To reset all session data

Clear localStorage in the browser console:

```javascript
localStorage.removeItem('freedom-blueprint-session')
```

---

## Rate Limiting

**File**: `src/app/api/chat/route.ts`

The default is 20 requests per minute per IP. Change these constants:

```typescript
const RATE_LIMIT_WINDOW_MS = 60_000  // Window in milliseconds
const RATE_LIMIT_MAX = 20             // Max requests per window
```

Note: This is an in-memory rate limiter that resets when the serverless function cold-starts. For production use with many users, consider a Redis-backed solution.

---

## The `/read` Page

**File**: `src/app/read/page.tsx`

The morning read page displays the completed Freedom Story in a premium reading layout with:
- Crimson Pro serif typography
- Line-by-line reveal animation
- Ambient background matching The Blueprint theme

### To change the reading experience

- **Font**: Change `font-family` in the component or `globals.css`
- **Reveal speed**: Adjust the interval timing in the reveal effect
- **Layout**: Modify the max-width, padding, and line-height in the component

---

## Security Headers

**File**: `next.config.ts`

The following headers are set on all routes:

```typescript
{ key: 'X-Content-Type-Options', value: 'nosniff' },
{ key: 'X-Frame-Options', value: 'DENY' },
{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
```

Add or modify headers in the `headers()` function in `next.config.ts`.
