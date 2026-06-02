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
