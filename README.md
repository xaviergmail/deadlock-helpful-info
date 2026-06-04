# Deadlock Helpful Info

Hero, item, and ability reference for Deadlock — built for the Steam Overlay browser.

**Live site**: https://xaviergmail.github.io/deadlock-helpful-info/

## Tech stack

- **[Solid.js](https://www.solidjs.com/)** — fine-grained reactivity, no Virtual DOM
- **[Vite](https://vitejs.dev/)** — build tool
- **TypeScript** strict mode
- **[Biome](https://biomejs.dev/)** — single-binary lint + format
- **[Vitest](https://vitest.dev/)** + `@solidjs/testing-library` — unit tests
- **[Playwright](https://playwright.dev/)** — E2E smoke tests
- **pnpm** — package manager
- **GitHub Pages** — hosting via GitHub Actions

See [`AGENTS.md`](./AGENTS.md) for the full architecture brief and Solid.js conventions.

## Quickstart

```sh
pnpm install
pnpm dev          # http://localhost:5173
pnpm test         # vitest unit tests
pnpm test:e2e     # playwright smoke (requires `pnpm exec playwright install --with-deps chromium`)
pnpm build        # production build → dist/
pnpm preview      # serve built site at http://localhost:4173/deadlock-helpful-info/
```

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Start Vite dev server at http://localhost:5173 |
| `pnpm build` | Build production bundle to `dist/` |
| `pnpm preview` | Serve the built `dist/` (with prod base path) |
| `pnpm test` | Run Vitest unit tests in watch mode |
| `pnpm test:watch` | Same as `test` (explicit watch mode) |
| `pnpm test:e2e` | Run Playwright E2E smoke tests against `pnpm preview` |
| `pnpm typecheck` | TypeScript strict typecheck (`tsc --noEmit`) |
| `pnpm lint` | Biome lint + format check |
| `pnpm format` | Biome auto-format files |
| `pnpm check` | Biome lint + format + auto-fix |
| `pnpm bundle-size` | Verify gzipped initial JS is under budget (60 KB) |
| `pnpm prepare` | Set up local git hooks (auto-runs after `pnpm install`) |

## Architecture

- **Hybrid data**: Structured data (heroes, abilities, analytics) baked at build time. Item UI uses `@deadlock-api/ui-core` web components which fetch item data at runtime (approved exception).
- **Fine-grained reactivity**: Solid components run once. Reactivity flows through signals, not re-renders.
- **Hash routing**: Uses `<HashRouter>` from `@solidjs/router` for zero-config GitHub Pages subpath compatibility.
- **Dark theme**: Single dark theme baked in (Steam Overlay context). Design tokens in `src/styles/tokens.css`.
- **Bundle budget**: CI fails if initial JS exceeds 60 KB gzipped. See `scripts/check-bundle-size.ts`.

## Deployment

Pushes to `main` automatically trigger a build + deploy via `.github/workflows/pages.yml`.

### One-time setup (REQUIRED before first deploy succeeds)

In your GitHub repo:

1. Go to **Settings → Pages**
2. Under **Source**, select **GitHub Actions**
3. Save

Without this step, the deploy job will silently no-op. There is no way to automate this — it must be done manually once per repo.

## Images

Images (`*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp`) are tracked via Git LFS — see `.gitattributes`. The deploy workflow checks out with `lfs: true` so images are included.

## Adding a route

1. Create a page component in `src/pages/<route-name>.tsx`
2. Register it in `src/app.tsx` with `lazy()` import + `<Route>` element
3. Add to `src/routes.ts` `navRoutes` array if it should appear in the primary nav

## Adding a test

Place `*.test.tsx` files under `src/**/__tests__/`. Use `@solidjs/testing-library` semantic queries (`getByRole`, `getByText`) — not implementation-detail selectors.

## Conventions

Read [`AGENTS.md`](./AGENTS.md) before contributing. The most important rules:

- **Never destructure props** in Solid components. Use `props.x`, not `({ x })`.
- **Signals are functions**. Call them: `count()`, not `count`.
- **Use `<For>` / `<Show>` / `<Switch>`** for rendering. No `.map()` in JSX. No ternaries.
- **No ad-hoc runtime API calls**. Item UI is handled by `@deadlock-api/ui-core`. Custom code must not `fetch()` external APIs directly. See AGENTS.md "Data Strategy" for the full policy.

Solid framework-specific lint rules are not enforced by Biome (see `CONTRIBUTING.md` for the trade-off note).

## Bundle budget

Current budgets enforced in CI:
- Initial JS: **60 KB** gzipped
- Total CSS: **20 KB** gzipped
- Any single chunk: **100 KB** gzipped

Tune in `scripts/check-bundle-size.ts`.

## Pre-commit hooks

`simple-git-hooks` + `lint-staged` auto-format staged files via Biome on commit.

The `prepare` script in `package.json` sets `core.hooksPath` locally to `.git/hooks` to override any global setting. This runs automatically after `pnpm install`.

## Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Security

See [`SECURITY.md`](./SECURITY.md).

## License

See [`LICENSE`](./LICENSE).
