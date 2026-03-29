---
title: CLI Debugging and Config Inspection
description: Debug ESLint behavior with print-config, strict CI flags, cache controls, and verbose diagnostics.
sidebar_position: 21
---

# CLI Debugging and Config Inspection

Use these commands to troubleshoot config resolution, strict CI behavior, and cache-related issues.

## Inspect effective config for a file

```bash
npx eslint --print-config src/plugin.ts
```

This is the fastest way to confirm:

- which config blocks are applied,
- parser/language options for the file,
- final merged rule settings.

## Strict CI flags

Treat warnings as failures in CI:

```bash
npx eslint . --max-warnings 0
```

Report unused disable comments:

```bash
npx eslint . --report-unused-disable-directives
```

## Cache tips

Use cache locally for speed:

```bash
npx eslint . --cache --cache-location .cache/eslint/.eslintcache
```

When debugging suspicious results, clear or bypass cache:

```bash
npx eslint . --no-cache
```

## Verbose troubleshooting

Show internal diagnostics from the ESLint CLI:

```bash
npx eslint . --debug
```

Use this when behavior differs between terminal and IDE or when plugin/config resolution appears incorrect.

## Practical debugging order

1. `--print-config` on a failing file.
2. Re-run without cache.
3. Re-run with `--debug`.
4. Confirm Node/ESLint versions match CI.
