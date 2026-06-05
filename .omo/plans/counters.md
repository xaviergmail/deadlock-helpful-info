# Counters Framework — Hero → Item (Phase 1) + Future Expansion

## TL;DR

> **Quick Summary**: Build a hero→item counter feature on the existing `/heroes` page that shows the top 3 counter items inline under each `HeroCard`. Data is curated in `data/counters/heroes/*.yaml`, validated + baked to `src/generated/counters.json` at build time, and consumed by Solid components. `@deadlock-api/ui-core` web components (`<dl-item-card>`) are wrapped in local adapters at `src/components/deadlock-ui/` to isolate the blast radius of any future v2 breaking changes. The framework is extensible to hero→hero and ability→hero counters later via schema versioning + a generic `target: { type, id }` field shape.
>
> **Deliverables (Phase 1)**:
> - `src/components/deadlock-ui/DeadlockUiProvider.tsx` + `ItemCard.tsx` + `types.ts` (adapter layer)
> - `src/lib/types.ts` (add `Counter`, `CounterEntry`, `HeroCounters`, `CountersData`)
> - `data/counters/heroes/*.yaml` (5 popular heroes curated first: Abrams, Haze, Bebop, Vindicta, Yamato)
> - `scripts/generate-counters.ts` (one-shot regen tool, NOT CI-wired in Phase 1)
> - `scripts/validate-counter-data.ts` (CI gate)
> - `src/generated/counters.json` (baked output)
> - `src/components/HeroCard.tsx` (extend to render top 3 `<ItemCard>` below hero)
> - `src/components/AppShell.tsx` (static shell only)
> - Solid JSX intrinsic typing for `<dl-*>` elements
> - E2E coverage in `e2e/smoke.spec.ts`
>
> **Estimated Effort**: Medium-Large (~14 tasks across 5 phases + Phase 0 spike + final review wave)
> **Parallel Execution**: YES — multiple waves
> **Critical Path**: 0 (spike) → 1 (adapter) → 2 (types) → 3 (data pipeline) → 4 (HeroCard integration) → 5 (curation) → F1–F4 → user okay
>
> **Future Phases (separate plans)**: hero→hero counters, ability→hero counters, item→ability counters, analytics-derived suggestions, full schema v2 migration.

---

## Context

### Original Request

Build a framework for hero→item counters as the primary deliverable, with future support for hero/ability counters. Must integrate `@deadlock-api/ui-core` for item rendering (approved exception in `AGENTS.md`). Must run well in the Steam Overlay (low RAM, slow GPU, possibly 15 FPS).

### Hyperplan Round 1 Synthesis

The `counter-framework-planning` team (5 members) produced 4 hostile proposals. Synthesized below:

| Member | Position | Adopted? |
|---|---|---|
| **UX Heretic** | "Hover-Strike Hero Grid" — inline tile expansion, no router/overlay, single global tooltip, tap-to-reveal fallback for Steam Overlay | **YES** (entire UX pattern) |
| **Long-Horizon** | Hybrid curated-first framework — YAML source of truth, schema versioning, adapter pattern for ui-core, CI freshness gates | **YES** (entire data architecture) |
| **Architect** | Type-system purity, layered architecture, contracts at boundaries, no `any` | **YES** (constraints throughout) |
| **Pragmatist** | Smallest correct change, MVP first, no premature abstraction, ship 5 heroes before all 38 | **YES** (phase ordering) |

**Tension resolution**: UX heretic + pragmatist both want minimal change → extend existing `HeroCard` rather than introduce a new "FlippableTile" component. Long-horizon wants schema versioning + migrations → but pragmatist objects this is over-engineering for MVP → **resolution**: ship Phase 1 with `schemaVersion: 1` field present but no migration code (no v2 yet); add migration scaffolding only when v2 is needed.

### Research Findings

**Codebase inventory** (verified via `explore`):
- `src/lib/types.ts` has `Hero` + `HeroImages` only. No `Item`, `Ability`, or `Counter` types.
- `@deadlock-api/ui-core` v1.4.0 is in `package.json` but NOT imported anywhere in `src/`.
- `/heroes` page already renders `HeroCard` + inline `HeroGrid` (commit `24a7a75`), no overlay.
- 38 player-selectable heroes baked in `src/generated/heroes.json` after filtering `disabled` + `in_development`.

**`@deadlock-api/ui-core` v1.4.0 facts** (verified via `librarian`):
- StencilJS + Shadow DOM web components
- 5 components: `<dl-item-card>`, `<dl-item-grid>`, `<dl-item-tooltip>`, `<dl-provider>`, `<dl-shop-panel>`
- `<dl-item-card>` accepts `item-id` | `item-class-name` | `item-data` (pre-loaded skips fetch)
- `<dl-provider>` is OPTIONAL (auto-fetches `GET api.deadlock-api.com/v1/assets/items?language=X` on mount)
- CSS variables for theming, NO `::part()`
- **Solid gotchas**: pass numbers/booleans via `prop:` syntax; must declare JSX intrinsic elements manually (no Solid example in upstream docs); boolean `false` attribute is truthy in HTML

**Counter data sources audit** (verified via `librarian`):
- `GET /v1/analytics/hero-counter-stats` — directional hero matchups, raw `wins`/`matches_played`. USABLE for hero→hero future phase.
- `GET /v1/analytics/item-stats?hero_id=N&enemy_hero_ids=...` — item perf vs enemies. USABLE for hero→item suggestions.
- Item JSON has counter-relevant properties (`HealAmp*`, `Slow*`, `Debuff*`, `TechResist`, `BulletResist`) but NO category tags — semantic categories ("anti-heal", "silence", "slow") require **manual curation**.
- Wiki has NO structured counter data.
- NO ability-vs-ability data exists anywhere.

### Identified Risks (with mitigations)

1. **`<dl-item-card>` integration friction**: StencilJS web components with Solid + verbatimModuleSyntax may need custom JSX typing.
   → **Mitigation**: Phase 0 spike validates this BEFORE any other work.
2. **Bundle growth from ui-core**: Could push us over the 60 KB gzipped initial JS budget.
   → **Mitigation**: Phase 0 measures impact; if too large, lazy-load ui-core or use direct CDN images.
3. **YAML curation effort**: 38 heroes × N counter items is real ongoing work.
   → **Mitigation**: Phase 5 only curates 5 popular heroes for "real-world useful" MVP; full coverage in a separate plan.
4. **Steam Overlay hover jank**: `:hover` can be sticky in the outdated Chromium frame.
   → **Mitigation**: Tap-to-reveal fallback (click toggles `.is-active` class) on top of hover.
5. **DOM node bloat**: 38 heroes × 3 items = 114 web components.
   → **Mitigation**: Render `<ItemCard>` only for currently visible heroes (in MVP, this is just all 38 cards × 3 = 114 — measure perf; if bad, lazy-mount via `<Show>` on hover).
6. **ui-core v2 breaking changes**: Direct usage everywhere = scattered rewrite.
   → **Mitigation**: All `<dl-*>` calls hidden behind `src/components/deadlock-ui/*` adapters. Blast radius = one folder + one smoke test.
7. **Curated data goes stale across patches**: Old counter recommendations become wrong.
   → **Mitigation**: `lastReviewedPatch` field per entry + CI freshness warnings.

---

## Work Objectives

### Core Objective (Phase 1)

Ship a working hero→item counter feature on `/heroes` that:
- Shows top 3 counter items inline below each `HeroCard` (for 5 curated heroes in Phase 1)
- Uses the built-in `<dl-item-tooltip>` behavior inside `<dl-item-card>`
- Renders correctly in Steam Overlay (tap-to-reveal fallback)
- Stays under the 60 KB gzipped initial JS budget
- Has typed contracts end-to-end (no `as any`, no `@ts-ignore`)

### Extensibility Objective

Lay groundwork (without building it) for future:
- Hero→hero counters
- Ability→hero counters
- Item→ability counters
- Analytics-derived "emerging counter" suggestions (separate UI lane)

Specifically: the YAML schema has a `schemaVersion` field present from day one, and types use a `target: string` (item slug) shape that can be evolved to `target: { type: 'item' | 'hero' | 'ability', id: string }` in v2 without breaking Phase 1 consumers.

### Concrete Deliverables

#### Adapter Layer (Phase 1)

```
src/components/deadlock-ui/
  DeadlockUiProvider.tsx   # Optional wrapper for <dl-provider>; defaults to no provider
  ItemCard.tsx             # Wraps <dl-item-card>; takes { itemId, compact?, onHover? }
  types.ts                 # Solid JSX intrinsic declarations for <dl-*> elements
```

#### Type Layer (Phase 1)

```typescript
// src/lib/types.ts (additions, NOT replacements)

/** Counter data schema version. v1 = hero→item only. Future v2 generalizes target. */
export type CounterSchemaVersion = 1;

/** One counter entry: "buy this item to counter that hero". */
export interface CounterEntry {
  /** Item slug, e.g. "decay", "metal_skin". MUST match an item in the Deadlock API. */
  item: string;
  /** Confidence in this recommendation. */
  confidence: 'high' | 'medium' | 'low';
  /** Human-readable reason; shown in tooltip. */
  reason: string;
  /** Patch date this entry was last reviewed, ISO YYYY-MM-DD. */
  lastReviewedPatch: string;
}

/** All counters for one hero. */
export interface HeroCounters {
  schemaVersion: CounterSchemaVersion;
  /** Hero slug (matches `class_name` in heroes.json without the "hero_" prefix). */
  hero: string;
  /** Items that counter this hero, in display order (top 3 shown by default). */
  itemCounters: CounterEntry[];
}

/** Generated runtime data: { [heroClassName]: HeroCounters }. */
export type CountersData = Record<string, HeroCounters>;
```

#### Data Layer (Phase 1)

```
data/counters/
  schema/
    v1.json                # JSON Schema for HeroCounters (used by validate-counter-data.ts)
  heroes/
    abrams.yaml
    bebop.yaml
    haze.yaml
    vindicta.yaml
    yamato.yaml
```

YAML format (example: `data/counters/heroes/haze.yaml`):

```yaml
schemaVersion: 1
hero: haze
itemCounters:
  - item: metal_skin
    confidence: high
    reason: Blocks Bullet Dance damage during her ult.
    lastReviewedPatch: 2026-06-01
  - item: knockdown
    confidence: high
    reason: Interrupts Bullet Dance channel.
    lastReviewedPatch: 2026-06-01
  - item: return_fire
    confidence: medium
    reason: Reflects rapid bullet attacks back at her.
    lastReviewedPatch: 2026-06-01
```

#### Scripts (Phase 1)

```
scripts/
  generate-counters.ts     # YAML → src/generated/counters.json (one-shot, manual)
  validate-counter-data.ts # CI gate: schema valid, all hero refs exist in heroes.json
```

`generate-counters.ts` is invoked manually like `node --experimental-strip-types scripts/generate-counters.ts`. It is NOT run on every build in Phase 1 (matches `fetch-heroes.ts` convention). CI gate is via `validate-counter-data.ts` only.

#### UI Integration (Phase 1)

- `src/components/AppShell.tsx`: static shell only.
- `src/components/HeroCard.tsx`: extend to render `<For each={topThreeCounters(hero)}>` block of `<ItemCard>` components inline below the hero image.
- Tap-to-reveal fallback: `<ItemCard>` toggles `.is-active` class on click for touch users.

---

## TODOs

### Phase 0: Spike — Validate `@deadlock-api/ui-core` integration with Solid

- [x] 0. Spike: Add `<dl-item-card item-id="decay" />` to a throwaway page (`src/pages/spike-counters.tsx` — to be deleted after spike). Verify:
  - Web component renders (item icon visible in browser)
  - TypeScript compiles with strict mode + `verbatimModuleSyntax` (JSX intrinsic declared)
  - Bundle size delta is acceptable (target: <10 KB gzipped added to initial JS)
  - StencilJS shadow DOM does NOT block our global CSS resets in unexpected ways
  - Solid's `prop:` syntax works for any boolean/number props (none needed for `<dl-item-card>` MVP, but worth knowing)
  - Verify in dev server (`pnpm dev`) AND production build (`pnpm preview`)
  - **Exit criteria**: spike commit shows working item card, bundle-size check passes, no console errors.
  - **Cleanup**: Delete `src/pages/spike-counters.tsx` and route entry in commit message; the spike is for evidence, not retention.

### Phase 1: Adapter Layer

- [x] 1. Create `src/components/deadlock-ui/types.ts` with Solid JSX intrinsic declarations for `<dl-item-card>`, `<dl-item-tooltip>`, `<dl-provider>`. Use `module 'solid-js' { namespace JSX { interface IntrinsicElements { ... } } }` pattern.
- [x] 2. Create `src/components/deadlock-ui/DeadlockUiProvider.tsx`. Accepts `{ children, language? }` props. For MVP, renders children only (no `<dl-provider>` wrap — auto-fetch on individual components works fine). Future flag for when global language switching is needed.
- [x] 3. Create `src/components/deadlock-ui/ItemCard.tsx`. Wraps `<dl-item-card item-id={props.itemId} />`. Props: `{ itemId: string; class?: string }`. Internal: handles click/keydown for `.is-active` toggle.
- [x] 4. Add `src/components/deadlock-ui/__tests__/ItemCard.test.tsx` — render with itemId prop, assert `<dl-item-card>` exists in DOM with correct attribute. Use Vitest + `@solidjs/testing-library`. (Web component behavior NOT tested at unit level — that's covered in Phase 0 spike + Phase 6 E2E.)
- [x] 5. NO `ItemTooltip` wrapper component — `<dl-item-card>` handles its own tooltip internally.

### Phase 2: Type + Schema

- [x] 6. Extend `src/lib/types.ts` with `CounterSchemaVersion`, `CounterEntry`, `HeroCounters`, `CountersData` (per spec in Work Objectives). No deletions of existing types. Verify `pnpm typecheck` passes.
- [x] 7. Create `data/counters/schema/v1.json` — JSON Schema for `HeroCounters`. Required: `schemaVersion: 1`, `hero: string`, `itemCounters: array`. Each item: `item, confidence (enum), reason, lastReviewedPatch (YYYY-MM-DD pattern)`.

### Phase 3: Data Pipeline

- [x] 8. Create `scripts/generate-counters.ts`. Reads all `data/counters/heroes/*.yaml`, validates each against `v1.json` schema, normalizes to `CountersData` shape (`{ [hero]: HeroCounters }`), writes `src/generated/counters.json`. Run with `node --experimental-strip-types scripts/generate-counters.ts`. Exit non-zero on validation failure; leaves existing `counters.json` untouched on error.
- [x] 9. Create `scripts/validate-counter-data.ts`. CI gate: validates YAML against schema, verifies every `hero` slug exists in `src/generated/heroes.json`, verifies no duplicate items per hero. Exit non-zero on failure. Used in CI workflow.
- [x] 10. Add `counters:validate` step to `.github/workflows/ci.yml` (right after `typecheck`, before `test`).
- [x] 11. Add `pnpm` script aliases: `"counters:generate": "node --experimental-strip-types scripts/generate-counters.ts"` and `"counters:validate": "node --experimental-strip-types scripts/validate-counter-data.ts"` to `package.json`.

### Phase 4: UI Integration

- [x] 12. ~~Create `src/lib/tooltip-state.ts`~~ — REMOVED: superseded by library's built-in tooltip; file deleted
- [x] 13. ~~Extend `src/components/AppShell.tsx`~~ — REMOVED: superseded by library's built-in tooltip; AppShell reverted to pre-counter state
- [x] 14. Extend `src/components/HeroCard.tsx`: import `ItemCard` + generated `counters.json`. Below the existing hero image, render a `<For>` block of top 3 counter items (use `counters[hero.class_name]?.itemCounters.slice(0, 3) ?? []`). For heroes with no curated counters (most heroes in Phase 1), render nothing.
- [x] 15. Add counter row styles to `src/components/HeroCard.css` (create if absent): BEM kebab-case classes (`.hero-card__counters`, `.hero-card__counter-item`), horizontal flex layout, small gaps. Match existing card design tokens from `tokens.css`.
- [x] 16. Add tap-to-reveal fallback: `<ItemCard>` toggles `.is-active` class on click. CSS rule `.is-active` triggers the same hover effect.
- [x] 17. Add unit test `src/components/__tests__/HeroCard.test.tsx` — for a hero with curated counters, assert 3 `<dl-item-card>` elements exist; for a hero without, assert 0.

### Phase 5: Curation (5 Heroes MVP)

- [x] 18. Curate `data/counters/heroes/abrams.yaml` — top 3 items + reasons + lastReviewedPatch. Sources: wiki + community discord meta. (Curator may be sub-agent or user; this task is "produce a YAML file", not "research from scratch".)
- [x] 19. Curate `data/counters/heroes/bebop.yaml` — same.
- [x] 20. Curate `data/counters/heroes/haze.yaml` — same.
- [x] 21. Curate `data/counters/heroes/vindicta.yaml` — same.
- [x] 22. Curate `data/counters/heroes/yamato.yaml` — same.
- [x] 23. Run `pnpm counters:generate` to bake → `src/generated/counters.json`. Verify no validation errors.
- [x] 24. Commit `src/generated/counters.json` (matches convention with `src/generated/heroes.json`).

### Phase 6: Verification

- [x] 25. Add `e2e/smoke.spec.ts` test: navigate to `/heroes`, click Haze, assert 3 `dl-item-card` elements render in `.hero-card__counters`. (Tooltip behavior is handled by the library's Shadow-DOM built-in tooltip and is not asserted here.)
- [x] 26. Manual QA: run `pnpm dev`, verify on `/heroes` that 5 curated heroes show counter items, hover works, tap works (browser dev tools touch emulation OK), bundle size still under 60 KB gzipped. **VERIFIED**: live browser run via `verify-counters.mjs` (chromium headless, real Deadlock API). Vindicta hover produces `wrapperVisibility: "visible"`, `hasTooltipEl: true`, `tooltipShadowTextLen: 234` (Knockdown tooltip body rendered); screenshot `/tmp/opencode/screenshots/02-vindicta-hover.png` shows the rendered tooltip. Tap-toggle automated in `e2e/smoke.spec.ts:121-129`. Bundle size 37656 B gzip (61.3% of 60 KB budget). 0 console errors during run.
- [~] 27. Steam Overlay smoke test (manual, if user has Deadlock installed): open the deployed page in Steam Overlay, verify usability. (Optional — defer to user.) **BLOCKED ON USER**: requires Deadlock installed in the user's environment; explicitly marked optional in the original plan.

## Final Verification Wave

- [x] F1. Plan Compliance Audit — `oracle` consultation. PASS_WITH_NOTES after commit `5490380`. Initial FAIL on Must Have 9 (E2E lacked hover/tap assertion); fixed by adding dispatched-click + `.is-active` toggle assertion in `e2e/smoke.spec.ts:113-125`. Note: hover-tooltip is library-owned (Shadow DOM) and covered by F3 manual QA.
- [x] F2. Code Quality Review — `oracle` consultation. PASS after commit `5490380`. Initial FAIL on 4 items (HeroCard test false positive, dead `DeadlockUiProvider`, unused `DeadlockUiProviderProps`, 4 unused JSX intrinsics); all resolved with no regressions.
- [x] F3. Manual QA — `pnpm dev`, browse `/heroes`, hover/tap each curated hero's counters, verify tooltip works, check console for errors, verify bundle-size CI passes. **VERIFIED**: closed out three bugs found during this pass — (1) Vindicta "item not found" due to non-canonical slugs in YAMLs → all 5 heroes updated to canonical `upgrade_*` class_names, schema regex `^upgrade_[a-z0-9_]+$` enforces it; (2) click made items disappear → downstream of bug 1, resolved by the same fix; (3) hover showed no tooltip → added per-card `tooltip-trigger="hover"` attribute on `<dl-item-card>` in `src/components/deadlock-ui/ItemCard.tsx` (rejected `<dl-provider>` wrapper after diagnosing Stencil's `/* @vite-ignore */` dynamic-import 404 in production builds). Final live-browser verification PASS; 0 console errors; bundle 37656 B; 8/8 E2E + 34/34 unit green.
- [x] F4. Scope Fidelity — combined with F1 audit. PASS. `schemaVersion: 1` literal type + field present end-to-end; adapter layer isolated to `src/components/deadlock-ui/`; `CounterEntry.item: string` is current v1 shape (no premature `target: { type, id }` union); no migration scripts; pivot deletions confirmed clean.

---

## Definition of Done

- [ ] All Phase 0 spike work cleaned up (no `src/pages/spike-counters.tsx`)
- [ ] `pnpm check && pnpm typecheck && pnpm test --run && pnpm build && pnpm bundle-size` all exit 0
- [ ] `pnpm test:e2e` exits 0 (counter scenarios pass)
- [ ] `pnpm counters:validate` exits 0
- [ ] Initial JS gzipped < 60 KB (budget enforced in CI)
- [ ] Navigating to `/#/heroes` shows 5 heroes with counter items inline
- [ ] Hovering an item shows tooltip; tapping (touch) shows tooltip
- [ ] All "Must Have" items implemented (adapter layer, types, data pipeline, UI integration, 5 curated heroes)
- [ ] All "Must NOT Have" items absent: NO direct `<dl-*>` usage outside `src/components/deadlock-ui/`; NO `as any` / `@ts-ignore`; NO custom `fetch()` to external APIs; NO `<dl-item-card>` mounted before user interaction OR mounted for heroes without curated data
- [ ] F1–F4 reviewers all APPROVE (or APPROVE_WITH_NOTES with notes addressed)
- [ ] User has given explicit approval to ship

## Must Have

1. `src/components/deadlock-ui/` adapter layer (3 files: types, provider, ItemCard) — `ItemTooltip` removed in favor of library's built-in tooltip
2. `src/lib/types.ts` extended with `CounterEntry`, `HeroCounters`, `CountersData`, `CounterSchemaVersion`
3. `data/counters/schema/v1.json` + `data/counters/heroes/*.yaml` (5 heroes)
4. `scripts/generate-counters.ts` + `scripts/validate-counter-data.ts`
5. `src/generated/counters.json` (baked, committed)
6. `src/components/HeroCard.tsx` renders top 3 inline counter items for curated heroes
7. `@deadlock-api/ui-core`'s `<dl-item-card>` handles its own built-in tooltip on hover (no custom tooltip wrapper)
8. CI step `pnpm counters:validate` (in `ci.yml`)
9. E2E test for hover/tap counter UX
10. `pnpm` script aliases `counters:generate`, `counters:validate`
11. `lastReviewedPatch` field tracked on every curated entry
12. `schemaVersion: 1` field present (future-proofing)

## Must NOT Have

1. NO direct usage of `<dl-*>` web components outside `src/components/deadlock-ui/*` — all access goes through adapter wrappers
2. NO `as any`, `@ts-ignore`, or `@ts-expect-error` anywhere
3. NO custom `fetch()` calls to `api.deadlock-api.com` or any external API (ui-core handles its own internally; this is the approved exception per AGENTS.md)
4. NO `<dl-item-card>` mounted at module-eval time — only inside Solid components reactive scope
5. NO custom `<dl-item-tooltip>` instances — `<dl-item-card>` from `@deadlock-api/ui-core` manages its own tooltip
6. NO router navigation for the counter feature — entirely inline on `/heroes`
7. NO `/heroes/:id` detail page — that is a separate future plan
8. NO React-style `.map()` in JSX — use `<For>`; NO ternaries for conditional rendering — use `<Show>` / `<Switch>`
9. NO destructured props in any new component
10. NO inline styles — all CSS goes in `.css` files co-located with components (per existing convention introduced by HeroPicker)
11. NO runtime YAML parsing — YAML is build-time only; runtime consumes JSON
12. NO migration code for schema v2 — defer until v2 actually needed
13. NO curation of all 38 heroes in this plan — Phase 5 only does 5 popular ones; full curation is a separate effort
14. NO global `:hover` styles applied to `<dl-*>` elements from outside the adapter — Shadow DOM blocks them anyway, but make the boundary explicit
15. NO bundle budget violations — initial JS gzipped MUST stay under 60 KB; if ui-core pushes us over, Phase 0 spike triggers a fallback plan
16. NO Phase 5 curation written by AI without source citation — every counter MUST cite "wiki", "discord meta thread", or "patch notes" in commit message (NOT in the YAML — keep YAML clean)
17. NO speculative analytics integration in this plan — analytics-derived counters are a separate future plan
18. NO `<dl-provider>` at AppShell level for Phase 1 — individual components auto-fetch; provider is a Phase ≥2 optimization if/when needed
19. NO breaking changes to existing `Hero` or `HeroImages` types — additive only

## Future Phases (not in this plan)

- **Phase 7+**: Curate remaining 33 heroes
- **Phase 8+**: Add `confidence`-based visual styling (high = solid, medium = outline, low = faded)
- **Phase 9+**: Analytics-derived "emerging counter" suggestions (separate UI lane, never overwrites curated)
- **Phase 10+**: Hero→hero counters (schema v2 with `target: { type, id }`)
- **Phase 11+**: Ability→hero counters (requires ability data pipeline first)
- **Phase 12+**: Item→ability counters (most niche, lowest priority)
- **Phase 13+**: CI freshness alarms (`lastReviewedPatch` > 30 days → warn)
- **Phase 14+**: Bulk auto-migration when schema v2 ships (`scripts/migrations/counters/v1-to-v2.ts`)
