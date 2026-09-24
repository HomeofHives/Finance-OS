# Finance-OS Docs

Documentation site for the Finance-OS monorepo, built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build).

## Commands

All commands are run from the `docs/` directory:

| Command          | Action                                          |
| :--------------- | :---------------------------------------------- |
| `pnpm install`   | Installs dependencies                           |
| `pnpm dev`       | Starts the local dev server at `localhost:4321` |
| `pnpm build`     | Build the production site to `./dist/`          |
| `pnpm preview`   | Preview the build locally before deploying      |
| `pnpm typecheck` | Run `astro check` for type errors               |

Documentation content lives in `src/content/docs/` as Markdown/MDX files.
