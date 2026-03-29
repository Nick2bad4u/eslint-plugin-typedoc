---
title: ADR 0003 - @eslint/object-schema Adoption
description: Decision record for whether eslint-plugin-typefest should adopt @eslint/object-schema in plugin internals.
sidebar_position: 3
---

# ADR 0003: Do not adopt `@eslint/object-schema` for plugin internals

- Status: Accepted
- Date: 2026-02-22

## Context

`@eslint/object-schema` provides keyed validation/merge schemas for structured object merging and validation strategies.

This repository does not currently maintain a complex multi-source runtime object-merging engine in plugin internals. Rule option validation is handled by standard ESLint rule `meta.schema` definitions.

## Decision

Do **not** add direct adoption of `@eslint/object-schema` in plugin runtime or rule internals at this time.

## Rationale

1. **Rule options are already validated by ESLint rule schemas** (`meta.schema`), making object-schema redundant for current rule configuration needs.
2. **No major internal object-merge subsystem exists** that would benefit from object-schema strategy definitions.
3. **Avoid unnecessary abstraction/dependency overhead** when native TypeScript types + explicit merge logic are sufficient.

## Consequences

- Keep rule option contracts in `meta.schema` + TypeScript types.
- Keep explicit merge logic where needed, localized and tested.

## Revisit Triggers

Re-evaluate if we introduce:

- multi-layer preset composition requiring non-trivial merge semantics,
- plugin/runtime user config ingestion with schema-driven merge behavior,
- or repeated ad-hoc object validation/merge logic indicating abstraction pressure.
