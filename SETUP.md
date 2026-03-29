# Setup Guide -- Using Claude Code

This guide walks you through setting up Freedom Blueprint using [Claude Code](https://claude.ai/claude-code) as your AI development assistant. Claude Code can install dependencies, configure the app, customise it to your needs, and deploy it -- all conversationally.

## Prerequisites

1. **Claude Code** installed ([installation guide](https://docs.anthropic.com/en/docs/claude-code/getting-started))
2. **Node.js 18+** and npm
3. **An Anthropic API key** -- get one at [console.anthropic.com](https://console.anthropic.com)
4. **A Vercel account** (free) for deployment -- [vercel.com](https://vercel.com)

## Step 1: Unzip and Open

```bash
# Unzip the project
unzip freedom-blueprint.zip
cd freedom-blueprint

# Open Claude Code in the project directory
claude
```

Claude Code will automatically read the `CLAUDE.md` file and understand the entire project.

## Step 2: Install and Configure

Tell Claude Code:

> Install the dependencies and set up my environment. My Anthropic API key is sk-ant-api03-...

Claude Code will:
- Run `npm install`
- Create `.env.local` with your API key
- Verify the build works

**Important**: Never share your API key in a public repo or chat. The `.env.local` file is gitignored.

## Step 3: Run Locally

Tell Claude Code:

> Start the dev server

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Step 4: Customise

This is where Claude Code shines. You can make changes conversationally:

### Change the coaching style
> Make the coach more Socratic -- ask more questions, give fewer direct observations. Tone down the confrontational style.

### Change the worksheets
> Replace worksheet 6 (Byron Katie) with a gratitude journaling exercise. Keep the same section and transition flow.

### Change the theme
> Change the colour palette to warm earth tones -- terracotta, sage green, cream. Keep the dark background but make it warmer.

### Change the AI model
> Switch from Claude Sonnet to Claude Haiku for faster responses. Keep Sonnet for the synthesis worksheets (7 and 8).

### Add features
> Add a progress dashboard that shows completion percentage and time spent on each worksheet.

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for a complete reference of what you can change and where each piece lives in the codebase.

## Step 5: Deploy to Vercel

Tell Claude Code:

> Deploy this to Vercel

Claude Code will:
- Run `vercel` (or `vercel --prod` for production)
- Guide you through linking to your Vercel account if needed
- Give you a live URL

**After deploying**, go to your Vercel dashboard and add the environment variable:
- **Key**: `ANTHROPIC_API_KEY`
- **Value**: your API key
- **Sensitive**: Yes

Or tell Claude Code:

> Set up the Vercel environment variable for my API key

## Step 6: Share

Your app is live. Share the Vercel URL with anyone you want to guide through the Freedom Blueprint process. Each person gets their own session stored in their browser's localStorage.

## Common Tasks with Claude Code

| What you want | What to say |
|---------------|-------------|
| Fix a bug | "The chat messages aren't persisting when I refresh. Can you fix it?" |
| Change copy | "Update the ritual opening text to say [your text]" |
| Add a worksheet | "Add a new worksheet called 'Values Hierarchy' between WS05 and WS06" |
| Change the model | "Use Claude Haiku instead of Sonnet for all worksheets" |
| Update dependencies | "Update all dependencies to their latest versions" |
| Run the linter | "Run the linter and fix any issues" |
| Build for production | "Do a production build and tell me if there are any errors" |
| Export as static | "Can this run as a static export without a server?" (Note: no -- the chat API requires a server) |

## Troubleshooting

### "API key not configured" error
- Check that `.env.local` exists and contains `ANTHROPIC_API_KEY=sk-ant-...`
- Restart the dev server after creating/editing `.env.local`
- On Vercel: check the environment variable is set in the project dashboard

### Chat not responding
- Check the browser console (F12) for errors
- Verify your API key is valid and has credits at [console.anthropic.com](https://console.anthropic.com)
- Check the rate limit hasn't been hit (20 requests/minute)

### Build fails
- Run `npm run build` to see the exact error
- Tell Claude Code the error message and it will fix it

### Session data lost
- Data is stored in localStorage under the key `freedom-blueprint-session`
- Private/incognito browsing doesn't persist localStorage across sessions
- Clearing browser data will erase progress

### Vercel deployment issues
- Make sure `ANTHROPIC_API_KEY` is set in Vercel's environment variables
- Check that the key is not prefixed with `NEXT_PUBLIC_` (it must be server-only)
- Check the Vercel function logs for errors (Vercel dashboard > Deployments > Functions)
