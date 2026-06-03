# AGENTS.md

## What This Is

Deadlock game-info SPA — hero, item, and ability reference designed to run in the **Steam Overlay browser** while gaming. Rendering performance and memory footprint are the top priorities; this app shares system resources with a running game on potentially low-end hardware.

## Status

Scaffold is **built and verified end-to-end**. Build pipeline, test infrastructure, CI/CD, and deployment workflow are all in place. The actual data pipeline (fetching from `api.deadlock-api.com` and baking JSON) and the hero/item/ability UI are **not yet implemented** — those land in follow-up plans.

## Tech Stack

- **[Solid.js](https://www.solidjs.com/) 1.9** — fine-grained reactivity, no Virtual DOM
- **[@solidjs/router](https://docs.solidjs.com/solid-router) 0.15** with `<HashRouter>` — zero-config GitHub Pages subpath compatibility (no 404.html hack)
- **[Vite](https://vitejs.dev/) 6.4** — build tool and dev server (`minify: 'esbuild'`, `target: 'esnext'`)
- **TypeScript 5.7** — strict mode + `noUncheckedIndexedAccess` + `verbatimModuleSyntax`
- **[Biome](https://biomejs.dev/) 1.9** — single-binary lint + format + import-sort (no ESLint, no Prettier)
- **[Vitest](https://vitest.dev/) 2.1** + `@solidjs/testing-library` 0.8 — unit tests
- **[Playwright](https://playwright.dev/) 1.50** — E2E smoke tests (chromium-only)
- **pnpm 11** — package manager (note: see "pnpm 11 quirks" below)
- **Node 22** LTS (pinned via `.node-version`)
- **GitHub Pages** — static hosting, deployed via GitHub Actions
- **Git LFS** — all images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`) tracked via LFS (see `.gitattributes`)

## Project Structure

```
src/
  index.tsx              # Solid mount point, imports global.css
  app.tsx                # HashRouter + lazy-loaded routes + AppShell wrapper
  routes.ts              # navRoutes metadata (used by Home page nav)
  components/
    AppShell.tsx         # header (banner) + main + footer (contentinfo)
    __tests__/           # vitest unit tests
  pages/                 # Route components (lazy-imported)
    home.tsx
    cheatsheets.tsx
    not-found.tsx
  lib/
    types.ts             # Skeleton domain types (Hero, Item, Ability, etc.)
  styles/
    tokens.css           # CSS custom properties (dark theme only)
    global.css           # Resets + element styles + page classes
  assets/
    cheatsheets/*.png    # LFS-tracked legacy content
  test-setup.ts          # @testing-library/jest-dom + cleanup() afterEach
e2e/
  smoke.spec.ts          # Playwright E2E covering all 3 routes
scripts/
  check-bundle-size.ts   # CI bundle budget gate
public/
  robots.txt
  favicon.svg
.github/
  workflows/
    pages.yml            # Build + deploy on push to main + daily cron
    ci.yml               # PR validation: lint, typecheck, test, build, bundle-size, e2e
  dependabot.yml         # Weekly npm + actions updates (Solid grouped separately)
  PULL_REQUEST_TEMPLATE.md
  ISSUE_TEMPLATE/*.yml   # Bug + feature issue forms
```

## Quickstart

```sh
pnpm install
pnpm dev          # http://localhost:5173 (root base path)
pnpm test         # vitest watch
pnpm test:e2e     # playwright (requires `pnpm exec playwright install --with-deps chromium` first)
pnpm build        # dist/ with VITE_BASE=/deadlock-helpful-info/ by default
pnpm preview      # http://localhost:4173/deadlock-helpful-info/
pnpm typecheck    # tsc --noEmit
pnpm lint         # biome check
pnpm check        # biome lint + format + auto-fix
pnpm bundle-size  # JSON report + non-zero exit on budget violation
```

## Solid.js — Critical Rules

Solid.js JSX looks like React but the execution model is fundamentally different. **Do not write React patterns.**

> ⚠️ **Biome does NOT enforce these rules.** Solid framework-specific lint rules (`solid/no-destructure`, `solid/reactivity`, etc.) only exist in `eslint-plugin-solid`. We chose Biome for speed/simplicity, accepting that reviewers + AGENTS.md guardrails compensate. If you see a violation, flag it.

### Components run ONCE

A Solid component function executes a single time to set up the reactive graph. It never re-runs. All reactivity flows through signals and effects.

```tsx
// WRONG — React mental model (component re-runs on state change)
function Counter() {
  const [count, setCount] = createSignal(0);
  console.log("runs once, not on every update");
  return <button onClick={() => setCount(c => c + 1)}>{count()}</button>;
}
```

### Never destructure props

Destructuring breaks reactivity because it captures the value at call time (which is once — see above).

```tsx
// WRONG — loses reactivity
function Item({ name, cost }) { return <span>{name}</span>; }

// RIGHT — access props directly or use mergeProps/splitProps
function Item(props) { return <span>{props.name}</span>; }
```

### Signals are functions

Read a signal by calling it: `count()`, not `count`. Forgetting the `()` passes the signal accessor itself instead of its value. In JSX this is intentional (Solid subscribes to it), but in plain JS logic you must call it.

### Conditional rendering

Use `<Show>` and `<Switch>`/`<Match>`, not ternaries or `&&` short-circuits in JSX. Ternaries cause the falsy branch to be created and destroyed instead of toggled, which wastes DOM operations.

### List rendering

Use `<For>` or `<Index>` — never `.map()`. Solid's `<For>` tracks items by reference and only updates changed rows. `.map()` recreates the entire list on every signal change.

### No re-render debugging

There is no "why did this re-render" because components don't re-render. If the UI isn't updating, the signal graph is broken (usually from destructured props or a missing `()` call). Trace reactivity issues with `createEffect` logging.

## Data Sources

### Primary — Deadlock API

REST endpoints at `api.deadlock-api.com`:

| Endpoint | Data |
|---|---|
| `GET /v1/assets/heroes` | All heroes — metadata, images (CDN), abilities, base stats, item recommendations |
| `GET /v1/assets/heroes/{id}` | Single hero |
| `GET /v1/assets/heroes/by-name/{name}` | Hero by name |
| `GET /v1/assets/items` | All items — name, cost, tier, slot type, properties, weapon stats, images |
| `GET /v1/assets/items/by-hero-id/{id}` | Items for a specific hero |
| `GET /v1/assets/items/by-slot-type/{slot}` | Items by slot (`weapon` / `vitality` / `spirit`) |
| `GET /v1/assets/abilities` | Abilities (limited; most ability data is nested in hero responses) |
| `GET /v1/analytics/hero-stats` | Win rates, pick rates by rank/patch |
| `GET /v1/analytics/item-stats` | Item win rates |
| `GET /v1/analytics/ability-order-stats` | Ability upgrade path popularity |

Bulk data dumps (Parquet): `s3-cache.deadlock-api.com/db-snapshot/` — heroes, items, match data, leaderboards. Use for offline analysis or build-time processing.

Hero images are served from `assets-bucket.deadlock-api.com` — use the URLs from the API `images` field directly (CDN-hosted, available in WebP).

Domain types (skeleton only) live in `src/lib/types.ts`.

### Supplementary — Deadlock Wiki

`deadlock.wiki` — MediaWiki with Cargo extension and Lua module data.

- **API**: `deadlock.wiki/api.php` (standard MediaWiki query API)
- **Structured data**: Lua modules like `Module:ItemData` backed by `Data:ItemData.json`
- **Use for**: lore, strategy context, patch note explanations, voice lines, trivia — data the API doesn't carry
- **Related repos**: `deadlock-wiki/deadbot` (Python, auto-updates wiki from game files), `deadlock-wiki/deadlock-data` (historical data)

### Data Strategy

Fetch data from the Deadlock API at **build time** and bake it into the static bundle. The Steam Overlay browser should never make runtime API calls — all content is pre-built static HTML+JS. Run a periodic CI rebuild (daily cron at 04:15 UTC, already wired in `pages.yml`) to pick up game balance changes.

> 🚧 **Not yet implemented.** The data fetcher (`scripts/fetch-data.ts` or similar) and the JSON-bake-into-`src/generated/` pipeline are in a **separate follow-up plan**. The current scaffold has zero runtime API calls and zero data — only skeleton types in `src/lib/types.ts`.

## Performance Constraints

- **No runtime API calls** — all data baked at build time
- **Lazy-load images** — hero/item images should use `loading="lazy"` or intersection observer (cheatsheets page already does this)
- **Minimize DOM nodes** — fewer nodes = less memory. Prefer virtual scrolling for large lists (hero roster, full item catalog)
- **Avoid large component trees** — keep the reactive graph shallow
- **No heavy dependencies** — every KB of JS is memory the game can't use
- **Prefer CSS over JS** for animations and transitions

### Bundle Budget (enforced in CI via `scripts/check-bundle-size.ts`)

| Metric | Budget | Current |
|---|---|---|
| Initial JS gzipped | 60 KB | ~14 KB (24%) |
| Total CSS gzipped | 20 KB | ~0.8 KB (4%) |
| Single chunk gzipped | 100 KB | none over |

The build will FAIL CI if any budget is exceeded. Tune in `scripts/check-bundle-size.ts`.

## Routing

`<HashRouter>` from `@solidjs/router`. Routes live in `src/app.tsx` with `lazy()` imports for code-splitting.

URLs look like `/#/cheatsheets` (note the hash). This is intentional — hash routing is zero-config on GitHub Pages subpath deploys (no 404.html redirect hack required). The trade-off is hash URLs are slightly less pretty than path URLs.

## Build Configuration

### `VITE_BASE` env var

Vite's `base` is env-driven: `process.env.VITE_BASE ?? '/'` in `vite.config.ts`.

- **Local dev** (`pnpm dev`): no env set → base `/`
- **Local build/preview** (`pnpm build`, `pnpm preview`): default `/deadlock-helpful-info/` (set in package.json scripts)
- **CI** (`.github/workflows/pages.yml`): `VITE_BASE: /deadlock-helpful-info/` set at workflow level
- **Custom domain in future**: override with `VITE_BASE=/ pnpm build`

### Path alias

`~` maps to `./src/` (configured in both `vite.config.ts` `resolve.alias` and `tsconfig.json` `paths`):

```ts
import AppShell from '~/components/AppShell';
import sheet1 from '~/assets/cheatsheets/foo.png?url';
```

## Deployment

Push to `main` triggers `.github/workflows/pages.yml`:
1. Checkout with `lfs: true`
2. Install pnpm + Node 22
3. `pnpm install --frozen-lockfile`
4. `pnpm build` (with `VITE_BASE=/deadlock-helpful-info/`)
5. `pnpm bundle-size` (gate)
6. Upload + deploy artifact to GitHub Pages
7. Live at https://xaviergmail.github.io/deadlock-helpful-info/

### One-time setup REQUIRED

In GitHub repo: **Settings → Pages → Source → "GitHub Actions"**. Without this, the deploy job is a silent no-op. Cannot be automated.

### Action versions (all major-pinned, no floating refs)

`actions/checkout@v6`, `actions/setup-node@v6`, `pnpm/action-setup@v4`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`, `actions/upload-artifact@v4`.

### Concurrency policy

- `pages.yml`: `cancel-in-progress: false` (don't interrupt a running deploy — corrupts Pages state)
- `ci.yml`: `cancel-in-progress: true` (cancel superseded PR runs to save CI minutes)

## CI (PR validation)

`.github/workflows/ci.yml` runs on every PR + push to main:
- `pnpm lint` (Biome)
- `pnpm typecheck`
- `pnpm test --run --coverage`
- `pnpm build`
- `pnpm bundle-size`
- Playwright smoke E2E (chromium)

Playwright report uploaded as artifact on failure.

## Repo Quirks Worth Knowing

### pnpm 11 build script approval

pnpm 11 blocks postinstall scripts by default for security. To allow specific packages, run `pnpm approve-builds --all` once — it writes `allowBuilds: { ... }` to `pnpm-workspace.yaml`. Currently approved: `@biomejs/biome`, `esbuild`, `simple-git-hooks`.

### Pre-commit hooks via `simple-git-hooks` + `lint-staged`

The `prepare` script in `package.json`:

```sh
git config --local core.hooksPath .git/hooks && simple-git-hooks
```

The `git config --local core.hooksPath .git/hooks` part overrides any global `core.hooksPath` setting. This was added because of a real footgun: running `git config core.hooksPath --unset` (no `--unset` flag) sets the value to the literal string `"--unset"` rather than unsetting it, which silently disables all git hooks repo-wide. The local override defends against that.

`lint-staged` runs `biome check --write --no-errors-on-unmatched` on staged TS/JS/JSON/CSS files.

### `--unset/` directory legacy

Same root cause as the hooks issue — a stray `git config core.hooksPath --unset` in repo history created a literal `--unset/` directory containing stale hook samples. Already cleaned up in T1, but if you see it reappear, that's why.

## Known Followups (Tracked but Not Blocking)

- **AppShell tests are source-grep, not real DOM**: `src/components/__tests__/AppShell.test.tsx` uses `readFileSync + toContain` on the source file rather than `render()` from `@solidjs/testing-library`. The TDD RED → GREEN ordering is preserved in git history (`ed9f9bf` → `f3f4b66`), but the tests don't exercise the rendered DOM. Cause: subagent hit a Solid+vitest+`@solidjs/router` context error during scaffolding and shortcut to source assertions. Fix is ~30 min of work — wrap render in `<Router>` or `<MemoryRouter>` from `@solidjs/router` and use `screen.getByRole('banner' | 'main' | 'contentinfo')`.

- **Data pipeline not built**: see "Data Strategy" above. Separate plan.

- **Hero/Item/Ability UI not built**: separate plan after data pipeline lands.

## When in doubt

- Read this file first
- Match existing patterns in `src/`
- Run `pnpm check && pnpm typecheck && pnpm test --run && pnpm build && pnpm bundle-size` before pushing
- Keep PRs focused — one concern per PR
