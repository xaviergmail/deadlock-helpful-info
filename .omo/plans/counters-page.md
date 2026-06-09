# Counters Page: Dual-Hero Selection with Shared Counter Highlighting

## TL;DR

> **Quick Summary**: Replace the heroes page (`/heroes`) with a counters page (`/counters`) featuring dual-hero selection (max 2), shared counter item highlighting, and a two-panel layout. Left panel shows up to 2 hero detail cards stacked vertically; right panel shows a scrollable hero grid. Shared items (same item counters both heroes) are highlighted with accent border + "×2" badge.
>
> **Deliverables**:
> - `src/pages/counters.tsx` — new CountersPage with dual-hero selection signal
> - `src/components/CounterDetailCard.tsx` + `.css` — detail card (icon + name + curated + analytics + shared highlight)
> - `src/lib/counters.ts` — shared-item computation utility
> - Refactored `HeroGrid.tsx` (multi-select + disabled state) and `HeroTile.tsx` (disabled prop)
> - Updated `app.tsx` (`/counters` route, `/heroes` redirect) + `routes.ts` (nav label)
> - Updated `global.css` + `tokens.css` (counters page layout, new design tokens)
> - Deleted: `heroes.tsx`, `HeroCard.tsx/css`, `HeroPicker.tsx/css` + their tests
> - Updated unit tests + e2e tests for all modified/new components
>
> **Estimated Effort**: Medium
> **Parallel Execution**: YES — 4 waves
> **Critical Path**: Task 1 (utility) → Task 5 (CounterDetailCard) → Task 6 (CountersPage) → Task 8 (route/cleanup) → Task 9 (e2e)

---

## Context

### Original Request
Convert the heroes page into a "counters" page with: smaller hero icons on the right side in a scrollable list; up to 2 heroes selectable at once (clicking fills first slot then second); when 2 are selected, other hero buttons become disabled; clicking a selected hero unselects it; unselecting the top hero promotes the bottom hero; shared counter items (same item counters both heroes) are highlighted.

### Interview Summary
**Key Discussions**:
- **Layout**: Two-panel — selected heroes stacked vertically on the left, scrollable hero grid on the right
- **Highlight style**: Accent border (`--color-accent`) + "×2" text badge on shared items
- **Counter display**: Separate sections per hero (curated + analytics), not merged
- **Route**: `/heroes` → `/counters`, nav label "Counters"
- **Empty state**: Two placeholder slots with instructional text
- **Test strategy**: Tests-after (UI-heavy, iterate first)

**Research Findings**:
- `heroes.tsx` is 18 lines — thin shell, easy to replace
- HeroGrid uses `role="listbox" / role="option"` with `aria-selected`
- `HeroPicker.tsx` (107 lines modal overlay) is NOT used on the heroes page — safe to delete
- CSS ownership is messy: portrait styles in `HeroPicker.css`, section styles in `HeroCard.css`
- Counter data keyed by `class_name` (with `hero_` prefix)
- Analytics data uses double-cast `as unknown as AnalyticsCountersFile` — needs cleanup
- Bundle budget: 60 KB JS gz (currently ~14 KB used), 20 KB CSS gz (currently ~0.8 KB used)

### Metis Review
**Identified Gaps** (all addressed):
- HeroPicker.tsx is unused — DELETE, don't repurpose ✅
- Selection UX contradiction (disabled vs clickable heroes) — resolved: selected heroes remain clickable (toggle off), only unselected heroes disabled when 2 selected ✅
- Same hero double-selected — prevented: selected heroes cannot be selected again ✅
- Shared items computed independently per section (curated intersection in curated, analytics in analytics) ✅
- Route redirect from `/heroes` to `/counters` needed ✅
- Single hero state shows counters with "select another hero" prompt ✅

---

## Work Objectives

### Core Objective
Replace the heroes page with a counters page featuring dual-hero selection, shared counter highlighting, and a two-panel layout optimized for Steam Overlay at 1280×720.

### Concrete Deliverables
- `src/pages/counters.tsx` — new page component with dual-hero signal (`createSignal<[Hero | undefined, Hero | undefined]>`)
- `src/pages/counters.css` — two-panel layout CSS (left detail panel, right scrollable grid)
- `src/components/CounterDetailCard.tsx` + `CounterDetailCard.css` — hero detail card (icon + name + curated + analytics sections + shared-item badge)
- `src/lib/counters.ts` — `computeSharedItems()` utility (intersection of item slugs per section)
- `src/components/HeroGrid.tsx` — refactored with `selectedIds: number[]` + `disabledIds: number[]`
- `src/components/HeroTile.tsx` — refactored with `disabled` prop
- `src/styles/tokens.css` — new tokens for shared highlight
- `src/app.tsx` — `/counters` route + `/heroes` redirect
- `src/routes.ts` — nav label "Counters"
- Updated `src/styles/global.css` — `.page-counters` layout

### Definition of Done
- [ ] `pnpm typecheck` → 0 errors
- [ ] `pnpm lint` → 0 errors
- [ ] `pnpm test --run` → all tests pass (unit + updated tests)
- [ ] `pnpm build` → exit 0
- [ ] `pnpm bundle-size` → 0 violations (under 60 KB JS gz, 20 KB CSS gz, no chunk over 100 KB gz)
- [ ] `pnpm test:e2e` → all e2e scenarios pass
- [ ] Navigate to `/#/counters` → two-panel layout renders
- [ ] `/heroes` redirects to `/counters`

### Must Have
- Dual-hero selection (max 2 heroes, click fills first empty slot)
- Selected heroes remain clickable in grid (click to unselect)
- Unselected heroes disabled when 2 slots filled (opacity + pointer-events:none + aria-disabled)
- Unselect Slot 1 → Slot 2 hero promotes to Slot 1
- Shared counter items highlighted with accent border + "×2" badge (per section independently)
- Two-panel layout: detail cards left, hero grid right (scrollable)
- `/counters` route with `/heroes` redirect
- Hero detail card uses `icon_image_small` + name (NOT 128px portrait)
- All current accessibility patterns preserved (listbox/option roles, aria-selected, focus-visible)
- Bundle stays under budget

### Must NOT Have (Guardrails)
- No search/filter on the hero grid
- No URL state for hero selections (`?hero1=&hero2=`)
- No localStorage persistence
- No CSS animations/transitions for slot changes
- No comparison summary section ("N shared counters")
- No mobile/responsive breakpoints (1280×720 Steam Overlay only)
- No repurposing of HeroPicker — DELETE it
- No keyboard arrow navigation beyond existing listbox pattern
- No changes to counter data pipeline or API calls
- No changes to `@deadlock-api/ui-core` ItemCard component
- No new npm dependencies
- No destructured props (Solid.js rule)
- No `.map()` in JSX (use `<For>`)
- No ternaries for conditional rendering (use `<Show>` / `<Switch>`)
- No `as any` or `@ts-ignore`
- No inline styles or `!important`

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (Vitest + Playwright)
- **Automated tests**: Tests-after
- **Framework**: Vitest 2.1 + @solidjs/testing-library 0.8 (unit), Playwright 1.50 (e2e)
- **If TDD**: N/A (tests-after)

### QA Policy
Every task includes agent-executed QA scenarios. Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright — Navigate, interact, assert DOM, screenshot
- **Unit logic**: Use `pnpm test --run` — Run specific test files
- **API/Backend**: Use Bash (curl) — Not applicable
- **Library/Module**: Use Bash (node) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately — foundation + cleanup):
├── Task 1: Shared-item computation utility + tests [quick]
├── Task 2: Design tokens + CounterDetailCard CSS + CountersPage CSS [quick]
├── Task 3: Delete HeroPicker files (unused component) [quick]
└── Task 4: HeroGrid + HeroTile refactor + test updates [unspecified-high]

Wave 2 (After Wave 1 — core components):
├── Task 5: CounterDetailCard component + tests [deep]
└── Task 6: CountersPage component + tests [deep]

Wave 3 (After Wave 2 — integration + cleanup):
├── Task 7: Route/nav/cleanup — wire routes, delete old files, add redirect [quick]
└── Task 8: CSS consolidation — global.css, remove .page-heroes [quick]

Wave 4 (After Wave 3 — e2e testing):
└── Task 9: E2E tests — full counters page scenarios [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
└── Task F4: Scope fidelity check (deep)
→ Present results → Get explicit user okay

Critical Path: Task 1 → Task 5 → Task 6 → Task 7 → Task 9 → F1-F4 → user okay
Parallel Speedup: ~55% faster than sequential
Max Concurrent: 4 (Wave 1)
```

### Dependency Matrix

| Task | Depends On | Blocks |
|------|-----------|--------|
| 1 | — | 5, 6 |
| 2 | — | 5, 6 |
| 3 | — | 7 |
| 4 | — | 6 |
| 5 | 1, 2 | 6 |
| 6 | 4, 5 | 7 |
| 7 | 6 | 8, 9 |
| 8 | 7 | 9 |
| 9 | 8 | F1-F4 |

### Agent Dispatch Summary

- **Wave 1**: 4 — T1 `quick`, T2 `quick`, T3 `quick`, T4 `unspecified-high`
- **Wave 2**: 2 — T5 `deep`, T6 `deep`
- **Wave 3**: 2 — T7 `quick`, T8 `quick`
- **Wave 4**: 1 — T9 `unspecified-high`
- **FINAL**: 4 — F1 `oracle`, F2 `unspecified-high`, F3 `unspecified-high`, F4 `deep`

---

## TODOs

- [x] 1. Shared-item computation utility + tests

  **What to do**:
  - Create `src/lib/counters.ts` with a `computeSharedItems()` function
  - Function takes two hero class names and returns curated intersection + analytics intersection independently
  - Curated intersection: item slugs present in BOTH heroes' `itemCounters` arrays in `counters.json`
  - Analytics intersection: item slugs present in BOTH heroes' `counters` arrays in `counters-analytics.json`
  - Cross-type matches (curated for hero A, analytics for hero B) are NOT highlighted
  - Export a `SharedItems` type: `{ curated: ReadonlySet<string>; analytics: ReadonlySet<string> }`
  - Also export a `getCuratedItems(className: string)` helper and `getAnalyticsItems(className: string)` helper for CounterDetailCard to use
  - Write unit tests in `src/lib/__tests__/counters.test.ts` covering: no overlap, partial overlap, full overlap, hero with no data, same hero passed twice
  - Clean up the `as unknown as AnalyticsCountersFile` double-cast from HeroCard — create a properly typed accessor

  **Must NOT do**:
  - No cross-type matching (curated for A + analytics for B is NOT shared)
  - No mixing of curated and analytics item sets
  - No `as any` or `@ts-ignore`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/HeroCard.tsx:68-73` — Current data access pattern for curated and analytics items (cast pattern to replace)
  - `src/lib/types.ts:42-67` — `CountersData`, `CuratedCounterEntry`, `AnalyticsCounterEntry`, `AnalyticsCountersFile` types
  - `src/generated/counters.json` — Curated counter data structure (keyed by `hero_*` class name, `itemCounters[].item`)
  - `src/generated/counters-analytics.json` — Analytics data structure (keyed by `hero_*` class name, `counters[].item`)

  **API/Type References**:
  - `src/lib/types.ts:CounterEntry.item` — The `item` string field is the slug used for intersection
  - `src/lib/types.ts:AnalyticsCounterEntry.item` — Same `item` field for analytics intersection

  **Test References**:
  - `src/components/__tests__/HeroCard.test.tsx` — Existing counter data mocking pattern

  **Why Each Reference Matters**:
  - HeroCard's cast pattern shows the current fragile data access that needs a clean replacement
  - CounterEntry.item is the intersection key — the utility must compare on this field
  - The JSON structures show how data is keyed and what fields are available

  **Acceptance Criteria**:

  - [ ] `src/lib/counters.ts` exports `computeSharedItems`, `getCuratedItems`, `getAnalyticsItems`, and `SharedItems` type
  - [ ] `pnpm test --run src/lib/__tests__/counters.test.ts` → PASS (5+ test cases)

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: computeSharedItems returns empty sets for heroes with no overlap
    Tool: Bash (pnpm test)
    Preconditions: counters.json and counters-analytics.json exist with test data
    Steps:
      1. Run: pnpm test --run src/lib/__tests__/counters.test.ts
      2. Verify test "returns empty sets for heroes with no overlapping items" passes
    Expected Result: All tests pass, 0 failures
    Failure Indicators: Any test failure
    Evidence: .omo/evidence/task-1-unit-tests.txt

  Scenario: computeSharedItems returns correct intersection for heroes with partial overlap
    Tool: Bash (pnpm test)
    Preconditions: Test mock has heroes with overlapping item slugs
    Steps:
      1. Run: pnpm test --run src/lib/__tests__/counters.test.ts
      2. Verify test "returns correct curated intersection" passes
      3. Verify test "returns correct analytics intersection" passes
    Expected Result: Shared sets contain only items present in both heroes' data
    Failure Indicators: Shared sets include items from only one hero, or missing shared items
    Evidence: .omo/evidence/task-1-unit-tests.txt

  Scenario: computeSharedItems handles hero with no data gracefully
    Tool: Bash (pnpm test)
    Preconditions: One class name not in counters data
    Steps:
      1. Run: pnpm test --run src/lib/__tests__/counters.test.ts
      2. Verify test "returns empty sets for hero with no counter data" passes
    Expected Result: Empty sets returned, no crash
    Failure Indicators: TypeError or undefined access
    Evidence: .omo/evidence/task-1-unit-tests.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-1-unit-tests.txt` — test output showing all cases pass

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(counters): add shared-item computation utility`
  - Files: `src/lib/counters.ts`, `src/lib/__tests__/counters.test.ts`
  - Pre-commit: `pnpm typecheck && pnpm test --run src/lib/__tests__/counters.test.ts`

- [x] 2. Design tokens + CounterDetailCard CSS + CountersPage CSS

  **What to do**:
  - Add to `src/styles/tokens.css`: `--color-shared-highlight` (accent gold for shared item border), `--color-shared-badge-bg` / `--color-shared-badge-fg` (badge text colors)
  - Create `src/components/CounterDetailCard.css` with BEM classes: `.counter-detail-card`, `.counter-detail-card__icon`, `.counter-detail-card__name`, `.counter-detail-card__section`, `.counter-detail-card__section--curated`, `.counter-detail-card__section--analytics`, `.counter-detail-card__section-header`, `.counter-detail-card__section-items`, `.counter-detail-card__stat-item`, `.counter-detail-card__stat-delta`, `.counter-detail-card__stat-samples`, `.counter-detail-card__placeholder`, `.counter-item--shared` (accent border + badge)
  - Create `src/pages/counters.css` with two-panel layout: `.page-counters` (grid/flex layout), `.counters__detail-panel` (left side, fixed width), `.counters__hero-panel` (right side, scrollable), `.counters__slot` (placeholder slots), `.counters__slot--empty`
  - Reuse existing patterns from `HeroCard.css` for section styling (curated/analytics backgrounds and borders)
  - Target viewport: 1280×720 (Steam Overlay). Left panel ~40-50%, right panel ~50-60%. Hero grid uses smaller tiles (~48-64px).

  **Must NOT do**:
  - No inline styles or `!important`
  - No mobile breakpoints (1280×720 only)
  - No CSS animations or transitions
  - No new npm dependencies

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4)
  - **Blocks**: Tasks 5, 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/HeroCard.css:1-111` — Current counter section styling patterns (curated/analytics backgrounds, stat-item layout, data-trend color binding)
  - `src/components/HeroPicker.css:1-121` — Current hero card and tile styles (to migrate/mark for deletion)
  - `src/styles/tokens.css:1-43` — Design token structure (colors, spacing, typography, layout)
  - `src/styles/global.css:128-138` — Current `.page-heroes` page layout

  **Why Each Reference Matters**:
  - HeroCard.css has the exact curated/analytics section patterns to replicate in CounterDetailCard
  - HeroPicker.css shows the tile and card portrait styles (being replaced/deleted)
  - tokens.css shows the token naming convention and structure to follow
  - global.css `.page-heroes` is the layout class being replaced by `.page-counters`

  **Acceptance Criteria**:

  - [ ] `src/styles/tokens.css` has 3 new tokens: `--color-shared-highlight`, `--color-shared-badge-bg`, `--color-shared-badge-fg`
  - [ ] `src/components/CounterDetailCard.css` exists with all BEM classes listed above
  - [ ] `src/pages/counters.css` exists with two-panel layout classes
  - [ ] `pnpm build` → CSS compiles without errors

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: CSS files compile without errors
    Tool: Bash (pnpm build)
    Preconditions: New CSS files created with correct classes
    Steps:
      1. Run: pnpm build
      2. Check exit code is 0
    Expected Result: Build succeeds, no CSS compilation errors
    Failure Indicators: Build fails, PostCSS errors, unknown variable references
    Evidence: .omo/evidence/task-2-css-build.txt

  Scenario: New design tokens are valid CSS custom properties
    Tool: Bash (grep)
    Preconditions: tokens.css has been modified
    Steps:
      1. Run: grep -c 'color-shared' src/styles/tokens.css
      2. Verify count is at least 3 (highlight, badge-bg, badge-fg)
    Expected Result: 3+ lines contain the new shared-item tokens
    Failure Indicators: Missing tokens or typos in variable names
    Evidence: .omo/evidence/task-2-tokens-check.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-2-css-build.txt` — build output showing successful CSS compilation

  **Commit**: YES (groups with Wave 1)
  - Message: `feat(counters): add layout tokens and component CSS`
  - Files: `src/styles/tokens.css`, `src/components/CounterDetailCard.css`, `src/pages/counters.css`
  - Pre-commit: `pnpm build`

- [x] 3. Delete HeroPicker files (unused component)

  **What to do**:
  - Delete `src/components/HeroPicker.tsx` (107 lines, modal overlay pattern — unused on heroes page)
  - Delete `src/components/HeroPicker.css` (121 lines, contains hero-tile and hero-card styles that are being replaced)
  - Delete `src/components/__tests__/HeroPicker.test.tsx` (9 tests for the overlay component)
  - Verify no other files import `HeroPicker` — search for any references and clean up
  - Do NOT delete `HeroCard.tsx`, `HeroCard.css`, or `HeroCard.test.tsx` yet (still needed until CounterDetailCard is created in Task 5)
  - Run `pnpm typecheck && pnpm test --run` to verify nothing is broken by the deletion

  **Must NOT do**:
  - Do NOT delete HeroCard files (needed until CounterDetailCard is created)
  - Do NOT delete heroes.tsx (needed until CountersPage is created)
  - Do NOT modify app.tsx routes yet (that's Task 7)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4)
  - **Blocks**: Task 7
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/HeroPicker.tsx` — The file to DELETE (107 lines, modal overlay pattern)
  - `src/components/HeroPicker.css` — The file to DELETE (121 lines, tile/card/picker styles)
  - `src/components/__tests__/HeroPicker.test.tsx` — The file to DELETE (9 tests)

  **Why Each Reference Matters**:
  - These files must be identified for deletion
  - Verifying no imports remain prevents build failures

  **Acceptance Criteria**:

  - [ ] `src/components/HeroPicker.tsx` deleted
  - [ ] `src/components/HeroPicker.css` deleted
  - [ ] `src/components/__tests__/HeroPicker.test.tsx` deleted
  - [ ] `pnpm typecheck` passes with 0 errors
  - [ ] `pnpm test --run` passes (remaining tests, minus 9 deleted tests)

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Build succeeds after HeroPicker deletion
    Tool: Bash (pnpm typecheck && pnpm test --run && pnpm build)
    Preconditions: HeroPicker files deleted
    Steps:
      1. Run: pnpm typecheck
      2. Run: pnpm test --run
      3. Run: pnpm build
    Expected Result: All three commands succeed with exit code 0
    Failure Indicators: TypeScript errors referencing HeroPicker, import resolution failures
    Evidence: .omo/evidence/task-3-build-after-delete.txt

  Scenario: No stale HeroPicker imports remain
    Tool: Bash (grep)
    Preconditions: HeroPicker files deleted
    Steps:
      1. Run: grep -r "HeroPicker" src/ --include="*.ts" --include="*.tsx"
      2. Verify no results (no remaining imports)
    Expected Result: grep returns 0 matches
    Failure Indicators: Any file still imports HeroPicker
    Evidence: .omo/evidence/task-3-no-stale-imports.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-3-build-after-delete.txt` — build output showing success
  - [ ] `task-3-no-stale-imports.txt` — grep output showing 0 matches

  **Commit**: YES (groups with Wave 1)
  - Message: `chore: delete unused HeroPicker overlay component`
  - Files: (deleted) `src/components/HeroPicker.tsx`, `src/components/HeroPicker.css`, `src/components/__tests__/HeroPicker.test.tsx`
  - Pre-commit: `pnpm typecheck && pnpm test --run && pnpm build`

- [x] 4. HeroGrid + HeroTile refactor + test updates

  **What to do**:
  - Refactor `src/components/HeroGrid.tsx`: change `selectedId: number | undefined` → `selectedIds: number[]` and add `disabledIds: number[]` prop
  - Refactor `src/components/HeroTile.tsx`: add `disabled?: boolean` prop, when true: add `aria-disabled="true"`, apply `hero-tile--disabled` class (opacity 0.4, pointer-events: none), remove from tab order with `tabIndex={-1}`
  - Add `.hero-tile--disabled` styles to the tile CSS (opacity: 0.4, pointer-events: none, cursor: default)
  - Update `src/components/__tests__/HeroGrid.test.tsx` for new interface (selectedIds array, disabledIds array)
  - Update `src/components/__tests__/HeroTile.test.tsx` to test `disabled` prop (aria-disabled, visual class, click suppression)
  - Keep `role="listbox"` on HeroGrid and `role="option"` on HeroTile
  - `selectedIds` maps to `aria-selected="true"` on matching tiles
  - Both `aria-selected` and the existing `hero-tile--selected` class remain for selected tiles

  **Must NOT do**:
  - No destructuring of props in Solid components
  - No `.map()` in JSX — use `<For>`
  - No removing accessibility roles (listbox/option must stay)
  - No renaming `HeroGrid` or `HeroTile` — keep existing component names

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3)
  - **Blocks**: Task 6
  - **Blocked By**: None (can start immediately)

  **References**:

  **Pattern References**:
  - `src/components/HeroGrid.tsx:1-21` — Current interface: `selectedId: number | undefined`, `onSelect: (hero: Hero) => void`
  - `src/components/HeroTile.tsx:1-37` — Current props: `selected?: boolean`, `onSelect: (hero: Hero) => void`, uses `hero-tile--selected`
  - `src/components/HeroPicker.css:1-40` — Tile styles (`.hero-tile`, `.hero-tile--selected`, `.hero-tile__img`, `.hero-tile__fallback`)

  **Test References**:
  - `src/components/__tests__/HeroGrid.test.tsx` — 5 tests for role, options, selection, click handler
  - `src/components/__tests__/HeroTile.test.tsx` — 7 tests for role, image, fallback, data-hero-id, aria-selected, click

  **Why Each Reference Matters**:
  - HeroGrid's current interface defines what needs to change (single → multi-select)
  - HeroTile's disabled prop is new functionality that needs visual + a11y treatment
  - Existing tests must be updated to match the new interface

  **Acceptance Criteria**:

  - [ ] `HeroGrid.tsx` accepts `selectedIds: number[]` and `disabledIds: number[]`
  - [ ] `HeroTile.tsx` accepts `disabled?: boolean` prop
  - [ ] Disabled tiles have `aria-disabled="true"`, `tabIndex={-1}`, and `.hero-tile--disabled` class
  - [ ] `pnpm test --run src/components/__tests__/HeroGrid.test.tsx` → PASS
  - [ ] `pnpm test --run src/components/__tests__/HeroTile.test.tsx` → PASS

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: HeroGrid renders with multi-select props
    Tool: Bash (pnpm test)
    Preconditions: HeroGrid refactored with selectedIds and disabledIds
    Steps:
      1. Run: pnpm test --run src/components/__tests__/HeroGrid.test.tsx
      2. Verify all tests pass including new "renders with selectedIds" test
    Expected Result: All HeroGrid tests pass (5+ tests, 0 failures)
    Failure Indicators: Test failures, TypeScript errors in test file
    Evidence: .omo/evidence/task-4-herogrid-tests.txt

  Scenario: HeroTile disabled prop works correctly
    Tool: Bash (pnpm test)
    Preconditions: HeroTile has disabled prop
    Steps:
      1. Run: pnpm test --run src/components/__tests__/HeroTile.test.tsx
      2. Verify "applies disabled class and aria-disabled" test passes
      3. Verify "suppressed click when disabled" test passes
    Expected Result: All HeroTile tests pass including new disabled tests
    Failure Indicators: Missing aria-disabled, click handler fires when disabled
    Evidence: .omo/evidence/task-4-herotile-tests.txt

  Scenario: Typecheck passes after HeroGrid/HeroTile refactor
    Tool: Bash (pnpm typecheck)
    Preconditions: Components refactored
    Steps:
      1. Run: pnpm typecheck
    Expected Result: 0 errors
    Failure Indicators: Type errors in HeroGrid, HeroTile, or consumers
    Evidence: .omo/evidence/task-4-typecheck.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-4-herogrid-tests.txt` — test output
  - [ ] `task-4-herotile-tests.txt` — test output
  - [ ] `task-4-typecheck.txt` — typecheck output

  **Commit**: YES (groups with Wave 1)
  - Message: `refactor(counters): HeroGrid multi-select and HeroTile disabled state`
  - Files: `src/components/HeroGrid.tsx`, `src/components/HeroTile.tsx`, `src/components/__tests__/HeroGrid.test.tsx`, `src/components/__tests__/HeroTile.test.tsx`
  - Pre-commit: `pnpm typecheck && pnpm test --run`

- [x] 5. CounterDetailCard component + tests

  **What to do**:
  - Create `src/components/CounterDetailCard.tsx` — a Solid component that displays hero counter information
  - Props: `hero: Hero | undefined`, `sharedCuratedItems: ReadonlySet<string>`, `sharedAnalyticsItems: ReadonlySet<string>`, `isSecondSlot?: boolean`
  - When `hero` is undefined: render a placeholder slot with "Select a hero" text and faded hero icon
  - When hero is defined: render small hero icon (`icon_image_small`) + hero name + Curated section + Analytics section
  - Use `getCuratedItems` and `getAnalyticsItems` from `src/lib/counters.ts` for data access
  - Curated section: `<For>` over curated items, each rendered as `<ItemCard>` with class `counter-detail-card__counter-item`. If item slug is in `sharedCuratedItems`, add `counter-item--shared` class and render a "×2" badge
  - Analytics section: `<For>` over analytics items (top 3), each as `<div class="counter-detail-card__stat-item" data-trend={trendFor(delta)}>` with ItemCard + delta + sample size. If item slug is in `sharedAnalyticsItems`, add `counter-item--shared` class and "×2" badge
  - Reuse `formatDelta`, `formatSampleSize`, `trendFor` helper functions from current HeroCard (move to `src/lib/counters.ts` or inline)
  - Use proper Solid patterns: no prop destructuring, signals as functions, `<Show>`/`<For>`
  - Import `CounterDetailCard.css`
  - Write unit tests in `src/components/__tests__/CounterDetailCard.test.tsx` covering: placeholder state, single hero, shared items highlighted, empty curated/analytics sections

  **Must NOT do**:
  - No prop destructuring (Solid rule)
  - No `.map()` in JSX — use `<For>`
  - No `as any` or `@ts-ignore`
  - No 128px portrait — use `icon_image_small` (small square icon ~48-64px)
  - No runtime fetch — data comes from imported JSON

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 1 for utility functions and Task 2 for CSS)
  - **Parallel Group**: Wave 2
  - **Blocks**: Task 6
  - **Blocked By**: Tasks 1, 2

  **References**:

  **Pattern References**:
  - `src/components/HeroCard.tsx:34-115` — Current counter section rendering pattern (curated + analytics with ItemCard, `<For>`, `<Show>`)
  - `src/components/HeroCard.tsx:15-32` — Helper functions (formatDelta, formatSampleSize, trendFor) to reuse
  - `src/components/HeroCard.css:1-111` — Section styling patterns (curated/analytics backgrounds, stat-item layout)
  - `src/components/deadlock-ui/ItemCard.tsx` — ItemCard component interface: `{ itemId: string; class?: string }`

  **API/Type References**:
  - `src/lib/types.ts:Hero` — `id`, `name`, `class_name`, `images.icon_image_small`
  - `src/lib/types.ts:CounterEntry` — `item`, `confidence`, `reason`, `lastReviewedPatch`
  - `src/lib/types.ts:AnalyticsCounterEntry` — `item`, `winRateDelta`, `sampleSize`, `reason`
  - `src/lib/counters.ts` — New utility (Task 1): `computeSharedItems`, `getCuratedItems`, `getAnalyticsItems`

  **Test References**:
  - `src/components/__tests__/HeroCard.test.tsx` — 14+ tests covering placeholder, image, fallback, curated/analytics sections, deltas, trends

  **Why Each Reference Matters**:
  - HeroCard shows the exact rendering pattern to replicate (but with smaller icon, different layout)
  - The helper functions (formatDelta, formatSampleSize, trendFor) should be reused, not rewritten
  - ItemCard's interface shows how to pass itemId and class names
  - Hero types show which image field to use (icon_image_small, not icon_hero_card)

  **Acceptance Criteria**:

  - [ ] `src/components/CounterDetailCard.tsx` exists and renders hero icon + name + curated + analytics sections
  - [ ] Shared items (slug in corresponding sharedItems Set) get `counter-item--shared` class and "×2" badge
  - [ ] `pnpm test --run src/components/__tests__/CounterDetailCard.test.tsx` → PASS (5+ tests)
  - [ ] `pnpm typecheck` → 0 errors

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: CounterDetailCard renders placeholder when hero is undefined
    Tool: Bash (pnpm test)
    Preconditions: CounterDetailCard component created
    Steps:
      1. Run: pnpm test --run src/components/__tests__/CounterDetailCard.test.tsx
      2. Verify "renders placeholder when hero is undefined" test passes
    Expected Result: Placeholder shows "Select a hero" text with faded icon
    Failure Indicators: Component crashes on undefined hero, no placeholder rendered
    Evidence: .omo/evidence/task-5-placeholder-test.txt

  Scenario: CounterDetailCard renders hero with shared items highlighted
    Tool: Bash (pnpm test)
    Preconditions: CounterDetailCard with hero data and shared items
    Steps:
      1. Run: pnpm test --run src/components/__tests__/CounterDetailCard.test.tsx
      2. Verify "renders shared items with highlight class" test passes
      3. Verify "renders ×2 badge on shared items" test passes
    Expected Result: Items in sharedCuratedItems set have counter-item--shared class and ×2 badge
    Failure Indicators: Shared items not highlighted, badge missing, wrong items highlighted
    Evidence: .omo/evidence/task-5-shared-items-test.txt

  Scenario: CounterDetailCard handles hero with empty curated section
    Tool: Bash (pnpm test)
    Preconditions: Hero with no counter data
    Steps:
      1. Run: pnpm test --run src/components/__tests__/CounterDetailCard.test.tsx
      2. Verify "hides curated section when no curated items" test passes
    Expected Result: Curated section hidden when itemCounters is empty
    Failure Indicators: Empty section shown, crash on empty array
    Evidence: .omo/evidence/task-5-empty-curated-test.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-5-placeholder-test.txt` — test output
  - [ ] `task-5-shared-items-test.txt` — test output
  - [ ] `task-5-empty-curated-test.txt` — test output

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(counters): add CounterDetailCard component with shared-item highlighting`
  - Files: `src/components/CounterDetailCard.tsx`, `src/components/__tests__/CounterDetailCard.test.tsx`
  - Pre-commit: `pnpm typecheck && pnpm test --run src/components/__tests__/CounterDetailCard.test.tsx`

- [x] 6. CountersPage component + tests

  **What to do**:
  - Create `src/pages/counters.tsx` — the main counters page component
  - State: `const [selection, setSelection] = createSignal<[Hero | undefined, Hero | undefined]>([undefined, undefined])`
  - Selection logic:
    - Click unselected hero → fills first empty slot (Slot 1, then Slot 2)
    - When 2 heroes selected → pass `disabledIds` to HeroGrid (all hero IDs NOT in selection)
    - Click selected hero in grid → unselect it (remove from slot, shift remaining up)
    - Unselect Slot 1 → Slot 2 hero moves to Slot 1
    - Same hero cannot be selected twice (already-selected heroes remain clickable for toggle-off)
  - Compute `sharedCuratedItems` and `sharedAnalyticsItems` using `computeSharedItems` from `src/lib/counters.ts` — called as a derived signal that recomputes when selection changes
  - Layout: two-panel (left = detail cards, right = hero grid)
  - Left panel: two `CounterDetailCard` slots stacked vertically. Slot 1 uses `selection()[0]`, Slot 2 uses `selection()[1]`. Pass `sharedCuratedItems` and `sharedAnalyticsItems` as computed sets.
  - Right panel: `HeroGrid` with `selectedIds={selection().filter(Boolean).map(h => h.id)}` and `disabledIds` for unselected heroes when 2 are selected
  - Import `src/pages/counters.css`
  - When only 1 hero selected, show a subtle "Select another hero to see shared counters" prompt below the first detail card
  - Write unit tests in `src/pages/__tests__/counters.test.tsx` (create directory) covering: initial state, single hero selection, dual hero selection, unselection promotion, shared items computation

  **Must NOT do**:
  - No prop destructuring
  - No `.map()` in JSX — use `<For>`
  - No URL state or query parameters for hero selection
  - No localStorage persistence
  - No animations or transitions on slot changes
  - No destructuring of `selection()` signal result — use `selection()[0]` and `selection()[1]` directly

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Tasks 4, 5)
  - **Parallel Group**: Wave 2 (after Task 5)
  - **Blocks**: Task 7
  - **Blocked By**: Tasks 4 (HeroGrid refactor), 5 (CounterDetailCard)

  **References**:

  **Pattern References**:
  - `src/pages/heroes.tsx:1-18` — Current page structure to replace (simple signal + HeroCard + HeroGrid)
  - `src/components/HeroGrid.tsx` — Refactored component with `selectedIds`, `disabledIds` (Task 4)
  - `src/components/CounterDetailCard.tsx` — New detail card component (Task 5)

  **API/Type References**:
  - `src/lib/types.ts:Hero` — Hero type with `id`, `name`, `class_name`, `images`
  - `src/lib/counters.ts` — `computeSharedItems`, `getCuratedItems`, `getAnalyticsItems` (Task 1)
  - `src/generated/heroes.json` — Array of 38 heroes

  **Test References**:
  - `src/components/__tests__/HeroGrid.test.tsx` — HeroGrid testing pattern (listbox role, option count, selection)

  **Why Each Reference Matters**:
  - heroes.tsx shows the simplest version of the page that needs to be replaced
  - HeroGrid's new interface (selectedIds, disabledIds) is the key integration point
  - computeSharedItems is the shared-item logic driver

  **Acceptance Criteria**:

  - [ ] `src/pages/counters.tsx` exists with dual-hero signal and two-panel layout
  - [ ] Selection logic works: click fills slots, 2 selected disables others, unselect promotes
  - [ ] Shared items computed correctly when 2 heroes selected
  - [ ] "Select another hero" prompt shown when only 1 hero selected
  - [ ] `pnpm test --run src/pages/__tests__/counters.test.tsx` → PASS (5+ tests)
  - [ ] `pnpm typecheck` → 0 errors

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: CountersPage renders with two empty slots initially
    Tool: Bash (pnpm test)
    Preconditions: CountersPage component created
    Steps:
      1. Run: pnpm test --run src/pages/__tests__/counters.test.tsx
      2. Verify "renders two empty slots initially" test passes
    Expected Result: Two placeholder slots visible, hero grid visible
    Failure Indicators: Missing slots, grid not rendering
    Evidence: .omo/evidence/task-6-initial-state-test.txt

  Scenario: Selecting one hero fills Slot 1
    Tool: Bash (pnpm test)
    Preconditions: CountersPage rendered
    Steps:
      1. Run: pnpm test --run src/pages/__tests__/counters.test.tsx
      2. Verify "clicking hero fills first slot" test passes
      3. Verify "shows hero counters in detail card" test passes
    Expected Result: First hero's detail card appears in Slot 1
    Failure Indicators: Slot not filled, counter data not rendering
    Evidence: .omo/evidence/task-6-single-selection-test.txt

  Scenario: Selecting two heroes fills both slots and computes shared items
    Tool: Bash (pnpm test)
    Preconditions: One hero already selected
    Steps:
      1. Run: pnpm test --run src/pages/__tests__/counters.test.tsx
      2. Verify "selecting second hero fills Slot 2" test passes
      3. Verify "shared items are computed" test passes
    Expected Result: Both slots filled, sharedCuratedItems and sharedAnalyticsItems computed
    Failure Indicators: Second selection ignored, shared items not computed
    Evidence: .omo/evidence/task-6-dual-selection-test.txt

  Scenario: Unselecting Slot 1 promotes Slot 2 hero
    Tool: Bash (pnpm test)
    Preconditions: Two heroes selected
    Steps:
      1. Run: pnpm test --run src/pages/__tests__/counters.test.tsx
      2. Verify "unselecting Slot 1 promotes Slot 2 to Slot 1" test passes
    Expected Result: Slot 2 hero moves to Slot 1, Slot 2 becomes empty
    Failure Indicators: Both slots cleared, Slot 2 stays in position
    Evidence: .omo/evidence/task-6-promotion-test.txt

  Scenario: Disabled state when two heroes selected
    Tool: Bash (pnpm test)
    Preconditions: Two heroes selected
    Steps:
      1. Run: pnpm test --run src/pages/__tests__/counters.test.tsx
      2. Verify "non-selected heroes are disabled" test passes
    Expected Result: Unselected hero tiles have aria-disabled="true" and disabled class
    Failure Indicators: All tiles still clickable, no disabled state
    Evidence: .omo/evidence/task-6-disabled-test.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-6-initial-state-test.txt` — test output
  - [ ] `task-6-single-selection-test.txt` — test output
  - [ ] `task-6-dual-selection-test.txt` — test output
  - [ ] `task-6-promotion-test.txt` — test output
  - [ ] `task-6-disabled-test.txt` — test output

  **Commit**: YES (groups with Wave 2)
  - Message: `feat(counters): add CountersPage with dual-hero selection`
  - Files: `src/pages/counters.tsx`, `src/pages/__tests__/counters.test.tsx`
  - Pre-commit: `pnpm typecheck && pnpm test --run src/pages/__tests__/counters.test.tsx`

- [x] 7. Route/nav/cleanup — delete old files, wire routes, add redirect

  **What to do**:
  - Delete `src/pages/heroes.tsx` (replaced by `counters.tsx`)
  - Delete `src/components/HeroCard.tsx` (replaced by `CounterDetailCard`)
  - Delete `src/components/HeroCard.css` (replaced by `CounterDetailCard.css`)
  - Delete `src/components/__tests__/HeroCard.test.tsx` (replaced by `CounterDetailCard.test.tsx`)
  - Update `src/app.tsx`: change `<Route path="/heroes" component={Heroes} />` to `<Route path="/counters" component={Counters} />` and add `<Route path="/heroes" component={CountersRedirect} />` (or use `<Redirect path="/heroes" href="/#/counters" />` from `@solidjs/router`)
  - Update lazy imports: `const Counters = lazy(() => import('~/pages/counters'))` replaces `const Heroes = lazy(...)`
  - Update `src/routes.ts`: change `{ path: '/heroes', label: 'Heroes' }` to `{ path: '/counters', label: 'Counters' }`
  - Remove import of `~/components/HeroPicker.css` from `counters.tsx` (if it was there) — replaced by `~/pages/counters.css`
  - Verify all imports are clean (no references to deleted files)
  - Run `pnpm typecheck && pnpm lint && pnpm test --run && pnpm build`

  **Must NOT do**:
  - Do NOT remove the `/heroes` route entirely without a redirect (existing links/bookmarks will break)
  - Do NOT delete `HeroGrid.tsx` or `HeroTile.tsx` (still used by CountersPage)
  - Do NOT delete `HeroPicker.css` yet (it still contains `.hero-tile` and `.hero-tile--selected` styles used by HeroGrid/HeroTile — will be migrated in Task 8)
  - Do NOT change `@solidjs/router` import patterns

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 6 for CountersPage)
  - **Parallel Group**: Wave 3 (with Task 8)
  - **Blocks**: Task 8 (CSS consolidation can reference cleaned-up imports)
  - **Blocked By**: Task 6 (CountersPage must exist before changing routes)

  **References**:

  **Pattern References**:
  - `src/app.tsx:1-23` — Current route definitions with lazy imports
  - `src/routes.ts:1-5` — Current nav routes array
  - `src/pages/heroes.tsx` — Page being replaced

  **API/Type References**:
  - `@solidjs/router` — `<Route>`, `<Redirect>` (check available redirect API in v0.15)

  **Why Each Reference Matters**:
  - app.tsx shows the exact route and lazy import pattern to update
  - routes.ts provides the nav label that needs changing
  - heroes.tsx is the file being deleted — need to verify nothing else imports it

  **Acceptance Criteria**:

  - [ ] `src/pages/heroes.tsx` deleted
  - [ ] `src/components/HeroCard.tsx` deleted
  - [ ] `src/components/HeroCard.css` deleted
  - [ ] `src/components/__tests__/HeroCard.test.tsx` deleted
  - [ ] `src/app.tsx` has `/counters` route and `/heroes` redirect
  - [ ] `src/routes.ts` has `{ path: '/counters', label: 'Counters' }`
  - [ ] `pnpm typecheck` → 0 errors
  - [ ] `pnpm build` → exit 0

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: Build succeeds after route change and file deletions
    Tool: Bash (pnpm typecheck && pnpm build)
    Preconditions: Old files deleted, routes updated
    Steps:
      1. Run: pnpm typecheck
      2. Run: pnpm build
    Expected Result: Both commands succeed with exit code 0
    Failure Indicators: TypeScript errors, import resolution failures, Vite build errors
    Evidence: .omo/evidence/task-7-build-after-cleanup.txt

  Scenario: /heroes redirects to /counters
    Tool: Bash (pnpm test --run)
    Preconditions: Route redirect in place
    Steps:
      1. Run: pnpm test --run (all unit tests)
      2. Verify no test failures related to routing
    Expected Result: All unit tests pass
    Failure Indicators: Route-related test failures, import errors for deleted files
    Evidence: .omo/evidence/task-7-unit-tests.txt

  Scenario: No stale imports reference deleted files
    Tool: Bash (grep)
    Preconditions: Files deleted
    Steps:
      1. Run: grep -r "from.*HeroCard" src/ --include="*.ts" --include="*.tsx" (should find only CounterDetailCard references if it imports from HeroCard — it shouldn't)
      2. Run: grep -r "from.*heroes" src/ --include="*.ts" --include="*.tsx" (should not find imports of deleted page)
    Expected Result: 0 matches for deleted file imports
    Failure Indicators: Any remaining import of deleted files
    Evidence: .omo/evidence/task-7-no-stale-imports.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-7-build-after-cleanup.txt` — build output
  - [ ] `task-7-unit-tests.txt` — unit test results
  - [ ] `task-7-no-stale-imports.txt` — grep results

  **Commit**: YES (groups with Wave 3)
  - Message: `feat(counters): wire /counters route, redirect /heroes, delete old files`
  - Files: `src/app.tsx`, `src/routes.ts`, (deleted) `src/pages/heroes.tsx`, `src/components/HeroCard.tsx`, `src/components/HeroCard.css`, `src/components/__tests__/HeroCard.test.tsx`
  - Pre-commit: `pnpm typecheck && pnpm lint && pnpm test --run && pnpm build`

- [x] 8. CSS consolidation — migrate styles from HeroPicker.css, update global layout

  **What to do**:
  - Create `src/components/HeroGrid.css` (new file) — migrate `.hero-tile`, `.hero-tile--selected`, `.hero-tile--disabled` (new), `.hero-tile__img`, `.hero-tile__fallback`, `.hero-picker__grid` styles from `HeroPicker.css`
  - Create `src/components/HeroTile.css` (new file) — or keep tile styles in `HeroGrid.css` (tile is small, keep with grid)
  - Actually: keep all tile+grid styles in `HeroGrid.css` since HeroTile is a small component tightly coupled to HeroGrid
  - Delete `src/components/HeroPicker.css` — all useful styles have been migrated
  - Update imports: `HeroGrid.tsx` now imports `~/components/HeroGrid.css` instead of `~/components/HeroPicker.css`
  - Update `src/styles/global.css`: replace `.page-heroes` with `.page-counters` layout (two-panel grid)
  - Remove `.page-heroes .hero-picker__grid` rule
  - Set up `.page-counters` as a CSS Grid: left panel (~40% width, `grid-row: 1 / 3`), right panel (~60% width, scrollable)
  - Verify no remaining references to `HeroPicker.css`, `HeroCard.css`, or `.page-heroes`
  - Run `pnpm build` to verify CSS compilation

  **Must NOT do**:
  - Do NOT delete `.hero-tile` or `.hero-tile--selected` styles (still used)
  - Do NOT add mobile responsive breakpoints (1280×720 only)
  - Do NOT add CSS animations or transitions
  - Do NOT use `!important`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on Task 7 for clean imports)
  - **Parallel Group**: Wave 3 (after Task 7)
  - **Blocks**: Task 9 (e2e needs correct CSS)
  - **Blocked By**: Task 7

  **References**:

  **Pattern References**:
  - `src/components/HeroPicker.css:1-121` — All styles to migrate (hero-tile, hero-card, hero-picker__grid, hero-tile--selected)
  - `src/styles/global.css:128-138` — Current `.page-heroes` layout to replace
  - `src/styles/tokens.css:1-43` — Design tokens for consistent spacing and colors

  **Why Each Reference Matters**:
  - HeroPicker.css contains all tile/grid/card styles that need to be migrated before deletion
  - global.css `.page-heroes` needs to become `.page-counters` with two-panel layout
  - tokens.css ensures consistent spacing and color usage

  **Acceptance Criteria**:

  - [ ] `src/components/HeroGrid.css` created with migrated tile + grid styles
  - [ ] `src/components/HeroPicker.css` deleted
  - [ ] `src/styles/global.css` has `.page-counters` with two-panel layout, no `.page-heroes`
  - [ ] `pnpm build` → exit 0
  - [ ] No remaining references to `HeroPicker.css` in source files

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: CSS compiles and build succeeds after consolidation
    Tool: Bash (pnpm build)
    Preconditions: Styles migrated, old CSS deleted
    Steps:
      1. Run: pnpm build
    Expected Result: Exit code 0, CSS bundled correctly
    Failure Indicators: PostCSS errors, unresolved CSS imports, missing class warnings
    Evidence: .omo/evidence/task-8-css-build.txt

  Scenario: No references to deleted CSS files remain
    Tool: Bash (grep)
    Preconditions: HeroPicker.css and HeroCard.css deleted
    Steps:
      1. Run: grep -r "HeroPicker.css" src/ --include="*.ts" --include="*.tsx" --include="*.css"
      2. Run: grep -r "HeroCard.css" src/ --include="*.ts" --include="*.tsx" --include="*.css"
      3. Run: grep -r "page-heroes" src/ --include="*.css"
    Expected Result: 0 matches for each grep
    Failure Indicators: Any remaining import of deleted CSS
    Evidence: .omo/evidence/task-8-no-stale-css.txt

  Scenario: HeroGrid imports HeroGrid.css (not HeroPicker.css)
    Tool: Bash (grep)
    Steps:
      1. Run: grep "HeroGrid.css" src/components/HeroGrid.tsx
    Expected Result: 1 match (the import line)
    Failure Indicators: No import or wrong import path
    Evidence: .omo/evidence/task-8-correct-imports.txt
  ```

  **Evidence to Capture**:
  - [ ] `task-8-css-build.txt` — build output
  - [ ] `task-8-no-stale-css.txt` — grep results showing 0 matches
  - [ ] `task-8-correct-imports.txt` — grep showing correct imports

  **Commit**: YES (groups with Wave 3)
  - Message: `refactor(counters): consolidate CSS, migrate styles from HeroPicker, update page layout`
  - Files: `src/components/HeroGrid.css` (new), `src/styles/global.css`, (deleted) `src/components/HeroPicker.css`, `src/components/HeroGrid.tsx` (import change)
  - Pre-commit: `pnpm build`

- [x] 9. E2E tests — full counters page scenarios

  **What to do**:
  - Update `e2e/smoke.spec.ts` to replace heroes-related tests with counters page tests
  - Keep existing non-heroes tests (home, cheatsheets, not-found, app shell landmarks)
  - Add/replace the following counters page tests:
    1. **Counters page renders two-panel layout**: Navigate to `/#/counters`, verify left panel (detail cards) and right panel (hero grid) are visible, verify 38 hero tiles in grid
    2. **Clicking a hero fills Slot 1**: Click first hero tile → verify Slot 1 detail card shows hero icon + name + curated section + analytics section
    3. **Clicking second hero fills Slot 2**: With Slot 1 filled, click another hero → verify Slot 2 shows that hero's counters
    4. **Two heroes selected disables remaining tiles**: With 2 heroes selected, verify remaining tiles have `aria-disabled="true"` and visual disabled state
    5. **Clicking selected hero unselects it**: Click a selected hero → verify it's removed from its slot, other hero promotes if needed
    6. **Shared items are highlighted**: Select two heroes with overlapping counter items → verify `dl-item-card` elements in shared sections have `.counter-item--shared` class
    7. **Counter items render for a specific hero** (Haze): Similar to existing test but using CountersPage and CounterDetailCard selectors
    8. **/heroes redirects to /counters**: Navigate to `/#/heroes` → verify URL changes to `/#/counters` or page content matches counters page
  - Mock Deadlock API responses for `dl-item-card` web component rendering (same pattern as existing e2e test)
  - Use Playwright selectors matching new component structure (`.counter-detail-card`, `.counters__detail-panel`, `.counters__hero-panel`, `.hero-tile--disabled`)

  **Must NOT do**:
  - Do NOT remove home, cheatsheets, or not-found tests
  - Do NOT add performance benchmarks
  - Do NOT test `@deadlock-api/ui-core` internal Shadow DOM behavior (out of scope)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on all implementation being complete)
  - **Parallel Group**: Wave 4 (after Wave 3)
  - **Blocks**: F1-F4 (final verification)
  - **Blocked By**: Tasks 7, 8 (complete implementation)

  **References**:

  **Pattern References**:
  - `e2e/smoke.spec.ts:39-173` — Current heroes page e2e tests (6 tests to replace + 4 non-heroes tests to keep)
  - `e2e/smoke.spec.ts:65-156` — Haze counter items test with API mocking pattern

  **Test References**:
  - `e2e/smoke.spec.ts:1-173` — Full e2e test file structure

  **Why Each Reference Matters**:
  - The existing e2e tests show the API mocking pattern for dl-item-card and the hero-specific test structure
  - The Haze test with mock API responses is the pattern to follow for mocking in new tests

  **Acceptance Criteria**:

  - [ ] `e2e/smoke.spec.ts` has 8+ counters page tests replacing 6 heroes page tests
  - [ ] Home, cheatsheets, not-found, app shell tests still pass
  - [ ] `pnpm test:e2e` → all e2e tests pass
  - [ ] `/counters` route renders correctly in Playwright
  - [ ] `/heroes` redirects to `/counters` in Playwright

  **QA Scenarios (MANDATORY)**:

  ```
  Scenario: E2E counters page renders with two panels
    Tool: Playwright
    Preconditions: App running at preview URL
    Steps:
      1. Navigate to /#/counters
      2. Verify `.counters__detail-panel` is visible
      3. Verify `.counters__hero-panel` is visible
      4. Verify 38 `[role="option"]` elements in hero grid
    Expected Result: Two-panel layout renders with detail panel and hero grid
    Failure Indicators: Missing panels, wrong element count, 404
    Evidence: .omo/evidence/task-9-two-panel-layout.png

  Scenario: Selecting two heroes shows shared items
    Tool: Playwright
    Preconditions: Counters page loaded, API mocked for item data
    Steps:
      1. Click first hero tile (e.g., Abrams)
      2. Verify Slot 1 detail card appears
      3. Click second hero tile (e.g., haze)
      4. Verify Slot 2 detail card appears
      5. Verify `.counter-item--shared` elements exist if heroes share counter items
    Expected Result: Both slots filled, shared items highlighted with accent border
    Failure Indicators: Second hero not appearing in Slot 2, shared items not highlighted
    Evidence: .omo/evidence/task-9-shared-items.png

  Scenario: Disabled tiles when two heroes selected
    Tool: Playwright
    Preconditions: Counters page loaded
    Steps:
      1. Click two different hero tiles
      2. Verify remaining 36 tiles have `aria-disabled="true"`
      3. Verify disabled tiles have `.hero-tile--disabled` class
      4. Verify clicking a disabled tile does NOT change selection
    Expected Result: Non-selected tiles are disabled and non-interactive
    Failure Indicators: Disabled tiles still clickable, missing aria-disabled
    Evidence: .omo/evidence/task-9-disabled-tiles.png

  Scenario: /heroes redirects to /counters
    Tool: Playwright
    Preconditions: App running
    Steps:
      1. Navigate to /#/heroes
      2. Wait for navigation
      3. Verify URL contains /counters (or page content matches counters page)
    Expected Result: Redirected to /#/counters or counters page content shown
    Failure Indicators: 404 page, old heroes page layout, blank page
    Evidence: .omo/evidence/task-9-redirect.png

  Scenario: Unselecting hero promotes remaining hero
    Tool: Playwright
    Preconditions: Two heroes selected
    Steps:
      1. With two heroes selected, click the Slot 1 hero tile in the grid
      2. Verify Slot 1 now shows the hero that was in Slot 2
      3. Verify Slot 2 shows placeholder
      4. Verify only one hero tile is selected in grid
    Expected Result: Slot 2 hero promoted to Slot 1, Slot 2 empty, grid shows 1 selected
    Failure Indicators: Both slots cleared, Slot 2 remains populated, grid selection wrong
    Evidence: .omo/evidence/task-9-promotion.png
  ```

  **Evidence to Capture**:
  - [ ] `task-9-two-panel-layout.png` — Playwright screenshot of counters page
  - [ ] `task-9-shared-items.png` — Playwright screenshot showing shared item highlight
  - [ ] `task-9-disabled-tiles.png` — Playwright screenshot showing disabled state
  - [ ] `task-9-redirect.png` — Playwright screenshot after redirect
  - [ ] `task-9-promotion.png` — Playwright screenshot showing slot promotion

  **Commit**: YES (Wave 4)
  - Message: `test(counters): e2e scenarios for dual-hero counters page`
  - Files: `e2e/smoke.spec.ts`
  - Pre-commit: `pnpm test:e2e`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

- [x] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .omo/evidence/. Compare deliverables against plan.
  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`
  Run `pnpm typecheck && pnpm lint && pnpm test --run && pnpm build && pnpm bundle-size`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names. Verify Solid.js rules: no prop destructuring, no `.map()` in JSX, signals called as functions, `<For>`/`<Show>` used correctly.
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: no hero selected, single hero, two heroes, unselect hero, same hero in both slots, hero with empty counter data. Save to `.omo/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1 batch**: `feat(counters): add shared-item utility, layout tokens, delete HeroPicker, refactor HeroGrid for multi-select` — `src/lib/counters.ts`, `src/styles/tokens.css`, `src/components/HeroPicker.tsx` (deleted), `src/components/HeroGrid.tsx`, `src/components/HeroTile.tsx`
- **Wave 2 batch**: `feat(counters): add CounterDetailCard and CountersPage components` — `src/components/CounterDetailCard.tsx`, `src/pages/counters.tsx`
- **Wave 3 batch**: `feat(counters): wire routes, cleanup, and redirect from /heroes` — `src/app.tsx`, `src/routes.ts`, `src/styles/global.css`
- **Wave 4 batch**: `test(counters): e2e scenarios for dual-hero counters page` — `e2e/smoke.spec.ts`
- Pre-commit: `pnpm typecheck && pnpm lint && pnpm test --run && pnpm build && pnpm bundle-size`

---

## Success Criteria

### Verification Commands
```bash
pnpm typecheck          # 0 errors
pnpm lint               # 0 errors
pnpm test --run         # all tests pass
pnpm build              # exit 0
pnpm bundle-size        # 0 violations (under 60KB JS gz, 20KB CSS gz, no chunk over 100KB gz)
pnpm test:e2e           # all e2e scenarios pass
```

### Final Checklist
- [ ] All "Must Have" present
- [ ] All "Must NOT Have" absent
- [ ] All tests pass
- [ ] `/heroes` redirects to `/counters`
- [ ] Dual-hero selection works (click fills slots, disable unselected, toggle off selected)
- [ ] Shared items highlighted with accent border + "×2" badge
- [ ] Bundle under budget