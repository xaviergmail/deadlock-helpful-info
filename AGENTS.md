# AGENTS.md

## What This Is

Deadlock game-info SPA — hero, item, and ability reference designed to run in the **Steam Overlay browser** while gaming. Rendering performance and memory footprint are the top priorities; this app shares system resources with a running game on potentially low-end hardware.

## Tech Stack

- **Solid.js** — chosen for fine-grained reactivity with no Virtual DOM (lowest memory overhead, fastest rendering in class)
- **Vite** — build tool and dev server
- **GitHub Pages** — static hosting, deployed via GitHub Actions
- **Git LFS** — all images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`) tracked via LFS (see `.gitattributes`)

## Solid.js — Critical Rules

Solid.js JSX looks like React but the execution model is fundamentally different. **Do not write React patterns.**

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

### Supplementary — Deadlock Wiki

`deadlock.wiki` — MediaWiki with Cargo extension and Lua module data.

- **API**: `deadlock.wiki/api.php` (standard MediaWiki query API)
- **Structured data**: Lua modules like `Module:ItemData` backed by `Data:ItemData.json`
- **Use for**: lore, strategy context, patch note explanations, voice lines, trivia — data the API doesn't carry
- **Related repos**: `deadlock-wiki/deadbot` (Python, auto-updates wiki from game files), `deadlock-wiki/deadlock-data` (historical data)

### Data Strategy

Fetch data from the Deadlock API at **build time** and bake it into the static bundle. The Steam Overlay browser should never make runtime API calls — all content is pre-built static HTML+JS. Run a periodic CI rebuild (daily cron or manual) to pick up game balance changes.

## Performance Constraints

- **No runtime API calls** — all data baked at build time
- **Lazy-load images** — hero/item images should use `loading="lazy"` or intersection observer
- **Minimize DOM nodes** — fewer nodes = less memory. Prefer virtual scrolling for large lists (hero roster, full item catalog)
- **Avoid large component trees** — keep the reactive graph shallow
- **No heavy dependencies** — every KB of JS is memory the game can't use. Audit bundle regularly with `vite-bundle-visualizer` or similar
- **Prefer CSS over JS** for animations and transitions

## Deployment

Push to `main` triggers GitHub Actions → Vite build → GitHub Pages deploy. The workflow is at `.github/workflows/pages.yml` (currently Jekyll; needs updating to Vite when the SPA is set up).

Git LFS must be checked out in CI (`lfs: true` on checkout action) for any locally-stored images.
