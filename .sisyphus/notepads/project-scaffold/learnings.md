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
