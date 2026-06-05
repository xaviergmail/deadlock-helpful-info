# counters-analytics — Implementation Plan

## Metadata
- Created: 2026-06-05
- Hyperplan: 5 members (pragmatist, architect, data-scientist, ux-heretic, long-horizon)
- Goal: Extend counter UI from 1 curated row to 2 rows — "Curated" + "Analytics" — for all 38 heroes

## Architecture Summary (Hyperplan Synthesis)

### Data Sources
- **Curated** (existing): `data/counters/heroes/*.yaml` → `src/generated/counters.json` (5 heroes, hand-picked, unchanged)
- **Analytics** (new): `scripts/generate-analytics.ts` → `src/generated/counters-analytics.json` (all 38 heroes, API-derived, committed)

### Type Design (architect wins over pragmatist optional-field hack)
Discriminated union; two separate strongly-typed arrays; no optional-field smell; no `as` casts:
```ts
// src/lib/types.ts additions
interface CuratedCounterEntry {
  readonly source: 'curated';
  readonly item: string;
  readonly confidence: 'high' | 'medium' | 'low';
  readonly reason: string;
  readonly lastReviewedPatch: string;
}
interface AnalyticsCounterEntry {
  readonly source: 'analytics';
  readonly item: string;        // class_name e.g. "upgrade_silencer"
  readonly winRateDelta: number; // e.g. 0.042 = +4.2pp vs baseline
  readonly sampleSize: number;  // matches_played
  readonly reason: string;      // template: "+4.2pp win rate over 1234 matches"
  readonly generatedAt: string; // ISO-8601
}
type CounterEntry = CuratedCounterEntry | AnalyticsCounterEntry;
// Type guards: isCurated(e), isAnalytics(e)
```

### Analytics Script Config (data-scientist wins on methodology; long-horizon on pipeline)
- `MIN_AVERAGE_BADGE = 50` (medium+ rank; configurable constant)
- `MIN_MATCHES_PLAYED = 100` (sample floor per item)
- `MIN_WIN_RATE_DELTA = 0.025` (+2.5pp above overall baseline)
- Baseline fetch: `/v1/analytics/item-stats?min_average_badge=50` (no hero filter)
- Per-hero fetch: `/v1/analytics/item-stats?enemy_hero_ids={heroId}&min_average_badge=50`
- Item map: `/v1/assets/items` → `itemId → class_name` lookup
- Dedup: exclude items already in `counters.json` curated list for that hero
- Reason template: `"+${(delta*100).toFixed(1)}pp win rate over ${n} matches"` — no AI at build time
- Failure policy: exit 0 + preserve prior file if API fails; exit 1 only if no prior file exists
- Output per hero includes `status: 'ok' | 'empty' | 'api_error' | 'stale_preserved'`

### UI Design (ux-heretic layout; architect typed constants; data-scientist honest empty state)
- **Curated row**: `<Show when={curatedCounters().length > 0}>` — only rendered when YAML data exists (5/38 heroes today)
- **Analytics row**: always rendered; `<Show when={analyticsCounters().length > 0}>` for items, else empty state node
- **Section labels**: exactly "Curated" / "Analytics" (verbatim from user spec, as typed constants)
- **BEM structure**:
  - `.hero-card__recommendations` — outer wrapper for both sections
  - `.hero-card__section .hero-card__section--curated` — curated section
  - `.hero-card__section .hero-card__section--analytics` — analytics section
  - `.hero-card__section-header` — `<h3>` inside each section
  - `.hero-card__section-items` — flex row of item cards (NO `overflow: hidden` — prevents tooltip clip)
  - `.hero-card__section-empty` — empty state text node
- **New tokens** in `tokens.css`:
  - `--counter-curated-bg` / `--counter-curated-border`
  - `--counter-analytics-bg` / `--counter-analytics-border`
- **Narrow viewport**: `.hero-card__section-items { overflow-x: auto; scroll-snap-type: x mandatory; }`
- **a11y**: `<h3>` for headers; keyboard focus flows curated-1→2→3 then analytics-1→2→3

### CI Pipeline (long-horizon simplified)
- Add `pnpm analytics:generate` to `pages.yml` BEFORE `pnpm build` (both push and daily 04:15 UTC cron)
- Commit `counters-analytics.json` to repo — rollback = git revert
- No separate `analytics-refresh.yml` yet; defer to future iteration

---

## TODOs

- [x] 1. `src/lib/types.ts` — add `CuratedCounterEntry`, `AnalyticsCounterEntry`, `CounterEntry` union, `isCurated()`/`isAnalytics()` type guards, `AnalyticsHeroData`, `AnalyticsCountersFile` shapes; keep existing `CounterEntry`/`HeroCounters`/`CountersData` for backward compat during transition
- [x] 2. `src/styles/tokens.css` — add 4 new CSS custom properties: `--counter-curated-bg`, `--counter-curated-border`, `--counter-analytics-bg`, `--counter-analytics-border` (dark-theme values, no hex in components)
- [x] 3. `scripts/generate-analytics.ts`
- [x] 4. `package.json` — add `"analytics:generate": "tsx scripts/generate-analytics.ts"` to scripts
- [x] 5. `src/generated/counters-analytics.json`
- [x] 6. `.github/workflows/pages.yml` — insert `pnpm analytics:generate` step after `pnpm install` and before `pnpm build`
- [x] 7. `src/components/HeroCard.tsx` — two-section render: (a) import `counters-analytics.json`; (b) `<Show>` curated section when `curatedCounters().length > 0`; (c) always-visible analytics section with `<Show>` for items vs empty state; NO `.map()`, NO ternaries, NO destructured props; wrap in `.hero-card__recommendations`
- [x] 8. `src/components/HeroCard.css` — add BEM section styles: border, tint via tokens, h3 header, items flex row, empty state text; NO `overflow: hidden` on item containers; `overflow-x: auto` for narrow viewport
- [x] 9. `src/components/__tests__/HeroCard.test.tsx` — extend: curated section present for hero with YAML data; curated section absent for hero without; analytics section visible with mock analytics data; analytics empty state visible when hero has no analytics data

## Final Verification Wave

- [x] F1. **Plan compliance audit** — `oracle` reads plan + all changed files, confirms each TODO implemented as specified, no scope creep, no unimplemented stubs
- [x] F2. **Solid.js correctness** — `oracle` audits `HeroCard.tsx` for: no destructured props, no `.map()` in JSX, no ternaries (use `<Show>`), correct `<For>`/`<Show>` usage, signals called as functions `()`
- [x] F3. **TS strict + bundle size** — `pnpm typecheck && pnpm build && pnpm bundle-size` all exit 0; zero `as any`, `@ts-ignore`; analytics JSON ≤ 25 KB raw
- [x] F4. **Visual verification** — Playwright opens `/#/heroes`, selects Abrams (curated+analytics data), verifies `.hero-card__section--curated` AND `.hero-card__section--analytics` visible with item cards; selects an uncurated hero, verifies only `.hero-card__section--analytics` present (or empty state)
