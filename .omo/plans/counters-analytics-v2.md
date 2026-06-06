# counters-analytics v2 — Item Matchups

## Goal

Replace the misleading `MIN_WIN_RATE_DELTA = 0.025` filter in the hero-card Analytics section with **"always show top-3 items by raw win-rate delta, regardless of threshold"** AND render the delta + sample size per item, so users self-judge weak vs strong matchups.

Reframes the section from "counters" → **"Item Matchups: win-rate delta vs average"**.

## Why (the bug we are fixing)

21/38 heroes today show "Not enough match data." — **false**. Live API probe (`min_average_badge=50`):

| Hero | id | total matches | items w/ matches≥100 | items clearing 2.5pp | max delta |
|---|---|---|---|---|---|
| Haze | 13 | 47,968,990 | 156/156 | 0 | +0.04pp |
| Yamato | 27 | 37,204,359 | 156/156 | 0 | +0.14pp |
| Warden | 25 | 31,849,730 | 156/156 | 0 | +1.73pp |

The binding constraint is the 2.5pp delta gate (NOT match volume). It bisects the roster 17 ok / 21 empty. The empty-state copy lies about why.

## Adversarial-plan synthesis (5-member hyperplan)

Team `hyperplan-ca-v2`: `minimalist` (unspecified-low), `integrator` (unspecified-high), `statistician` (ultrabrain), `ux-heretic` (artistry), `systems-realist` (deep). Two rounds: proposals + cross-critique. Final positions reconciled in the matrix above.

Notable concessions during critique:
- integrator conceded its `EPSILON=0.001` floor (recognised as re-introducing the very threshold the user removed) → switched to no floor + label flip to neutral framing.
- statistician conceded its `Z>1.96` gate (rejected user's "always show" premise) → conceded to raw top-3 with sample size as the honesty mechanism.
- ux-heretic conceded Unicode minus typography from systems-realist.
- minimalist conceded Unicode minus + accepted that the badge IS the reframe (so label can stay simple — though synthesis still flipped label per integrator's "negative deltas make over-perform a lie" argument).

## Constraints (NON-NEGOTIABLE)

- **Solid.js**: no destructured props; `<Show>` / `<For>` not ternary / `.map()`; signals are functions.
- **TS strict** + `verbatimModuleSyntax`; NO `as any`, NO `@ts-ignore`.
- **Biome**: BEM kebab-case CSS co-located in `.css`; NO inline `style=`, NO `!important`. `console.log` allowed in `scripts/` (warn only).
- **Dark theme only**; new colors → tokens in `src/styles/tokens.css`.
- **Bundle budget** (CI-gated): initial JS ≤ 60 KB gz (now 37.6), CSS ≤ 20 KB gz (now 1.8), single chunk ≤ 100 KB gz.
- **No runtime `fetch()`** in app code. `scripts/generate-analytics.ts` bakes data; daily 04:15 UTC cron + `pages.yml` step regenerate.
- **Steam Overlay** 1280×720 / old Chromium / low RAM.
- **Do NOT commit** unless user explicitly requests.

## File map

| File | Change |
|---|---|
| `scripts/generate-analytics.ts` | Remove `MIN_WIN_RATE_DELTA` const + `delta < MIN_WIN_RATE_DELTA` gate. Keep `MIN_MATCHES_PLAYED = 100`. Sort by raw delta desc, top-3. Update reason template to use Unicode minus + signed prefix. Update config object: `minWinRateDelta: 0` (preserved field, value advertises "no gate"). |
| `src/lib/types.ts` | No structural changes. `AnalyticsCounterEntry` already has `winRateDelta` + `sampleSize`. `AnalyticsHeroData.status` enum unchanged. `config.minWinRateDelta` field preserved as `number` (now permanently 0). |
| `src/styles/tokens.css` | Add `--color-delta-positive` (muted green), `--color-delta-negative` (muted red). Reuse existing `--color-fg-muted` for neutral / sample-size. |
| `src/components/HeroCard.tsx` | Section label: "Item Matchups". Add subtitle `<p class="hero-card__section-sub">Win-rate delta vs average</p>`. Wrap each analytics item in `.hero-card__stat-item` (icon + delta line + sample-size line). Helpers `formatDelta(d)` and `formatSampleSize(n)` co-located in module scope. `data-trend` attribute on stat-item: `positive` (d > 0.01), `negative` (d < -0.01), `neutral` (else). Empty-state copy: "Item stats unavailable." |
| `src/components/HeroCard.css` | Add `.hero-card__section-sub` (text-sm, fg-muted, margin 0 0 space-1 0). Add `.hero-card__stat-item` (flex column, align center, gap space-1). Add `.hero-card__stat-delta` (text-sm, color via `[data-trend]` attribute selectors). Add `.hero-card__stat-samples` (text-sm, color-fg-muted). Keep `.hero-card__counter-item` unchanged (still used by curated row). |
| `src/components/__tests__/HeroCard.test.tsx` | Update mock JSON to include positive + negative + near-zero deltas. Update empty-state assertion to "Item stats unavailable.". New tests: subtitle renders, signed delta renders correctly (`+4.2pp` / `−0.1pp` / `0.0pp`), sample size formatted compactly (`52K` / `47.9M`), `data-trend` attribute set correctly across three buckets. |
| `e2e/smoke.spec.ts` | Update Haze test: expect `.hero-card__section-empty` NOT attached; expect `dl-item-card` count 6 (3 curated + 3 analytics); expect `.hero-card__stat-delta` count 3 in analytics section. Update Apollo test: deterministic via baked data; check `.hero-card__stat-delta` + `.hero-card__stat-samples` present; `.hero-card__section--curated` not attached. |
| `src/generated/counters-analytics.json` | Regenerate via `pnpm analytics:generate`. All 38 heroes likely → status `ok` with 3 items each (since `MIN_MATCHES=100` is trivially met for all items across all heroes per probe data). Update HeroCard.test.tsx mock to reflect new shape. |

## Tasks

### Phase 1: Pipeline (no UI impact)

- [ ] 1. `scripts/generate-analytics.ts`: remove `MIN_WIN_RATE_DELTA` constant. Remove the `if (delta < MIN_WIN_RATE_DELTA) continue;` line. Keep `MIN_MATCHES_PLAYED = 100` and the dedup-against-curated filter. Sort surviving candidates by `delta` desc; take top-3 (`MAX_ITEMS_PER_HERO`). In the `reason` template, switch ASCII `-` to Unicode `−` for negative deltas; use explicit signed prefix (`+` / `−` / `''` for zero); template becomes ``${signedDelta} win rate over ${sampleSize} matches``. In `output.config`, write `minWinRateDelta: 0` (preserves field shape; value advertises "no gate").
- [ ] 2. `pnpm analytics:generate` locally. Verify console summary shows `ok: 38 empty: 0` (or near-zero — empty would only occur if a hero had zero items with matches≥100, which probe data rules out).

### Phase 2: Types & tokens

- [ ] 3. `src/lib/types.ts`: no changes needed (verify by reading; `AnalyticsCounterEntry.winRateDelta` + `sampleSize` are already there). Document this in the plan: status enum unchanged (`'ok' | 'empty' | 'api_error' | 'stale_preserved'`); `'empty'` semantics shifted (now means "no items passed `MIN_MATCHES=100`" — extremely rare).
- [ ] 4. `src/styles/tokens.css`: add `--color-delta-positive` (suggested: hsl-based muted green, e.g. `hsl(140 40% 55%)` — pick to match existing dark-theme contrast) and `--color-delta-negative` (muted red, e.g. `hsl(0 50% 60%)`). Match the existing tokens.css indentation + comment style.

### Phase 3: UI

- [ ] 5. `src/components/HeroCard.tsx`: add module-scope helpers:
  ```ts
  function formatDelta(d: number): string {
    const pp = Math.round(d * 1000) / 10; // pp with 1 decimal
    if (pp === 0) return '0.0pp';
    const sign = pp > 0 ? '+' : '−';
    return `${sign}${Math.abs(pp).toFixed(1)}pp`;
  }
  function formatSampleSize(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return String(n);
  }
  function trendFor(d: number): 'positive' | 'negative' | 'neutral' {
    if (d > 0.01) return 'positive';
    if (d < -0.01) return 'negative';
    return 'neutral';
  }
  ```
- [ ] 6. `src/components/HeroCard.tsx`: change `SECTION_LABELS.analytics` → `'Item Matchups'`. After the `<h3>` add `<p class="hero-card__section-sub">Win-rate delta vs average</p>`. Replace the existing `<For>` body with a stat-item wrapper:
  ```tsx
  <For each={analytics()}>{(entry) => (
    <div class="hero-card__stat-item" data-trend={trendFor(entry.winRateDelta)}>
      <ItemCard itemId={entry.item} class="hero-card__counter-item" />
      <span class="hero-card__stat-delta">{formatDelta(entry.winRateDelta)}</span>
      <span class="hero-card__stat-samples">{formatSampleSize(entry.sampleSize)}</span>
    </div>
  )}</For>
  ```
  Update fallback copy: `<p class="hero-card__section-empty">Item stats unavailable.</p>`.
- [ ] 7. `src/components/HeroCard.css`: add styles:
  ```css
  .hero-card__section-sub { font-size: var(--text-sm); color: var(--color-fg-muted); margin: 0 0 var(--space-1) 0; text-align: center; }
  .hero-card__stat-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-1); }
  .hero-card__stat-delta { font-size: var(--text-sm); font-variant-numeric: tabular-nums; color: var(--color-fg-muted); }
  .hero-card__stat-item[data-trend="positive"] .hero-card__stat-delta { color: var(--color-delta-positive); }
  .hero-card__stat-item[data-trend="negative"] .hero-card__stat-delta { color: var(--color-delta-negative); }
  .hero-card__stat-samples { font-size: var(--text-sm); color: var(--color-fg-muted); font-variant-numeric: tabular-nums; }
  ```
  Keep `.hero-card__counter-item` (still used by curated row). `tabular-nums` prevents jitter when sign / digit-width changes.

### Phase 4: Tests

- [ ] 8. `src/components/__tests__/HeroCard.test.tsx`: update analytics mock to include three rows that exercise positive (`+0.042`), negative (`-0.015`), and near-zero (`+0.005`) deltas with distinct sample sizes (e.g. `1_500_000`, `52_174`, `999`). Update existing empty-state assertion text to `'Item stats unavailable.'`. Add tests:
  - subtitle `'Win-rate delta vs average'` rendered;
  - `formatDelta` outputs `'+4.2pp'`, `'−1.5pp'`, `'0.5pp'` (all three rendered exactly);
  - `formatSampleSize` outputs `'1.5M'`, `'52K'`, `'999'`;
  - `data-trend` attribute set correctly on each stat-item (`positive`, `negative`, `neutral`);
  - empty-state still triggers when hero key absent from analytics (or `counters.length === 0`).
- [ ] 9. `e2e/smoke.spec.ts`:
  - Haze test (L113-116): assert `.hero-card__section-empty` NOT attached; assert `.hero-card__section--curated dl-item-card` count 3; assert `.hero-card__section--analytics dl-item-card` count 3; assert `.hero-card__section--analytics .hero-card__stat-delta` count 3; assert subtitle text "Win-rate delta vs average" visible.
  - Apollo test (L134-144): same assertions for analytics-only path; verify `.hero-card__section--curated` NOT attached; verify `.hero-card__stat-samples` count 3.

### Phase 5: Verification

- [ ] 10. `pnpm typecheck` clean.
- [ ] 11. `pnpm test --run` — all unit tests pass (39 prior + new additions).
- [ ] 12. `pnpm build` exit 0.
- [ ] 13. `pnpm bundle-size` — initial JS ≤ 60 KB gz (target: < 39 KB; estimate +~600 B for helpers + JSON growth), CSS ≤ 20 KB gz (target: < 2.5 KB; estimate +~250 B for new BEM classes).
- [ ] 14. `pnpm exec playwright install --with-deps chromium && pnpm test:e2e` — all 9 E2E pass.
- [ ] 15. Visual QA at 1280×720 via Playwright: load `/#/heroes`, click Haze → screenshot. Verify (a) no horizontal scrollbar on analytics row, (b) delta + sample-size visible under each icon, (c) no clipping, (d) colors discriminate positive/negative/neutral. Save to `.omo/evidence/heroes-item-matchups.png`.

## Final Verification Wave

- [ ] F1. **Plan compliance audit** — `oracle` consultation. Confirm: all 6 adversarial-decision resolutions implemented as specified; no scope creep; no unimplemented stubs; the `MIN_WIN_RATE_DELTA` constant fully removed (not just set to 0 in code); the new helpers live in `HeroCard.tsx` (not a new lib file — minimalism); the Solid rules respected (no destructured props, `<For>` not `.map()`, `<Show>` not ternary).
- [ ] F2. **Code quality review** — `oracle` consultation. Confirm: BEM kebab-case adherence; no inline `style=`; no `!important`; no `as any` / `@ts-ignore`; helpers pure + unit-tested; `tabular-nums` prevents layout shift on sign change; `data-trend` attribute selectors avoid the cascade-specificity foot-gun.
- [ ] F3. **Manual / visual QA** — Playwright at 1280×720. Visit `/#/heroes`. Click Haze (expect three near-zero / negative deltas with neutral/red coloring). Click Priest (expect three +5pp+ deltas with green coloring). Click Vindicta (mixed). Verify badges legible at native zoom; verify analytics row does not push curated row off-card; verify tooltip on item icon still works.
- [ ] F4. **Scope fidelity** — confirm: no commits made; no files outside the file map touched; the data regen happened locally + the JSON diff is reviewable in git (38 hero entries all transition to `ok`); pages.yml regen step unchanged; bundle still passes CI gate; statistician's rejected Z-gate not implemented.

## Acceptance Criteria

1. Haze (and every other previously-empty hero) shows 3 analytics items with delta + sample size; the "Not enough match data." message NEVER renders for a hero with data — only `'Item stats unavailable.'` if the entire fetch failed.
2. Negative deltas display with Unicode minus and red color; positive deltas display with plus and green color; near-zero (within ±1pp) renders neutral muted text.
3. Section header reads "Item Matchups" with subtitle "Win-rate delta vs average".
4. CI green: `pnpm lint && pnpm typecheck && pnpm test --run && pnpm build && pnpm bundle-size && pnpm test:e2e` all pass.
5. Bundle gates: initial JS still under 60 KB gz, CSS still under 20 KB gz.
6. No `MIN_WIN_RATE_DELTA` constant survives in `scripts/generate-analytics.ts` (the gate is gone, not commented out).

## Out of Scope (explicit non-goals)

- Statistical significance gating (Z-test, Wilson interval, etc.) — rejected per user's #3 premise; statistician's argument is preserved in `.omo/notepads/counters-analytics-v2/decisions.md` for future revisit.
- Methodology rework of the baseline (currently global item win rate; statistician flagged contamination by the matchup itself) — out of scope for this iteration; addresses a deeper concern than the user requested.
- Raising `MIN_MATCHES_PLAYED` above 100 — rejected because sample-size badge gives users the variance signal directly.
- Removing the curated section, renaming `class_name`s, or changing the `<dl-item-card>` library integration.
