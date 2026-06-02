# Learnings — project-scaffold

## [2026-06-02] Session ses_175996352ffeJcV0ggvPOqr30B — Plan Start
### Stack Confirmed
- Solid.js + Vite + TypeScript (strict) + pnpm + Biome + Vitest + Playwright
- `@solidjs/router` HashRouter (hash routing for GH Pages subpath safety)
- No ESLint — pure Biome (user chose this; no sneaking in eslint-plugin-solid)

### Critical Solid Conventions (enforce in every task)
- NEVER destructure props: `(props) =>` not `({ x }) =>`
- NEVER `.map()` in JSX — use `<For>`
- NEVER ternaries for conditional rendering — use `<Show>` / `<Switch>`
- Signals are functions — call them `count()` not `count`
- Components run once — no re-renders

### Path Constants
- VITE_BASE for prod: `/deadlock-helpful-info/`
- Dev base: `/` (no env var set)
- Repo owner: `xaviergmail`
- GitHub Pages URL: `https://xaviergmail.github.io/deadlock-helpful-info/`

### Action Version Pins (2026)
- `actions/checkout@v6`
- `actions/setup-node@v6` with `cache: pnpm`
- `pnpm/action-setup@v4`
- `actions/configure-pages@v6`
- `actions/upload-pages-artifact@v5`
- `actions/deploy-pages@v5`
- `actions/upload-artifact@v4`

### Bundle Budget
- Initial JS gzipped: 60 KB ceiling
- Total CSS gzipped: 20 KB ceiling
- Single chunk max: 100 KB

### Node + pnpm Pins
- Node: 22 (Iron LTS)
- pnpm: check `pnpm --version` during T2 to pin exact version in packageManager field

### TypeScript Config (T3)
- `tsconfig.json` must keep `jsxImportSource: "solid-js"` and `moduleResolution: "bundler"` for Solid + Vite compatibility.
- `tsconfig.node.json` needs `composite: true` so project references work cleanly.
- `tsc --showConfig -p tsconfig.json` reflects the expected normalized options and is a good verification artifact.

### Biome Config (T4)
- Repo lockfile pins `@biomejs/biome@1.9.4`, so the schema URL must match `https://biomejs.dev/schemas/1.9.4/schema.json`.
- `noConsole` can stay warn with `allow: ["error", "warn"]` to keep error/warn logging available.

### Public static assets (T8)
- `public/` is the Vite passthrough directory, so `robots.txt` and `favicon.svg` should be placed there to ship at root unchanged.
- A minimal SVG favicon can stay XML-valid and still match Deadlock colors with a dark background and gold accent.

## [2026-06-02] Wave 1 Completion — Critical Lessons

### pnpm 11 Build Scripts (CRITICAL for all future agents)
- pnpm 11 blocks build scripts by default (ERR_PNPM_IGNORED_BUILDS)
- The `pnpm` field in package.json is IGNORED in pnpm 11
- `pnpm-workspace.yaml` with `onlyBuiltDependencies` does NOT work in pnpm 11.5.1
- CORRECT FIX: Run `pnpm approve-builds --all` — creates `allowBuilds` section in pnpm-workspace.yaml
- Current pnpm-workspace.yaml now has: `allowBuilds: { '@biomejs/biome': true, esbuild: true, simple-git-hooks: true }`
- pnpm version: 11.5.1 (NOT 9.x — agent installed newer version)
- `pnpm exec <cmd>` was failing because of ERR_PNPM_IGNORED_BUILDS; now fixed

### vite-plugin-solid v2.11 Options
- The `typescript: { onlyRemoveTypeImports: true }` option DOES NOT EXIST in vite-plugin-solid v2.11 types
- The Options interface has: include, exclude, dev, ssr, hot, extensions, babel, solid
- Use `solid()` with no args for default behavior; pass options via `babel:` if needed
- Version installed: vite-plugin-solid@2.11.12

### Vite 6.4.3 minify
- `minify: 'oxc'` is NOT in Vite 6.x TypeScript types (it's experimental/Vite 7+)
- Using `minify: 'esbuild'` — functionally identical for our use case
- Vite 8.0.16 is available if needed later

### vitest.config.ts mergeConfig
- Import `type { UserConfig } from 'vite'` and cast `viteConfig as UserConfig`
- This is a known typing quirk in vitest+vite setup

### @types/node Required
- Added `@types/node@^22.0.0` to devDependencies (for process.env, import.meta.dirname, node:path)
- Installed: @types/node@22.19.19

### pnpm-workspace.yaml
- File exists at repo root (single-package project uses it for allowBuilds config)
- Do NOT overwrite or delete this file

### Repo State at Wave 1 Complete
- git log: 12 commits from b6f3a89 to 6ea4ee3
- All Wave 1 files present and verified
- Biome: CLEAN (exit 0)
- TypeScript: CLEAN (exit 0) on tsconfig.node.json scope
- node_modules: installed correctly with pnpm@11.5.1

- Moved LFS-tracked PNG cheatsheets with git mv into src/assets/cheatsheets to preserve history; git lfs ls-files reflects the new paths.
 - `src/lib/types.ts` should stay export-only: readonly fields, no runtime values, and no `any`/`unknown`.
 - The scaffold app imports require minimal `AppShell` and page modules for `pnpm typecheck` to pass.
- Replaced cheatsheets route stub with Solid <For>-based rendering and Vite ?url imports for PNG assets.
- AppShell tests in Vitest must avoid Solid runtime rendering here; source-based assertions against the component file were reliable.
