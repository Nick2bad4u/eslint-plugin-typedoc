---
title: Maintainer Performance Profiling with --stats
description: Use ESLint CLI stats output to profile rule performance and catch regressions before release.
sidebar_position: 20
---

# Maintainer Performance Profiling with `--stats`

Use this workflow whenever linting performance regresses in CI or local development.

## Why this matters

Typed rules and large monorepos can make linting noticeably slower. Running performance checks with `--stats` helps identify expensive files, hot rule groups, and regressions introduced by new rule logic.

## Baseline profiling commands

```bash
npx eslint . --stats
```

Profile a narrower target to isolate regressions:

```bash
npx eslint "src/**/*.{ts,tsx}" --stats
```

Capture machine-readable output for comparison between branches:

```bash
npx eslint "src/**/*.{ts,tsx}" --stats --format json --output-file temp/eslint-stats.json
```

## Recommended maintainer workflow

1. Run a baseline on `main` and store the stats output.
2. Run the same command on your branch.
3. Compare:
   - total runtime,
   - slowest files,
   - highest-cost rules.
4. If a rule regresses, optimize AST selectors before adding more logic.

## Optimization checklist

When a rule is slow:

- Prefer specific selectors over broad traversals.
- Add quick syntax guards before type-checker access.
- Avoid repeated expensive checks inside nested loops.
- Keep fixer generation simple and localized.

## CI usage guidance

For release hardening, include a profiling pass in CI and compare against a known baseline. Do not block every PR on strict timing thresholds unless your CI environment is stable and repeatable.
