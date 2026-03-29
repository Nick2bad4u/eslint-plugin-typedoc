---
title: Type-aware linting readiness
description: Checklist and rollout playbook for enabling type-aware eslint-plugin-typefest rules safely.
---

# Type-aware linting readiness

Use this guide before enabling type-aware presets or rules in a large codebase.

## When this guide applies

Use this checklist when adopting:

- `recommended-type-checked`
- `strict` or `all` in projects with type-aware rules
- `ts-extras/type-guards`

## Readiness checklist

### 1) Parser-service availability

Confirm the lint runtime can provide full type services:

- ESLint uses `@typescript-eslint/parser`
- your lint config resolves the intended `tsconfig`(s)
- the targeted files are included in those `tsconfig`(s)

### 2) Project graph stability

Before enabling strict typed checks:

- `npm run typecheck` is green
- baseline linting is green (or has a controlled known backlog)
- generated types/artifacts are not stale

### 3) Performance baseline

Capture a baseline to detect regressions:

```bash
npx eslint "src/**/*.{ts,tsx}" --stats
```

Track:

- total runtime
- expensive files
- hot rules that call type-checker operations frequently

### 4) CI gate ordering

Prefer this order:

1. typecheck
2. lint (typed rules enabled)
3. tests

This keeps typed-service failures easy to classify.

## Recommended rollout sequence

1. Start with one package/folder.
2. Enable type-aware rules as `warn` first.
3. Fix baseline findings in small batches.
4. Promote to `error` once the scope stays green.
5. Expand scope incrementally.

## Fast validation commands

```bash
npm run typecheck
npm run lint
npm run test
```

For focused typed checks during migration:

```bash
npx eslint "src/**/*.{ts,tsx}" --stats
```

## Common failure modes

### "Typed rule requires type information"

Likely causes:

- file not included in the active `tsconfig`
- parser-service wiring mismatch for the current workspace
- incorrect project root assumptions in local/CI lint execution

### Large runtime regressions

Likely causes:

- expensive semantic checks on broad selectors
- repeated checker calls without syntax prefilters
- too-large rollout scope for first pass

## Related docs

- [Rollout and fix safety](./rollout-and-fix-safety.md)
- [Rule adoption checklist](./adoption-checklist.md)
- [Preset selection strategy](./preset-selection-strategy.md)
- [Typed service path inventory](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/developer/typed-paths)
