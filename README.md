# SereneStay.ai

AI-powered healing retreat matching platform. Find your perfect sanctuary for wellness, nature, and serenity around the world.

## Features

- **56 curated destinations** across 6 regions
- **9-dimensional AI matching** — serenity, nature, climate, affordability, wellness, community, WiFi, visa, medical
- **Hard Veto warnings** — auto-flags destinations with poor WiFi (≤2) or medical facilities (≤2)
- **SSE streaming chat** — natural conversation with AI guide powered by DeepSeek
- **Smart matching** — weighted scoring algorithm based on user preferences

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **AI**: DeepSeek API (deepseek-chat, OpenAI-compatible)
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Set environment variable
export DEEPSEEK_API_KEY=your-key-here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # SSE streaming chat
│   │   ├── destinations/
│   │   │   ├── route.ts           # List destinations (filter/sort)
│   │   │   └── [slug]/route.ts    # Destination detail + veto warnings
│   │   └── match/route.ts         # AI-powered matching
│   ├── chat/page.tsx              # AI chat page
│   ├── destinations/              # Destination browser
│   ├── pricing/page.tsx           # Pricing page
│   ├── page.tsx                   # Homepage
│   └── layout.tsx                 # Root layout
├── components/                    # React components
├── lib/
│   ├── types.ts                   # TypeScript types
│   ├── deepseek.ts                # DeepSeek API client
│   ├── destinations.ts            # Data loader
│   ├── prompts.ts                 # AI prompt templates
│   └── api.ts                     # Frontend API client
└── data/
    ├── serenestay-destinations.json   # 56 destinations
    └── serenestay-ai-prompts.md       # Prompt library
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEEPSEEK_API_KEY` | Yes | DeepSeek API key for AI features |

## API Endpoints

- `GET /api/destinations` — List all destinations (supports `?region=`, `?tag=`, `?sort=`)
- `GET /api/destinations/[slug]` — Single destination with veto warnings
- `POST /api/chat` — SSE streaming chat
- `POST /api/match` — AI-powered destination matching

## License

Private — All rights reserved.
