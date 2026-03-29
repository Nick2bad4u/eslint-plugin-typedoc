---
title: ADR 0001 - @eslint/plugin-kit Adoption
description: Decision record for whether eslint-plugin-typefest should adopt @eslint/plugin-kit for rule/runtime internals.
sidebar_position: 1
---

# ADR 0001: Do not adopt `@eslint/plugin-kit` for rule/runtime internals

- Status: Accepted
- Date: 2026-02-22

## Context

The repository currently uses custom internal utilities to build and maintain rule behavior:

- `src/_internal/typed-rule.ts` for typed rule creation and parser service/type-checker access.
- `src/_internal/imported-type-aliases.ts` for type import collection and safe type replacement fixes.
- `src/_internal/imported-value-symbols.ts` for value import collection, scope-safe replacement names, and import-inserting autofix generation.

`@eslint/plugin-kit` (per package README) provides utilities focused on:

- `ConfigCommentParser`
- `Directive`
- `VisitNodeStep` / `CallMethodStep`
- `TextSourceCodeBase`

These are primarily for implementing custom language/source-code plumbing (directive parsing, traversal, `SourceCode`-like behavior), not for rule-level import-safe fixer orchestration.

## Decision

Do **not** adopt `@eslint/plugin-kit` in this plugin at this time.

## Rationale

1. **No direct capability overlap** with this repository's highest-complexity internals (typed rule services, safe import insertion, scope-safe symbol replacement).
2. **Would not reduce maintenance burden** in currently hand-rolled areas.
3. **Would add dependency and migration surface** without meaningful DX/perf/correctness gains.

## Consequences

- Keep existing internal abstractions in `src/_internal/*`.
- Continue targeted hardening/tests around import-inserting autofix behavior.

## Revisit Triggers

Re-evaluate adoption if we add custom language support requiring:

- custom `SourceCode#traverse()` step modeling,
- custom disable directive parsing/representation,
- or other infrastructure directly using `Directive` and traversal step abstractions.
