# Contributing

Thanks for considering a contribution.

## Setup

```sh
pnpm install
pnpm dev
```

The `pnpm install` runs `prepare` which sets up local git hooks via `simple-git-hooks` + `lint-staged`. Pre-commit will auto-format staged files via Biome.

## Conventions

Read [`AGENTS.md`](./AGENTS.md) first. The most important Solid.js rules:

- **Never destructure props** in components. Use `props.x`, not `({ x })`.
- **Signals are functions**. Call them: `count()`, not `count`.
- **Use `<For>` / `<Show>` / `<Switch>`** for rendering. No `.map()` in JSX. No ternaries for conditional rendering.
- **Build-time data only**. No runtime API calls from the browser.

### Lint trade-off

This repo uses Biome (single-binary lint + format) instead of ESLint + Prettier. Biome does not currently support `eslint-plugin-solid` rules like `solid/no-destructure` and `solid/reactivity` that catch Solid-specific footguns automatically.

The AGENTS.md guardrails plus reviewer eyes compensate. If you spot a destructured-props violation or `.map()` in JSX during review, flag it.

## Commits

Conventional Commits: `type(scope): description`. Types: `feat`, `fix`, `chore`, `docs`, `ci`, `test`, `refactor`, `style`.

## Verification before pushing

```sh
pnpm check        # biome auto-fix
pnpm typecheck
pnpm test --run
pnpm build
pnpm bundle-size
```

## Pull requests

Use the PR template. Keep changes focused — one concern per PR.
