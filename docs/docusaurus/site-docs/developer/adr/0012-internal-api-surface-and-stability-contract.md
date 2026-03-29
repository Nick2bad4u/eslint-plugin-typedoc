---
title: ADR 0012 - Internal API Surface and Stability Contract
description: Decision record for documenting internal helper APIs while keeping plugin-consumer contracts explicitly separated.
sidebar_position: 12
---

# ADR 0012: Document internal helper APIs with explicit stability boundaries

- Status: Accepted
- Date: 2026-03-09

## Context

The repository now exposes a large TypeDoc surface under `developer/api/internal/*` in addition to the plugin-consumer API under `developer/api/plugin/*`.

Without a clear decision, contributors and users can misinterpret internal helper docs as semver-stable public API, which creates pressure to preserve internal signatures that should remain refactorable.

At the same time, maintainers need searchable internal API docs for faster development and safer refactors.

## Decision

Adopt an explicit two-surface contract for developer API docs:

1. Keep generating docs for both plugin and internal modules.
2. Treat only `developer/api/plugin/*` as consumer-facing API contract.
3. Treat `developer/api/internal/*` as maintainer-facing reference with no semver stability guarantee.
4. Keep sidebar and chart documentation explicit about this boundary.

## Rationale

1. **Maintainability**: internal docs speed up contributor onboarding and refactoring.
2. **Correctness of expectations**: explicit boundaries reduce accidental API promises.
3. **Operational clarity**: maintainers can still inspect internals in docs builds without editing generated files.

## Consequences

- Internal helper signatures may change between releases without public API deprecation ceremony.
- Plugin contract reviews should focus on `plugin.ts` exports and related docs.
- Developer docs should continue adding charts/notes that distinguish consumer API from maintainer internals.

## Revisit Triggers

Re-evaluate this decision if:

- external tooling starts depending directly on documented internal paths,
- the project introduces a formally supported extension API for third-party rule composition,
- or release policy changes to guarantee broader API stability.
