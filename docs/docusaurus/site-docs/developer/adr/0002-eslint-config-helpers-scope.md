---
title: ADR 0002 - @eslint/config-helpers Scope
description: Decision record to keep @eslint/config-helpers usage scoped to ESLint config authoring.
sidebar_position: 2
---

# ADR 0002: Keep `@eslint/config-helpers` scoped to config authoring

- Status: Accepted
- Date: 2026-02-22

## Context

This repository already uses `@eslint/config-helpers` in the root ESLint config:

- `eslint.config.mjs` imports `defineConfig` and `globalIgnores` from `@eslint/config-helpers`.
- `package.json` includes `@eslint/config-helpers` as a dev dependency.

The package is designed for authoring and composing flat config objects, not for rule implementation internals.

## Decision

Continue using `@eslint/config-helpers` for ESLint flat config composition, and do **not** expand it into plugin runtime/rule internals.

## Rationale

1. **Current usage is correct and low-risk**: it improves config readability and type-friendly composition.
2. **No replacement value** for typed rule helpers or import-safe fixer infrastructure.
3. **Separation of concerns**: config authoring helpers should remain in config-layer code.

## Consequences

- Keep `defineConfig`/`globalIgnores` usage in config files.
- Do not refactor `src/plugin.ts` or `src/_internal/*` toward config-helper APIs.

## Revisit Triggers

Revisit only if ESLint introduces new config-helper APIs that materially simplify distributed plugin presets beyond current `src/plugin.ts` construction patterns.
