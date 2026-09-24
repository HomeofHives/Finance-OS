# @finance-os/frontend

React + Vite single-page application for Finance-OS.

## Stack

- React 19, TypeScript, Vite
- TanStack Router for routing
- Tailwind CSS v4 (styling via `@theme` tokens defined in `src/app/styles/global.css`)
- Design tokens and `Button` component from `@finance-os/ui`
- Framer Motion for animation; Lenis for smooth scrolling
- Zustand for the light/dark theme store

## Structure

```text
src/
├── app/           # App shell: router, providers, global styles
│   ├── providers/ # Theme store + ThemeSync
│   ├── router/    # TanStack Router setup
│   └── styles/    # global.css (Tailwind theme + application styles)
├── pages/         # Route pages; page-owned components live next to their page
│   └── home/      # Landing page and its section components
└── shared/        # Cross-page reusable primitives (animations, ThemeToggle)
```

## Commands

```bash
pnpm dev          # start the Vite dev server
pnpm build        # typecheck + production build
pnpm typecheck    # tsc project build (no emit)
pnpm lint         # ESLint
pnpm preview      # preview the production build
```
