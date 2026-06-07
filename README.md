# NEEV — Outreach Enrichment Tool

A local contact list enrichment and outreach email generation tool for NEEV Paris,
a made-to-order Parisian womenswear brand.

## Setup

```
npm install
cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
node server.js
# Open http://localhost:3000
```

## What it does

- **Enrich tab** — runs 37 web search batches against the Anthropic API
  (`claude-sonnet-4-20250514` with the `web_search_20250305` tool) to find real
  fashion influencers, press editors, stylists, and concept store buyers relevant
  to NEEV. Results are deduplicated and appended to `data/contacts.json`.
- **Email drafts tab** — for each contact without a draft, researches them via
  web search and generates a personalized cold outreach email from Nawel,
  founder of NEEV, in their detected language (French or English).
- **Exports** — Klaviyo CSV (contacts with email), drafts CSV (contacts with a
  completed draft), and a full contact list CSV.

All API calls are proxied through the local Express server in `server.js` so the
browser never talks to the Anthropic API directly (avoids CORS issues and keeps
the API key server-side).

`data/contacts.json` is created on first run (preloaded with the existing NEEV
contact list) and persists across restarts.
