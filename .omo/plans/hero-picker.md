# Hero Picker — 3-Phase Implementation

## TL;DR

> **Quick Summary**: Build a hero picker for the Deadlock Helpful Info Solid.js SPA in 3 phases — display primitives, grid composition, then an overlay where clicking a "?" card opens a grid and selecting a hero swaps the placeholder.
>
> **Deliverables**:
> - `scripts/fetch-heroes.ts` (one-shot regen tool, NOT CI-wired)
> - `src/generated/heroes.json` (47 player-selectable heroes, baked)
> - `src/lib/types.ts` (overwritten with minimal correct shape)
> - `src/components/HeroTile.tsx` + tests + CSS
> - `src/components/HeroCard.tsx` + tests
> - `src/components/HeroGrid.tsx` + tests
> - `src/components/HeroPicker.tsx` + tests
> - `src/components/HeroPicker.css` (external, BEM kebab-case)
> - `src/pages/heroes.tsx` (new `/heroes` route)
> - Route + nav entry wiring in `src/app.tsx` + `src/routes.ts`
> - E2E coverage in `e2e/smoke.spec.ts`
>
> **Estimated Effort**: Medium (10 tasks across 3 phases + final review wave)
> **Parallel Execution**: YES — 4 waves (incl. final review)
> **Critical Path**: 0 (spike) → 2 (types) → 4 (HeroTile GREEN) → 6 (HeroGrid GREEN) → 7 (page wiring) → 8 (HeroPicker GREEN) → 9 (E2E) → F1–F4 → user okay
> (Task 1 and Task 3 run in parallel with Task 2 in Wave 1 and are not on the critical path.)

---

## Context

### Original Request
Build a Hero Picker for the Deadlock Helpful Info SPA in 3 phases:
1. Hero display primitives + baked data
2. Grid composition + page wiring
3. Overlay swap: click "?" card → opens grid → select hero → swaps placeholder

### Interview Summary
**User-Confirmed Decisions**:
- Commit `scripts/fetch-heroes.ts` as one-shot regen tool (NOT CI-wired)
- OVERWRITE `src/lib/types.ts` skeleton with minimal correct shape
- Save plan and hand off via `/start-work` (no high-accuracy Momus loop)

**Defaults Applied** (from Metis review — user can override):
- Bake BOTH PNG + WebP image URLs (Steam Overlay perf win, ~25-35% smaller)
- Render fallback (first letter on accent-gold) for 3 heroes with empty `images: {}` — do NOT filter out
- Exclude `items: Record<string,string>` field (YAGNI — separate plan if abilities ever needed)
- Use `mousedown` (not `click`) for document-level outside-close (better UX)
- `position: fixed; inset: 0` (not `100vw/100vh` — viewport reliability)
- `setTimeout(..., 100)` for overlay focus (Steam Overlay focus-stealing mitigation)
- `fetch-heroes.ts` exits non-zero on API failure, leaves existing `heroes.json` untouched
- Phase 0 spike validates `import heroes from '~/generated/heroes.json'` with `verbatimModuleSyntax: true` BEFORE Phase 1 component work
- z-index: 9999 on overlay

### Research Findings (Metis-validated)
- API: `GET https://api.deadlock-api.com/v1/assets/heroes` — `abilities` field does NOT exist on hero response; `items: Record<string,string>` does (maps slot key → ability ID)
- 61 heroes total, 47 with `player_selectable: true`
- 3 player-selectable heroes have `images: {}` empty
- CDN: `https://assets-bucket.deadlock-api.com/assets-api-res/images/heroes/...`
- WebP variants exist for every image key (e.g., `icon_image_small_webp`)
- `tsconfig.json` has `resolveJsonModule: true` AND `verbatimModuleSyntax: true` — JSON import syntax UNTESTED
- `vite.config.ts` has `assetsInlineLimit: 0` (no base64 inlining)
- Existing components (AppShell, cheatsheets) put styles in `global.css`; this plan introduces external co-located `.css` files as a new convention for new components

### Metis Review
**Identified Gaps** (all addressed):
- API shape mismatch (corrected via overwrite + Phase 0 spike)
- Empty-images edge case (fallback renderer)
- jsdom focus-trap limitation (assertions via `document.activeElement`; real keyboard cycle deferred to Playwright)
- Bundle-size risk (checkpoint after Phase 1)
- AI-slop attack surface (19 explicit MUST NOTs)

---

## Work Objectives

### Core Objective
Build a hero picker overlay where clicking a card placeholder opens a grid of all 47 player-selectable heroes, and selecting one swaps the placeholder for the hero's card image.

### Concrete Deliverables
- `scripts/fetch-heroes.ts` — Node script, runs `node --experimental-strip-types scripts/fetch-heroes.ts`
- `src/generated/heroes.json` — 47 entries, sorted by `name`, fields: `id`, `name`, `class_name`, `images.icon_image_small`, `images.icon_image_small_webp`, `images.icon_hero_card`, `images.icon_hero_card_webp`
- `src/lib/types.ts` — replaced contents (skeleton deleted)
- `src/components/HeroTile.tsx` + `__tests__/HeroTile.test.tsx`
- `src/components/HeroCard.tsx` + `__tests__/HeroCard.test.tsx`
- `src/components/HeroGrid.tsx` + `__tests__/HeroGrid.test.tsx`
- `src/components/HeroPicker.tsx` + `__tests__/HeroPicker.test.tsx`
- `src/components/HeroPicker.css`
- `src/pages/heroes.tsx`
- `src/app.tsx` — add `Heroes` lazy route
- `src/routes.ts` — add `{ path: '/heroes', label: 'Heroes' }` to `navRoutes`
- `e2e/smoke.spec.ts` — add 3 hero picker scenarios

### Definition of Done
- [ ] `pnpm check && pnpm typecheck && pnpm test --run && pnpm build && pnpm bundle-size` all exit 0
- [ ] `pnpm test:e2e` exits 0 (hero picker scenarios pass)
- [ ] `pnpm bundle-size` reports initial JS gzipped < 30 KB (current ~14 KB + ~10 KB budget for this plan)
- [ ] Navigating to `/#/heroes`, clicking the "?" card, then clicking a hero tile, swaps the card visual

### Must Have
- TDD: each component task is RED (failing test for missing module/wrong behavior) → GREEN (minimal implementation)
- Vitest tests use `render()` from `@solidjs/testing-library` + `screen.getByRole(...)` — NOT source-grep
- Focus trap test uses `document.activeElement` assertion (jsdom can't simulate real Tab cycling)
- All a11y: `role="dialog"` + `aria-modal="true"` on overlay; `role="listbox"` + `aria-label="Heroes"` on grid; `role="option"` + `aria-selected` on tiles; `aria-haspopup="dialog"` + `aria-expanded` on trigger
- Solid rules: NEVER destructure `props`; use `<For>` (not `.map()`); use `<Show>` (not ternary) for overlay mount
- BEM kebab-case (`.hero-picker__overlay`, `.hero-tile--selected`)
- WebP `<source>` + PNG `<img>` fallback via `<picture>` element
- Empty-images heroes render fallback (first letter of `name`, accent-gold background)
- Bundle-size check after Phase 1 commit batch

### Must NOT Have (Guardrails)
- ❌ Generic `Modal` / `Overlay` / `Dropdown` base component (build concrete `HeroPicker`)
- ❌ `useFocusTrap` / `useClickOutside` extracted hooks (inline ~20 lines each)
- ❌ `/heroes/:id` detail route (separate plan)
- ❌ Hero search / filter / sort UI (separate plan)
- ❌ Image preload (`<link rel="preload">`)
- ❌ ErrorBoundary wrapper
- ❌ Loading spinner (data is a static import)
- ❌ CSS transitions or animations on overlay (deferred — `prefers-reduced-motion` rule in global.css is safety net)
- ❌ Arrow-key grid navigation (deferred — would upgrade to `role="grid"`)
- ❌ `createMemo` over static heroes data
- ❌ JSDoc comments
- ❌ `console.log` / `console.warn` / `console.error` in component code
- ❌ Branded types (e.g., `HeroId = Brand<number, 'HeroId'>`)
- ❌ `as const` on imported JSON
- ❌ CSS nesting (flat BEM only)
- ❌ `stopPropagation()` in overlay (use containment check)
- ❌ Portal (`<Portal>` from `solid-js/web`) — Steam Overlay risk
- ❌ `display: none` to hide overlay (must unmount via `<Show>`)
- ❌ New runtime dependencies (no `@deadlock-api/ui-core`, no kobalte, no headless UI)
- ❌ `package.json` script entry for `fetch-heroes.ts` (run manually only)
- ❌ Wiring `fetch-heroes.ts` into CI
- ❌ Preserving any field from the old `types.ts` skeleton (`HeroImages`, `Ability`, `Item`, `HeroStats`, `SlotType` are all wrong — DELETE)

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed.

### Test Decision
- **Infrastructure exists**: YES — Vitest 2.1 + `@solidjs/testing-library` 0.8 + Playwright 1.50 (chromium)
- **Automated tests**: YES (TDD) — each component task is RED → GREEN
- **Framework**: Vitest (unit, jsdom) + Playwright (E2E, chromium)
- **Test setup**: `src/test-setup.ts` already wires `@testing-library/jest-dom` + `cleanup()` afterEach

### QA Policy
Every implementation task includes agent-executed QA scenarios. Evidence saved to `.omo/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Unit (Vitest)**: `pnpm vitest run path/to/test --reporter=verbose` — assertion log captured
- **E2E (Playwright)**: `pnpm test:e2e` — screenshots + traces in `playwright-report/`
- **Build gate**: `pnpm typecheck && pnpm build && pnpm bundle-size` — JSON report captured
- **Visual sanity (browser)**: Playwright screenshot for grid layout + overlay open state

### jsdom Caveat
jsdom does not implement real focus cycling. Focus-trap unit tests MUST:
- Use `document.activeElement` assertion (e.g., `expect(document.activeElement).toBe(firstOption)`)
- NOT use `userEvent.tab()` (will set activeElement but not cycle correctly)
- Defer real Tab-cycling validation to Playwright E2E

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 0 (de-risk spike — MUST complete before Wave 1):
└── Task 0: JSON import + verbatimModuleSyntax spike [quick]

Wave 1 (foundation — after Wave 0 confirms spike):
├── Task 1: fetch-heroes.ts + bake heroes.json [quick]
├── Task 2: Overwrite types.ts with minimal shape [quick]
└── Task 3: Base CSS file (HeroPicker.css with primitives) [quick]

Wave 2 (display primitives — after Wave 1):
├── Task 4: HeroTile RED→GREEN (depends: 2, 3) [quick]
└── Task 5: HeroCard RED→GREEN (depends: 2, 3) [quick]

Wave 3 (composition + page — after Wave 2):
├── Task 6: HeroGrid RED→GREEN (depends: 4) [quick]
└── Task 7: /heroes page + route + nav wiring (depends: 1, 5, 6) [quick]

Wave 4 (picker + E2E — after Wave 3):
├── Task 8: HeroPicker RED→GREEN + overlay CSS (depends: 5, 6) [unspecified-high]
└── Task 9: Wire HeroPicker into /heroes + E2E scenarios (depends: 7, 8) [quick]

Wave FINAL (4 parallel reviews after Wave 4 — then user okay):
├── Task F1: Plan compliance audit [oracle]
├── Task F2: Code quality review [unspecified-high]
├── Task F3: Real manual QA via Playwright [unspecified-high]
└── Task F4: Scope fidelity check [deep]
→ Present results → Get explicit user okay

Critical Path: 0 → 2 → 4 → 6 → 7 → 8 → 9 → F1-F4 → user okay
Max Concurrent: 3 (Wave 1, Wave 2 + leftover from Wave 1)
```

### Dependency Matrix

- **0**: — → 1, 2, 3
- **1**: 0 → 7
- **2**: 0 → 4, 5
- **3**: 0 → 4, 5, 8
- **4**: 2, 3 → 6, 8
- **5**: 2, 3 → 7, 8
- **6**: 4 → 7, 8
- **7**: 1, 5, 6 → 9
- **8**: 5, 6, 3 → 9
- **9**: 7, 8 → F1–F4
- **F1–F4**: 9 → user okay

### Agent Dispatch Summary

- **Wave 0**: `quick` (1 task)
- **Wave 1**: `quick` × 3
- **Wave 2**: `quick` × 2
- **Wave 3**: `quick` × 2
- **Wave 4**: `unspecified-high` (T8 — focus trap nuance) + `quick` (T9)
- **Wave FINAL**: `oracle` (F1), `unspecified-high` (F2 + F3), `deep` (F4)

---

## TODOs

> Each task uses bare-number labels for the /start-work progress counter.
> Every task has: What to do, Must NOT do, Recommended Agent Profile, Parallelization, References, Acceptance Criteria, QA Scenarios, Commit.

- [x] 0. Phase 0 spike — JSON import + `verbatimModuleSyntax` validation

  **What to do**:
  - Create temporary file `src/generated/heroes.json` with `[{"id":1,"name":"Test","class_name":"hero_test","images":{"icon_image_small":"x","icon_image_small_webp":"x","icon_hero_card":"x","icon_hero_card_webp":"x"}}]`
  - Create temporary file `src/spike-test.ts` with: `import heroes from '~/generated/heroes.json'; export const count = heroes.length;`
  - Run `pnpm typecheck` and `pnpm build`
  - If FAIL: try `import heroes from '~/generated/heroes.json' with { type: 'json' }`. If still fails, fall back to `fetch('/heroes.json')` build-time emit pattern and update Task 1.
  - If PASS: document which import form worked in commit message; DELETE `src/spike-test.ts` and revert `src/generated/heroes.json` to empty `[]` (Task 1 will populate)
  - Commit only `src/generated/heroes.json` (empty array) — spike file deleted

  **Must NOT do**:
  - Leave `src/spike-test.ts` in the repo
  - Add the import form to any production code in this task
  - Modify `tsconfig.json` (we want to validate the EXISTING config works)

  **Recommended Agent Profile**:
  - **Category**: `quick` — single mechanical validation, binary outcome
  - **Skills**: none needed
  - **Skills Evaluated but Omitted**: none relevant

  **Parallelization**:
  - **Can Run In Parallel**: NO (gates everything)
  - **Parallel Group**: Wave 0 sequential
  - **Blocks**: 1, 2, 3
  - **Blocked By**: none

  **References**:
  - `tsconfig.json` — verify `resolveJsonModule: true` AND `verbatimModuleSyntax: true` are both present (they are)
  - `vite.config.ts` — `resolve.alias` has `~` → `./src/`
  - `package.json` — `"type": "module"` confirmed

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` exits 0 with the spike file present
  - [ ] `pnpm build` exits 0 with the spike file present
  - [ ] Commit message documents the working import form (plain `import` vs `with { type: 'json' }` vs fallback)
  - [ ] `src/spike-test.ts` does NOT exist in final commit
  - [ ] `src/generated/heroes.json` exists with content `[]`

  **QA Scenarios**:

  ```
  Scenario: JSON import compiles and bundles
    Tool: Bash
    Preconditions: src/spike-test.ts + src/generated/heroes.json (with 1-entry array) exist
    Steps:
      1. Run: pnpm typecheck 2>&1 | tee .omo/evidence/task-0-typecheck.log
      2. Run: pnpm build 2>&1 | tee .omo/evidence/task-0-build.log
      3. Run: grep -c 'Test' dist/assets/*.js 2>&1 | tee .omo/evidence/task-0-bundle-grep.log
    Expected Result: typecheck exits 0; build exits 0; "Test" string present in built JS (proves JSON was bundled)
    Failure Indicators: typecheck error TS1259 or TS1471; build error about JSON imports
    Evidence: .omo/evidence/task-0-*.log

  Scenario: Spike artifacts cleaned up
    Tool: Bash
    Preconditions: After spike validation complete
    Steps:
      1. Run: test ! -f src/spike-test.ts && echo "CLEAN" || echo "DIRTY"
      2. Run: cat src/generated/heroes.json
    Expected Result: First step prints "CLEAN"; second step prints "[]"
    Evidence: .omo/evidence/task-0-cleanup.log
  ```

  **Commit**: YES (commit A)
  - Message: `chore(spike): validate JSON import with verbatimModuleSyntax (Phase 0)`
  - Files: `src/generated/heroes.json` (empty array)
  - Pre-commit: `pnpm typecheck && pnpm build`

- [x] 1. Add `fetch-heroes.ts` + bake `src/generated/heroes.json`

  **What to do**:
  - Create `scripts/fetch-heroes.ts` with this exact behavior:
    - `fetch('https://api.deadlock-api.com/v1/assets/heroes')`
    - If `!response.ok` → `process.exitCode = 1; throw new Error(...)` (do NOT write the file)
    - Parse JSON; filter `h => h.player_selectable === true`
    - Project to: `{ id, name, class_name, images: { icon_image_small, icon_image_small_webp, icon_hero_card, icon_hero_card_webp } }`
    - For heroes with empty `images: {}` — emit ALL FOUR image fields as empty strings `""` (component renders fallback when first letter detected)
    - Sort by `name` ascending
    - Assert array length >= 40 (sanity guard); if < 40 → exitCode = 1, throw
    - Write to `src/generated/heroes.json` with 2-space indent + trailing newline
  - Run: `node --experimental-strip-types scripts/fetch-heroes.ts`
  - Commit `scripts/fetch-heroes.ts` AND `src/generated/heroes.json`

  **Must NOT do**:
  - Add the script to `package.json` `scripts`
  - Wire it into `.github/workflows/*`
  - Write the raw API `images` object (must explicitly pick the 4 fields)
  - Use `axios` or any HTTP library (use Node 22 native `fetch`)
  - Include `items`, `disabled`, `in_development`, `colors`, or any field beyond the 4 typed ones
  - Add a placeholder `heroes.json` fallback for when API is down (intentional fail-fast)

  **Recommended Agent Profile**:
  - **Category**: `quick` — focused single-file script + one-shot data bake
  - **Skills**: none
  - **Skills Evaluated but Omitted**: none

  **Parallelization**:
  - **Can Run In Parallel**: YES — independent of Task 2 and Task 3
  - **Parallel Group**: Wave 1 (with 2, 3)
  - **Blocks**: 7
  - **Blocked By**: 0

  **References**:
  - API contract: `GET https://api.deadlock-api.com/v1/assets/heroes` returns array; sample hero shape confirmed via prior librarian research
  - Existing CDN base: `https://assets-bucket.deadlock-api.com/`
  - Filter rule: `player_selectable === true` (47 heroes; do NOT add `!disabled` etc. — over-filtering)
  - Image fields per Metis: API has up to 15 image keys; pick exactly `icon_image_small`, `icon_image_small_webp`, `icon_hero_card`, `icon_hero_card_webp`
  - 3 heroes have `images: {}` empty — script emits `""` for each missing key; type stays string (not optional)

  **Acceptance Criteria**:
  - [ ] `scripts/fetch-heroes.ts` exists with the projection logic above
  - [ ] `src/generated/heroes.json` exists with exactly 47 entries (or whatever the live API returns at fetch time, ≥40)
  - [ ] All entries have the 4 image fields (possibly empty strings for the 3 known empty-images heroes)
  - [ ] Array is sorted by `name` ascending
  - [ ] `cat src/generated/heroes.json | jq 'length'` → ≥40
  - [ ] `cat src/generated/heroes.json | jq '.[0] | keys'` → `["class_name","id","images","name"]`
  - [ ] `pnpm typecheck` exits 0 (type from Task 2 should accept the data)
  - [ ] `package.json` is unchanged
  - [ ] `.github/workflows/` is unchanged

  **QA Scenarios**:

  ```
  Scenario: Script bakes valid hero list
    Tool: Bash
    Preconditions: Network access to api.deadlock-api.com; Task 0 + 2 complete
    Steps:
      1. Run: node --experimental-strip-types scripts/fetch-heroes.ts 2>&1 | tee .omo/evidence/task-1-run.log
      2. Run: jq 'length' src/generated/heroes.json | tee .omo/evidence/task-1-count.log
      3. Run: jq '.[0]' src/generated/heroes.json | tee .omo/evidence/task-1-sample.log
      4. Run: jq '[.[] | .images | keys] | unique' src/generated/heroes.json | tee .omo/evidence/task-1-image-keys.log
    Expected Result: script exits 0; count ≥40; sample has id/name/class_name/images.{icon_image_small,icon_image_small_webp,icon_hero_card,icon_hero_card_webp}; unique image keys arrays all contain exactly the 4 declared keys
    Failure Indicators: exit code !=0; count <40; extra/missing image keys
    Evidence: .omo/evidence/task-1-*.log

  Scenario: Script fails safely on API error
    Tool: Bash
    Preconditions: Network blocked or API returns non-200
    Steps:
      1. Run: cp src/generated/heroes.json /tmp/heroes-snapshot.json
      2. Run with bad URL override (modify temporarily or use https_proxy=http://127.0.0.1:1 to force failure): node --experimental-strip-types scripts/fetch-heroes.ts; echo "exit=$?" | tee .omo/evidence/task-1-fail.log
      3. Run: diff src/generated/heroes.json /tmp/heroes-snapshot.json && echo "UNCHANGED" | tee .omo/evidence/task-1-unchanged.log
    Expected Result: script exits non-zero; existing heroes.json byte-identical to snapshot (no clobber)
    Evidence: .omo/evidence/task-1-fail.log, .omo/evidence/task-1-unchanged.log
  ```

  **Commit**: YES (commit B)
  - Message: `feat(data): add fetch-heroes.ts + bake src/generated/heroes.json`
  - Files: `scripts/fetch-heroes.ts`, `src/generated/heroes.json`
  - Pre-commit: `pnpm typecheck`

- [x] 2. Overwrite `src/lib/types.ts` with minimal correct shape

  **What to do**:
  - DELETE all existing exports from `src/lib/types.ts` (`HeroImages`, `Ability`, `Hero`, `Item`, `HeroStats`, `SlotType` — all wrong)
  - Replace with EXACTLY:
    ```ts
    export interface HeroImages {
      icon_image_small: string;
      icon_image_small_webp: string;
      icon_hero_card: string;
      icon_hero_card_webp: string;
    }

    export interface Hero {
      id: number;
      name: string;
      class_name: string;
      images: HeroImages;
    }
    ```
  - Run `pnpm typecheck` — must pass (no other file currently imports from `types.ts`; verified by Metis)
  - Run `grep -rn "from.*~/lib/types" src/` — if any imports exist, REJECT and surface to user (the assumption that types.ts is unused was verified at plan time but check at exec time)

  **Must NOT do**:
  - Preserve any old type fields (`portrait`, `card`, `icon`, `minimap`, `abilities`, `stats`, etc.)
  - Add JSDoc comments
  - Add `Brand<>` types
  - Add `items: Record<string, string>` (excluded per user decision)
  - Mark image fields optional (`?:`) — empty heroes get `""`, not `undefined`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Skills Evaluated but Omitted**: none

  **Parallelization**:
  - **Can Run In Parallel**: YES — independent of Task 1, Task 3
  - **Parallel Group**: Wave 1 (with 1, 3)
  - **Blocks**: 4, 5
  - **Blocked By**: 0

  **References**:
  - Existing `src/lib/types.ts` — to be wholly replaced
  - `src/generated/heroes.json` (from Task 1) — shape must match this interface exactly
  - Metis-verified: NO existing file imports from `src/lib/types.ts` (safe to overwrite)

  **Acceptance Criteria**:
  - [ ] `src/lib/types.ts` contains exactly the two interfaces above + no other code
  - [ ] `pnpm typecheck` exits 0
  - [ ] `grep -rn "from.*~/lib/types" src/` returns empty BEFORE this commit (sanity)
  - [ ] After Task 7 lands, `src/pages/heroes.tsx` imports `Hero` from `~/lib/types` and typechecks

  **QA Scenarios**:

  ```
  Scenario: Type overwrite compiles
    Tool: Bash
    Preconditions: Task 0 + Task 1 complete; src/generated/heroes.json populated
    Steps:
      1. Run: pnpm typecheck 2>&1 | tee .omo/evidence/task-2-typecheck.log
      2. Run: cat src/lib/types.ts | tee .omo/evidence/task-2-content.log
      3. Run: wc -l src/lib/types.ts | tee .omo/evidence/task-2-lines.log
    Expected Result: typecheck exits 0; file content has exactly the 2 interfaces; line count is small (~15 lines)
    Failure Indicators: typecheck errors; file contains old types
    Evidence: .omo/evidence/task-2-*.log

  Scenario: heroes.json data conforms to new type
    Tool: Bash (bun/node one-liner)
    Preconditions: Task 1 + Task 2 complete
    Steps:
      1. Create temp file scripts/_verify-types.ts: `import type { Hero } from '../src/lib/types'; import data from '../src/generated/heroes.json'; const h: ReadonlyArray<Hero> = data; console.log(h.length);`
      2. Run: pnpm exec tsc --noEmit scripts/_verify-types.ts 2>&1 | tee .omo/evidence/task-2-conformance.log
      3. Run: rm scripts/_verify-types.ts
    Expected Result: tsc exits 0 (data conforms to type)
    Evidence: .omo/evidence/task-2-conformance.log
  ```

  **Commit**: YES (commit C)
  - Message: `refactor(types): overwrite Hero/HeroImages with minimal correct API shape`
  - Files: `src/lib/types.ts`
  - Pre-commit: `pnpm typecheck`

- [x] 3. Create `src/components/HeroPicker.css` with primitive styles

  **What to do**:
  - Create `src/components/HeroPicker.css` (external file, NOT inline `<style>`)
  - Use ONLY tokens from `src/styles/tokens.css` (`var(--color-bg)`, `var(--color-fg)`, `var(--color-accent)`, etc. — read tokens.css to confirm exact names)
  - Include sections (in this order):
    - `.hero-tile` block (button reset, aspect-ratio:1, padding:0, background:#141414, border:1px solid transparent, cursor:pointer, overflow:hidden, border-radius:4px)
    - `.hero-tile:focus-visible` (outline:2px solid var(--color-accent); outline-offset:2px)
    - `.hero-tile--selected` (border-color:var(--color-accent); box-shadow:0 0 0 2px var(--color-accent))
    - `.hero-tile__img` (width:100%; height:100%; object-fit:cover; display:block)
    - `.hero-tile__fallback` (width:100%; height:100%; display:grid; place-items:center; background:var(--color-accent); color:#0a0a0a; font-weight:700; font-size:1.5rem)
    - `.hero-card` (width:128px; aspect-ratio:3/4; background:#141414; display:grid; place-items:center; border-radius:4px; overflow:hidden)
    - `.hero-card__placeholder` (font-size:64px; opacity:0.4; color:var(--color-fg))
    - `.hero-card__img` (width:100%; height:100%; object-fit:cover; display:block)
    - `.hero-card__fallback` (same as hero-tile__fallback but font-size:3rem)
    - Grid + overlay rules added in Task 8 (additive edits — do NOT pre-stub them here)
  - No CSS nesting. Flat BEM only.

  **Must NOT do**:
  - Use CSS nesting (`& __tile`)
  - Add transitions or animations
  - Add `@media` queries (added in Task 6 for grid + Task 8 for overlay)
  - Pre-stub `.hero-grid` or `.hero-picker` rules (those are added in Tasks 6 and 8 to keep diffs scoped)
  - Hardcode colors that exist as tokens (use `var(--color-*)`)
  - Add a `style` attribute anywhere

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none
  - **Skills Evaluated but Omitted**: `visual-engineering` — overkill for static BEM CSS with no animation/layout complexity

  **Parallelization**:
  - **Can Run In Parallel**: YES — independent of Task 1, Task 2
  - **Parallel Group**: Wave 1 (with 1, 2)
  - **Blocks**: 4, 5, 8
  - **Blocked By**: 0

  **References**:
  - `src/styles/tokens.css` — read to confirm exact token names (`--color-bg`, `--color-fg`, `--color-accent`)
  - `src/styles/global.css` lines 93-117 — `.app-shell__header` pattern shows the existing BEM convention to match
  - `AGENTS.md` "Dark theme" — `#0a0a0a` bg, `#e6e6e6` fg, `#d4af37` gold accent (confirm these are the token values)

  **Acceptance Criteria**:
  - [ ] `src/components/HeroPicker.css` exists
  - [ ] All declared selectors present
  - [ ] `pnpm check` (biome) exits 0
  - [ ] No `&` nesting
  - [ ] All colors via `var(--color-*)` except the literal `#141414` tile/card surface and `#0a0a0a` fallback text color

  **QA Scenarios**:

  ```
  Scenario: CSS file lints clean
    Tool: Bash
    Preconditions: src/components/HeroPicker.css created
    Steps:
      1. Run: pnpm check 2>&1 | tee .omo/evidence/task-3-biome.log
      2. Run: grep -c '^\.' src/components/HeroPicker.css | tee .omo/evidence/task-3-selectors.log
      3. Run: grep -c '&' src/components/HeroPicker.css | tee .omo/evidence/task-3-nesting.log
    Expected Result: biome exits 0; selector count ≥9; nesting count = 0
    Evidence: .omo/evidence/task-3-*.log
  ```

  **Commit**: YES (commit D)
  - Message: `feat(styles): add HeroPicker.css with hero-tile + hero-card primitives`
  - Files: `src/components/HeroPicker.css`
  - Pre-commit: `pnpm check`

- [x] 4. HeroTile component — RED → GREEN

  **What to do**:
  - **RED**: Create `src/components/__tests__/HeroTile.test.tsx` first. Tests:
    1. Renders a `<button role="option" type="button">` element
    2. Renders `<picture>` containing `<source type="image/webp" srcset={hero.images.icon_image_small_webp}>` + `<img src={hero.images.icon_image_small} alt={hero.name} loading="lazy" decoding="async">`
    3. When `hero.images.icon_image_small === ""`, renders `<span class="hero-tile__fallback">{first letter of name uppercased}</span>` instead of picture
    4. Has `data-hero-id` attribute equal to `String(hero.id)`
    5. When `selected={true}`: `aria-selected="true"` and class includes `hero-tile--selected`
    6. When `selected={false}` (or omitted): `aria-selected="false"` and class does NOT include `hero-tile--selected`
    7. Clicking calls `onSelect` exactly once with the hero object reference
  - Run `pnpm vitest run src/components/__tests__/HeroTile.test.tsx` — expect FAIL (cannot find module)
  - **GREEN**: Create `src/components/HeroTile.tsx`:
    ```tsx
    import { Show } from 'solid-js';
    import type { Hero } from '~/lib/types';

    interface HeroTileProps {
      hero: Hero;
      selected?: boolean;
      onSelect: (hero: Hero) => void;
    }

    export default function HeroTile(props: HeroTileProps) {
      const hasImage = () => props.hero.images.icon_image_small !== '';
      const initial = () => (props.hero.name[0] ?? '?').toUpperCase();
      const tileClass = () =>
        `hero-tile${props.selected ? ' hero-tile--selected' : ''}`;
      return (
        <button
          type="button"
          role="option"
          aria-selected={props.selected ? 'true' : 'false'}
          data-hero-id={String(props.hero.id)}
          class={tileClass()}
          onClick={() => props.onSelect(props.hero)}
        >
          <Show
            when={hasImage()}
            fallback={<span class="hero-tile__fallback">{initial()}</span>}
          >
            <picture>
              <source type="image/webp" srcset={props.hero.images.icon_image_small_webp} />
              <img
                class="hero-tile__img"
                src={props.hero.images.icon_image_small}
                alt={props.hero.name}
                loading="lazy"
                decoding="async"
              />
            </picture>
          </Show>
        </button>
      );
    }
    ```
  - Run tests — expect PASS

  **Must NOT do**:
  - Destructure `props` (use `props.hero`, etc.)
  - Use `.map()` (no list here, but rule still applies in general)
  - Use ternary inside JSX for selected class (string concat is fine and matches existing patterns)
  - Add `useFocusTrap` or any abstraction
  - Add JSDoc
  - Add `console.log`
  - Use `as any`
  - Add hover transition

  **Recommended Agent Profile**:
  - **Category**: `quick` — focused single-component TDD
  - **Skills**: none
  - **Skills Evaluated but Omitted**: `visual-engineering` — no design decisions, all locked

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Task 5
  - **Parallel Group**: Wave 2 (with 5)
  - **Blocks**: 6, 8
  - **Blocked By**: 2 (types), 3 (CSS class names referenced in tests)

  **References**:
  - `src/components/AppShell.tsx` — props pattern (non-destructured)
  - `src/components/__tests__/AppShell.test.tsx` — known-bad pattern to AVOID (source-grep, not render)
  - For correct Vitest + Solid `render()` pattern: use `render(() => <HeroTile ... />)` from `@solidjs/testing-library`; `screen.getByRole('option')`; `fireEvent.click(...)`
  - `src/lib/types.ts` (post-Task 2) for `Hero` type
  - `src/components/HeroPicker.css` (post-Task 3) for class names `hero-tile`, `hero-tile--selected`, `hero-tile__img`, `hero-tile__fallback`

  **Acceptance Criteria**:
  - [ ] Test file commits FIRST in the same commit; git log shows RED→GREEN via temporary intermediate or simply one commit if RED state is captured in the commit body
  - [ ] `pnpm vitest run src/components/__tests__/HeroTile.test.tsx` reports 7+ tests, all pass
  - [ ] `pnpm check && pnpm typecheck` both exit 0
  - [ ] `ast-grep --lang tsx --pattern 'function $NAME({ $$$ })' src/components/HeroTile.tsx` returns empty
  - [ ] `grep -c 'console\.' src/components/HeroTile.tsx` returns 0
  - [ ] No `as any` or `@ts-ignore` in either file

  **QA Scenarios**:

  ```
  Scenario: HeroTile renders image and selection state
    Tool: Bash (vitest)
    Preconditions: Task 2 + Task 3 complete
    Steps:
      1. Run: pnpm vitest run src/components/__tests__/HeroTile.test.tsx --reporter=verbose 2>&1 | tee .omo/evidence/task-4-tests.log
      2. Run: pnpm typecheck 2>&1 | tee .omo/evidence/task-4-typecheck.log
    Expected Result: All 7 tests pass; typecheck exits 0
    Failure Indicators: any test fail; typecheck errors
    Evidence: .omo/evidence/task-4-*.log

  Scenario: HeroTile fallback for empty-images hero
    Tool: Bash (vitest with empty-images fixture)
    Preconditions: Test file includes case with hero `{ id: 99, name: "Bomber", class_name: "hero_bomber", images: { icon_image_small: "", icon_image_small_webp: "", icon_hero_card: "", icon_hero_card_webp: "" } }`
    Steps:
      1. Same vitest run as above — fallback test assertion is included
      2. Run: grep -A2 'fallback' .omo/evidence/task-4-tests.log
    Expected Result: Test "renders fallback letter B when images empty" passes
    Evidence: .omo/evidence/task-4-tests.log

  Scenario: Lint + AST cleanliness
    Tool: Bash
    Preconditions: HeroTile.tsx created
    Steps:
      1. Run: pnpm check 2>&1 | tee .omo/evidence/task-4-biome.log
      2. Run: ast-grep --lang tsx --pattern 'function $NAME({ $$$ })' src/components/HeroTile.tsx | tee .omo/evidence/task-4-no-destructure.log
      3. Run: ast-grep --lang tsx --pattern '$ARR.map($$$)' src/components/HeroTile.tsx | tee .omo/evidence/task-4-no-map.log
    Expected Result: biome 0; both ast-grep outputs empty
    Evidence: .omo/evidence/task-4-*.log
  ```

  **Commit**: YES (commit E)
  - Message: `feat(components): add HeroTile primitive with TDD coverage`
  - Files: `src/components/HeroTile.tsx`, `src/components/__tests__/HeroTile.test.tsx`
  - Pre-commit: `pnpm check && pnpm typecheck && pnpm vitest run src/components/__tests__/HeroTile.test.tsx`

- [x] 5. HeroCard component — RED → GREEN (with empty-images fallback)

  **What to do**:
  - **RED**: Create `src/components/__tests__/HeroCard.test.tsx`. Tests:
    1. When `hero` prop is `undefined`: renders `<span class="hero-card__placeholder" data-placeholder="true">?</span>`; root has class `hero-card`
    2. When `hero` provided and `icon_hero_card !== ""`: renders `<picture>` with WebP `<source>` + `<img src={hero.images.icon_hero_card} alt={hero.name} decoding="async">`
    3. When `hero` provided but `icon_hero_card === ""`: renders `<span class="hero-card__fallback">{first letter uppercased}</span>`
    4. Root element class is exactly `hero-card`
  - Run vitest — expect FAIL
  - **GREEN**: Create `src/components/HeroCard.tsx`:
    ```tsx
    import { Show } from 'solid-js';
    import type { Hero } from '~/lib/types';

    interface HeroCardProps {
      hero: Hero | undefined;
    }

    export default function HeroCard(props: HeroCardProps) {
      return (
        <div class="hero-card">
          <Show
            when={props.hero}
            fallback={
              <span class="hero-card__placeholder" data-placeholder="true">?</span>
            }
          >
            {(hero) => (
              <Show
                when={hero().images.icon_hero_card !== ''}
                fallback={
                  <span class="hero-card__fallback">
                    {(hero().name[0] ?? '?').toUpperCase()}
                  </span>
                }
              >
                <picture>
                  <source type="image/webp" srcset={hero().images.icon_hero_card_webp} />
                  <img
                    class="hero-card__img"
                    src={hero().images.icon_hero_card}
                    alt={hero().name}
                    decoding="async"
                  />
                </picture>
              </Show>
            )}
          </Show>
        </div>
      );
    }
    ```
  - Run tests — expect PASS

  **Must NOT do**:
  - Destructure `props`
  - Use ternary in JSX for the placeholder/image switch (use nested `<Show>`)
  - Add `loading="lazy"` to the card image (card is the main visible element, not a thumbnail)
  - Add CSS animation/transition

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none

  **Parallelization**:
  - **Can Run In Parallel**: YES — with Task 4
  - **Parallel Group**: Wave 2 (with 4)
  - **Blocks**: 7, 8
  - **Blocked By**: 2, 3

  **References**:
  - `src/lib/types.ts` (post-Task 2)
  - `src/components/HeroPicker.css` (post-Task 3) for `hero-card`, `hero-card__placeholder`, `hero-card__img`, `hero-card__fallback`
  - Solid `<Show>` callback-as-child pattern: `{(accessor) => <jsx>{accessor().foo}</jsx>}` (Solid's narrowing trick)

  **Acceptance Criteria**:
  - [ ] All 4 tests pass
  - [ ] `pnpm check && pnpm typecheck` exit 0
  - [ ] `ast-grep --lang tsx --pattern 'function $NAME({ $$$ })' src/components/HeroCard.tsx` empty
  - [ ] `grep -c 'console\.' src/components/HeroCard.tsx` = 0

  **QA Scenarios**:

  ```
  Scenario: HeroCard renders placeholder, image, and fallback states
    Tool: Bash (vitest)
    Preconditions: Tasks 2 + 3 complete
    Steps:
      1. Run: pnpm vitest run src/components/__tests__/HeroCard.test.tsx --reporter=verbose 2>&1 | tee .omo/evidence/task-5-tests.log
      2. Run: pnpm typecheck 2>&1 | tee .omo/evidence/task-5-typecheck.log
    Expected Result: 4 tests pass; typecheck exits 0
    Evidence: .omo/evidence/task-5-*.log
  ```

  **Commit**: YES (commit F)
  - Message: `feat(components): add HeroCard with ? placeholder + empty-images fallback (TDD)`
  - Files: `src/components/HeroCard.tsx`, `src/components/__tests__/HeroCard.test.tsx`
  - Pre-commit: `pnpm check && pnpm typecheck && pnpm vitest run src/components/__tests__/HeroCard.test.tsx`

- [x] 6. HeroGrid component — RED → GREEN + grid CSS

  **What to do**:
  - **RED**: Create `src/components/__tests__/HeroGrid.test.tsx` with a 3-hero fixture. Tests:
    1. Root has `role="listbox"` and `aria-label="Heroes"` and class `hero-picker__grid`
    2. Renders exactly N `[role="option"]` children for an N-hero fixture
    3. When `selectedId === heroes[1].id`, only that tile has `aria-selected="true"`; others `"false"`
    4. Clicking a tile calls `onSelect` with that hero
    5. Component uses `<For>` (assert via DOM: rendering 3 heroes then re-rendering with order swapped reuses nodes — assert via `data-hero-id` after re-render matches new order)
  - Run vitest — expect FAIL
  - **GREEN**: Create `src/components/HeroGrid.tsx`:
    ```tsx
    import { For } from 'solid-js';
    import HeroTile from './HeroTile';
    import type { Hero } from '~/lib/types';

    interface HeroGridProps {
      heroes: ReadonlyArray<Hero>;
      selectedId: number | undefined;
      onSelect: (hero: Hero) => void;
    }

    export default function HeroGrid(props: HeroGridProps) {
      return (
        <div role="listbox" aria-label="Heroes" class="hero-picker__grid">
          <For each={props.heroes}>
            {(hero) => (
              <HeroTile
                hero={hero}
                selected={props.selectedId === hero.id}
                onSelect={props.onSelect}
              />
            )}
          </For>
        </div>
      );
    }
    ```
  - APPEND to `src/components/HeroPicker.css`:
    ```css
    .hero-picker__grid {
      display: grid;
      gap: 8px;
      grid-template-columns: repeat(6, 1fr);
      padding: 12px;
    }
    @media (max-width: 960px) { .hero-picker__grid { grid-template-columns: repeat(5, 1fr); } }
    @media (max-width: 720px) { .hero-picker__grid { grid-template-columns: repeat(4, 1fr); } }
    @media (max-width: 480px) { .hero-picker__grid { grid-template-columns: repeat(3, 1fr); } }
    ```
  - Run tests — expect PASS

  **Must NOT do**:
  - Use `.map()` instead of `<For>`
  - Destructure props
  - Add filtering / sorting / search logic
  - Add `<Index>` (we want keyed-by-reference behavior of `<For>`)
  - Add a generic `Grid` base component

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none

  **Parallelization**:
  - **Can Run In Parallel**: NO (Wave 3 single-track for these two)
  - **Parallel Group**: Wave 3 (with Task 7 — both depend on prior waves, runnable in parallel)
  - **Blocks**: 7, 8
  - **Blocked By**: 4

  **References**:
  - `src/components/HeroTile.tsx` (post-Task 4)
  - `src/components/HeroPicker.css` (post-Task 3) — additive append
  - AGENTS.md "Solid.js — Critical Rules" → "Use `<For>` or `<Index>` — never `.map()`"

  **Acceptance Criteria**:
  - [ ] 5 tests pass
  - [ ] `ast-grep --lang tsx --pattern '$ARR.map($$$)' src/components/HeroGrid.tsx` empty
  - [ ] `grep '@media' src/components/HeroPicker.css | wc -l` = 3
  - [ ] `pnpm check && pnpm typecheck` exit 0

  **QA Scenarios**:

  ```
  Scenario: HeroGrid renders, selects, and dispatches
    Tool: Bash (vitest)
    Steps:
      1. Run: pnpm vitest run src/components/__tests__/HeroGrid.test.tsx --reporter=verbose 2>&1 | tee .omo/evidence/task-6-tests.log
      2. Run: ast-grep --lang tsx --pattern '$ARR.map($$$)' src/components/HeroGrid.tsx 2>&1 | tee .omo/evidence/task-6-no-map.log
    Expected Result: 5 tests pass; ast-grep output empty
    Evidence: .omo/evidence/task-6-*.log
  ```

  **Commit**: YES (commit G)
  - Message: `feat(components): add HeroGrid composing HeroTile via <For> (TDD)`
  - Files: `src/components/HeroGrid.tsx`, `src/components/__tests__/HeroGrid.test.tsx`, `src/components/HeroPicker.css` (additive)
  - Pre-commit: `pnpm check && pnpm typecheck && pnpm vitest run src/components/__tests__/HeroGrid.test.tsx`

- [x] 7. `/heroes` page + lazy route + nav entry (Phase 2 wiring)

  **What to do**:
  - Create `src/pages/heroes.tsx`:
    ```tsx
    import { createSignal } from 'solid-js';
    import HeroGrid from '~/components/HeroGrid';
    import HeroCard from '~/components/HeroCard';
    import '~/components/HeroPicker.css';
    import heroesData from '~/generated/heroes.json';
    import type { Hero } from '~/lib/types';

    const heroes = heroesData as ReadonlyArray<Hero>;

    export default function HeroesPage() {
      const [selected, setSelected] = createSignal<Hero | undefined>(undefined);
      return (
        <section class="page-heroes">
          <HeroCard hero={selected()} />
          <HeroGrid
            heroes={heroes}
            selectedId={selected()?.id}
            onSelect={setSelected}
          />
        </section>
      );
    }
    ```
  - Modify `src/app.tsx`: add `const Heroes = lazy(() => import('~/pages/heroes'));` and `<Route path="/heroes" component={Heroes} />` (placement matching existing lazy-route pattern)
  - Modify `src/routes.ts`: append `{ path: '/heroes', label: 'Heroes' }` to `navRoutes`
  - Add `.page-heroes` CSS to `src/styles/global.css` (NOT HeroPicker.css — this is page layout, not component): `display: grid; gap: 16px; padding: 16px;`
  - Run `pnpm dev`, navigate to `http://localhost:5173/#/heroes`, manually verify grid renders + clicking a tile updates HeroCard

  **Must NOT do**:
  - Eagerly import the page (must use `lazy()`)
  - Add the route to `src/routes.ts` without `lazy()` in `app.tsx`
  - Use a Solid Store (the local signal is sufficient)
  - Add a hero detail link
  - Add the picker overlay (that's Task 8 + 9)
  - Add `<Suspense>` wrapper (not used elsewhere in the app)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: none

  **Parallelization**:
  - **Can Run In Parallel**: NO with Task 6 (depends on it); independent of any pending Wave 2 tail-work
  - **Parallel Group**: Wave 3 (sequential: Task 6 → Task 7)
  - **Blocks**: 9
  - **Blocked By**: 1, 5, 6

  **References**:
  - `src/app.tsx` — existing lazy route pattern (Home, Cheatsheets, NotFound)
  - `src/routes.ts` — existing `navRoutes` array shape
  - `src/pages/cheatsheets.tsx` — existing page component pattern
  - `src/styles/global.css` — where page-level layout classes live

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck && pnpm build` exit 0
  - [ ] `pnpm bundle-size` exit 0 (initial JS < 30 KB gzipped)
  - [ ] `grep "path: '/heroes'" src/routes.ts` finds the entry
  - [ ] `grep "lazy(() => import('~/pages/heroes'))" src/app.tsx` finds the lazy import
  - [ ] Manual Playwright run navigates to `/#/heroes` and sees 47 tiles + 1 card

  **QA Scenarios**:

  ```
  Scenario: /heroes route renders grid + card
    Tool: Playwright
    Preconditions: pnpm dev OR pnpm preview running
    Steps:
      1. Navigate: page.goto('http://localhost:5173/#/heroes')
      2. await expect(page.locator('[role="listbox"][aria-label="Heroes"]')).toBeVisible()
      3. const tileCount = await page.locator('[role="option"]').count(); expect(tileCount).toBeGreaterThanOrEqual(40)
      4. await expect(page.locator('.hero-card [data-placeholder="true"]')).toBeVisible()
      5. const firstTile = page.locator('[role="option"]').first(); const tileName = await firstTile.locator('img, .hero-tile__fallback').first().getAttribute('alt') || await firstTile.locator('.hero-tile__fallback').textContent()
      6. await firstTile.click()
      7. await expect(page.locator('.hero-card [data-placeholder="true"]')).toHaveCount(0)
      8. await expect(page.locator('.hero-card img, .hero-card .hero-card__fallback').first()).toBeVisible()
      9. await page.screenshot({ path: '.omo/evidence/task-7-page.png', fullPage: true })
    Expected Result: All assertions pass; screenshot saved
    Evidence: .omo/evidence/task-7-page.png

  Scenario: Bundle size still within budget
    Tool: Bash
    Steps:
      1. Run: pnpm build 2>&1 | tee .omo/evidence/task-7-build.log
      2. Run: pnpm bundle-size 2>&1 | tee .omo/evidence/task-7-bundle.log
    Expected Result: Both exit 0; bundle report shows initial JS gzipped < 30 KB
    Evidence: .omo/evidence/task-7-*.log
  ```

  **Commit**: YES (commit H)
  - Message: `feat(heroes): add /heroes route with grid + card composition`
  - Files: `src/pages/heroes.tsx`, `src/app.tsx`, `src/routes.ts`, `src/styles/global.css`
  - Pre-commit: `pnpm check && pnpm typecheck && pnpm build && pnpm bundle-size`

- [x] 8. HeroPicker overlay component — RED → GREEN + overlay CSS

  **What to do**:
  - **RED**: Create `src/components/__tests__/HeroPicker.test.tsx` with 10 tests:
    1. Initial render: no `[role="dialog"]` exists; trigger button has `aria-expanded="false"` and `aria-haspopup="dialog"`
    2. Click trigger → overlay with `role="dialog"`, `aria-modal="true"`, `aria-label="Pick a hero"` appears; trigger `aria-expanded="true"`
    3. When open: 47-ish `[role="option"]` elements present inside overlay (use 3-hero fixture for unit test → assert 3)
    4. Click a hero option → `onChange` called with that hero exactly once → overlay closes (no `[role="dialog"]`)
    5. Escape key while open → overlay closes; `onChange` NOT called
    6. `mousedown` on `document.body` outside overlay while open → overlay closes
    7. `mousedown` inside overlay → overlay does NOT close
    8. On open: `document.activeElement` is the first `[role="option"]` inside the overlay (use `await` + small `vi.waitFor` since focus is on setTimeout)
    9. On close: `document.activeElement` is the trigger button
    10. Overlay container has `tabindex="-1"` (so it can receive focus)
  - Run vitest — expect FAIL
  - **GREEN**: Create `src/components/HeroPicker.tsx`:
    ```tsx
    import { createSignal, onCleanup, createEffect, Show } from 'solid-js';
    import HeroCard from './HeroCard';
    import HeroGrid from './HeroGrid';
    import type { Hero } from '~/lib/types';

    interface HeroPickerProps {
      heroes: ReadonlyArray<Hero>;
      selected: Hero | undefined;
      onChange: (hero: Hero) => void;
    }

    export default function HeroPicker(props: HeroPickerProps) {
      const [open, setOpen] = createSignal(false);
      let overlayEl: HTMLDivElement | undefined;
      let triggerEl: HTMLButtonElement | undefined;

      const close = () => {
        setOpen(false);
        triggerEl?.focus();
      };

      const onDocMouseDown = (e: MouseEvent) => {
        if (!overlayEl) return;
        if (!overlayEl.contains(e.target as Node)) close();
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
          return;
        }
        if (e.key === 'Tab' && overlayEl) {
          const focusables = overlayEl.querySelectorAll<HTMLElement>(
            'button, [href], [tabindex]:not([tabindex="-1"])',
          );
          if (focusables.length === 0) return;
          const first = focusables[0]!;
          const last = focusables[focusables.length - 1]!;
          const active = document.activeElement as HTMLElement | null;
          if (e.shiftKey && active === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && active === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      createEffect(() => {
        if (open()) {
          document.addEventListener('mousedown', onDocMouseDown);
          document.addEventListener('keydown', onKeyDown);
          // setTimeout (not queueMicrotask) — Steam Overlay focus-stealing mitigation
          const t = window.setTimeout(() => {
            overlayEl?.querySelector<HTMLElement>('[role="option"]')?.focus();
          }, 100);
          onCleanup(() => {
            window.clearTimeout(t);
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKeyDown);
          });
        }
      });

      const handleSelect = (hero: Hero) => {
        props.onChange(hero);
        close();
      };

      return (
        <div class="hero-picker">
          <button
            ref={triggerEl}
            type="button"
            class="hero-picker__trigger"
            aria-haspopup="dialog"
            aria-expanded={open() ? 'true' : 'false'}
            onClick={() => setOpen((v) => !v)}
          >
            <HeroCard hero={props.selected} />
          </button>
          <Show when={open()}>
            <div
              ref={overlayEl}
              class="hero-picker__overlay"
              role="dialog"
              aria-modal="true"
              aria-label="Pick a hero"
              tabindex="-1"
            >
              <button
                type="button"
                class="hero-picker__close"
                aria-label="Close hero picker"
                onClick={close}
              >×</button>
              <HeroGrid
                heroes={props.heroes}
                selectedId={props.selected?.id}
                onSelect={handleSelect}
              />
            </div>
          </Show>
        </div>
      );
    }
    ```
  - APPEND to `src/components/HeroPicker.css`:
    ```css
    .hero-picker { display: inline-block; }
    .hero-picker__trigger {
      background: none; border: none; padding: 0; cursor: pointer;
      border-radius: 4px;
    }
    .hero-picker__trigger:focus-visible {
      outline: 2px solid var(--color-accent); outline-offset: 2px;
    }
    .hero-picker__overlay {
      position: fixed;
      inset: 5vh 5vw;
      background: var(--color-bg);
      border: 1px solid var(--color-accent);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
      z-index: 9999;
      overflow: auto;
      padding: 16px;
    }
    .hero-picker__close {
      position: absolute;
      top: 8px; right: 8px;
      width: 32px; height: 32px;
      background: transparent;
      color: var(--color-fg);
      border: 1px solid var(--color-fg);
      border-radius: 4px;
      cursor: pointer;
      font-size: 20px;
      line-height: 1;
    }
    ```
  - Run tests — expect PASS. Use `vi.waitFor(() => expect(document.activeElement).toBe(...))` for focus tests because focus is on a 100ms timeout.

  **Must NOT do**:
  - Use `<Portal>` from `solid-js/web`
  - Use `queueMicrotask` for focus (use `setTimeout(..., 100)`)
  - Use `stopPropagation` anywhere (containment check only)
  - Use `display: none` to hide overlay (must unmount via `<Show>`)
  - Extract `useFocusTrap` or `useClickOutside` hooks
  - Add CSS transitions or animations
  - Add arrow-key navigation (deferred — would require `role="grid"`)
  - Destructure props
  - Add `console.log`
  - Use `as any`
  - Add a debounce on the trigger click

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` — overlay + focus trap + event-lifecycle has more nuance than Wave 1-3 tasks
  - **Skills**: none (no skill specifically targets Solid focus-trap patterns)
  - **Skills Evaluated but Omitted**: `visual-engineering` — visual decisions are locked; this is logic-heavy

  **Parallelization**:
  - **Can Run In Parallel**: NO with Task 9; YES with Task 7 (independent files)
  - **Parallel Group**: Wave 4 (with Task 9 sequential after this)
  - **Blocks**: 9
  - **Blocked By**: 3 (CSS), 5 (HeroCard), 6 (HeroGrid)

  **References**:
  - `src/components/HeroCard.tsx`, `src/components/HeroGrid.tsx`
  - `src/components/HeroPicker.css` (additive append)
  - AGENTS.md "Solid.js — Critical Rules" — destructure / `<For>` / `<Show>` / signals-are-functions / no re-render mental model
  - Metis directive: `tabindex="-1"` required on overlay container
  - Metis directive: `setTimeout(100)` not `queueMicrotask` (Steam Overlay focus race)
  - Metis directive: `mousedown` (not `click`) for outside-close
  - Metis directive: `inset: 0` (5vh 5vw used here for visible margin) — `inset` IS used; the 5vh/5vw values give a small margin from viewport edges

  **Acceptance Criteria**:
  - [ ] All 10 tests pass
  - [ ] `ast-grep --lang tsx --pattern 'function $NAME({ $$$ })' src/components/HeroPicker.tsx` empty
  - [ ] `grep -nE 'stopPropagation|Portal|display:\s*none|queueMicrotask' src/components/HeroPicker.tsx src/components/HeroPicker.css` empty
  - [ ] `grep -c 'console\.' src/components/HeroPicker.tsx` = 0
  - [ ] `grep 'tabindex="-1"' src/components/HeroPicker.tsx` finds the overlay
  - [ ] `grep 'setTimeout' src/components/HeroPicker.tsx` finds the focus timer
  - [ ] `pnpm check && pnpm typecheck && pnpm build && pnpm bundle-size` all exit 0

  **QA Scenarios**:

  ```
  Scenario: Overlay open/close/select lifecycle (unit)
    Tool: Bash (vitest)
    Preconditions: Tasks 3, 5, 6 complete
    Steps:
      1. Run: pnpm vitest run src/components/__tests__/HeroPicker.test.tsx --reporter=verbose 2>&1 | tee .omo/evidence/task-8-tests.log
    Expected Result: All 10 tests pass
    Evidence: .omo/evidence/task-8-tests.log

  Scenario: Forbidden-pattern grep
    Tool: Bash
    Steps:
      1. Run: grep -nE 'stopPropagation|Portal|queueMicrotask|display:\s*none' src/components/HeroPicker.tsx src/components/HeroPicker.css 2>&1 | tee .omo/evidence/task-8-forbidden.log
      2. Run: ast-grep --lang tsx --pattern 'function $NAME({ $$$ })' src/components/HeroPicker.tsx 2>&1 | tee .omo/evidence/task-8-no-destructure.log
    Expected Result: Both outputs empty
    Evidence: .omo/evidence/task-8-*.log
  ```

  **Commit**: YES (commit I)
  - Message: `feat(components): add HeroPicker overlay with focus trap + ? swap (TDD)`
  - Files: `src/components/HeroPicker.tsx`, `src/components/__tests__/HeroPicker.test.tsx`, `src/components/HeroPicker.css` (additive)
  - Pre-commit: `pnpm check && pnpm typecheck && pnpm vitest run src/components/__tests__/HeroPicker.test.tsx && pnpm build && pnpm bundle-size`

- [x] 9. Wire HeroPicker into `/heroes` page + Playwright E2E

  **What to do**:
  - Modify `src/pages/heroes.tsx`: replace the inline `<HeroCard>` + `<HeroGrid>` composition with `<HeroPicker heroes={heroes} selected={selected()} onChange={setSelected} />`. Keep the page-level `selected` signal (`createSignal<Hero | undefined>`).
  - Update `.page-heroes` CSS in `src/styles/global.css` if needed: `display: grid; place-items: center; gap: 16px; padding: 16px;` (centers the picker)
  - APPEND to `e2e/smoke.spec.ts` exactly these 3 tests:
    ```ts
    test('hero picker opens and selects a hero', async ({ page }) => {
      await page.goto('/#/heroes');
      await expect(page.locator('.hero-picker__trigger [data-placeholder="true"]')).toBeVisible();
      await page.locator('.hero-picker__trigger').click();
      await expect(page.locator('[role="dialog"][aria-label="Pick a hero"]')).toBeVisible();
      const firstOption = page.locator('[role="dialog"] [role="option"]').first();
      const altOrFallback =
        (await firstOption.locator('img').first().getAttribute('alt').catch(() => null)) ??
        (await firstOption.locator('.hero-tile__fallback').textContent());
      await firstOption.click();
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);
      await expect(page.locator('.hero-picker__trigger [data-placeholder="true"]')).toHaveCount(0);
      await page.screenshot({ path: '.omo/evidence/task-9-selected.png' });
      expect(altOrFallback).toBeTruthy();
    });

    test('escape key closes the hero picker', async ({ page }) => {
      await page.goto('/#/heroes');
      await page.locator('.hero-picker__trigger').click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    });

    test('click outside closes the hero picker', async ({ page }) => {
      await page.goto('/#/heroes');
      await page.locator('.hero-picker__trigger').click();
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await page.mouse.click(2, 2);
      await expect(page.locator('[role="dialog"]')).toHaveCount(0);
    });
    ```
  - Run `pnpm test:e2e` — expect all (existing + 3 new) pass

  **Must NOT do**:
  - Add a fourth E2E test for arrow-key navigation (deferred)
  - Add a search bar or filter to the page
  - Add hero detail navigation
  - Remove or alter existing smoke tests
  - Change Playwright config

  **Recommended Agent Profile**:
  - **Category**: `quick` — wiring + E2E follows established patterns
  - **Skills**: `playwright` — explicitly for the E2E scenarios
  - **Skills Evaluated but Omitted**: none

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4 (sequential after Task 8)
  - **Blocks**: F1–F4
  - **Blocked By**: 7, 8

  **References**:
  - `e2e/smoke.spec.ts` — existing pattern for `page.goto('/#/...')` (HashRouter)
  - `playwright.config.ts` (if exists) — chromium-only, baseURL
  - `src/components/HeroPicker.tsx` (post-Task 8)

  **Acceptance Criteria**:
  - [ ] `pnpm test:e2e` exits 0
  - [ ] Existing smoke tests still pass (no regressions)
  - [ ] 3 new tests visible in the Playwright report
  - [ ] Screenshot `.omo/evidence/task-9-selected.png` exists
  - [ ] `src/pages/heroes.tsx` uses `<HeroPicker>` (not direct `<HeroGrid>` + `<HeroCard>`)
  - [ ] Bundle size still under budget: `pnpm bundle-size` exits 0

  **QA Scenarios**:

  ```
  Scenario: Full E2E suite passes
    Tool: Bash (Playwright)
    Preconditions: pnpm exec playwright install --with-deps chromium previously run
    Steps:
      1. Run: pnpm test:e2e 2>&1 | tee .omo/evidence/task-9-e2e.log
      2. Run: ls playwright-report/ 2>&1 | tee .omo/evidence/task-9-report-listing.log
      3. Run: ls .omo/evidence/task-9-*.png 2>&1 | tee .omo/evidence/task-9-screenshots.log
    Expected Result: All tests pass; Playwright report generated; screenshot exists
    Failure Indicators: any test fail; HTML report missing
    Evidence: .omo/evidence/task-9-*.log + .omo/evidence/task-9-selected.png

  Scenario: Page uses picker, not raw grid+card
    Tool: Bash
    Steps:
      1. Run: grep -n 'HeroPicker' src/pages/heroes.tsx | tee .omo/evidence/task-9-uses-picker.log
      2. Run: grep -nE '<HeroGrid|<HeroCard' src/pages/heroes.tsx | tee .omo/evidence/task-9-no-raw.log
    Expected Result: First grep finds the import + usage; second grep is empty
    Evidence: .omo/evidence/task-9-*.log
  ```

  **Commit**: YES (commit J)
  - Message: `test(e2e): cover hero picker open/select/close/escape/outside-click flows`
  - Files: `src/pages/heroes.tsx`, `src/styles/global.css` (minor), `e2e/smoke.spec.ts`
  - Pre-commit: `pnpm check && pnpm typecheck && pnpm test --run && pnpm build && pnpm bundle-size && pnpm test:e2e`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1–F4 as checked before getting user's okay.** Rejection or user feedback → fix → re-run → present again → wait for okay.

- [x] F1. **Plan Compliance Audit** — `oracle`

  Read this plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": grep / ast-grep the codebase for forbidden patterns — REJECT with file:line if found. Specifically:
  - `grep -rn "console\." src/components/Hero*.tsx src/pages/heroes.tsx` → MUST be empty
  - `ast-grep --lang tsx --pattern 'function $NAME({ $$$ })' src/components/Hero*.tsx src/pages/heroes.tsx` → MUST be empty (no destructured props)
  - `ast-grep --lang tsx --pattern '$ARR.map($$$)' src/components/Hero*.tsx src/pages/heroes.tsx` → MUST be empty (use `<For>`)
  - `grep -rn "stopPropagation\|useFocusTrap\|useClickOutside\|createMemo\|Portal\|display: none\|display:none" src/components/Hero*.tsx src/components/HeroPicker.css` → MUST be empty
  - `grep -rn "import.*from.*'@deadlock-api/ui-core'" src/` → MUST be empty
  - Check evidence files exist in `.omo/evidence/`
  - Compare deliverables list against actual filesystem

  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [x] F2. **Code Quality Review** — `unspecified-high`

  Run `pnpm check && pnpm typecheck && pnpm test --run --coverage && pnpm build && pnpm bundle-size`. Review every changed file:
  - No `as any`, no `@ts-ignore`, no `@ts-expect-error`
  - No empty catch blocks
  - No commented-out code
  - No unused imports
  - No generic names (`data`, `result`, `item`, `temp`, `thing`) — use `hero`, `tile`, `option`, `selectedHero`
  - No premature abstraction (no `Modal` base, no extracted hooks)
  - No JSDoc bloat
  - Verify `aria-selected`, `aria-expanded` use string `"true"`/`"false"` (not booleans — Solid JSX serializes boolean false to omitted attribute)

  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Bundle [<XX KB] | Files [N clean/N issues] | VERDICT`

- [x] F3. **Real Manual QA via Playwright** — `unspecified-high` (with `playwright` skill)

  Start from clean state (`pnpm dev` on port 5173 OR `pnpm preview` on 4173). Execute EVERY QA scenario from EVERY task — exact steps, capture screenshots. Test integration: open picker → select hero A → reopen picker → select hero B → card updates correctly. Edge cases: rapid double-click trigger, Escape during selection, click overlay backdrop vs grid tile, keyboard-only navigation, simulate one of the 3 empty-images heroes (mock or known ID).

  Save to `.omo/evidence/final-qa/`.

  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [x] F4. **Scope Fidelity Check** — `deep`

  For each task 0–9: read "What to do", read actual `git diff` for that commit. Verify 1:1 — nothing missing, nothing beyond spec. Verify "Must NOT do" compliance per task. Detect cross-task contamination (Task N touching Task M's files unnecessarily). Flag unaccounted changes. Specifically verify:
  - Task 1 only touched `scripts/fetch-heroes.ts` + `src/generated/heroes.json` + `tsconfig.json` (if needed for script)
  - Task 2 only touched `src/lib/types.ts`
  - Task 4 only touched `src/components/HeroTile.tsx` + test + `HeroPicker.css` (additive)
  - No edits to `package.json` adding scripts/deps for `fetch-heroes.ts`
  - No edits to `.github/workflows/*` (script NOT in CI)

  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

| # | Commit | Wave | Phase |
|---|---|---|---|
| A | `chore(spike): validate JSON import with verbatimModuleSyntax (Phase 0)` | 0 | spike |
| B | `feat(data): add fetch-heroes.ts + bake src/generated/heroes.json` | 1 | 1 |
| C | `refactor(types): overwrite Hero/HeroImages with minimal correct API shape` | 1 | 1 |
| D | `feat(styles): add HeroPicker.css with hero-tile + hero-card primitives` | 1 | 1 |
| E | `feat(components): add HeroTile primitive with TDD coverage` | 2 | 1 |
| F | `feat(components): add HeroCard with ? placeholder + empty-images fallback (TDD)` | 2 | 1 |
| G | `feat(components): add HeroGrid composing HeroTile via <For> (TDD)` | 3 | 2 |
| H | `feat(heroes): add /heroes route with grid + card composition` | 3 | 2 |
| I | `feat(components): add HeroPicker overlay with focus trap + ? swap (TDD)` | 4 | 3 |
| J | `test(e2e): cover hero picker open/select/close/escape/outside-click flows` | 4 | 3 |

Pre-commit hook (`simple-git-hooks` + `lint-staged`) auto-runs Biome on staged files.

---

## Success Criteria

### Verification Commands
```bash
pnpm check          # Expected: no errors
pnpm typecheck      # Expected: no errors
pnpm test --run     # Expected: all tests pass, no skipped
pnpm build          # Expected: dist/ produced
pnpm bundle-size    # Expected: initial JS gzipped < 30 KB
pnpm test:e2e       # Expected: 3 new hero picker scenarios pass
```

### Final Checklist
- [ ] All Phase 0 + Phase 1 + Phase 2 + Phase 3 commits landed
- [ ] All "Must Have" items implemented
- [ ] All "Must NOT Have" items absent (verified by F1 grep + ast-grep)
- [ ] All test scenarios pass
- [ ] Bundle budget respected
- [ ] F1–F4 reviewers all APPROVE
- [ ] User explicit "okay" received
