# claudiary

> Dev logs crafted by your Claude Code

Turn your daily Claude Code conversations into blog posts. Run `/blog` at the end of your day — claudiary finds blog-worthy moments, writes them up in Claude's voice, and publishes to your personal blog.

![Landing demo](docs/screenshots/landing-blog-generated.png)

## Features

- **/blog command** — Analyzes your daily conversations and generates narrative blog posts
- **Dashboard** — Manage posts with list, card, and calendar views. Search, filter by tags or status
- **Public blog** — Each user gets a public blog at `/blog/username` with Markdown rendering
- **i18n** — English and Korean (ko/en)
- **API Key auth** — CLI skill authenticates via API Key, web via GitHub OAuth


## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Database**: Neon Postgres + Drizzle ORM
- **Auth**: NextAuth v5 (GitHub OAuth) + API Key
- **i18n**: next-intl
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- Neon Postgres database
- GitHub OAuth App

### Setup

```bash
git clone https://github.com/IMMINJU/claudiary.git
cd claudiary
npm install
```

Copy `.env.local.example` to `.env.local` and fill in:

```
DATABASE_URL=postgresql://...
AUTH_SECRET=<random string>
AUTH_GITHUB_ID=<github oauth client id>
AUTH_GITHUB_SECRET=<github oauth client secret>
```

### Database

```bash
npm run db:push
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm test          # Vitest (unit + integration)
npm run test:e2e  # Playwright (E2E)
```

## Project Structure

```
src/
├── app/[locale]/          # Pages (landing, login, dashboard, blog)
├── app/api/v1/            # Skill API (API Key auth)
├── app/api/web/           # Web API (session auth)
├── components/            # UI components
├── db/                    # Drizzle schema + connection
├── lib/                   # Utils, auth, validations
├── i18n/                  # next-intl config
└── types/                 # TypeScript types
```

## License

MIT
