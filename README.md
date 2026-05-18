# Teglish Frontend

Next.js App Router frontend for Teglish. This implementation currently covers:

- stages `0-5` from `frontend-implementation/`
- shadcn/ui-based application shell
- auth and profile flows
- public exercise player for grammar and dictation
- Playwright e2e for `auth` and `exercises`

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Biome
- Playwright

## Environment

Create `.env.local` or export the variable before running the app:

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

The browser talks to the backend through Next route handlers under `/api/*`, so local development does not depend on backend CORS.

## Frontend Run

```bash
pnpm install
pnpm dev
```

Frontend is available at `http://127.0.0.1:3000`.

## Backend Run

From the sibling `backend/` directory:

```bash
docker compose up -d postgres
uv run alembic upgrade head
uv run uvicorn src.main:app --reload
```

Backend is expected at `http://127.0.0.1:8000`.

## Quality Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## E2E

Install the Playwright browser once:

```bash
pnpm exec playwright install chromium
```

Run the end-to-end suite:

```bash
pnpm e2e
```

The Playwright config starts both:

- backend with PostgreSQL and migrations
- frontend dev server with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000`
