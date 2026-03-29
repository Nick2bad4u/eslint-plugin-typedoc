---
title: ADR 0010 - Autofix Governance and Global Kill-Switch
description: Decision record for governing plugin autofix behavior via default safety semantics and runtime kill-switch settings.
sidebar_position: 10
---

# ADR 0010: Govern autofix behavior with safe defaults and plugin-level kill switches

- Status: Accepted
- Date: 2026-02-28

## Context

This plugin includes migration rules where some transformations are fully safe while others are context-sensitive.

The codebase already implements runtime controls in `settings.typefest` and wraps rule contexts to strip `fix` callbacks when global autofixes are disabled.

Relevant implementation points include:

- `settings.typefest.disableAllAutofixes`
- `settings.typefest.disableImportInsertionFixes`
- `createContextWithoutAutofixes(...)` in `src/_internal/typed-rule.ts`
- parsed/memoized settings in `src/_internal/plugin-settings.ts`

## Decision

Adopt a formal autofix governance model:

1. Rules should only emit `fix` when safety is deterministic.
2. Rules should emit `suggest` for behavior-sensitive migrations.
3. Global settings can suppress autofixes at runtime:
   - `disableAllAutofixes` removes all `fix` callbacks,
   - `disableImportInsertionFixes` disables import-insertion helpers.

## Rationale

1. **Operational safety**: large migrations need a hard stop mechanism for automated rewrites.
2. **Predictable rollout**: teams can start with diagnostics/suggestions before enabling broad fixing.
3. **Centralized control**: settings-based suppression avoids rule-by-rule ad hoc toggles.

## Consequences

- Fix behavior is intentionally policy-driven, not purely rule-local.
- Rule authors must classify fixes as deterministic (`fix`) vs contextual (`suggest`).
- Migration playbooks can use settings to stage risk and reduce churn.

## Revisit Triggers

Re-evaluate if:

- ESLint introduces stronger first-class fix governance primitives,
- the plugin requires finer-grained per-rule fix policy controls,
- or contributors report current kill-switch granularity as insufficient.
