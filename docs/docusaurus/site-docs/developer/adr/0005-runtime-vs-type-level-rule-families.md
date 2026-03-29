---
title: ADR 0005 - Runtime vs Type-Level Rule Families
description: Decision record for keeping ts-extras and type-fest rules as distinct families with distinct migration semantics.
sidebar_position: 5
---

# ADR 0005: Keep runtime-helper and type-utility rules as separate families

- Status: Accepted
- Date: 2026-02-25

## Context

The plugin enforces two different migration categories:

1. **Runtime helper migrations** (`prefer-ts-extras-*`): code-emitting changes such as `Object.keys` -> `objectKeys`.
2. **Type utility migrations** (`prefer-type-fest-*`): compile-time-only alias/type-shape normalization.

Mixing these categories into one conceptual family created confusion in documentation and rollout planning because runtime and type-level migrations have different review risk profiles.

## Decision

Keep two explicit rule families and document them as separate design tracks:

- `prefer-ts-extras-*` is treated as runtime behavior standardization.
- `prefer-type-fest-*` is treated as type-level expressiveness and consistency standardization.

Rule docs, release notes, and migration guidance should continue to preserve this split.

## Rationale

1. **Clear risk model**: runtime migrations require behavioral confidence checks; type-level migrations focus on assignability and API clarity.
2. **Cleaner rollout strategy**: teams can phase runtime and type-only changes independently.
3. **Better rule authoring discipline**: rule metadata, fixes, and examples remain aligned with the migration category.

## Consequences

- Documentation and changelogs should explicitly label which family a rule belongs to.
- Bulk autofix campaigns can be grouped by risk profile (runtime vs type-level).
- New rules should declare category intent up front during design/review.

## Revisit Triggers

Re-evaluate if:

- the project introduces cross-family rules that intentionally combine runtime and type-level transformations,
- or users report that the split no longer reflects how migration work is planned.
