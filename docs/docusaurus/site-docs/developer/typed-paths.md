---
title: Typed service path inventory
description: Inventory of typed parser-service and TypeScript-checker callpaths used by eslint-plugin-typefest.
---

# Typed service path inventory

This page inventories the current typed callpaths that can reach parser services or the TypeScript checker.

> Source document: [`docs/internal/typed-paths.md`](https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/docs/internal/typed-paths.md)

## Guard model

All type-aware rule execution enters through explicit gates:

- `createTypedRule(...)` short-circuits typed rules (`meta.docs.requiresTypeChecking: true`) when full type services are unavailable.
- Optional typed flows in non-type-checked rules call `hasTypeServices(context)` before calling `getTypedRuleServices(context)`.
- Type-dependent helpers no longer discover typed services internally.

## Core typed helpers

| Path                                                                                              | Typed dependency                   | Guard entry                                                                  | Fallback behavior                                              | Max expected expensive calls/file               |
| ------------------------------------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------- |
| `src/_internal/typed-rule.ts#getTypedRuleServices`                                                | `parserServices.program`, checker  | `hasTypeServices(context)` or typed-rule create short-circuit                | Throws if called without `program`                             | 1 (rule create path)                            |
| `src/_internal/constrained-type-at-location.ts#getConstrainedTypeAtLocationWithFallback`          | `parserServices`, checker          | Caller must pass prevalidated checker/parser services                        | Attempts constrained API first, then checker/node-map fallback | O(number of callsites invoking type resolution) |
| `src/_internal/array-like-expression.ts#createIsArrayLikeExpressionChecker`                       | checker + parser-services node map | Caller must pass typed services object                                       | Returns `false` on safe operation failure                      | O(array-like candidate expressions)             |
| `src/_internal/typescript-eslint-node-autofix.ts#createTypeScriptEslintNodeExpressionSkipChecker` | optional typed services            | Caller passes `typedServices` explicitly (or omits for definition-only mode) | Definition-only path when no typed services are supplied       | O(guard candidate expressions)                  |
| `src/_internal/type-checker-compat.ts` helpers                                                    | checker compatibility methods      | Only called from typed helper/rule paths                                     | Returns `undefined` when host checker API is unavailable       | O(type graph traversal within caller)           |

## Rule callpath inventory

### Rules that require type checking (`meta.docs.requiresTypeChecking: true`)

- `src/rules/prefer-ts-extras-array-at.ts`
- `src/rules/prefer-ts-extras-array-concat.ts`
- `src/rules/prefer-ts-extras-array-find.ts`
- `src/rules/prefer-ts-extras-array-find-last.ts`
- `src/rules/prefer-ts-extras-array-find-last-index.ts`
- `src/rules/prefer-ts-extras-array-includes.ts`
- `src/rules/prefer-ts-extras-array-join.ts`
- `src/rules/prefer-ts-extras-array-first.ts`
- `src/rules/prefer-ts-extras-array-last.ts`
- `src/rules/prefer-ts-extras-is-empty.ts`
- `src/rules/prefer-ts-extras-safe-cast-to.ts`
- `src/rules/prefer-ts-extras-set-has.ts`
- `src/rules/prefer-ts-extras-string-split.ts`

### Rules with optional typed branch (`meta.docs.requiresTypeChecking: false`)

These rules always run a definition-only check and only run checker-backed logic when services are explicitly prevalidated:

- `src/rules/prefer-ts-extras-is-defined.ts`
- `src/rules/prefer-ts-extras-is-infinite.ts`
- `src/rules/prefer-ts-extras-is-present.ts`

## Telemetry counters

Typed hot-path counters are recorded in `src/_internal/typed-path-telemetry.ts`:

- `prefilterChecks`
- `prefilterHits`
- `expensiveTypeCalls`
- `fallbackInvocations`

Snapshot API:

- `getTypedPathTelemetrySnapshot()`
- `resetTypedPathTelemetry()`

Derived rates included in snapshot totals:

- `prefilterHitRate = prefilterHits / prefilterChecks`
- `fallbackInvocationRate = fallbackInvocations / expensiveTypeCalls`
- `averageExpensiveCallsPerFile = expensiveTypeCalls / fileCount`
