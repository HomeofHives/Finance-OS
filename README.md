# Finance-OS

A production-oriented personal finance management platform built as a pnpm monorepo.

## Tech Stack

- **Frontend:** React + Vite + TypeScript
- **Routing:** TanStack Router
- **Styling:** Tailwind CSS v4
- **UI:** shadcn/ui (`packages/ui`)
- **Animations:** Framer Motion, Lenis smooth scroll
- **Backend:** Fastify
- **Database:** MongoDB (Mongoose)
- **Validation:** Zod
- **Authentication:** JWT (planned)
- **Logging:** Fastify/Pino
- **Documentation:** Astro + Starlight (`docs/`)

## Prerequisites

- Node.js `>= 26`
- pnpm 12.5.1

Check your versions:

```bash
node --version
pnpm --version
```

## Project Structure

```text
finance-os/
├── apps/
│   ├── frontend/     # React + Vite single-page application
│   └── backend/      # Fastify API
│
├── packages/
│   └── ui/           # Shared shadcn/ui components + design tokens
│
├── docs/             # Astro + Starlight documentation site
├── package.json      # Root workspace configuration
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── README.md
```

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

Do not install dependencies inside individual packages unless specifically required.

### 2. Configure the Backend Environment

Copy the example environment into place and fill in the values:

```bash
cp apps/backend/.env.example apps/backend/.env
```

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/finance-os
JWT_SECRET=your-development-secret
```

> Never commit `.env` files containing secrets.

### 3. Run the Development Environment

```bash
pnpm dev
```

This starts the frontend, backend, and docs in parallel:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Docs:     http://localhost:4321
```

The backend waits for the MongoDB connection to succeed before it starts accepting requests.

## Code Quality

Run the validation commands from the repository root:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

Formatting (via Prettier):

```bash
pnpm format        # write formatting fixes
pnpm format:check  # verify formatting without modifying files
```

## Development Workflow

1. Switch to `develop` and create a feature branch.
2. Make focused changes following the existing structure and conventions.
3. Run `pnpm typecheck`, `pnpm lint`, and `pnpm build`.
4. Open a pull request targeting `develop`.

## Documentation

Project documentation lives under `docs/` and is built with Astro + Starlight. See `docs/README.md` for the available commands.
