---
title: Preset selection strategy
description: Choose the right eslint-plugin-typefest preset and roll it out with minimal migration risk.
---

# Preset selection strategy

This guide helps teams pick a preset based on migration tolerance, type-checking maturity, and rollout velocity.

## Decision checkpoints

Use these checkpoints before choosing a preset:

1. **Type information availability**: Do you run ESLint with project-aware type services in CI/local workflows?
2. **Migration bandwidth**: Can the team handle broad replacement churn this quarter?
3. **Runtime sensitivity**: Do you need to review behavior-sensitive changes manually before broad adoption?
4. **Convergence target**: Do you intend to land on `strict`/`all`, or stay at a stable baseline?

## Recommended starting points

### `minimal`

Choose this when:

- You need the lowest-friction baseline.
- You want immediate value with minimal code churn.

### `recommended`

Choose this when:

- You want broader coverage but still pragmatic defaults.
- You can absorb moderate migration effort.

### `recommended-type-checked`

Choose this when:

- Type services are already stable in your lint pipeline.
- You want stronger guidance on typed guard/helper patterns.

### `strict`

Choose this when:

- Your codebase already enforces high lint/type discipline.
- You prefer stronger consistency constraints over minimal churn.

### `all`

Choose this when:

- You want full plugin coverage and can manage incremental cleanup.
- You actively maintain migration and suppression hygiene.

### `experimental`

Choose this when:

- You want everything from `all` plus lower-confidence candidate rules.
- You are comfortable evaluating report-only diagnostics before broader rollout.

### Domain overlays

Layer these when they match your codebase goals:

- `type-fest/types`
- `ts-extras/type-guards`

## Rollout playbook

1. Start with `warn` for one target folder/package.
2. Record baseline violations and identify high-churn rule families.
3. Run autofix in scoped batches, then run full tests/typecheck.
4. Promote to `error` after each batch reaches zero violations.
5. Repeat until all target folders are converged.

## Validation gates

- `npm run lint`
- `npm run typecheck`
- `npm run test`

For monorepos, run package-level gates first, then full-repo gates.

## Escalation policy

If a rule creates migration risk or noisy output:

1. Keep the preset enabled.
2. Temporarily lower that single rule to `warn` or `off` with a tracking note.
3. Re-enable after targeted remediation.

This preserves preset consistency while avoiding long-lived blind spots.
