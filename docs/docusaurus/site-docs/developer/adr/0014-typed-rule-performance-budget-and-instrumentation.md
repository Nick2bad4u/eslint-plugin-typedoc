---
title: ADR 0014 - Typed Rule Performance Budget and Instrumentation
description: Decision record for budgeting semantic-rule cost and requiring hotspot-aware instrumentation for non-trivial typed-rule changes.
sidebar_position: 14
---

# ADR 0014: Enforce typed-rule performance budgets with hotspot-oriented instrumentation

- Status: Accepted
- Date: 2026-03-09

## Context

Typed rules can incur significant cost from checker lookups, constrained type resolution, and rewrite-safety analysis. As rule coverage grows, these costs can stack in editor save cycles and CI lint runs.

The repository already includes benchmark fixtures and profiling guides, but contributor workflows need an explicit architectural decision tying semantic-rule expansion to performance budget discipline.

## Decision

Adopt a performance-governance contract for typed rules:

1. New semantic checks must be guarded by syntax prefilters where practical.
2. Repeated semantic computations should use memoization/caching when AST identity is stable.
3. Meaningful typed-rule expansions should be validated against benchmark/profiling workflows.
4. Regressions beyond accepted budget thresholds require design-level remediation before merge.

## Rationale

1. **Editor DX**: lint-on-save latency must remain predictable.
2. **Scalability**: guardrails prevent cumulative O(n²)-style drift in complex visitors.
3. **Operational clarity**: contributors have explicit criteria for when to profile and optimize.

## Consequences

- Contributors need to justify new checker-heavy logic with guard/caching strategy.
- Benchmark and performance diagnostics become part of typed-rule review, not optional extras.
- Some feature proposals may be deferred or re-scoped when they violate budget targets.

## Revisit Triggers

Re-evaluate if:

- ESLint execution model changes in ways that shift hotspot behavior (e.g., parallelized rule execution),
- TypeScript checker APIs gain lower-cost equivalents for key operations,
- or project policy changes to prioritize rule breadth over lint latency.
