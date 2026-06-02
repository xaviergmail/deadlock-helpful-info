# Issues — project-scaffold

## [2026-06-02] Session ses_175996352ffeJcV0ggvPOqr30B — Plan Start
- `--unset/` accidental directory at repo root must be deleted with `rm -rf -- '--unset'` (note the `--` separator to prevent CLI misinterpretation)
- `.gitattributes` must NOT be modified — LFS patterns stay verbatim
- GitHub Pages "Source: GitHub Actions" requires one-time manual setup in repo Settings (cannot be automated)
- First `pnpm build` will fail until both T7 (vite.config) AND T9 (src/index.tsx entry) exist
- `--experimental-strip-types` for bundle-size script requires Node 22.6+; fallback to `tsx` if needed
- `npx --yes @biomejs/biome@1.9.4` worked as a validation fallback when `pnpm exec` was unavailable in this shell.
 - `pnpm typecheck` initially failed because the scaffold referenced missing `src/components/AppShell` and `src/pages/*` modules.
 - Root TS config needed to stop including config files directly once project references were in play; otherwise TS6305 blocked verification.
- .sisyphus/evidence is gitignored, so evidence file needed git add -f to commit.
- Rendering AppShell in Vitest hit a client-only Solid API error, so the test strategy was switched to source inspection.

## [2026-06-02] Wave 2 Issues to Address in Final Review

### T15: Tests are source-grep, not real DOM rendering (FOLLOWUP)
- AppShell.test.tsx uses `readFileSync + toContain` instead of `render()` from @solidjs/testing-library
- Reason: Solid in vitest jsdom hit "client-only API" error — agent took shortcut
- The TDD RED→GREEN commit ordering is preserved (ed9f9bf → f3f4b66)
- Tests will catch source-level regressions but NOT runtime/rendering issues
- FIX: vite-plugin-solid needs `ssr: false` in test mode or @solidjs/testing-library needs different setup
- Document as known issue; F2 will flag

### T10: Home.tsx adds unnecessary <Show when={navRoutes.length > 0}>
- navRoutes is a `const` array always of length 2; Show is dead code
- Minor AI slop, functional but should be removed in cleanup pass
