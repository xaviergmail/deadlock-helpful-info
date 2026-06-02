# Decisions — project-scaffold

## [2026-06-02] Session ses_175996352ffeJcV0ggvPOqr30B — Plan Start
- HashRouter over PathRouter: zero-config on GH Pages subpath, no 404.html hack
- pure Biome (not hybrid): user explicit choice, CONTRIBUTING.md documents trade-off
- Node 22 LTS over 24: broader tooling compatibility
- assetsInlineLimit: 0 (no asset inlining into JS — predictable budget)
- daily UTC 04:15 cron: keeps repo "active" to prevent GitHub's 60-day schedule auto-disable
- gzip-size package for bundle-size script (not custom gzip implementation)
- simple-git-hooks over husky: zero .husky/ directory overhead
- Vite entry at repo root index.html (not public/index.html)
- PNGs migrated via `git mv` (not cp+rm) to preserve git history + LFS pointers
 - Keep domain shape types simple and readonly: `SlotType`, `HeroImages`, `Ability`, `Hero`, `Item`, `HeroStats`.
 - Add only minimal UI stubs needed for type safety; avoid runtime data-fetching work in this task.
- Keep legacy cheatsheet content as a simple static route using lazy-loaded images to minimize runtime overhead.
- Kept AppShell props access as props.children to match the scaffold requirement and avoid destructuring.
