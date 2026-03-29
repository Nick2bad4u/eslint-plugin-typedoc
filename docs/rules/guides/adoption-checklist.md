---
title: Rule adoption checklist
description: Practical checklist for adopting eslint-plugin-typefest rules with low risk.
---

# Rule adoption checklist

Use this checklist when rolling out one or more rules across an existing codebase.

## Before enabling rules

1. Identify the target package/folder scope.
2. Run ESLint in report-only mode to estimate violation count.
3. Confirm your CI, tests, and typecheck are green before refactoring.
4. Decide whether this rollout is autofix-first or manual-first.

## During migration

1. Apply changes in small batches (per folder/package).
2. Keep each PR focused on one rule family when possible.
3. Re-run tests and typecheck after each batch.
4. Flag behavior-sensitive replacements for reviewer attention.

## After migration

1. Switch rule severity from `warn` to `error`.
2. Remove local disables added during migration.
3. Add one representative example to internal team docs.
4. Track regressions by keeping the rule enabled in CI.

## Suggested PR checklist

- [ ] Only target files for this migration are changed.
- [ ] Tests pass after each replacement batch.
- [ ] Typecheck passes after each replacement batch.
- [ ] Reviewer notes include runtime-sensitive replacements.
- [ ] Final lint run has no new violations for the migrated rule(s).
