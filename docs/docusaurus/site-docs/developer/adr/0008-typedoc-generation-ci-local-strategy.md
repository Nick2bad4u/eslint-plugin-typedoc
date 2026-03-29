---
title: ADR 0008 - TypeDoc Generation Strategy for CI and Local Development
description: Decision record for splitting TypeDoc generation behavior between CI-safe direct invocation and Windows-safe local invocation.
sidebar_position: 8
---

# ADR 0008: Use environment-aware TypeDoc generation (CI direct, local wrapper)

- Status: Accepted
- Date: 2026-02-28

## Context

The repository is developed on Windows paths that may include parentheses (for example, `PC (2)`), and this causes local TypeDoc execution failures in some command paths (`spawnSync ... EINVAL` / entry-point resolution issues).

At the same time, CI runs in a stable Linux environment where direct TypeDoc invocation is reliable and should remain the canonical execution path.

We need:

- reliable local docs generation for maintainers,
- predictable CI behavior for release/deploy pipelines,
- and minimal behavioral divergence across environments.

## Decision

Adopt an environment-aware docs generation strategy:

1. In CI (`CI=true` or `GITHUB_ACTIONS=true`), run TypeDoc directly via:
   - `typedoc --options typedoc.config.json`
2. In local development, route TypeDoc through `scripts/run-typedoc-docs.mjs` to apply Windows-path-safe execution behavior.

The docs workspace script `docs:api` becomes the environment-aware entrypoint. Explicit scripts remain available for deterministic runs:

- `docs:api:default` for direct TypeDoc behavior,
- `docs:api:local` for wrapper-based local behavior.

## Rationale

1. **CI stability**: keep the simplest and most standard invocation in automation.
2. **Local reliability**: avoid known Windows path edge cases for contributors.
3. **Controlled complexity**: isolate workaround logic to a single script boundary.

## Consequences

- Script behavior is intentionally environment-dependent.
- The wrapper script becomes a maintained internal tool.
- CI logs and local logs may differ slightly in startup path, while output artifacts remain aligned.

## Revisit Triggers

Re-evaluate if:

- TypeDoc fully resolves Windows path handling for this repository layout,
- Node/process invocation changes make the wrapper unnecessary,
- or CI starts requiring the wrapper path for parity.
