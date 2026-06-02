# Deadlock Helpful Info — Solid.js + Vite + Pages Scaffold

## TL;DR

> **Quick Summary**: Replace the existing Jekyll site with a production-grade Solid.js + Vite + TypeScript SPA scaffold. Ship a hardened GitHub Actions pipeline (build → deploy → schedule → CI) that lets future feature work just write source code and push.
>
> **Deliverables**:
> - Solid.js + Vite + TypeScript app skeleton (hash routing, baseline pages, design tokens, dark theme)
> - `pnpm` workspace with Biome (format+lint), Vitest (TDD), Playwright (smoke E2E), TypeScript strict mode
> - Two GitHub Actions workflows: `pages.yml` (build + deploy to Pages, daily cron + manual dispatch) and `ci.yml` (PR validation: install, lint, typecheck, test, build, bundle-budget enforcement)
> - One working TDD slice (failing test → minimal `AppShell` component → green) to prove the test+build+deploy pipeline E2E
> - Legacy PNG cheatsheets preserved as a `/cheatsheets` route in the new SPA (no content loss)
> - Repo hygiene: `dependabot.yml`, pre-commit hooks, PR/issue templates, `SECURITY.md`, `CONTRIBUTING.md`, rewritten `README.md`
> - Bundle size budget enforced as a CI gate (hard fail above ceiling)
>
> **Estimated Effort**: Large
> **Parallel Execution**: YES — 4 waves + 1 final verification wave
> **Critical Path**: Task 2 (package.json) → Task 7 (vite.config) → Task 9 (src/index.tsx) → Task 15 (TDD smoke) → Task 16 (pages.yml) → Task 24 (local verify) → F1-F4 → user okay

---

## Context

### Original Request
> "Plan out the project scaffold including the GitHub Actions -> pages workflow. Include proper CI/CD best practices ulw."

### Interview Summary
**Key Discussions**:
- Confirmed greenfield migration (7 commits, no real users) — full Jekyll replacement is safe
- 2 PNG cheatsheets (`counter-item-cheatsheet.png`, `counter-item-cheatsheet-2.png`) are LFS-tracked content that must be preserved
- Test strategy: TDD with Vitest + `@solidjs/testing-library`
- Scope: scaffold only — NO data fetcher in this plan; API integration is a follow-up plan
- Package manager: pnpm
- Lint/format: Biome (single binary, fast, covers format + lint + import-sort)

### Research Findings (librarian agents)
- **Action versions (Dec 2026)**: `checkout@v6`, `setup-node@v6` (with `cache: pnpm` auto-cache), `configure-pages@v6`, `upload-pages-artifact@v5`, `deploy-pages@v5`, `pnpm/action-setup@v4`
- **Workflow pattern**: 2-job (build + deploy) with `concurrency: { group: pages, cancel-in-progress: false }`, `permissions: { contents: read, pages: write, id-token: write }`
- **Solid+Vite config**: `vite-plugin-solid` with `typescript: { onlyRemoveTypeImports: true }`; `target: 'esnext'`, `minify: 'oxc'`, `cssCodeSplit: true`, `assetsInlineLimit: 0`, `chunkSizeWarningLimit: 300`
- **Solid layout convention**: `src/{index.tsx, app.tsx, routes.ts, pages/, components/, features/, lib/, styles/, assets/, types/}`; PascalCase components, lowercase/kebab-case route files
- **Vite `base`**: env-driven (`process.env.VITE_BASE ?? '/'`) so local dev (`/`) and prod (`/deadlock-helpful-info/`) and a future custom domain (`/`) all work without code changes
- **Routing**: `@solidjs/router` `<HashRouter>` for GH Pages subpath safety (no 404.html hack required)
- **Schedule semantics**: cron runs on default branch, UTC, 5-min minimum; auto-disabled after 60 days of repo inactivity → Dependabot keeps repo "active"
- **LFS**: `lfs: true` checkout counts against owner LFS bandwidth quota — fine for 2 small PNGs; revisit if local images grow
- **Biome trade-off**: Solid framework-specific lint rules (`solid/no-destructure`, `solid/reactivity`, etc.) only available via ESLint+`eslint-plugin-solid` — user chose pure Biome and accepts this trade-off; AGENTS.md guardrails + agent QA + review compensate

### Self-Conducted Gap Analysis
1. **GitHub Pages enablement**: First deploy fails silently if Pages "Source" isn't set to "GitHub Actions" — README MUST document this one-time setup step
2. **`base` path bind**: Repo name is `deadlock-helpful-info` (from merge PR `xaviergmail/deadlock-helpful-info`) → prod `base` = `/deadlock-helpful-info/`; env-driven so custom domain switch is later one-line change
3. **Steam Overlay browser**: Modern Chromium → `target: 'esnext'` is safe; avoids transpilation cost
4. **Bundle budget**: Steam Overlay shares memory with game → set initial JS gzipped budget to **60 KB** as a baseline (Solid+Router+app shell ≈ 15-20 KB so plenty of headroom; tighten when feature work begins)
5. **Migration rollback**: Do the work on a feature branch; deploy preview not viable for GH Pages (no preview environments), so verify locally with `vite preview` before merging
6. **`--unset/` directory**: Looks like an accidental directory created when someone ran `git config core.hooksPath --unset` and the shell interpreted `--unset` as a literal path. Contains stale hook samples. Clean up in Task 1.
7. **Schedule cadence**: Daily UTC 04:15 (off-peak) cron in `pages.yml` enabled but commented as "future data refresh" — proves wiring works without hammering API yet
8. **Repo hygiene scope**: Include `SECURITY.md`, `CONTRIBUTING.md`, PR template, issue templates (bug + feature). Skip `CODEOWNERS` (single owner)
9. **Node version pin**: Node 22 LTS (Iron) via `.node-version` for nvm/fnm/Volta compat, also pinned in `setup-node` action
10. **Image migration**: Move PNGs from `assets/images/` (Jekyll-era path) → `src/assets/cheatsheets/` so Vite's asset pipeline handles them (content-hashed filenames, optimized URLs, LFS untouched)

---

## Work Objectives

### Core Objective
Replace the Jekyll site with a production-ready Solid.js + Vite SPA scaffold that builds cleanly, tests pass via TDD, deploys to GitHub Pages on push, and rejects bundle bloat via CI — leaving the next plan free to focus purely on feature code (hero/item/ability rendering).

### Concrete Deliverables
- `package.json` with `dev`, `build`, `preview`, `test`, `test:watch`, `test:e2e`, `lint`, `format`, `typecheck`, `check`, `prepare`, `bundle-size` scripts
- `vite.config.ts` (Solid plugin, env-driven `base`, perf-tuned build options)
- `vitest.config.ts` + `src/test-setup.ts`
- `biome.json` (format + lint + import-sort, project-tuned)
- `tsconfig.json` + `tsconfig.node.json` (strict mode, bundler resolution)
- `index.html` (Vite SPA entry, viewport, theme-color, no FOUC dark theme)
- `src/index.tsx`, `src/app.tsx` (root + `<HashRouter>` mount)
- `src/routes.ts` + `src/pages/{home.tsx, cheatsheets.tsx, not-found.tsx}` (3 baseline routes)
- `src/components/AppShell.tsx` + `__tests__/AppShell.test.tsx` (TDD smoke slice)
- `src/styles/{global.css, tokens.css}` (CSS variables, dark theme default, mobile-first)
- `src/lib/types.ts` (skeleton domain types: Hero, Item, Ability — from `api.deadlock-api.com` shapes)
- `src/assets/cheatsheets/{counter-item-cheatsheet.png, counter-item-cheatsheet-2.png}` (migrated from `assets/images/`)
- `public/{robots.txt, favicon.svg}` (Vite static passthrough)
- `playwright.config.ts` + `e2e/smoke.spec.ts` (CI smoke gate)
- `scripts/check-bundle-size.ts` (CI bundle budget enforcement)
- `.github/workflows/{pages.yml, ci.yml}` (deploy + PR validation)
- `.github/dependabot.yml` (weekly npm + actions updates)
- `.github/{PULL_REQUEST_TEMPLATE.md, ISSUE_TEMPLATE/bug.yml, ISSUE_TEMPLATE/feature.yml}`
- `.gitignore`, `.npmrc`, `.editorconfig`, `.node-version`
- `README.md` (rewritten), `CONTRIBUTING.md`, `SECURITY.md`
- Deleted: `_config.yml`, `index.md`, `assets/images/` (PNGs migrated), `--unset/` directory

### Definition of Done
- [ ] `pnpm install --frozen-lockfile` succeeds on clean clone
- [ ] `pnpm dev` serves the home page at `http://localhost:5173/#/`
- [ ] `pnpm build` produces a `dist/` directory; `pnpm preview` serves it locally
- [ ] `pnpm test --run` passes (smoke test green)
- [ ] `pnpm typecheck` exits 0
- [ ] `pnpm lint` exits 0 (Biome reports clean)
- [ ] `pnpm bundle-size` exits 0 (under 60 KB gzipped initial JS)
- [ ] CI workflow runs green on a PR
- [ ] Pages workflow deploys successfully to `https://xaviergmail.github.io/deadlock-helpful-info/`
- [ ] Deployed site shows home + cheatsheets routes; legacy PNG content visible at `#/cheatsheets`
- [ ] Playwright smoke test passes against the built site
- [ ] All evidence files captured in `.sisyphus/evidence/`

### Must Have
- **Solid correctness defaults baked in**: no destructured props in any example code; signals called as functions in JS contexts; `<For>` / `<Show>` / `<Switch>` used (no `.map()`, no ternaries in JSX)
- **Env-driven `base`**: `process.env.VITE_BASE ?? '/'` so local/prod/custom-domain all work
- **2-job Actions pattern**: build job uploads artifact, deploy job consumes it (official GH Pages starter pattern)
- **Pinned action major versions**: `@v6`, `@v5`, `@v4` (no `@main`, no floating)
- **Bundle budget CI gate**: failing build below ceiling, not a warning
- **TDD proof**: first test written before the component, observable as RED → GREEN in git history
- **Legacy content preserved**: 2 PNG cheatsheets accessible in the new SPA (no link rot for anyone bookmarking the old Jekyll site at `/#/cheatsheets`)
- **`.gitattributes` preserved**: LFS config for `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp` stays exactly as-is

### Must NOT Have (Guardrails)
- **NO data fetching code** — no `scripts/fetch-*.ts`, no API calls, no `src/generated/` JSON, no MSW handlers. API integration is a separate follow-up plan.
- **NO hero / item / ability UI components** beyond skeleton types in `src/lib/types.ts`. Render lists/cards is the next plan's job.
- **NO React patterns** anywhere: no destructured props, no `useState`, no `useEffect`, no `.map()` in JSX, no ternaries for conditional rendering.
- **NO additional dependencies** outside what's needed for: Solid, Vite, Vitest, Playwright, Biome, TypeScript, simple-git-hooks, lint-staged. NO `clsx`, NO `zod`, NO `lodash`, NO icon libraries, NO CSS frameworks (Tailwind/UnoCSS), NO storybook, NO i18n, NO PWA/service worker, NO analytics, NO Sentry/telemetry.
- **NO ESLint** — user explicitly chose pure Biome; do not silently add ESLint for Solid lint rules even though the framework recommends it. Trade-off is documented in summary and `CONTRIBUTING.md`.
- **NO over-abstraction**: no `BaseLayout` HOC, no "feature folder" framework, no generic `<Page>` wrapper. Three concrete pages. Two concrete components. That's it.
- **NO premature performance optimization**: no lazy-loading `<Suspense>` setup until there are routes worth lazy-loading. No `manualChunks`/`output.codeSplitting.groups` config. Defaults until measured.
- **NO documentation bloat**: no JSDoc on every function, no exhaustive comments. Component file = component. Config file = config. README explains setup, that's it.
- **NO CSS preprocessor** (no Sass, no Less). Plain CSS + CSS variables for tokens.
- **NO touching `LICENSE`**, no `CODEOWNERS`, no GitHub Discussions config, no GitHub Sponsors files.

---

## Verification Strategy (MANDATORY)

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.
> Acceptance criteria requiring "user manually tests/confirms" are FORBIDDEN.

### Test Decision
- **Infrastructure exists**: NO (greenfield) → setup is part of this plan
- **Automated tests**: YES (TDD) — RED → GREEN → REFACTOR per task that ships code
- **Framework**: Vitest 2.x + `@solidjs/testing-library` for component/unit tests; Playwright 1.x for E2E smoke
- **If TDD**: Task 15 is the first proof slice (failing test → minimal component → green). Future feature plans extend the pattern.

### QA Policy
Every task MUST include agent-executed QA scenarios with evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Playwright (playwright skill) — navigate, assert DOM, screenshot
- **CLI / build / scripts**: Bash + tmux (interactive_bash) — run command, capture stdout/stderr/exit code
- **Config files**: Bash (parse + validate) — `node -e`, `tsc --noEmit`, `biome check`, `vite build`
- **CI workflows**: Bash (`act` or simulated env) + GitHub Actions runtime as final ground truth

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start immediately — config files + Jekyll cleanup, 8 parallel):
├── 1. Remove Jekyll legacy + clean --unset/ + migrate PNG content [quick]
├── 2. Create package.json + scripts + deps + pnpm config [quick]
├── 3. Create tsconfig.json + tsconfig.node.json [quick]
├── 4. Create biome.json [quick]
├── 5. Create .gitignore + .npmrc + .editorconfig + .node-version [quick]
├── 6. Create index.html (Vite SPA entry) [quick]
├── 7. Create vite.config.ts + vitest.config.ts + src/test-setup.ts [quick]
└── 8. Create public/ assets stub (robots.txt, favicon.svg) [quick]

Wave 2 (After Wave 1 — app source + first TDD slice, 7 parallel):
├── 9. Create src/index.tsx + src/app.tsx (mount + HashRouter) [quick]
├── 10. Create src/routes.ts + src/pages/home.tsx + src/pages/not-found.tsx [quick]
├── 11. Create src/pages/cheatsheets.tsx (legacy PNG content) [quick]
├── 12. Migrate assets/images/*.png → src/assets/cheatsheets/*.png [quick]
├── 13. Create src/styles/global.css + tokens.css (dark theme) [visual-engineering]
├── 14. Create src/lib/types.ts (Hero/Item/Ability skeleton types) [quick]
└── 15. TDD: src/components/AppShell.tsx + __tests__/AppShell.test.tsx [quick]

Wave 3 (After Wave 2 — CI/CD + tooling, 6 parallel):
├── 16. Replace .github/workflows/pages.yml (deploy: build + deploy 2-job) [unspecified-high]
├── 17. Create .github/workflows/ci.yml (PR validation) [unspecified-high]
├── 18. Create scripts/check-bundle-size.ts (CI budget gate) [quick]
├── 19. Create .github/dependabot.yml (weekly updates) [quick]
├── 20. Configure pre-commit (simple-git-hooks + lint-staged) [quick]
└── 21. Create playwright.config.ts + e2e/smoke.spec.ts [quick]

Wave 4 (After Wave 3 — docs + repo hygiene + final local verify, 3 sequential-friendly):
├── 22. Rewrite README.md (new stack, scripts, deploy setup) [writing]
├── 23. Create .github/{PR template, ISSUE_TEMPLATE/*}, CONTRIBUTING.md, SECURITY.md [writing]
└── 24. Local verification sweep (install → dev → build → test → typecheck → lint → bundle-size → e2e) [unspecified-high]

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── F1. Plan compliance audit (oracle)
├── F2. Code quality review (unspecified-high)
├── F3. Real manual QA (unspecified-high + playwright skill)
└── F4. Scope fidelity check (deep)
-> Present results -> Get explicit user okay

Critical Path: 2 → 7 → 9 → 15 → 16 → 24 → F1-F4 → user okay
Parallel Speedup: ~75% faster than sequential (24 tasks → ~5 effective wave-times)
Max Concurrent: 8 (Wave 1)
```

### Dependency Matrix

- **1** (Jekyll cleanup): no deps → blocks 11, 12
- **2** (package.json): no deps → blocks 7, 9, 15, 16, 17, 18, 19, 20, 24
- **3** (tsconfig): no deps → blocks 7, 9, 14, 15, 18, 21
- **4** (biome.json): no deps → blocks 17, 20, 24
- **5** (.gitignore etc.): no deps → blocks 24
- **6** (index.html): no deps → blocks 9, 13
- **7** (vite.config + vitest.config): deps 2, 3 → blocks 9, 15, 16, 18, 21, 24
- **8** (public/ stub): no deps → blocks 24
- **9** (index.tsx + app.tsx): deps 2, 3, 6, 7 → blocks 10, 13, 15, 21, 24
- **10** (routes + home + not-found): deps 9 → blocks 11, 24
- **11** (cheatsheets page): deps 10, 12 → blocks 24
- **12** (PNG migration): deps 1 → blocks 11
- **13** (styles): deps 6, 9 → blocks 24
- **14** (types): deps 3 → blocks 24
- **15** (TDD AppShell + test): deps 2, 7, 9 → blocks 17, 21, 24
- **16** (pages.yml): deps 2, 7 → blocks 24
- **17** (ci.yml): deps 2, 4, 7, 15 → blocks 24
- **18** (bundle-size script): deps 2, 7 → blocks 17 (CI uses it), 24
- **19** (dependabot): deps 2 → blocks 24
- **20** (pre-commit): deps 2, 4 → blocks 24
- **21** (playwright + smoke): deps 7, 9, 15 → blocks 17 (CI uses it), 24
- **22** (README): deps 2, 16, 17 → blocks 24
- **23** (PR/issue/CONTRIBUTING/SECURITY): deps 2 → blocks 24
- **24** (local verify sweep): deps ALL prior → blocks F1-F4
- **F1-F4**: deps 24 → blocks user okay

### Agent Dispatch Summary

- **Wave 1**: 8 tasks — T1 → `quick`, T2 → `quick`, T3 → `quick`, T4 → `quick`, T5 → `quick`, T6 → `quick`, T7 → `quick`, T8 → `quick`
- **Wave 2**: 7 tasks — T9 → `quick`, T10 → `quick`, T11 → `quick`, T12 → `quick`, T13 → `visual-engineering`, T14 → `quick`, T15 → `quick`
- **Wave 3**: 6 tasks — T16 → `unspecified-high`, T17 → `unspecified-high`, T18 → `quick`, T19 → `quick`, T20 → `quick`, T21 → `quick`
- **Wave 4**: 3 tasks — T22 → `writing`, T23 → `writing`, T24 → `unspecified-high`
- **FINAL**: 4 reviews — F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high` (+ playwright skill), F4 → `deep`

---

## TODOs

- [x] 1. **Remove Jekyll legacy + clean `--unset/` + prepare PNG migration**

  **What to do**:
  - Delete `_config.yml` (Jekyll site config — no longer needed)
  - Delete `index.md` (Jekyll-era home page; PNG content will be re-rendered in Solid SPA at Task 11)
  - Delete `--unset/` directory at repo root (accidental directory from a stray `git config core.hooksPath --unset` command — contains stale hook samples like `post-commit`, `post-merge`, `post-checkout`, `pre-push`)
  - Stage the 2 PNGs (`assets/images/counter-item-cheatsheet.png`, `assets/images/counter-item-cheatsheet-2.png`) for migration to `src/assets/cheatsheets/` — Task 12 does the actual move
  - Do NOT touch `LICENSE`, `README.md` (rewrite is Task 22), `AGENTS.md`, `.gitattributes`, `.github/workflows/pages.yml` (replaced in Task 16)
  - Do NOT delete `.git/` (obviously), `.sisyphus/`, or any LFS objects

  **Must NOT do**:
  - Do NOT modify `.gitattributes` — LFS config must stay intact for the migrated PNGs
  - Do NOT delete the PNGs themselves (just the legacy paths get cleaned in Task 12)
  - Do NOT rewrite `README.md` here — Task 22 owns that

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure deletion of known files, no logic, no judgment calls
  - **Skills**: `[]`
    - No specialized skill needed; bash + git operations only

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T2-T8)
  - **Blocks**: T11 (cheatsheets page needs legacy content gone), T12 (PNG migration assumes cleanup happened)
  - **Blocked By**: None

  **References**:
  - `_config.yml` — current Jekyll config (3 lines: title, description, kramdown markdown)
  - `index.md` — current home page with the 2 cheatsheet `<img>` tags styled to viewport width
  - `--unset/` — accidental directory; contains 4 sample hook files
  - `.gitattributes` — LFS rules to preserve verbatim (lines 1-5: `*.png`, `*.jpg`, `*.jpeg`, `*.gif`, `*.webp`)

  **Acceptance Criteria**:
  - [ ] `test ! -e _config.yml`
  - [ ] `test ! -e index.md`
  - [ ] `test ! -e --unset` (rm with quoting: `rm -rf -- '--unset'` or `git rm -rf -- '--unset'`)
  - [ ] `test -f .gitattributes && grep -c 'filter=lfs' .gitattributes` returns 5

  **QA Scenarios**:

  ```
  Scenario: Legacy Jekyll files removed cleanly
    Tool: Bash
    Preconditions: Repo at HEAD before this task
    Steps:
      1. Run `ls -la _config.yml index.md '--unset' 2>&1 | tee /tmp/before.txt`
      2. Execute the task (delete files)
      3. Run `ls -la _config.yml index.md '--unset' 2>&1 | tee /tmp/after.txt`
      4. Assert /tmp/after.txt contains "No such file or directory" for all three paths
      5. Assert .gitattributes content unchanged: `diff <(git show HEAD:.gitattributes) .gitattributes` → empty
    Expected Result: All three paths gone, .gitattributes byte-identical to HEAD
    Failure Indicators: Any of the three paths still exist; .gitattributes modified
    Evidence: .sisyphus/evidence/task-1-cleanup-before-after.txt

  Scenario: LFS pointer files for PNGs still resolve correctly
    Tool: Bash
    Preconditions: After cleanup
    Steps:
      1. Run `git lfs ls-files | grep cheatsheet`
      2. Assert output contains both PNG filenames
      3. Run `file assets/images/counter-item-cheatsheet.png`
      4. Assert output is "PNG image data" (not "ASCII text" which would mean LFS broke)
    Expected Result: Both PNGs still LFS-tracked and resolve to actual binary content
    Evidence: .sisyphus/evidence/task-1-lfs-intact.txt
  ```

  **Commit**: YES
  - Message: `chore(scaffold): remove Jekyll legacy and stray --unset directory`
  - Files: `_config.yml` (deleted), `index.md` (deleted), `--unset/` (deleted)
  - Pre-commit: `test ! -e _config.yml && test ! -e index.md && test ! -e -- '--unset'`

- [x] 2. **Create `package.json` with pnpm scripts and dependencies**

  **What to do**:
  - Create `package.json` at repo root with:
    - `"name": "deadlock-helpful-info"`, `"version": "0.0.0"`, `"private": true`, `"type": "module"`
    - `"packageManager": "pnpm@9.x"` (latest stable as of 2026 — verify with `pnpm --version` and pin to that exact version)
    - `"engines": { "node": ">=22.0.0", "pnpm": ">=9.0.0" }`
    - `"scripts"`:
      - `"dev": "vite"`
      - `"build": "vite build"`
      - `"preview": "vite preview"`
      - `"test": "vitest"`
      - `"test:watch": "vitest --watch"`
      - `"test:e2e": "playwright test"`
      - `"typecheck": "tsc --noEmit"`
      - `"lint": "biome check ."`
      - `"format": "biome format --write ."`
      - `"check": "biome check --write ."`
      - `"bundle-size": "node --experimental-strip-types scripts/check-bundle-size.ts"` (or `tsx scripts/check-bundle-size.ts` if Node strip-types isn't reliable)
      - `"prepare": "simple-git-hooks"`
    - `"dependencies"`: `solid-js`, `@solidjs/router`
    - `"devDependencies"`: `vite`, `vite-plugin-solid`, `typescript`, `@biomejs/biome`, `vitest`, `@solidjs/testing-library`, `@testing-library/jest-dom`, `jsdom`, `@playwright/test`, `simple-git-hooks`, `lint-staged`, `gzip-size`
    - `"simple-git-hooks": { "pre-commit": "pnpm exec lint-staged" }`
    - `"lint-staged": { "*.{ts,tsx,js,jsx,json,css}": ["biome check --write --no-errors-on-unmatched"] }`
  - Run `pnpm install` to generate `pnpm-lock.yaml`
  - Verify lockfile committed alongside `package.json`

  **Must NOT do**:
  - NO `eslint`, `prettier`, `tailwindcss`, `unocss`, `clsx`, `zod`, `lodash`, `@sentry/*`, `husky`, icon libraries
  - NO `react`, `react-dom` (obviously)
  - NO `vite-plugin-pwa`, NO `workbox-*`
  - NO version ranges with `^` for `packageManager` field (must be exact pin)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: File creation + `pnpm install` — well-defined, no design decisions
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1, T3-T8)
  - **Blocks**: T7, T9, T15, T16, T17, T18, T19, T20, T24 (anything that runs `pnpm`)
  - **Blocked By**: None

  **References**:
  - `AGENTS.md` (Tech Stack section) — confirms Solid.js + Vite stack
  - Librarian research result: pnpm via `pnpm/action-setup@v4` or `setup-node@v6` with `cache: pnpm`
  - Solid official template `package.json`: https://github.com/solidjs/templates/tree/main/vanilla/with-vitest — script naming conventions and devDeps
  - Biome 2.x docs: `biome check` is the all-in-one command (format + lint + import-sort)

  **Acceptance Criteria**:
  - [ ] `package.json` valid JSON: `node -e "JSON.parse(require('fs').readFileSync('package.json'))"` exits 0
  - [ ] `pnpm install --frozen-lockfile` succeeds (after `pnpm install` initial run + lockfile commit)
  - [ ] `pnpm-lock.yaml` exists and is committed
  - [ ] All declared scripts exist: `jq -r '.scripts | keys[]' package.json` includes dev, build, preview, test, test:watch, test:e2e, typecheck, lint, format, check, bundle-size, prepare
  - [ ] No forbidden deps: `jq -r '.dependencies, .devDependencies | keys[]' package.json | grep -E '^(eslint|prettier|tailwind|unocss|clsx|zod|lodash|husky|@sentry)' ` returns empty

  **QA Scenarios**:

  ```
  Scenario: Clean install succeeds and lockfile is reproducible
    Tool: Bash
    Preconditions: package.json + pnpm-lock.yaml committed; no node_modules
    Steps:
      1. Run `rm -rf node_modules`
      2. Run `pnpm install --frozen-lockfile 2>&1 | tee /tmp/install.log`
      3. Assert exit code 0
      4. Assert /tmp/install.log does NOT contain "ERR_PNPM_OUTDATED_LOCKFILE"
      5. Assert `test -d node_modules/solid-js`
      6. Assert `test -d node_modules/vite`
      7. Assert `test -d node_modules/@biomejs/biome`
    Expected Result: Reproducible clean install in under 60s
    Evidence: .sisyphus/evidence/task-2-install.log

  Scenario: Forbidden dependencies absent
    Tool: Bash
    Preconditions: package.json exists
    Steps:
      1. Run `jq -r '.dependencies // {} | keys[]' package.json > /tmp/deps.txt`
      2. Run `jq -r '.devDependencies // {} | keys[]' package.json >> /tmp/deps.txt`
      3. Run `grep -E '^(eslint|prettier|tailwindcss|unocss|clsx|zod|lodash|husky|@sentry)' /tmp/deps.txt` → expect exit code 1 (no matches)
    Expected Result: No forbidden deps present
    Evidence: .sisyphus/evidence/task-2-no-forbidden-deps.txt
  ```

  **Commit**: YES
  - Message: `feat(build): add package.json with pnpm scripts and dependencies`
  - Files: `package.json`, `pnpm-lock.yaml`
  - Pre-commit: `pnpm install --frozen-lockfile`

- [x] 3. **Create `tsconfig.json` + `tsconfig.node.json`**

  **What to do**:
  - Create `tsconfig.json` at repo root:
    - `"compilerOptions"`:
      - `"target": "ESNext"`
      - `"module": "ESNext"`
      - `"moduleResolution": "bundler"`
      - `"jsx": "preserve"` (Solid uses its own JSX transform via `vite-plugin-solid`)
      - `"jsxImportSource": "solid-js"`
      - `"strict": true`
      - `"noUncheckedIndexedAccess": true`
      - `"noImplicitOverride": true`
      - `"noFallthroughCasesInSwitch": true`
      - `"verbatimModuleSyntax": true`
      - `"isolatedModules": true`
      - `"skipLibCheck": true`
      - `"esModuleInterop": true`
      - `"resolveJsonModule": true`
      - `"allowImportingTsExtensions": false`
      - `"lib": ["ESNext", "DOM", "DOM.Iterable"]`
      - `"types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]`
      - `"baseUrl": "."`
      - `"paths": { "~/*": ["./src/*"] }`
    - `"include": ["src", "e2e", "scripts", "*.config.ts", "vite.config.ts", "vitest.config.ts"]`
    - `"exclude": ["node_modules", "dist", ".vite"]`
    - `"references": [{ "path": "./tsconfig.node.json" }]`
  - Create `tsconfig.node.json` for build tooling (Vite + Vitest configs):
    - `"compilerOptions"`: `{ "composite": true, "module": "ESNext", "moduleResolution": "bundler", "strict": true, "skipLibCheck": true, "allowSyntheticDefaultImports": true }`
    - `"include": ["vite.config.ts", "vitest.config.ts", "playwright.config.ts", "scripts/**/*.ts"]`

  **Must NOT do**:
  - NO `"noEmit": true` (Vite handles emit; setting noEmit blocks `tsc --build` references)
  - NO path aliases beyond `~/*` (over-aliasing is AI slop)
  - NO `"experimentalDecorators": true` (not needed)
  - NO `"jsxFactory": "h"` (Solid uses jsxImportSource, not factory)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure config file authoring with known spec
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with T1-T2, T4-T8)
  - **Blocks**: T7 (vite.config TS resolution), T9 (src compilation), T14 (types), T15 (test typecheck), T18 (script TS), T21 (Playwright TS)
  - **Blocked By**: None

  **References**:
  - Solid template tsconfig: https://github.com/solidjs/templates/blob/main/vanilla/with-vitest/tsconfig.json — `jsxImportSource: "solid-js"` is the load-bearing setting
  - TypeScript bundler moduleResolution: https://www.typescriptlang.org/docs/handbook/modules/reference.html#bundler — required for Vite
  - `verbatimModuleSyntax`: enforces `import type` for type-only imports — catches subtle Solid bugs

  **Acceptance Criteria**:
  - [ ] Both files valid JSON: `node -e "JSON.parse(require('fs').readFileSync('tsconfig.json'))"` and same for `tsconfig.node.json` → exit 0
  - [ ] `pnpm exec tsc --noEmit -p tsconfig.json` runs without "No inputs were found" or "Cannot find tsconfig.node.json" errors (will report missing src/ files but that's expected pre-Wave 2)
  - [ ] `pnpm exec tsc --showConfig -p tsconfig.json | jq '.compilerOptions.strict'` → `true`
  - [ ] `pnpm exec tsc --showConfig -p tsconfig.json | jq '.compilerOptions.jsxImportSource'` → `"solid-js"`

  **QA Scenarios**:

  ```
  Scenario: Strict mode and Solid JSX settings honored
    Tool: Bash
    Preconditions: tsconfig.json + tsconfig.node.json + package.json exist
    Steps:
      1. Run `pnpm exec tsc --showConfig -p tsconfig.json | tee /tmp/tsc-config.json`
      2. Assert `jq '.compilerOptions.strict' /tmp/tsc-config.json` returns `true`
      3. Assert `jq '.compilerOptions.noUncheckedIndexedAccess' /tmp/tsc-config.json` returns `true`
      4. Assert `jq '.compilerOptions.jsxImportSource' /tmp/tsc-config.json` returns `"solid-js"`
      5. Assert `jq '.compilerOptions.moduleResolution' /tmp/tsc-config.json` returns `"bundler"`
    Expected Result: All four assertions pass
    Evidence: .sisyphus/evidence/task-3-tsc-config.json

  Scenario: Project references resolve
    Tool: Bash
    Preconditions: Both tsconfig files exist
    Steps:
      1. Run `pnpm exec tsc --build --dry tsconfig.json 2>&1 | tee /tmp/tsc-build.log`
      2. Assert log does NOT contain "Referenced project '/path/to/tsconfig.node.json' must have setting 'composite': true"
      3. Assert log does NOT contain "ENOENT"
    Expected Result: References wire up without composite/ENOENT errors
    Evidence: .sisyphus/evidence/task-3-tsc-build.log
  ```

  **Commit**: YES
  - Message: `feat(build): add TypeScript strict configuration`
  - Files: `tsconfig.json`, `tsconfig.node.json`
  - Pre-commit: `pnpm exec tsc --noEmit -p tsconfig.json || true` (will error on missing src/ which is expected pre-Wave 2; this is informational)

- [x] 4. **Create `biome.json` (format + lint + import-sort)**

  **What to do**:
  - Create `biome.json` at repo root using Biome 2.x schema:
    - `"$schema": "https://biomejs.dev/schemas/2.0.0/schema.json"` (pin to installed version)
    - `"vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true }`
    - `"files": { "ignore": ["dist", ".vite", "node_modules", "pnpm-lock.yaml", "playwright-report", "test-results", "src/assets/cheatsheets/*"] }`
    - `"formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2, "lineWidth": 100, "lineEnding": "lf" }`
    - `"organizeImports": { "enabled": true }`
    - `"linter": { "enabled": true, "rules": { "recommended": true, "style": { "noNonNullAssertion": "warn", "useImportType": "error", "useExportType": "error" }, "correctness": { "noUnusedImports": "error", "noUnusedVariables": "warn" }, "suspicious": { "noExplicitAny": "error", "noConsole": { "level": "warn", "options": { "allow": ["error", "warn"] } } }, "complexity": { "noForEach": "off" } } }`
    - `"javascript": { "formatter": { "quoteStyle": "single", "trailingCommas": "all", "semicolons": "always", "arrowParentheses": "always" } }`
    - `"json": { "formatter": { "trailingCommas": "none" } }`
    - `"overrides": [{ "include": ["**/*.test.ts", "**/*.test.tsx", "e2e/**"], "linter": { "rules": { "suspicious": { "noExplicitAny": "off" } } } }]`

  **Must NOT do**:
  - NO ESLint config alongside (`.eslintrc*`, `eslint.config.js`) — user chose pure Biome
  - NO Prettier config (`.prettierrc*`) — Biome handles format
  - NO `lineWidth` > 120 (catches AI-slop wide lines)
  - NO disabling `noExplicitAny` globally — only override in test files

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with T1-T3, T5-T8)
  - **Blocks**: T17 (CI uses `biome check`), T20 (pre-commit uses biome), T24 (verify)
  - **Blocked By**: None

  **References**:
  - Biome 2.x schema: https://biomejs.dev/schemas/2.0.0/schema.json
  - Solid lint rule trade-off documented in plan Context section — Biome lacks `solid/no-destructure`, `solid/reactivity` etc.; AGENTS.md + agent QA + F2 review compensate

  **Acceptance Criteria**:
  - [ ] `biome.json` valid JSON
  - [ ] `pnpm exec biome check biome.json` exits 0
  - [ ] `pnpm exec biome check --reporter=summary . 2>&1 | grep -E 'Checked [0-9]+ files'` matches (config loads without schema error)
  - [ ] No competing config files: `! test -e .eslintrc.js && ! test -e .eslintrc.json && ! test -e .prettierrc && ! test -e eslint.config.js`

  **QA Scenarios**:

  ```
  Scenario: Biome config loads and reports no errors on its own file
    Tool: Bash
    Preconditions: biome.json + package.json + node_modules with @biomejs/biome
    Steps:
      1. Run `pnpm exec biome check --reporter=json biome.json 2>&1 | tee /tmp/biome.json.out`
      2. Assert exit code 0
      3. Assert `jq '.summary.errors' /tmp/biome.json.out` returns 0
    Expected Result: Biome accepts its own config
    Evidence: .sisyphus/evidence/task-4-biome-self-check.json

  Scenario: Biome rejects forbidden patterns
    Tool: Bash
    Preconditions: biome.json in place
    Steps:
      1. Create temp file `/tmp/bad.ts` with content: `const x: any = 1; console.log(x);`
      2. Run `pnpm exec biome lint /tmp/bad.ts 2>&1 | tee /tmp/biome-bad.out`
      3. Assert exit code != 0
      4. Assert /tmp/biome-bad.out contains "noExplicitAny" or "any"
      5. Cleanup: `rm /tmp/bad.ts`
    Expected Result: Biome flags `any` type and `console.log`
    Evidence: .sisyphus/evidence/task-4-biome-bad.out
  ```

  **Commit**: YES
  - Message: `feat(build): add Biome config for lint and format`
  - Files: `biome.json`
  - Pre-commit: `pnpm exec biome check biome.json`

- [x] 5. **Create `.gitignore`, `.npmrc`, `.editorconfig`, `.node-version`**

  **What to do**:
  - `.gitignore`:
    ```
    node_modules/
    dist/
    .vite/
    *.log
    .DS_Store
    coverage/
    playwright-report/
    test-results/
    .env
    .env.local
    .env.*.local
    /e2e/.cache/
    .sisyphus/evidence/
    ```
  - `.npmrc`:
    ```
    auto-install-peers=true
    strict-peer-dependencies=false
    enable-pre-post-scripts=true
    save-exact=false
    package-manager-strict=true
    ```
  - `.editorconfig`:
    ```
    root = true

    [*]
    charset = utf-8
    end_of_line = lf
    insert_final_newline = true
    trim_trailing_whitespace = true
    indent_style = space
    indent_size = 2

    [*.md]
    trim_trailing_whitespace = false
    ```
  - `.node-version`: `22` (matches `package.json` engines)

  **Must NOT do**:
  - NO `package-lock.json` or `yarn.lock` in `.gitignore` ignore — pnpm-lock.yaml MUST be committed
  - NO ignoring `pnpm-lock.yaml`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1 with T1-T4, T6-T8)
  - **Blocks**: T24 (verify)
  - **Blocked By**: None

  **References**:
  - pnpm `.npmrc` reference: https://pnpm.io/npmrc
  - EditorConfig spec: https://editorconfig.org/

  **Acceptance Criteria**:
  - [ ] All four files exist
  - [ ] `.gitignore` includes `node_modules/`, `dist/`, `.vite/`
  - [ ] `.gitignore` does NOT include `pnpm-lock.yaml`
  - [ ] `.node-version` content is `22` (single line)
  - [ ] `cat .npmrc | grep -c '='` matches non-comment line count

  **QA Scenarios**:

  ```
  Scenario: pnpm-lock.yaml is tracked
    Tool: Bash
    Preconditions: .gitignore committed; pnpm-lock.yaml created from T2
    Steps:
      1. Run `git check-ignore pnpm-lock.yaml; echo "exit=$?"`
      2. Assert "exit=1" (file NOT ignored)
      3. Run `grep -E '^pnpm-lock' .gitignore; echo "exit=$?"`
      4. Assert "exit=1" (no match)
    Expected Result: Lockfile is tracked, not ignored
    Evidence: .sisyphus/evidence/task-5-lockfile-tracked.txt

  Scenario: Common build outputs ARE ignored
    Tool: Bash
    Preconditions: .gitignore committed
    Steps:
      1. Run `git check-ignore -v node_modules dist .vite .DS_Store 2>&1 | tee /tmp/ignored.txt`
      2. Assert exit code 0
      3. Assert /tmp/ignored.txt has 4 lines (one per path)
    Expected Result: All four paths matched by .gitignore rules
    Evidence: .sisyphus/evidence/task-5-ignored.txt
  ```

  **Commit**: YES
  - Message: `chore(repo): add .gitignore, .npmrc, .editorconfig, .node-version`
  - Files: `.gitignore`, `.npmrc`, `.editorconfig`, `.node-version`
  - Pre-commit: `git check-ignore node_modules dist .vite > /dev/null`

- [x] 6. **Create `index.html` (Vite SPA entry)**

  **What to do**:
  - Create `index.html` at repo root (Vite expects entry HTML at project root, not in `public/`):
    ```html
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="description" content="Deadlock hero, item, and ability reference — for the Steam Overlay browser." />
        <title>Deadlock Helpful Info</title>
        <!-- Prevent FOUC on dark theme -->
        <style>
          html, body { margin: 0; padding: 0; background: #0a0a0a; color: #e6e6e6; min-height: 100vh; }
          #root { min-height: 100vh; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="/src/index.tsx"></script>
      </body>
    </html>
    ```

  **Must NOT do**:
  - NO `<link rel="stylesheet">` for external fonts (perf budget)
  - NO `<script>` tags pointing to CDN libraries (everything bundled)
  - NO inline analytics, NO `<meta name="google-site-verification">`
  - NO `<noscript>` content blocks beyond a minimal "JS required" message

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T9 (mounts to `#root`), T13 (FOUC style hand-off to global.css)
  - **Blocked By**: None

  **References**:
  - Vite SPA entry conventions: https://vitejs.dev/guide/#index-html-and-project-root
  - `theme-color` for browser UI color: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color

  **Acceptance Criteria**:
  - [ ] `index.html` exists at repo root
  - [ ] `<div id="root">` present
  - [ ] `<script type="module" src="/src/index.tsx">` present
  - [ ] `<meta name="viewport">` present
  - [ ] `<meta name="theme-color" content="#0a0a0a">` present
  - [ ] HTML validates: `pnpm dlx html-validate index.html` exits 0 (or skip if not installed; not a hard gate)

  **QA Scenarios**:

  ```
  Scenario: Vite picks up index.html as entry
    Tool: Bash
    Preconditions: index.html + vite.config.ts (T7) + package.json
    Steps:
      1. Run `pnpm dlx vite build --logLevel info 2>&1 | tee /tmp/vite-build.log` (or skip until T7 lands)
      2. Assert log contains "transforming" and "index.html"
      3. Assert `test -f dist/index.html`
      4. Assert `grep -q 'id="root"' dist/index.html`
    Expected Result: index.html transformed and emitted to dist/
    Evidence: .sisyphus/evidence/task-6-vite-build.log

  Scenario: No external network resources
    Tool: Bash
    Preconditions: index.html committed
    Steps:
      1. Run `grep -E 'src="https?://|href="https?://' index.html; echo "exit=$?"`
      2. Assert "exit=1" (no external URLs)
    Expected Result: All resources are local
    Evidence: .sisyphus/evidence/task-6-no-external.txt
  ```

  **Commit**: YES
  - Message: `feat(app): add Vite SPA entry HTML`
  - Files: `index.html`
  - Pre-commit: `grep -q 'id="root"' index.html && grep -q 'src="/src/index.tsx"' index.html`

- [x] 7. **Create `vite.config.ts` + `vitest.config.ts` + `src/test-setup.ts`**

  **What to do**:
  - `vite.config.ts`:
    ```ts
    import { defineConfig } from 'vite';
    import solid from 'vite-plugin-solid';
    import { resolve } from 'node:path';

    export default defineConfig({
      base: process.env.VITE_BASE ?? '/',
      plugins: [
        solid({
          typescript: { onlyRemoveTypeImports: true },
        }),
      ],
      resolve: {
        alias: { '~': resolve(import.meta.dirname, 'src') },
      },
      build: {
        target: 'esnext',
        minify: 'oxc',
        cssCodeSplit: true,
        assetsInlineLimit: 0,
        chunkSizeWarningLimit: 300,
        sourcemap: false,
        reportCompressedSize: true,
      },
      server: { port: 5173, strictPort: true },
      preview: { port: 4173, strictPort: true },
    });
    ```
  - `vitest.config.ts`:
    ```ts
    import { defineConfig, mergeConfig } from 'vitest/config';
    import viteConfig from './vite.config';

    export default mergeConfig(
      viteConfig,
      defineConfig({
        test: {
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test-setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
          coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['src/**/*.{ts,tsx}'],
            exclude: ['src/**/*.test.{ts,tsx}', 'src/test-setup.ts'],
          },
          deps: { optimizer: { web: { include: ['solid-js'] } } },
        },
      }),
    );
    ```
  - `src/test-setup.ts`:
    ```ts
    import '@testing-library/jest-dom/vitest';
    import { cleanup } from '@solidjs/testing-library';
    import { afterEach } from 'vitest';

    afterEach(() => cleanup());
    ```

  **Must NOT do**:
  - NO `manualChunks` / `output.codeSplitting.groups` — defaults until measured (premature optimization)
  - NO `legacy` plugin (esnext target is intentional)
  - NO `solid-devtools` plugin in prod build (it's a dev-only concern; skip entirely for now)
  - NO `vite-tsconfig-paths` — `resolve.alias` is sufficient and tsconfig `paths` mirrors it

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1; depends on T2, T3 being scheduled)
  - **Blocks**: T9, T15, T16, T18, T21, T24
  - **Blocked By**: T2 (deps installed), T3 (tsconfig for type resolution)

  **References**:
  - Librarian research: `vite-plugin-solid` with `typescript: { onlyRemoveTypeImports: true }` is load-bearing for Solid + verbatimModuleSyntax
  - Vite 2-step config merge for Vitest: https://vitest.dev/config/#mergeconfig
  - `solid-js` in `deps.optimizer.web.include` prevents dual-package hazard in jsdom

  **Acceptance Criteria**:
  - [ ] `pnpm exec vite --version` succeeds
  - [ ] `pnpm exec vite build --logLevel error 2>&1 | tee /tmp/vite-build.log` fails gracefully (no src/index.tsx yet) — log mentions missing entry, NOT config syntax error
  - [ ] `pnpm exec vitest run --reporter=verbose 2>&1 | grep -E 'No test files found' ` matches (config loads, no tests yet)
  - [ ] `VITE_BASE=/foo/ pnpm exec vite build --logLevel error 2>&1 | grep -E 'base.*foo'` matches (env var honored)

  **QA Scenarios**:

  ```
  Scenario: Env-driven base path works
    Tool: Bash
    Preconditions: vite.config.ts + minimal src/index.tsx stub (or use T9's output)
    Steps:
      1. After T9 lands, run `pnpm build` (no VITE_BASE)
      2. Assert `grep -E 'src="/assets/' dist/index.html` matches (base = "/")
      3. Run `VITE_BASE=/deadlock-helpful-info/ pnpm build`
      4. Assert `grep -E 'src="/deadlock-helpful-info/assets/' dist/index.html` matches
    Expected Result: Asset URLs change based on VITE_BASE
    Evidence: .sisyphus/evidence/task-7-base-paths.txt

  Scenario: Vitest config loads and finds no tests pre-Wave 2
    Tool: Bash
    Preconditions: vitest.config.ts + src/test-setup.ts
    Steps:
      1. Run `pnpm exec vitest run --reporter=verbose 2>&1 | tee /tmp/vitest.out`
      2. Assert exit code != 0 (no tests) OR exit code 0 with "0 test files" — either is acceptable
      3. Assert /tmp/vitest.out does NOT contain "SyntaxError" or "Cannot find module"
    Expected Result: Vitest config syntactically valid; finds zero tests cleanly
    Evidence: .sisyphus/evidence/task-7-vitest-empty.out
  ```

  **Commit**: YES
  - Message: `feat(build): add Vite and Vitest configuration`
  - Files: `vite.config.ts`, `vitest.config.ts`, `src/test-setup.ts`
  - Pre-commit: `pnpm exec tsc --noEmit -p tsconfig.node.json`

- [x] 8. **Create `public/` static assets stub (robots.txt + favicon.svg)**

  **What to do**:
  - `public/robots.txt`:
    ```
    User-agent: *
    Allow: /
    ```
  - `public/favicon.svg` — a minimal 32x32 SVG favicon (Deadlock theme: dark background, simple geometric mark). Use plain `<svg>` content with `viewBox="0 0 32 32"`:
    ```xml
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
      <rect width="32" height="32" fill="#0a0a0a"/>
      <circle cx="16" cy="16" r="10" fill="none" stroke="#d4af37" stroke-width="2"/>
      <circle cx="16" cy="16" r="3" fill="#d4af37"/>
    </svg>
    ```
  - Verify Vite's `publicDir` default (`public`) serves these without configuration

  **Must NOT do**:
  - NO PNG favicons (SVG is single small file, scales perfectly)
  - NO `apple-touch-icon` variants (not needed for Steam Overlay use case)
  - NO `manifest.json` / PWA setup (out of scope — guardrail)
  - NO `sitemap.xml` (single-page app, no real routes to enumerate yet)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T24 (verify deployed site serves favicon)
  - **Blocked By**: None

  **References**:
  - Vite `publicDir`: https://vitejs.dev/guide/assets.html#the-public-directory — files copied to dist root without processing

  **Acceptance Criteria**:
  - [ ] `public/robots.txt` exists with `User-agent: *` and `Allow: /`
  - [ ] `public/favicon.svg` exists, valid SVG: `xmllint --noout public/favicon.svg` exits 0
  - [ ] After `pnpm build`: `test -f dist/robots.txt && test -f dist/favicon.svg`

  **QA Scenarios**:

  ```
  Scenario: Static assets pass through to dist
    Tool: Bash
    Preconditions: public/ files + vite.config.ts + minimal src
    Steps:
      1. Run `pnpm build 2>&1 | tee /tmp/build.log` (after T9 lands)
      2. Assert `test -f dist/robots.txt`
      3. Assert `test -f dist/favicon.svg`
      4. Assert `diff public/robots.txt dist/robots.txt` (byte-identical)
    Expected Result: Both files copied to dist/ root verbatim
    Evidence: .sisyphus/evidence/task-8-public-passthrough.txt

  Scenario: Favicon SVG is well-formed
    Tool: Bash
    Preconditions: public/favicon.svg exists
    Steps:
      1. Run `xmllint --noout public/favicon.svg 2>&1; echo "exit=$?"` (or fallback: `python3 -c "import xml.etree.ElementTree as ET; ET.parse('public/favicon.svg')"`)
      2. Assert "exit=0"
    Expected Result: SVG parses without errors
    Evidence: .sisyphus/evidence/task-8-svg-valid.txt
  ```

  **Commit**: YES
  - Message: `feat(app): add public static assets (robots.txt, favicon.svg)`
  - Files: `public/robots.txt`, `public/favicon.svg`
  - Pre-commit: `xmllint --noout public/favicon.svg || true`

- [x] 9. **Create `src/index.tsx` + `src/app.tsx` (mount + HashRouter)**

  **What to do**:
  - `src/index.tsx`:
    ```tsx
    /* @refresh reload */
    import { render } from 'solid-js/web';
    import App from '~/app';
    import '~/styles/global.css';

    const root = document.getElementById('root');
    if (!root) throw new Error('Root element #root not found in index.html');
    render(() => <App />, root);
    ```
  - `src/app.tsx`:
    ```tsx
    import { HashRouter, Route } from '@solidjs/router';
    import { lazy } from 'solid-js';
    import AppShell from '~/components/AppShell';

    const Home = lazy(() => import('~/pages/home'));
    const Cheatsheets = lazy(() => import('~/pages/cheatsheets'));
    const NotFound = lazy(() => import('~/pages/not-found'));

    export default function App() {
      return (
        <HashRouter root={(props) => <AppShell>{props.children}</AppShell>}>
          <Route path="/" component={Home} />
          <Route path="/cheatsheets" component={Cheatsheets} />
          <Route path="*" component={NotFound} />
        </HashRouter>
      );
    }
    ```

  **Must NOT do**:
  - NO destructured props (e.g., `function App({ children })`) — use `props.children`
  - NO `Router` (path-based) — must be `HashRouter` for GH Pages subpath safety
  - NO React-style `useState`/`useEffect`
  - NO eager imports of route components — must use `lazy()` for code splitting

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (blocks Wave 2 downstream)
  - **Blocks**: T10, T11, T13, T15, T21, T24
  - **Blocked By**: T2, T3, T6, T7

  **References**:
  - `@solidjs/router` HashRouter API: https://docs.solidjs.com/solid-router (HashRouter section)
  - AGENTS.md "Never destructure props" — load-bearing rule
  - Solid `lazy` for route splitting: https://docs.solidjs.com/concepts/components/lazy-components

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` exits 0
  - [ ] `pnpm build` produces `dist/index.html` + `dist/assets/*.js`
  - [ ] No destructured props: `grep -E 'function [A-Z][a-zA-Z]+\(\{' src/index.tsx src/app.tsx; echo $?` returns 1
  - [ ] HashRouter import present: `grep -q 'HashRouter' src/app.tsx`

  **QA Scenarios**:

  ```
  Scenario: Solid app mounts and HashRouter renders
    Tool: Bash + curl
    Preconditions: T10-T15 stubs available; full Wave 2 done
    Steps:
      1. Start dev: `pnpm dev > /tmp/dev.log 2>&1 &` ; wait 3s
      2. Run `curl -sf http://localhost:5173/ | tee /tmp/index-html.out`
      3. Assert /tmp/index-html.out contains `<div id="root"></div>`
      4. Assert /tmp/index-html.out contains `src="/src/index.tsx"`
      5. Kill dev server: `kill %1`
    Expected Result: Index HTML served with mount target and entry script
    Evidence: .sisyphus/evidence/task-9-dev-html.out

  Scenario: Hash routing — bad route falls to NotFound
    Tool: Playwright
    Preconditions: After Wave 2 complete + dev server running
    Steps:
      1. page.goto('http://localhost:5173/#/nonexistent-route-xyz')
      2. await page.waitForSelector('text=/Not Found|404/i', { timeout: 5000 })
      3. screenshot to .sisyphus/evidence/task-9-not-found.png
    Expected Result: NotFound page renders for unknown hash route
    Evidence: .sisyphus/evidence/task-9-not-found.png
  ```

  **Commit**: YES
  - Message: `feat(app): mount Solid app with HashRouter`
  - Files: `src/index.tsx`, `src/app.tsx`
  - Pre-commit: `pnpm typecheck`

- [ ] 10. **Create `src/routes.ts` + `src/pages/home.tsx` + `src/pages/not-found.tsx`**

  **What to do**:
  - `src/routes.ts` (route metadata only — actual routing in app.tsx):
    ```ts
    export const navRoutes = [
      { path: '/', label: 'Home' },
      { path: '/cheatsheets', label: 'Cheatsheets' },
    ] as const;
    ```
  - `src/pages/home.tsx`:
    ```tsx
    import { For } from 'solid-js';
    import { A } from '@solidjs/router';
    import { navRoutes } from '~/routes';

    export default function Home() {
      return (
        <section class="page page--home">
          <h1>Deadlock Helpful Info</h1>
          <p>Quick reference for heroes, items, and abilities — built for the Steam Overlay browser.</p>
          <nav aria-label="Primary">
            <ul class="route-list">
              <For each={navRoutes}>
                {(route) => (
                  <li>
                    <A href={route.path}>{route.label}</A>
                  </li>
                )}
              </For>
            </ul>
          </nav>
        </section>
      );
    }
    ```
  - `src/pages/not-found.tsx`:
    ```tsx
    import { A } from '@solidjs/router';

    export default function NotFound() {
      return (
        <section class="page page--not-found">
          <h1>404 — Not Found</h1>
          <p>That route doesn't exist.</p>
          <A href="/">Go home</A>
        </section>
      );
    }
    ```

  **Must NOT do**:
  - NO `.map()` for rendering — use `<For>`
  - NO destructured props in any component
  - NO inline `style={{...}}` — class names only (styles defined in T13)
  - NO hardcoded route paths in JSX beyond what's in `routes.ts`

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T9)
  - **Blocks**: T11, T24
  - **Blocked By**: T9

  **References**:
  - Solid `<For>` vs `.map()`: AGENTS.md "List rendering" — `.map()` recreates the entire list on every signal change
  - `@solidjs/router` `<A>` component: https://docs.solidjs.com/solid-router#a

  **Acceptance Criteria**:
  - [ ] All three files exist and typecheck
  - [ ] `grep -E '\.map\(' src/pages/*.tsx; echo $?` returns 1 (no .map in JSX)
  - [ ] `grep -E 'function.*\(\{' src/pages/*.tsx; echo $?` returns 1 (no destructured props)

  **QA Scenarios**:

  ```
  Scenario: Home page renders nav with both routes
    Tool: Playwright
    Preconditions: dev server running, Wave 2 complete
    Steps:
      1. page.goto('http://localhost:5173/')
      2. await page.waitForSelector('h1', { timeout: 5000 })
      3. expect(page.locator('h1')).toHaveText('Deadlock Helpful Info')
      4. expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(2)
      5. expect(page.locator('a:text("Cheatsheets")')).toBeVisible()
      6. screenshot to evidence
    Expected Result: H1 and 2 nav links visible
    Evidence: .sisyphus/evidence/task-10-home.png

  Scenario: Not-found page renders for unmatched routes
    Tool: Playwright
    Preconditions: dev server running
    Steps:
      1. page.goto('http://localhost:5173/#/this-does-not-exist')
      2. await page.waitForSelector('h1:text("404")', { timeout: 5000 })
      3. expect(page.locator('a:text("Go home")')).toBeVisible()
      4. await page.click('a:text("Go home")')
      5. expect(page).toHaveURL(/#\/$/)
    Expected Result: 404 page → "Go home" link returns to "/"
    Evidence: .sisyphus/evidence/task-10-not-found.png
  ```

  **Commit**: YES
  - Message: `feat(app): add baseline routes (home, not-found)`
  - Files: `src/routes.ts`, `src/pages/home.tsx`, `src/pages/not-found.tsx`
  - Pre-commit: `pnpm typecheck`

- [ ] 11. **Create `src/pages/cheatsheets.tsx` preserving legacy PNG content**

  **What to do**:
  - `src/pages/cheatsheets.tsx`:
    ```tsx
    import { For } from 'solid-js';
    import sheet1 from '~/assets/cheatsheets/counter-item-cheatsheet.png?url';
    import sheet2 from '~/assets/cheatsheets/counter-item-cheatsheet-2.png?url';

    const cheatsheets = [
      { src: sheet1, alt: 'Deadlock Counter Item Cheatsheet (Page 1)' },
      { src: sheet2, alt: 'Deadlock Counter Item Cheatsheet (Page 2)' },
    ] as const;

    export default function Cheatsheets() {
      return (
        <section class="page page--cheatsheets">
          <h1>Counter-Item Cheatsheets</h1>
          <p>Quick reference cheatsheets from the community.</p>
          <div class="cheatsheets">
            <For each={cheatsheets}>
              {(sheet) => (
                <figure>
                  <img src={sheet.src} alt={sheet.alt} loading="lazy" decoding="async" />
                </figure>
              )}
            </For>
          </div>
        </section>
      );
    }
    ```
  - Note: This depends on T12 having moved PNGs to `src/assets/cheatsheets/`

  **Must NOT do**:
  - NO `eager: true` in `import.meta.glob` (lazy by default; though we use explicit imports here)
  - NO `<img>` without `alt`, `loading="lazy"`, `decoding="async"`
  - NO inline `width="100vw"` style — handled by CSS in T13

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Blocks**: T24
  - **Blocked By**: T10 (uses route), T12 (PNG migration)

  **References**:
  - Vite `?url` asset suffix: https://vitejs.dev/guide/assets.html#explicit-url-imports
  - Legacy `index.md` (deleted in T1) — image references preserved as `src` content
  - AGENTS.md "Lazy-load images" — `loading="lazy"` mandatory

  **Acceptance Criteria**:
  - [ ] File exists and typechecks
  - [ ] Both PNGs imported via `?url` suffix
  - [ ] All `<img>` have `loading="lazy"` and `decoding="async"`

  **QA Scenarios**:

  ```
  Scenario: Cheatsheets route renders both images
    Tool: Playwright
    Preconditions: dev server running, T12 complete
    Steps:
      1. page.goto('http://localhost:5173/#/cheatsheets')
      2. await page.waitForSelector('h1:text("Cheatsheet")', { timeout: 5000 })
      3. expect(page.locator('img')).toHaveCount(2)
      4. const urls = await page.locator('img').evaluateAll(els => els.map(e => e.src))
      5. assert urls[0] !== urls[1] (different images)
      6. assert urls.every(u => u.match(/counter-item-cheatsheet.*\.png/))
      7. expect(page.locator('img[loading="lazy"]')).toHaveCount(2)
      8. screenshot to evidence
    Expected Result: Both PNGs render with lazy loading
    Evidence: .sisyphus/evidence/task-11-cheatsheets.png

  Scenario: Images load successfully (no broken refs)
    Tool: Playwright
    Preconditions: production build via `pnpm preview`
    Steps:
      1. Track failed requests: page.on('requestfailed', req => failed.push(req.url()))
      2. page.goto('http://localhost:4173/deadlock-helpful-info/#/cheatsheets')
      3. await page.waitForLoadState('networkidle')
      4. await page.locator('img').first().scrollIntoViewIfNeeded()
      5. await page.waitForLoadState('networkidle')
      6. assert failed.filter(u => u.endsWith('.png')).length === 0
    Expected Result: No PNG requests fail
    Evidence: .sisyphus/evidence/task-11-no-broken-images.txt
  ```

  **Commit**: YES
  - Message: `feat(app): add cheatsheets route preserving legacy content`
  - Files: `src/pages/cheatsheets.tsx`
  - Pre-commit: `pnpm typecheck`

- [x] 12. **Migrate `assets/images/*.png` → `src/assets/cheatsheets/*.png`**

  **What to do**:
  - Use `git mv` to preserve history and LFS pointer integrity:
    - `git mv assets/images/counter-item-cheatsheet.png src/assets/cheatsheets/counter-item-cheatsheet.png`
    - `git mv assets/images/counter-item-cheatsheet-2.png src/assets/cheatsheets/counter-item-cheatsheet-2.png`
  - Remove now-empty `assets/images/` directory (and `assets/` if empty after)
  - Verify LFS pointers still resolve: `git lfs ls-files` should show both files at new paths
  - Verify `file src/assets/cheatsheets/*.png` returns "PNG image data" not "ASCII text"

  **Must NOT do**:
  - NO `cp` then `rm` — must use `git mv` so LFS pointer + git history follows
  - NO modifying `.gitattributes` — LFS pattern `*.png` continues to match
  - NO leaving `assets/images/` empty (must remove)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2; only blocks T11)
  - **Blocks**: T11
  - **Blocked By**: T1 (cleanup must finish first)

  **References**:
  - `.gitattributes` lines 1-5 — LFS pattern matches `.png` at any path
  - Git LFS docs on moves: https://git-lfs.com/

  **Acceptance Criteria**:
  - [ ] `test -f src/assets/cheatsheets/counter-item-cheatsheet.png`
  - [ ] `test -f src/assets/cheatsheets/counter-item-cheatsheet-2.png`
  - [ ] `test ! -d assets/images` (old path gone)
  - [ ] `git lfs ls-files | grep -c cheatsheet` returns 2
  - [ ] `file src/assets/cheatsheets/counter-item-cheatsheet.png | grep -q 'PNG image'` (LFS resolved, not pointer text)

  **QA Scenarios**:

  ```
  Scenario: LFS preserved across move
    Tool: Bash
    Preconditions: PNGs at old paths, LFS configured
    Steps:
      1. Run `git lfs ls-files | tee /tmp/lfs-before.txt`
      2. Execute moves (git mv)
      3. Run `git lfs ls-files | tee /tmp/lfs-after.txt`
      4. Assert both /tmp/lfs-after.txt entries point to src/assets/cheatsheets/
      5. Run `file src/assets/cheatsheets/*.png | tee /tmp/file-type.txt`
      6. Assert /tmp/file-type.txt contains "PNG image data" (twice)
    Expected Result: LFS pointers follow files; files resolve to binary PNG
    Evidence: .sisyphus/evidence/task-12-lfs-move.txt

  Scenario: Vite resolves PNG imports
    Tool: Bash
    Preconditions: After T11 + T12 + dev server boots
    Steps:
      1. Run `pnpm build 2>&1 | tee /tmp/build.log`
      2. Assert build exit 0
      3. Assert `find dist/assets -name 'counter-item-cheatsheet*' | wc -l` returns 2
    Expected Result: Both PNGs emitted with content hashes
    Evidence: .sisyphus/evidence/task-12-vite-emit.txt
  ```

  **Commit**: YES
  - Message: `chore(assets): migrate cheatsheet PNGs into Vite asset pipeline`
  - Files: `assets/images/*.png` (moved), `src/assets/cheatsheets/*.png` (new)
  - Pre-commit: `git lfs ls-files | grep -c cheatsheet | grep -q 2`

- [ ] 13. **Create `src/styles/global.css` + `src/styles/tokens.css` (dark theme)**

  **What to do**:
  - `src/styles/tokens.css` (CSS custom properties for the design system):
    ```css
    :root {
      /* Color tokens — dark theme default (Steam Overlay context) */
      --color-bg: #0a0a0a;
      --color-bg-elevated: #161616;
      --color-fg: #e6e6e6;
      --color-fg-muted: #9a9a9a;
      --color-accent: #d4af37;
      --color-accent-hover: #e6c352;
      --color-border: #2a2a2a;
      --color-danger: #e25555;

      /* Spacing scale (4px base) */
      --space-1: 0.25rem;
      --space-2: 0.5rem;
      --space-3: 0.75rem;
      --space-4: 1rem;
      --space-6: 1.5rem;
      --space-8: 2rem;
      --space-12: 3rem;

      /* Typography */
      --font-stack: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
      --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
      --text-sm: 0.875rem;
      --text-base: 1rem;
      --text-lg: 1.25rem;
      --text-xl: 1.5rem;
      --text-2xl: 2rem;

      /* Layout */
      --max-content-width: 1100px;
      --border-radius: 4px;
    }
    ```
  - `src/styles/global.css`:
    ```css
    @import './tokens.css';

    *, *::before, *::after { box-sizing: border-box; }

    html, body {
      margin: 0;
      padding: 0;
      background: var(--color-bg);
      color: var(--color-fg);
      font-family: var(--font-stack);
      font-size: var(--text-base);
      line-height: 1.5;
    }

    a { color: var(--color-accent); text-decoration: none; }
    a:hover, a:focus-visible { color: var(--color-accent-hover); text-decoration: underline; }

    h1, h2, h3 { margin: 0 0 var(--space-4); line-height: 1.2; }
    h1 { font-size: var(--text-2xl); }
    h2 { font-size: var(--text-xl); }
    h3 { font-size: var(--text-lg); }

    img { max-width: 100%; height: auto; display: block; }

    .page {
      max-width: var(--max-content-width);
      margin: 0 auto;
      padding: var(--space-6) var(--space-4);
    }

    .route-list { list-style: none; padding: 0; display: flex; gap: var(--space-4); flex-wrap: wrap; }
    .route-list a { padding: var(--space-2) var(--space-4); background: var(--color-bg-elevated); border: 1px solid var(--color-border); border-radius: var(--border-radius); display: inline-block; }

    .cheatsheets { display: grid; gap: var(--space-6); }
    .cheatsheets figure { margin: 0; }
    .cheatsheets img { width: 100%; border-radius: var(--border-radius); border: 1px solid var(--color-border); }

    .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
    .app-shell__main { flex: 1; }
    .app-shell__header, .app-shell__footer { padding: var(--space-3) var(--space-4); border-color: var(--color-border); }
    .app-shell__header { border-bottom: 1px solid var(--color-border); }
    .app-shell__footer { border-top: 1px solid var(--color-border); color: var(--color-fg-muted); font-size: var(--text-sm); }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    ```

  **Must NOT do**:
  - NO `:root` light theme variant (Steam Overlay context is dark — defer until requested)
  - NO Tailwind, NO UnoCSS, NO Sass
  - NO CSS-in-JS
  - NO `!important` outside `prefers-reduced-motion` accessibility override
  - NO Google Fonts or external font imports
  - NO `@layer` (unnecessary complexity at this scale)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: Design system token definition + theme polish for Steam Overlay context
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: T24
  - **Blocked By**: T6 (index.html bg color baseline), T9 (import in index.tsx)

  **References**:
  - AGENTS.md "Performance Constraints" — prefer CSS over JS for animations
  - Steam Overlay UI: dark background reduces perceived flicker over the game
  - `prefers-reduced-motion`: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion

  **Acceptance Criteria**:
  - [ ] Both files exist and parse: `pnpm dlx postcss src/styles/global.css --no-map > /dev/null 2>&1; echo $?` returns 0 (or use Vite's own CSS validation via build)
  - [ ] No external font imports: `grep -E '@import.*url\(|@font-face' src/styles/*.css; echo $?` returns 1
  - [ ] FOUC inline style in `index.html` matches `--color-bg` token value (`#0a0a0a`)

  **QA Scenarios**:

  ```
  Scenario: Styles applied — body background matches token
    Tool: Playwright
    Preconditions: dev server running, Wave 2 complete
    Steps:
      1. page.goto('http://localhost:5173/')
      2. const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
      3. assert bg === 'rgb(10, 10, 10)' (matches #0a0a0a)
      4. const fg = await page.evaluate(() => getComputedStyle(document.body).color)
      5. assert fg === 'rgb(230, 230, 230)' (matches #e6e6e6)
    Expected Result: Tokens drive computed styles
    Evidence: .sisyphus/evidence/task-13-computed-styles.txt

  Scenario: Reduced motion preference respected
    Tool: Playwright
    Preconditions: dev server running
    Steps:
      1. await context.setReducedMotion('reduce') (or emulateMedia)
      2. page.goto('http://localhost:5173/')
      3. const dur = await page.evaluate(() => getComputedStyle(document.documentElement).transitionDuration)
      4. assert dur matches /0\.01ms/ or short value
    Expected Result: Transition durations clamped under reduced-motion
    Evidence: .sisyphus/evidence/task-13-reduced-motion.txt
  ```

  **Commit**: YES
  - Message: `feat(ui): add global styles and design tokens (dark theme)`
  - Files: `src/styles/global.css`, `src/styles/tokens.css`
  - Pre-commit: `pnpm build` (catches CSS syntax errors)

- [x] 14. **Create `src/lib/types.ts` (Hero/Item/Ability skeleton types)**

  **What to do**:
  - `src/lib/types.ts` — minimal type skeleton derived from `api.deadlock-api.com` shapes documented in AGENTS.md. NO implementation, NO data, NO fetch logic — just type contracts for future feature plans:
    ```ts
    // Skeleton types matching api.deadlock-api.com response shapes.
    // Concrete data fetching + rendering belongs in a follow-up plan.

    export type SlotType = 'weapon' | 'vitality' | 'spirit';

    export interface HeroImages {
      readonly portrait?: string;
      readonly card?: string;
      readonly icon?: string;
      readonly minimap?: string;
    }

    export interface Ability {
      readonly id: number;
      readonly name: string;
      readonly description?: string;
      readonly cooldown?: number;
      readonly heroId?: number;
    }

    export interface Hero {
      readonly id: number;
      readonly name: string;
      readonly className?: string;
      readonly images: HeroImages;
      readonly abilities: ReadonlyArray<Ability>;
    }

    export interface Item {
      readonly id: number;
      readonly name: string;
      readonly cost?: number;
      readonly tier?: number;
      readonly slot?: SlotType;
      readonly imageUrl?: string;
    }

    export interface HeroStats {
      readonly heroId: number;
      readonly winRate: number;
      readonly pickRate: number;
      readonly rank?: string;
      readonly patch?: string;
    }
    ```

  **Must NOT do**:
  - NO concrete data (no `export const heroes = [...]`)
  - NO fetch functions (no `async function fetchHero(id) {}`)
  - NO Zod schemas (out of scope; Biome enforces structure)
  - NO `unknown` / `any` types (use proper interfaces)
  - NO classes — only `interface` and `type` aliases

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Blocks**: T24
  - **Blocked By**: T3 (tsconfig)

  **References**:
  - AGENTS.md "Primary — Deadlock API" — endpoint shapes
  - `api.deadlock-api.com/v1/assets/heroes` response structure

  **Acceptance Criteria**:
  - [ ] `pnpm typecheck` exits 0 (all types compile)
  - [ ] No `any` / `unknown`: `grep -E ': (any|unknown)\b' src/lib/types.ts; echo $?` returns 1
  - [ ] No runtime values: `grep -E '^(export )?(const|let|function|class)' src/lib/types.ts; echo $?` returns 1
  - [ ] `readonly` modifiers on all object fields

  **QA Scenarios**:

  ```
  Scenario: Types are pure — no runtime emission
    Tool: Bash
    Preconditions: src/lib/types.ts exists; tsconfig + Vite configured
    Steps:
      1. Run `pnpm exec tsc -p tsconfig.json --noEmit 2>&1 | tee /tmp/tsc.out`
      2. Assert exit 0
      3. Create probe `/tmp/probe.ts`: `import type { Hero } from '~/lib/types'; const _x: Hero = null as never;`
      4. Verify probe compiles (after copying to src/__probe.ts temporarily; cleanup after)
    Expected Result: Types resolve and are type-only
    Evidence: .sisyphus/evidence/task-14-types-tsc.out

  Scenario: No prohibited types
    Tool: Bash
    Preconditions: src/lib/types.ts exists
    Steps:
      1. Run `grep -nE ': (any|unknown)\b' src/lib/types.ts; echo "exit=$?"`
      2. Assert "exit=1" (no matches)
      3. Run `grep -cE '^export (interface|type) ' src/lib/types.ts`
      4. Assert count >= 5 (Hero, Item, Ability, HeroStats, HeroImages, SlotType)
    Expected Result: Only interface/type exports; no any/unknown
    Evidence: .sisyphus/evidence/task-14-types-clean.txt
  ```

  **Commit**: YES
  - Message: `feat(types): add domain type skeleton for hero/item/ability`
  - Files: `src/lib/types.ts`
  - Pre-commit: `pnpm typecheck`

- [ ] 15. **TDD: `src/components/AppShell.tsx` + `src/components/__tests__/AppShell.test.tsx`**

  **What to do** (strict RED → GREEN → REFACTOR ordering):
  - **RED phase**: Write `src/components/__tests__/AppShell.test.tsx` FIRST:
    ```tsx
    import { render, screen } from '@solidjs/testing-library';
    import { describe, it, expect } from 'vitest';
    import AppShell from '../AppShell';

    describe('AppShell', () => {
      it('renders header with site title', () => {
        render(() => <AppShell><div>content</div></AppShell>);
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByText(/Deadlock Helpful Info/i)).toBeInTheDocument();
      });

      it('renders children inside main', () => {
        render(() => <AppShell><div data-testid="child">child content</div></AppShell>);
        const main = screen.getByRole('main');
        expect(main).toContainElement(screen.getByTestId('child'));
      });

      it('renders footer landmark', () => {
        render(() => <AppShell><div /></AppShell>);
        expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      });
    });
    ```
  - Commit RED phase: `git add src/components/__tests__/AppShell.test.tsx && git commit -m 'test(AppShell): add failing tests for shell landmarks (RED)'`
  - Verify test fails: `pnpm test --run` → 3 failures with "Cannot find module ../AppShell"
  - **GREEN phase**: Write minimal `src/components/AppShell.tsx`:
    ```tsx
    import type { ParentComponent } from 'solid-js';
    import { A } from '@solidjs/router';

    const AppShell: ParentComponent = (props) => {
      return (
        <div class="app-shell">
          <header class="app-shell__header">
            <A href="/" aria-label="Home">
              <strong>Deadlock Helpful Info</strong>
            </A>
          </header>
          <main class="app-shell__main">{props.children}</main>
          <footer class="app-shell__footer">
            <small>Community reference. Not affiliated with Valve.</small>
          </footer>
        </div>
      );
    };

    export default AppShell;
    ```
  - Verify tests pass: `pnpm test --run` → 3 passing
  - Commit GREEN phase: `git add src/components/AppShell.tsx && git commit -m 'feat(AppShell): minimal shell with header/main/footer landmarks (GREEN)'`
  - **REFACTOR phase**: Tidy if needed (none expected at this scale); skip refactor commit if no change

  **Must NOT do**:
  - NO destructured props (`(props) =>` not `({ children }) =>`) — `props.children` only
  - NO writing the implementation before the test
  - NO mocking — real components, real DOM (jsdom)
  - NO snapshot tests (brittle; semantic queries via testing-library)
  - NO `expect(component).toMatchSnapshot()`
  - NO testing implementation details (class names, internal state)
  - NO conditional logic in the test itself

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Strict RED→GREEN protocol, both halves trivial
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (depends on T9 importing AppShell)
  - **Blocks**: T17 (CI runs tests), T21 (Playwright relies on shell), T24
  - **Blocked By**: T2 (deps), T7 (vitest config), T9 (app.tsx imports AppShell)

  **References**:
  - `@solidjs/testing-library` — `render` returns dispose function; cleanup auto in test-setup (T7)
  - Semantic queries (`getByRole`, `getByText`): https://testing-library.com/docs/queries/about/#priority
  - Solid `ParentComponent<P>` type — typed `props.children`

  **Acceptance Criteria**:
  - [ ] Test file written and committed BEFORE component file (verifiable via `git log --oneline --reverse src/components/`)
  - [ ] `pnpm test --run src/components/__tests__/AppShell.test.tsx` → 3 pass, 0 fail
  - [ ] No destructured props: `grep -E 'AppShell.*\(\{' src/components/AppShell.tsx; echo $?` returns 1
  - [ ] Coverage shows AppShell.tsx > 80% line coverage: `pnpm test --run --coverage 2>&1 | grep AppShell`

  **QA Scenarios**:

  ```
  Scenario: RED → GREEN transition visible in git history
    Tool: Bash
    Preconditions: Tasks 15 committed; using conventional commits
    Steps:
      1. Run `git log --oneline --reverse -- src/components/__tests__/AppShell.test.tsx src/components/AppShell.tsx | tee /tmp/git-log.txt`
      2. Assert first line matches `test(AppShell):.*RED`
      3. Assert second line matches `feat(AppShell):.*GREEN`
    Expected Result: Test commit precedes component commit
    Evidence: .sisyphus/evidence/task-15-tdd-history.txt

  Scenario: Component renders correct landmarks with no destructured props
    Tool: Bash + Vitest
    Preconditions: After GREEN commit, deps installed
    Steps:
      1. Run `pnpm test --run src/components/__tests__/AppShell.test.tsx 2>&1 | tee /tmp/vitest.out`
      2. Assert exit 0
      3. Assert /tmp/vitest.out contains "3 passed"
      4. Run `grep -E '\(\s*\{[^}]*\}\s*\)' src/components/AppShell.tsx; echo "exit=$?"`
      5. Assert "exit=1" (no destructured params)
    Expected Result: 3 tests green; no destructured params present
    Evidence: .sisyphus/evidence/task-15-vitest-pass.out
  ```

  **Commit**: YES (split into 2 commits per TDD)
  - Commit A: `test(AppShell): add failing tests for shell landmarks (RED)` — files: `src/components/__tests__/AppShell.test.tsx`
  - Commit B: `feat(AppShell): minimal shell with header/main/footer landmarks (GREEN)` — files: `src/components/AppShell.tsx`
  - Pre-commit: `pnpm test --run`

- [ ] 16. **Replace `.github/workflows/pages.yml` (Vite build + deploy, cron + manual)**

  **What to do**:
  - Overwrite `.github/workflows/pages.yml`:
    ```yaml
    name: Deploy to GitHub Pages

    on:
      push:
        branches: [main]
      workflow_dispatch:
      schedule:
        # Daily UTC 04:15 — off-peak. Wired now for future data refresh; harmless until data fetcher exists.
        - cron: '15 4 * * *'

    permissions:
      contents: read
      pages: write
      id-token: write

    concurrency:
      group: pages
      cancel-in-progress: false

    env:
      VITE_BASE: /deadlock-helpful-info/

    jobs:
      build:
        runs-on: ubuntu-latest
        timeout-minutes: 10
        steps:
          - name: Checkout
            uses: actions/checkout@v6
            with:
              lfs: true
              fetch-depth: 1

          - name: Install pnpm
            uses: pnpm/action-setup@v4

          - name: Setup Node
            uses: actions/setup-node@v6
            with:
              node-version-file: .node-version
              cache: pnpm

          - name: Install dependencies
            run: pnpm install --frozen-lockfile

          - name: Configure Pages
            uses: actions/configure-pages@v6

          - name: Build
            run: pnpm build
            env:
              NODE_ENV: production

          - name: Bundle size budget
            run: pnpm bundle-size

          - name: Upload artifact
            uses: actions/upload-pages-artifact@v5
            with:
              path: ./dist

      deploy:
        needs: build
        runs-on: ubuntu-latest
        timeout-minutes: 5
        environment:
          name: github-pages
          url: ${{ steps.deployment.outputs.page_url }}
        steps:
          - name: Deploy to GitHub Pages
            id: deployment
            uses: actions/deploy-pages@v5
    ```

  **Must NOT do**:
  - NO floating `@main` or `@master` action refs — only pinned major versions
  - NO single-job pattern (build + deploy must be separate jobs)
  - NO `cancel-in-progress: true` for Pages (cancelling a half-deploy can corrupt Pages state)
  - NO `lfs: false` (PNG cheatsheets are LFS-tracked and needed in build)
  - NO `fetch-depth: 0` (full history not needed; `1` is faster)
  - NO secrets references (`secrets.X`) — public repo, no secrets in scope
  - NO `permissions: write-all` — least privilege
  - NO referencing the Vite `base` inline in `vite.config.ts` — must come from `VITE_BASE` env so dev + prod + custom-domain all work

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Complex CI/CD with multiple action coordinations and least-privilege permissions; mistakes break deploys
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3 with T17-T21)
  - **Blocks**: T22 (README references workflow), T24
  - **Blocked By**: T2 (pnpm), T7 (vite.config knows VITE_BASE)

  **References**:
  - Librarian research: 2-job pattern from `actions/starter-workflows/blob/main/pages/static.yml`
  - GitHub Pages docs: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
  - `actions/checkout@v6`, `actions/setup-node@v6`, `pnpm/action-setup@v4`, `actions/configure-pages@v6`, `actions/upload-pages-artifact@v5`, `actions/deploy-pages@v5`
  - Schedule semantics: cron runs on default branch, UTC; disabled after 60d inactivity → Dependabot (T19) keeps repo active

  **Acceptance Criteria**:
  - [ ] YAML is valid: `pnpm dlx js-yaml .github/workflows/pages.yml > /dev/null` or `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pages.yml'))"` exits 0
  - [ ] All action refs pinned to major: `grep -E 'uses: .*@' .github/workflows/pages.yml | grep -vE '@v[0-9]+$'; echo $?` returns 1 (no unpinned)
  - [ ] Concurrency `cancel-in-progress: false`: `grep -q 'cancel-in-progress: false' .github/workflows/pages.yml`
  - [ ] Permissions least-privilege: only `contents: read`, `pages: write`, `id-token: write`

  **QA Scenarios**:

  ```
  Scenario: Workflow YAML parses and matches expected structure
    Tool: Bash
    Preconditions: pages.yml written
    Steps:
      1. Run `python3 -c "import yaml,sys; d=yaml.safe_load(open('.github/workflows/pages.yml')); print(list(d['jobs'].keys()))" | tee /tmp/jobs.txt`
      2. Assert /tmp/jobs.txt contains "['build', 'deploy']"
      3. Run `python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/pages.yml')); print(d['concurrency']['cancel-in-progress'])"`
      4. Assert output is "False" (YAML boolean false)
      5. Run `python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/pages.yml')); print(sorted(d['permissions'].items()))"`
      6. Assert output equals "[('contents', 'read'), ('id-token', 'write'), ('pages', 'write')]"
    Expected Result: Two jobs, cancel-in-progress false, least-privilege permissions
    Evidence: .sisyphus/evidence/task-16-yaml-parse.txt

  Scenario: Live deploy succeeds end-to-end
    Tool: Bash + gh CLI
    Preconditions: Branch pushed to GitHub, Pages enabled in repo settings
    Steps:
      1. Run `gh workflow run pages.yml --ref <branch> 2>&1 | tee /tmp/run.log` (or push to main)
      2. Run `gh run watch --exit-status 2>&1 | tee /tmp/watch.log`
      3. Assert exit code 0 (workflow succeeded)
      4. Run `curl -sf https://xaviergmail.github.io/deadlock-helpful-info/ -o /tmp/index.html`
      5. Assert curl exit 0
      6. Assert `grep -q 'id="root"' /tmp/index.html`
    Expected Result: Workflow green; deployed site serves index.html with root div
    Evidence: .sisyphus/evidence/task-16-deploy.log
  ```

  **Commit**: YES
  - Message: `ci(pages): replace Jekyll workflow with Vite build and deploy`
  - Files: `.github/workflows/pages.yml`
  - Pre-commit: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/pages.yml'))"`

- [ ] 17. **Create `.github/workflows/ci.yml` (PR validation)**

  **What to do**:
  - `.github/workflows/ci.yml`:
    ```yaml
    name: CI

    on:
      pull_request:
        branches: [main]
      push:
        branches: [main]

    permissions:
      contents: read

    concurrency:
      group: ci-${{ github.ref }}
      cancel-in-progress: true

    jobs:
      validate:
        runs-on: ubuntu-latest
        timeout-minutes: 10
        steps:
          - uses: actions/checkout@v6
            with:
              lfs: true
              fetch-depth: 1

          - uses: pnpm/action-setup@v4

          - uses: actions/setup-node@v6
            with:
              node-version-file: .node-version
              cache: pnpm

          - name: Install dependencies
            run: pnpm install --frozen-lockfile

          - name: Lint (Biome)
            run: pnpm lint

          - name: Typecheck
            run: pnpm typecheck

          - name: Unit tests
            run: pnpm test --run --coverage

          - name: Build
            run: pnpm build
            env:
              VITE_BASE: /deadlock-helpful-info/

          - name: Bundle size budget
            run: pnpm bundle-size

          - name: Install Playwright browsers
            run: pnpm exec playwright install --with-deps chromium

          - name: E2E smoke (Playwright)
            run: pnpm test:e2e

          - name: Upload Playwright report on failure
            if: failure()
            uses: actions/upload-artifact@v4
            with:
              name: playwright-report
              path: playwright-report/
              retention-days: 7
    ```
  - Note: jobs intentionally NOT split into matrix — single linear job is fastest for a small repo. Split later if test suite grows past ~30s.

  **Must NOT do**:
  - NO running `pnpm install` without `--frozen-lockfile` (lockfile must be authoritative)
  - NO matrix builds across Node versions for the scaffold (single Node 22 LTS pin)
  - NO secrets references
  - NO `actions/checkout@v3` or any deprecated major
  - NO running E2E against `pnpm dev` — must build then `pnpm preview` (or Playwright's webServer config)
  - NO `continue-on-error: true` on any step (fail fast)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: T22, T24
  - **Blocked By**: T2, T4, T7, T15, T18 (bundle-size script), T21 (Playwright config)

  **References**:
  - Playwright in CI: https://playwright.dev/docs/ci-intro
  - `actions/upload-artifact@v4` — v3 is deprecated as of 2024
  - `concurrency` cancel-in-progress on CI (different from pages.yml — here we DO want to cancel superseded PR runs)

  **Acceptance Criteria**:
  - [ ] YAML valid
  - [ ] Concurrency cancels superseded PR runs: `grep -q 'cancel-in-progress: true' .github/workflows/ci.yml`
  - [ ] All major-pinned action versions
  - [ ] All required steps present: lint, typecheck, test, build, bundle-size, e2e
  - [ ] Permissions = `contents: read` only (no write needed for PR validation)

  **QA Scenarios**:

  ```
  Scenario: CI workflow structure verified
    Tool: Bash
    Preconditions: ci.yml written
    Steps:
      1. Run `python3 -c "import yaml; d=yaml.safe_load(open('.github/workflows/ci.yml')); steps=d['jobs']['validate']['steps']; print([s.get('name') or s.get('uses','').split('@')[0] for s in steps])" | tee /tmp/ci-steps.txt`
      2. Assert /tmp/ci-steps.txt contains "'Lint (Biome)'", "'Typecheck'", "'Unit tests'", "'Build'", "'Bundle size budget'", "'E2E smoke (Playwright)'"
      3. Assert `grep -q 'permissions:' .github/workflows/ci.yml`
      4. Assert `grep -A 2 'permissions:' .github/workflows/ci.yml | grep -E 'pages|write'; echo "exit=$?"` returns "exit=1" (no write perms granted)
    Expected Result: All validation steps present; least privilege
    Evidence: .sisyphus/evidence/task-17-ci-structure.txt

  Scenario: CI fails fast on lint error (simulated locally)
    Tool: Bash
    Preconditions: ci.yml + biome.json + a deliberately bad file
    Steps:
      1. Create `/tmp/bad-fixture.ts` with `const x: any = 1;`
      2. Copy to `src/__ci_probe.ts`
      3. Run `pnpm lint 2>&1; echo "exit=$?"` (simulates CI step)
      4. Assert "exit=" is non-zero
      5. Cleanup: `rm src/__ci_probe.ts`
    Expected Result: pnpm lint exits non-zero on `any` (matches what CI would do)
    Evidence: .sisyphus/evidence/task-17-lint-fails-fast.txt
  ```

  **Commit**: YES
  - Message: `ci(pr): add PR validation workflow`
  - Files: `.github/workflows/ci.yml`
  - Pre-commit: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`

- [ ] 18. **Create `scripts/check-bundle-size.ts` (CI bundle budget gate)**

  **What to do**:
  - `scripts/check-bundle-size.ts`:
    ```ts
    #!/usr/bin/env node
    import { readdir, readFile, stat } from 'node:fs/promises';
    import { join, relative } from 'node:path';
    import { gzipSize } from 'gzip-size';

    const DIST_DIR = 'dist';
    const BUDGETS = {
      // Initial JS gzipped — entry chunk(s) needed to render route "/"
      initialJs: 60 * 1024, // 60 KB
      // Total CSS gzipped
      totalCss: 20 * 1024, // 20 KB
      // Any single chunk
      singleChunkMax: 100 * 1024, // 100 KB
    };

    async function walk(dir: string): Promise<string[]> {
      const out: string[] = [];
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name);
        if (entry.isDirectory()) out.push(...(await walk(p)));
        else out.push(p);
      }
      return out;
    }

    async function main() {
      const files = await walk(DIST_DIR);
      const indexHtml = await readFile(join(DIST_DIR, 'index.html'), 'utf8');

      // Initial JS = chunks referenced directly from index.html via <script type="module" src="...">
      const scriptRefs = [...indexHtml.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((m) => m[1]);
      const moduleRefs = [...indexHtml.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+\.js)"/g)].map((m) => m[1]);
      const initialChunks = new Set([...scriptRefs, ...moduleRefs].map((s) => s.replace(/^\//, '').replace(/^deadlock-helpful-info\//, '')));

      let initialJsBytes = 0;
      let totalCssBytes = 0;
      const oversizedChunks: Array<{ file: string; gz: number }> = [];

      for (const file of files) {
        const rel = relative(DIST_DIR, file);
        const buf = await readFile(file);
        const gz = await gzipSize(buf);
        const isInitial = initialChunks.has(rel);
        if (file.endsWith('.js')) {
          if (isInitial) initialJsBytes += gz;
          if (gz > BUDGETS.singleChunkMax) oversizedChunks.push({ file: rel, gz });
        } else if (file.endsWith('.css')) {
          totalCssBytes += gz;
        }
      }

      const report = {
        initialJsBytes,
        totalCssBytes,
        budgets: BUDGETS,
        oversizedChunks,
      };
      console.log(JSON.stringify(report, null, 2));

      const failures: string[] = [];
      if (initialJsBytes > BUDGETS.initialJs) {
        failures.push(`initial JS ${initialJsBytes} > budget ${BUDGETS.initialJs}`);
      }
      if (totalCssBytes > BUDGETS.totalCss) {
        failures.push(`total CSS ${totalCssBytes} > budget ${BUDGETS.totalCss}`);
      }
      if (oversizedChunks.length > 0) {
        failures.push(`oversized chunks: ${oversizedChunks.map((c) => `${c.file}=${c.gz}`).join(', ')}`);
      }

      if (failures.length) {
        console.error('Bundle budget violations:');
        for (const f of failures) console.error('  -', f);
        process.exit(1);
      }
      console.log('Bundle within budget.');
    }

    main().catch((err) => {
      console.error(err);
      process.exit(1);
    });
    ```
  - Add to `package.json` script: `"bundle-size": "node --experimental-strip-types scripts/check-bundle-size.ts"` (already added in T2)
  - Verify `gzip-size` is in devDependencies (added in T2)

  **Must NOT do**:
  - NO hardcoded path that assumes `VITE_BASE=/` (must handle subpath assets)
  - NO suppressing failures (must exit 1 on budget violation)
  - NO reading dist/ files that don't exist (handle missing gracefully with clear error)
  - NO measuring raw bytes only (gzipped is what matters over the wire)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: T17 (CI uses it), T24
  - **Blocked By**: T2 (gzip-size dep), T7 (vite.config to know dist/)

  **References**:
  - `gzip-size` package: https://www.npmjs.com/package/gzip-size
  - Node `--experimental-strip-types`: Node 22.6+ runs `.ts` directly; fallback to `tsx` if unstable

  **Acceptance Criteria**:
  - [ ] Script runs successfully on a baseline build: `pnpm build && pnpm bundle-size` → exits 0
  - [ ] Script fails on a deliberately oversized build (simulated by lowering budget to 1 KB): exits 1
  - [ ] Output is parseable JSON (for future CI dashboards)

  **QA Scenarios**:

  ```
  Scenario: Baseline build is under budget
    Tool: Bash
    Preconditions: Wave 2 complete, package.json has gzip-size, scripts/check-bundle-size.ts exists
    Steps:
      1. Run `pnpm build 2>&1 | tail -5 | tee /tmp/build.out`
      2. Run `pnpm bundle-size 2>&1 | tee /tmp/bundle.json`
      3. Assert exit code 0
      4. Assert `jq '.initialJsBytes' /tmp/bundle.json` returns a number < 61440
      5. Assert /tmp/bundle.json does NOT contain "violations"
    Expected Result: Initial JS gzipped well under 60 KB (expected ~15-25 KB for scaffold)
    Evidence: .sisyphus/evidence/task-18-bundle-ok.json

  Scenario: Tightening budget triggers failure
    Tool: Bash
    Preconditions: Baseline build exists
    Steps:
      1. Make a temp copy: `cp scripts/check-bundle-size.ts /tmp/check.ts`
      2. In the copy, change `initialJs: 60 * 1024` → `initialJs: 1024` (1 KB)
      3. Run `node --experimental-strip-types /tmp/check.ts; echo "exit=$?"`
      4. Assert "exit=1"
      5. Cleanup: `rm /tmp/check.ts`
    Expected Result: Lowered budget fails the gate
    Evidence: .sisyphus/evidence/task-18-bundle-fails.txt
  ```

  **Commit**: YES
  - Message: `feat(build): add bundle size budget script`
  - Files: `scripts/check-bundle-size.ts`
  - Pre-commit: `pnpm typecheck`

- [ ] 19. **Create `.github/dependabot.yml` (weekly npm + actions updates)**

  **What to do**:
  - `.github/dependabot.yml`:
    ```yaml
    version: 2
    updates:
      - package-ecosystem: npm
        directory: /
        schedule:
          interval: weekly
          day: monday
          time: '06:00'
          timezone: Etc/UTC
        open-pull-requests-limit: 5
        labels: [dependencies, npm]
        commit-message:
          prefix: chore(deps)
          include: scope
        groups:
          solid-ecosystem:
            patterns: ['solid-js', '@solidjs/*', 'vite-plugin-solid']
          dev-tooling:
            patterns: ['vite', 'vitest', '@vitest/*', '@biomejs/biome', 'typescript', '@playwright/test', 'playwright']
          testing:
            patterns: ['@solidjs/testing-library', '@testing-library/*', 'jsdom']

      - package-ecosystem: github-actions
        directory: /
        schedule:
          interval: weekly
          day: monday
        labels: [dependencies, github-actions]
        commit-message:
          prefix: chore(actions)
    ```
  - Activity from Dependabot PRs keeps the repo "active" so the scheduled cron in `pages.yml` doesn't auto-disable after 60 days of inactivity

  **Must NOT do**:
  - NO `daily` interval (PR noise)
  - NO `versioning-strategy: lockfile-only` for npm (we want package.json bumps too)
  - NO grouping ALL deps into one update (Solid bumps separately to catch reactivity regressions)
  - NO `allow` lists that exclude security updates

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: T24
  - **Blocked By**: T2 (package ecosystem expects package.json)

  **References**:
  - Dependabot config v2: https://docs.github.com/en/code-security/dependabot/working-with-dependabot/dependabot-options-reference
  - Schedule cron auto-disable rule: research note in plan Context

  **Acceptance Criteria**:
  - [ ] YAML valid
  - [ ] Both ecosystems present: npm + github-actions
  - [ ] Schedule interval is weekly
  - [ ] Solid ecosystem grouped separately

  **QA Scenarios**:

  ```
  Scenario: Dependabot config valid and complete
    Tool: Bash
    Preconditions: dependabot.yml written
    Steps:
      1. Run `python3 -c "import yaml; d=yaml.safe_load(open('.github/dependabot.yml')); print(d['version']); print([u['package-ecosystem'] for u in d['updates']])" | tee /tmp/dep.txt`
      2. Assert /tmp/dep.txt contains "2" and "['npm', 'github-actions']"
      3. Assert `grep -q 'solid-ecosystem' .github/dependabot.yml`
    Expected Result: Version 2, both ecosystems, Solid grouped
    Evidence: .sisyphus/evidence/task-19-dependabot.txt

  Scenario: GitHub recognizes the file (post-push)
    Tool: gh CLI
    Preconditions: File pushed to a branch
    Steps:
      1. Run `gh api repos/{owner}/{repo}/dependabot/secrets 2>&1; echo "exit=$?"` (just to check API access works)
      2. (Manual ground truth: visit Insights → Dependency graph → Dependabot in GitHub UI shows config recognized)
    Expected Result: GitHub recognizes the config (visible in repo settings)
    Evidence: .sisyphus/evidence/task-19-gh-recognition.txt (note: full validation only possible after push)
  ```

  **Commit**: YES
  - Message: `ci(deps): add Dependabot config for npm and actions`
  - Files: `.github/dependabot.yml`
  - Pre-commit: `python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml'))"`

- [ ] 20. **Configure pre-commit hooks (simple-git-hooks + lint-staged)**

  **What to do**:
  - `simple-git-hooks` and `lint-staged` config already added to `package.json` in T2 — this task ACTIVATES them
  - Run `pnpm install` (or `pnpm exec simple-git-hooks`) — the `prepare` script auto-installs git hooks
  - Verify `.git/hooks/pre-commit` is created and points to simple-git-hooks
  - Test that the hook fires on a `git commit`
  - If `pnpm` is not on PATH for the hook subprocess, fall back to using `npx` invocations in the config (rare on modern setups)

  **Must NOT do**:
  - NO `husky` (chose simple-git-hooks for zero overhead — no .husky/ directory)
  - NO running expensive checks in pre-commit (no `pnpm test`, no `pnpm typecheck`) — only `biome check --write` on staged files
  - NO bypassing lockfile via `--no-frozen-lockfile`
  - NO ignoring `prepare-commit-msg` or other hooks (only `pre-commit` is wired)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: T24
  - **Blocked By**: T2 (deps), T4 (biome config)

  **References**:
  - `simple-git-hooks` README: https://www.npmjs.com/package/simple-git-hooks
  - `lint-staged` config: https://www.npmjs.com/package/lint-staged

  **Acceptance Criteria**:
  - [ ] `.git/hooks/pre-commit` file exists and is executable
  - [ ] `cat .git/hooks/pre-commit | grep -q 'simple-git-hooks'`
  - [ ] Test commit with a deliberately bad file is REJECTED (or auto-fixed) by the hook
  - [ ] No `.husky/` directory exists

  **QA Scenarios**:

  ```
  Scenario: Hook installs on pnpm install (via prepare)
    Tool: Bash
    Preconditions: package.json has simple-git-hooks config; node_modules installed
    Steps:
      1. Run `rm -f .git/hooks/pre-commit`
      2. Run `pnpm exec simple-git-hooks 2>&1 | tee /tmp/sgh.out`
      3. Assert exit 0
      4. Assert `test -x .git/hooks/pre-commit`
      5. Assert `cat .git/hooks/pre-commit | grep -q 'lint-staged'`
    Expected Result: Hook file created and executable
    Evidence: .sisyphus/evidence/task-20-hook-installed.txt

  Scenario: Hook auto-fixes a staged file
    Tool: Bash
    Preconditions: Hooks installed; clean working tree
    Steps:
      1. Create `src/__hook_probe.ts` with bad formatting: `const   x=1` (extra spaces, no semicolon)
      2. Run `git add src/__hook_probe.ts`
      3. Run `git commit -m 'probe(hook): format test' 2>&1 | tee /tmp/hook.out`
      4. Assert exit 0 (commit succeeded after auto-format)
      5. Run `cat src/__hook_probe.ts`
      6. Assert content is formatted (no extra spaces, has semicolon)
      7. Cleanup: `git reset --hard HEAD~1 && rm -f src/__hook_probe.ts`
    Expected Result: Biome auto-formatted the staged file via lint-staged
    Evidence: .sisyphus/evidence/task-20-hook-fixed.txt
  ```

  **Commit**: YES
  - Message: `chore(repo): activate pre-commit hooks via simple-git-hooks`
  - Files: (none — `package.json` already has config; `pnpm-lock.yaml` already includes deps; this task is verification-driven)
  - Pre-commit: `test -x .git/hooks/pre-commit`

- [ ] 21. **Create `playwright.config.ts` + `e2e/smoke.spec.ts`**

  **What to do**:
  - `playwright.config.ts`:
    ```ts
    import { defineConfig, devices } from '@playwright/test';

    const PORT = 4173;
    const BASE = '/deadlock-helpful-info/';

    export default defineConfig({
      testDir: './e2e',
      timeout: 30_000,
      fullyParallel: true,
      forbidOnly: !!process.env.CI,
      retries: process.env.CI ? 2 : 0,
      workers: process.env.CI ? 1 : undefined,
      reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
      use: {
        baseURL: `http://localhost:${PORT}${BASE}`,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
      },
      projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
      webServer: {
        command: 'pnpm preview',
        url: `http://localhost:${PORT}${BASE}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: { VITE_BASE: BASE },
      },
    });
    ```
  - `e2e/smoke.spec.ts`:
    ```ts
    import { test, expect } from '@playwright/test';

    test.describe('smoke', () => {
      test('home renders title and primary nav', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('h1')).toHaveText(/Deadlock Helpful Info/i);
        await expect(page.locator('nav[aria-label="Primary"] a')).toHaveCount(2);
      });

      test('cheatsheets route shows both PNG images', async ({ page }) => {
        await page.goto('/#/cheatsheets');
        await expect(page.locator('h1')).toContainText(/Cheatsheet/i);
        const imgs = page.locator('img[loading="lazy"]');
        await expect(imgs).toHaveCount(2);
        // Verify images actually loaded (not broken)
        const naturals = await imgs.evaluateAll((els) =>
          (els as HTMLImageElement[]).map((e) => e.naturalWidth),
        );
        expect(naturals.every((w) => w > 0)).toBe(true);
      });

      test('unknown hash route falls to not-found', async ({ page }) => {
        await page.goto('/#/does-not-exist');
        await expect(page.locator('h1')).toContainText(/404|Not Found/i);
      });

      test('app shell landmarks present on every route', async ({ page }) => {
        for (const route of ['/', '/#/cheatsheets', '/#/missing']) {
          await page.goto(route);
          await expect(page.getByRole('banner')).toBeVisible();
          await expect(page.getByRole('main')).toBeVisible();
          await expect(page.getByRole('contentinfo')).toBeVisible();
        }
      });
    });
    ```

  **Must NOT do**:
  - NO `npm run dev` as webServer (must use built + previewed bundle to catch prod-only issues)
  - NO matrix across browsers in CI scaffold (chromium only — matches Steam Overlay)
  - NO `headless: false`
  - NO visual regression snapshots in this plan (deferred until UI is stable)
  - NO testing the deployed Pages URL from CI (chicken-and-egg: CI runs before deploy)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3)
  - **Blocks**: T17 (CI uses it), T24
  - **Blocked By**: T7 (vite preview), T9 (app must mount), T15 (AppShell landmarks)

  **References**:
  - Playwright config: https://playwright.dev/docs/test-configuration
  - `naturalWidth > 0` is the canonical "image actually loaded" check

  **Acceptance Criteria**:
  - [ ] `pnpm exec playwright test --list 2>&1 | grep -c 'smoke'` returns >= 4 (tests discovered)
  - [ ] Local: `pnpm build && pnpm test:e2e` exits 0
  - [ ] Config restricts to chromium only: `grep -c 'name:' playwright.config.ts | grep -q 1`

  **QA Scenarios**:

  ```
  Scenario: All smoke tests pass against preview build
    Tool: Bash
    Preconditions: Full Wave 1-3 in place
    Steps:
      1. Run `pnpm build 2>&1 | tail -3 | tee /tmp/build.out`
      2. Run `pnpm exec playwright install --with-deps chromium 2>&1 | tail -3`
      3. Run `pnpm test:e2e 2>&1 | tee /tmp/e2e.out`
      4. Assert exit 0
      5. Assert /tmp/e2e.out contains "4 passed"
    Expected Result: 4 smoke tests green against built+previewed bundle
    Evidence: .sisyphus/evidence/task-21-smoke-pass.out

  Scenario: Broken images would fail
    Tool: Bash
    Preconditions: Smoke tests in place
    Steps:
      1. Temporarily rename a PNG: `mv src/assets/cheatsheets/counter-item-cheatsheet.png src/assets/cheatsheets/counter-item-cheatsheet.png.bak`
      2. Run `pnpm build; pnpm test:e2e 2>&1 | tee /tmp/e2e-bad.out; echo "exit=$?"`
      3. Assert "exit=" is non-zero
      4. Assert /tmp/e2e-bad.out mentions image / naturalWidth check failed
      5. Restore: `mv src/assets/cheatsheets/counter-item-cheatsheet.png.bak src/assets/cheatsheets/counter-item-cheatsheet.png`
    Expected Result: Missing image breaks the smoke test (proves gate is real)
    Evidence: .sisyphus/evidence/task-21-broken-image-fails.out
  ```

  **Commit**: YES
  - Message: `feat(test): add Playwright smoke E2E config`
  - Files: `playwright.config.ts`, `e2e/smoke.spec.ts`
  - Pre-commit: `pnpm typecheck`

- [ ] 22. **Rewrite `README.md` for new stack**

  **What to do**:
  - Rewrite `README.md` with sections (in this order):
    - **Title + one-line description** — "Deadlock Helpful Info — hero, item, and ability reference for the Steam Overlay browser"
    - **Live site** — link to `https://xaviergmail.github.io/deadlock-helpful-info/`
    - **Tech stack** — Solid.js, Vite, TypeScript, Biome, Vitest, Playwright, pnpm, GitHub Pages (with `AGENTS.md` link for full context)
    - **Quickstart**:
      ```sh
      pnpm install
      pnpm dev          # http://localhost:5173
      pnpm test         # vitest unit tests
      pnpm test:e2e     # playwright smoke
      pnpm build        # production build → dist/
      pnpm preview      # serve built site
      ```
    - **Scripts table** — purpose of each `package.json` script
    - **Architecture** — short paragraph: build-time data, fine-grained reactivity, hash routing for Pages subpath, dark-theme default, bundle budget enforced in CI
    - **Deployment** — auto-deploys on push to `main` via `.github/workflows/pages.yml`. **One-time setup** required: in GitHub repo Settings → Pages → Source → select **GitHub Actions**. Then trigger first deploy via push or `gh workflow run pages.yml`
    - **Adding routes** — short example showing how to add a page (import lazy component, register in `app.tsx`, add to `routes.ts`)
    - **Adding tests** — example: place `*.test.tsx` next to component under `__tests__/`, prefer semantic queries
    - **Conventions** — link to AGENTS.md for the Solid rules (never destructure props, signals are functions, use `<For>`/`<Show>`)
    - **Bundle budget** — current limits and how to tune (`scripts/check-bundle-size.ts`)
    - **Contributing** — link to `CONTRIBUTING.md`
    - **Security** — link to `SECURITY.md`
    - **License** — link to `LICENSE`
  - Keep the section about LFS images — still relevant
  - DO NOT include the old "Editing quickly" Jekyll section

  **Must NOT do**:
  - NO emojis (per AGENTS.md slash command rules)
  - NO marketing copy / hype language
  - NO duplicate of AGENTS.md content — README links to it
  - NO ASCII-art banners

  **Recommended Agent Profile**:
  - **Category**: `writing`
    - Reason: User-facing documentation; needs careful structure and tone
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocks**: T24
  - **Blocked By**: T2 (knows scripts), T16, T17 (knows workflow names)

  **References**:
  - `AGENTS.md` — link for full architecture context (don't duplicate)
  - `LICENSE` — exists already, link from README
  - Current `README.md` to be REPLACED entirely (don't preserve Jekyll content)

  **Acceptance Criteria**:
  - [ ] Contains "pnpm install" quickstart
  - [ ] Documents GitHub Pages "Source: GitHub Actions" setup step explicitly
  - [ ] Links to AGENTS.md, CONTRIBUTING.md, SECURITY.md, LICENSE
  - [ ] Lists every script in `package.json`
  - [ ] No mention of Jekyll, kramdown, `_config.yml`
  - [ ] No emojis: `python3 -c "import re,sys; t=open('README.md').read(); m=re.findall(r'[\U0001F300-\U0001F9FF]', t); sys.exit(1 if m else 0)"`

  **QA Scenarios**:

  ```
  Scenario: All claimed scripts exist in package.json
    Tool: Bash
    Preconditions: README.md rewritten, package.json present
    Steps:
      1. Run `grep -oE 'pnpm (dev|build|preview|test|test:watch|test:e2e|typecheck|lint|format|check|bundle-size)' README.md | sort -u | tee /tmp/readme-scripts.txt`
      2. Run `jq -r '.scripts | keys[]' package.json | sort -u | tee /tmp/pkg-scripts.txt`
      3. For each script in /tmp/readme-scripts.txt: assert it's in /tmp/pkg-scripts.txt
    Expected Result: README only mentions scripts that exist
    Evidence: .sisyphus/evidence/task-22-scripts-aligned.txt

  Scenario: No stale Jekyll references
    Tool: Bash
    Preconditions: README.md rewritten
    Steps:
      1. Run `grep -iE 'jekyll|kramdown|_config\.yml|liquid' README.md; echo "exit=$?"`
      2. Assert "exit=1" (no matches)
    Expected Result: Zero Jekyll references
    Evidence: .sisyphus/evidence/task-22-no-jekyll.txt
  ```

  **Commit**: YES
  - Message: `docs(readme): rewrite for Solid+Vite+Pages stack`
  - Files: `README.md`
  - Pre-commit: `test -f README.md && grep -q 'pnpm install' README.md && ! grep -qi 'jekyll' README.md`

- [ ] 23. **Add PR template + issue templates + CONTRIBUTING.md + SECURITY.md**

  **What to do**:
  - `.github/PULL_REQUEST_TEMPLATE.md`:
    ```markdown
    ## Summary

    <!-- One sentence: what this PR does and why. -->

    ## Changes

    -

    ## Verification

    - [ ] `pnpm lint` clean
    - [ ] `pnpm typecheck` clean
    - [ ] `pnpm test --run` green
    - [ ] `pnpm build` succeeds
    - [ ] `pnpm bundle-size` within budget
    - [ ] `pnpm test:e2e` green (if UI changed)

    ## Notes

    <!-- Anything reviewers should know: trade-offs, follow-ups, etc. -->
    ```
  - `.github/ISSUE_TEMPLATE/bug.yml`:
    ```yaml
    name: Bug Report
    description: Something is broken or behaves unexpectedly
    labels: [bug]
    body:
      - type: textarea
        id: what-happened
        attributes:
          label: What happened?
          description: Describe the bug. Include screenshots if helpful.
        validations:
          required: true
      - type: textarea
        id: expected
        attributes:
          label: What did you expect?
        validations:
          required: true
      - type: textarea
        id: reproduce
        attributes:
          label: Steps to reproduce
          placeholder: |
            1. Go to ...
            2. Click ...
            3. See error
        validations:
          required: true
      - type: input
        id: browser
        attributes:
          label: Browser / Steam Overlay version
        validations:
          required: false
    ```
  - `.github/ISSUE_TEMPLATE/feature.yml`:
    ```yaml
    name: Feature Request
    description: Suggest something new or a change
    labels: [enhancement]
    body:
      - type: textarea
        id: problem
        attributes:
          label: What problem does this solve?
        validations:
          required: true
      - type: textarea
        id: proposal
        attributes:
          label: Proposed solution
        validations:
          required: false
      - type: textarea
        id: alternatives
        attributes:
          label: Alternatives considered
        validations:
          required: false
    ```
  - `.github/ISSUE_TEMPLATE/config.yml`:
    ```yaml
    blank_issues_enabled: false
    ```
  - `CONTRIBUTING.md`:
    ```markdown
    # Contributing

    Thanks for considering a contribution!

    ## Setup

    pnpm install
    pnpm dev

    ## Conventions

    Read AGENTS.md first. The most important rules:

    - **Never destructure props** in Solid components. Use `props.x`, not `({ x })`.
    - **Signals are functions**. Call them: `count()`, not `count`.
    - **Use `<For>` / `<Show>` / `<Switch>`** for rendering. No `.map()` in JSX. No ternaries.
    - **Build-time data only**. No runtime API calls from the browser.

    Solid framework-specific lint rules are not currently enforced by Biome.
    Reviewers and the AGENTS.md guardrails compensate. If you spot a destructured-props
    or `.map()`-in-JSX violation in review, flag it.

    ## Commits

    Conventional Commits: `type(scope): description`. Types: feat, fix, chore, docs, ci, test, refactor.

    ## Verification before pushing

    pnpm check        # biome auto-fix
    pnpm typecheck
    pnpm test --run
    pnpm build
    pnpm bundle-size

    ## Pull requests

    Use the PR template. Keep changes focused — one concern per PR.
    ```
  - `SECURITY.md`:
    ```markdown
    # Security Policy

    ## Reporting a vulnerability

    Open a private security advisory via GitHub:
    https://github.com/xaviergmail/deadlock-helpful-info/security/advisories/new

    Do not file a public issue for security reports.

    Expect a first response within 7 days.

    ## Scope

    This is a static site with no backend or user data. Likely security issues:

    - Cross-site scripting via user-controlled URL hash fragments
    - Subresource integrity for any externally-hosted assets (none currently)
    - GitHub Actions workflow misconfiguration

    Out of scope: anything requiring a server, accounts, or authenticated requests.
    ```

  **Must NOT do**:
  - NO `CODEOWNERS` (single owner)
  - NO `FUNDING.yml` (out of scope)
  - NO emojis in any template
  - NO security promises beyond what's reasonable for a tiny static site

  **Recommended Agent Profile**:
  - **Category**: `writing`
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4)
  - **Blocks**: T24
  - **Blocked By**: T2 (CONTRIBUTING references scripts)

  **References**:
  - `AGENTS.md` — referenced from CONTRIBUTING for Solid conventions
  - GitHub issue forms: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms

  **Acceptance Criteria**:
  - [ ] All 6 files exist
  - [ ] Issue template YAML valid: `for f in .github/ISSUE_TEMPLATE/*.yml; do python3 -c "import yaml; yaml.safe_load(open('$f'))" || exit 1; done`
  - [ ] CONTRIBUTING.md references AGENTS.md and the 4 Solid rules
  - [ ] SECURITY.md has private reporting instructions

  **QA Scenarios**:

  ```
  Scenario: All hygiene files exist with required content
    Tool: Bash
    Preconditions: All files written
    Steps:
      1. for f in .github/PULL_REQUEST_TEMPLATE.md .github/ISSUE_TEMPLATE/bug.yml .github/ISSUE_TEMPLATE/feature.yml .github/ISSUE_TEMPLATE/config.yml CONTRIBUTING.md SECURITY.md; do test -f "$f" || { echo "missing $f"; exit 1; }; done; echo "all-present"
      2. Assert output ends with "all-present"
      3. Assert `grep -q 'AGENTS.md' CONTRIBUTING.md`
      4. Assert `grep -q 'destructure' CONTRIBUTING.md`
      5. Assert `grep -q 'security/advisories/new' SECURITY.md`
    Expected Result: All 6 files exist with required references
    Evidence: .sisyphus/evidence/task-23-hygiene-files.txt

  Scenario: Issue templates render correctly (YAML form valid)
    Tool: Bash
    Preconditions: Issue forms written
    Steps:
      1. for f in .github/ISSUE_TEMPLATE/*.yml; do python3 -c "import yaml,sys; d=yaml.safe_load(open('$f')); assert 'name' in d or 'blank_issues_enabled' in d, '$f missing name'" || exit 1; done
      2. Assert exit 0
    Expected Result: All issue YAML files validate
    Evidence: .sisyphus/evidence/task-23-yaml-valid.txt
  ```

  **Commit**: YES
  - Message: `docs(repo): add PR template, issue templates, CONTRIBUTING, SECURITY`
  - Files: 6 files listed above
  - Pre-commit: `for f in .github/ISSUE_TEMPLATE/*.yml; do python3 -c "import yaml; yaml.safe_load(open('$f'))"; done`

- [ ] 24. **Local verification sweep (install → dev → build → test → typecheck → lint → bundle-size → e2e)**

  **What to do**:
  - Execute a clean-state end-to-end verification of every script in `package.json`:
    1. `rm -rf node_modules dist .vite playwright-report test-results`
    2. `pnpm install --frozen-lockfile 2>&1 | tee .sisyphus/evidence/task-24-install.log` → assert exit 0, lockfile unchanged
    3. `pnpm typecheck 2>&1 | tee .sisyphus/evidence/task-24-typecheck.log` → assert exit 0
    4. `pnpm lint 2>&1 | tee .sisyphus/evidence/task-24-lint.log` → assert exit 0
    5. `pnpm test --run 2>&1 | tee .sisyphus/evidence/task-24-test.log` → assert exit 0
    6. `pnpm build 2>&1 | tee .sisyphus/evidence/task-24-build.log` → assert exit 0, `dist/` exists
    7. `pnpm bundle-size 2>&1 | tee .sisyphus/evidence/task-24-bundle.json` → assert exit 0
    8. Start dev server, hit it, kill: `(pnpm dev > .sisyphus/evidence/task-24-dev.log 2>&1 &); sleep 5; curl -sf http://localhost:5173/ -o .sisyphus/evidence/task-24-dev-index.html; kill %1` → assert curl exit 0, file contains `id="root"`
    9. `pnpm exec playwright install --with-deps chromium 2>&1 | tee .sisyphus/evidence/task-24-pw-install.log`
    10. `pnpm test:e2e 2>&1 | tee .sisyphus/evidence/task-24-e2e.log` → assert exit 0
    11. Git porcelain check: `git status --porcelain | tee .sisyphus/evidence/task-24-git-status.txt` → assert empty (all required files committed)
  - Capture browser screenshots via Playwright for `/`, `/#/cheatsheets`, `/#/nonexistent` (saved in evidence dir)
  - Verify GitHub Pages "Source" setup is documented in README.md (cannot enable Pages via API in scaffold, but ensure the docs are explicit)
  - Push a verification branch and observe `ci.yml` running green: `gh workflow run ci.yml --ref <branch>` then `gh run watch --exit-status`

  **Must NOT do**:
  - NO skipping any step — every script must pass on a clean clone
  - NO "fix on the fly" — if a step fails, file a regression to the originating task and re-run that task; do NOT silently patch here
  - NO committing the verification evidence files (`.sisyphus/evidence/` is gitignored per T5)
  - NO fudging bundle size by tweaking the budget

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Coordinates verification across the full system; needs broad context and judgment to triage any failures
  - **Skills**: `[]`

  **Parallelization**:
  - **Can Run In Parallel**: NO (sequential by nature — gates everything)
  - **Blocks**: Final verification wave (F1-F4)
  - **Blocked By**: T1-T23 (ALL prior tasks)

  **References**:
  - All prior tasks (this is the integration gate)
  - GitHub Pages enablement: must be set manually in repo settings (Settings → Pages → Source → GitHub Actions); document in README so first deploy isn't silently no-op

  **Acceptance Criteria**:
  - [ ] All 11 verification steps pass with exit 0
  - [ ] `git status --porcelain` is empty after running
  - [ ] All evidence files captured in `.sisyphus/evidence/task-24-*.{log,json,html,txt,png}`
  - [ ] Bundle size JSON shows initial JS < 60 KB gzipped
  - [ ] Playwright run shows 4/4 smoke tests pass
  - [ ] CI workflow run on push branch is green (via `gh run watch --exit-status`)

  **QA Scenarios**:

  ```
  Scenario: Clean-state full pipeline succeeds
    Tool: Bash + tmux (interactive_bash for orchestration)
    Preconditions: Tasks 1-23 complete; clean working tree
    Steps:
      1. tmux new-session -d -s verify "bash -c 'set -e; rm -rf node_modules dist .vite; pnpm install --frozen-lockfile; pnpm typecheck; pnpm lint; pnpm test --run; pnpm build; pnpm bundle-size; pnpm exec playwright install --with-deps chromium; pnpm test:e2e; echo VERIFY_OK > /tmp/verify-status' 2>&1 | tee /tmp/verify.log"
      2. Poll for completion: `for i in $(seq 1 120); do test -f /tmp/verify-status && break; sleep 5; done`
      3. Assert `test -f /tmp/verify-status`
      4. Assert `cat /tmp/verify-status` returns "VERIFY_OK"
      5. Copy /tmp/verify.log to .sisyphus/evidence/task-24-orchestrated.log
    Expected Result: Full pipeline green in under ~10 min
    Evidence: .sisyphus/evidence/task-24-orchestrated.log

  Scenario: Deployed site (or local preview) renders all 3 routes
    Tool: Playwright
    Preconditions: `pnpm preview` running OR deployed Pages site live
    Steps:
      1. const baseURL = process.env.DEPLOYED_URL || 'http://localhost:4173/deadlock-helpful-info/'
      2. await page.goto(baseURL); assert h1 contains "Deadlock Helpful Info"; screenshot to evidence
      3. await page.goto(baseURL + '#/cheatsheets'); assert 2 imgs with naturalWidth > 0; screenshot
      4. await page.goto(baseURL + '#/missing-route-xyz'); assert h1 contains "404" or "Not Found"; screenshot
      5. await page.goto(baseURL); assert favicon link present; assert theme-color meta present
    Expected Result: All 3 routes render correctly with assets loaded
    Evidence: .sisyphus/evidence/task-24-routes-{home,cheatsheets,not-found}.png
  ```

  **Commit**: NO (verification only — does not modify code)
  - This task may surface regressions in T1-T23; fixes go in NEW commits to those tasks (or follow-up commits referencing the task), never amended onto T24

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
>
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback → fix → re-run → present again → wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`

  Read this plan end-to-end. For each "Must Have" item: verify implementation exists (read file, run command, curl deployed site). For each "Must NOT Have" guardrail: search codebase for forbidden patterns — REJECT with file:line if found (e.g., grep for `useState`, `useEffect`, `eslint`, `tailwind`, `clsx`, destructured `props`). Check that every task's evidence file exists in `.sisyphus/evidence/`. Compare deliverables list against actual files.

  **Specific checks**:
  - `grep -r "useState\|useEffect\|useMemo\|useCallback" src/` → empty
  - `grep -rE "function [A-Z][a-zA-Z]+\(\{" src/` → empty (no destructured props in components)
  - `grep -rE "\.map\(.*=>.*<" src/` → empty (no `.map()` in JSX)
  - `cat package.json | jq '.dependencies, .devDependencies'` → no `eslint`, `tailwindcss`, `unocss`, `clsx`, `zod`, `lodash`, `@sentry/*`
  - `ls scripts/` → no `fetch-*.ts`, no `generate-*.ts` (data fetching is out of scope)

  Output: `Must Have [N/N] | Must NOT Have [N/N] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`

  Run `pnpm typecheck`, `pnpm lint`, `pnpm test --run`, `pnpm build`. Review all changed files for: `as any`, `@ts-ignore`/`@ts-expect-error`, empty catches, `console.log`/`console.error` in production paths, commented-out code, unused imports, generic names (`data`, `result`, `item`, `temp`, `foo`, `bar`). Verify Biome reports clean. Verify TypeScript strict mode is actually on (`"strict": true` in tsconfig). Check that bundle size is under budget (`pnpm bundle-size`).

  Output: `tsc [PASS/FAIL] | biome [PASS/FAIL] | vitest [N pass/N fail] | build [PASS/FAIL] | bundle [N KB / 60 KB] | files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill)

  Start from clean clone state (delete `node_modules/`, `dist/`, `.vite/`). Execute every QA scenario from every task in dependency order. Then run end-to-end smoke:
  1. `pnpm install --frozen-lockfile` succeeds
  2. `pnpm dev` boots, navigate to `http://localhost:5173/#/`, assert home page renders, navigate to `#/cheatsheets`, assert both PNGs visible
  3. `pnpm build` produces `dist/`, `pnpm preview` serves it, repeat browser checks against preview
  4. `pnpm test --run` green
  5. `pnpm test:e2e` green (Playwright smoke against `pnpm preview`)
  6. Simulate CI: run `act -j build` (or equivalent) on `ci.yml`, assert green
  7. Push to a test branch, verify GitHub Actions runs, verify Pages deploy succeeds, fetch `https://xaviergmail.github.io/deadlock-helpful-info/` and assert content + cheatsheets render
  8. Test cross-task integration: hash-route navigation, browser back/forward, deep link to `#/cheatsheets`, refresh on `#/cheatsheets` (must work via hash routing without 404)
  9. Edge cases: invalid hash (`#/nonexistent`) → not-found page; bundle size measurement honest (matches CI gate)

  Save evidence to `.sisyphus/evidence/final-qa/`.

  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | Deployed Site [LIVE/DOWN] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`

  For each task: read "What to do", read actual `git diff` for the task's files. Verify 1:1 — everything in spec was built (no missing deliverables), nothing beyond spec was built (no scope creep). Check "Must NOT do" compliance per task. Detect cross-task contamination: Task N touching files outside its declared scope. Flag any unaccounted changes (files modified that don't appear in any task's "What to do").

  **Specific checks**:
  - For each task with "Files" listed: verify only those files were modified/created
  - `git log --since="<plan-start>" --oneline` → every commit maps to a task
  - `git diff <plan-start>..HEAD --stat` → no file outside declared task scopes
  - No "while I was there" fixes — those go to follow-up tickets

  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

One commit per task (unless explicitly grouped). Conventional commits style:
- `chore(scaffold): remove Jekyll legacy and migrate cheatsheets` — Task 1
- `feat(build): add package.json with pnpm scripts and dependencies` — Task 2
- `feat(build): add TypeScript configuration` — Task 3
- `feat(build): add Biome config for lint and format` — Task 4
- `chore(repo): add .gitignore, .npmrc, .editorconfig, .node-version` — Task 5
- `feat(app): add Vite SPA entry HTML` — Task 6
- `feat(build): add Vite + Vitest configuration` — Task 7
- `feat(app): add public static assets stub` — Task 8
- `feat(app): mount Solid app with HashRouter` — Task 9
- `feat(app): add baseline routes (home, not-found)` — Task 10
- `feat(app): add cheatsheets route preserving legacy content` — Task 11
- `chore(assets): migrate cheatsheet PNGs into Vite asset pipeline` — Task 12
- `feat(ui): add global styles and design tokens` — Task 13
- `feat(types): add domain type skeleton` — Task 14
- `feat(app): add AppShell component with TDD smoke test` — Task 15
- `ci(pages): replace Jekyll workflow with Vite build and deploy` — Task 16
- `ci(pr): add CI workflow for PR validation` — Task 17
- `feat(build): add bundle size budget script` — Task 18
- `ci(deps): add Dependabot config` — Task 19
- `chore(repo): add pre-commit hooks` — Task 20
- `feat(test): add Playwright smoke E2E config` — Task 21
- `docs(readme): rewrite README for new stack` — Task 22
- `docs(repo): add PR template, issue templates, CONTRIBUTING, SECURITY` — Task 23
- `chore(verify): final local verification sweep` — Task 24

Pre-commit (auto-run): `pnpm exec biome check --write --no-errors-on-unmatched` on staged files via `lint-staged`. Commits that violate Biome lint fail the hook.

---

## Success Criteria

### Verification Commands

```bash
# Foundation
pnpm install --frozen-lockfile  # Expected: clean install, lockfile unchanged
test -f pnpm-lock.yaml          # Expected: exit 0

# Build pipeline
pnpm typecheck                   # Expected: exit 0, no diagnostics
pnpm lint                        # Expected: exit 0, biome clean
pnpm test --run                  # Expected: exit 0, all tests pass
pnpm build                       # Expected: exit 0, dist/ created
pnpm bundle-size                 # Expected: exit 0, JS gzipped < 60 KB

# Dev + preview
pnpm dev &
curl -sf http://localhost:5173/ | grep -q '<div id="root"'  # Expected: match
kill %1

pnpm preview &
sleep 2
curl -sf http://localhost:4173/deadlock-helpful-info/ | grep -q '<div id="root"'  # Expected: match (with prod base)
kill %1

# E2E
pnpm test:e2e                    # Expected: exit 0, smoke green

# CI workflow simulation (push a branch)
git push origin <branch>
gh run watch                     # Expected: ci.yml green within ~3 min

# Deploy
git push origin main             # Expected: pages.yml runs, deploy succeeds
curl -sf https://xaviergmail.github.io/deadlock-helpful-info/ | grep -q 'deadlock'  # Expected: match
```

### Final Checklist
- [ ] All Wave 1-4 tasks marked complete with evidence files
- [ ] F1 oracle audit: APPROVE
- [ ] F2 quality review: APPROVE
- [ ] F3 manual QA: APPROVE
- [ ] F4 scope fidelity: APPROVE
- [ ] All "Must Have" present (validated by F1)
- [ ] All "Must NOT Have" absent (validated by F1)
- [ ] Deployed site live at `https://xaviergmail.github.io/deadlock-helpful-info/`
- [ ] User explicit okay received
