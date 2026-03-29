---
title: Rollout and fix safety
description: Guidance for phased rollout, fix safety, and manual verification.
---

# Rollout and fix safety

This page centralizes rollout guidance used across rule migrations.

## Phased rollout model

1. Start with `warn` severity to measure blast radius.
2. Run `--fix` only on a scoped folder first.
3. Review runtime-sensitive call sites manually.
4. Promote to `error` after baseline cleanup.

## Fix safety expectations

- **Autofix-safe patterns:** simple API shape substitutions where runtime behavior is equivalent.
- **Suggestion-only patterns:** potentially behavior-sensitive changes requiring explicit reviewer choice.
- **Manual migrations:** replacements that depend on local typing, nullability, or control flow assumptions.

## Manual verification checklist

1. Verify import changes are deduplicated and stable.
2. Confirm narrowed types still match downstream usage.
3. Validate guard/predicate behavior with tests.
4. Confirm no accidental semantic changes in edge cases.

## FAQ

### Why not migrate everything in one pass?

Large one-shot migrations make regressions harder to detect and review. Smaller batches isolate risk.

### Should we always use `--fix` in CI?

No. Prefer running `--fix` locally and committing explicit changes. CI should validate, not rewrite, code.

### How do we handle wrapper utilities?

Either align wrappers to canonical helpers/types used by this plugin or deprecate wrappers that duplicate behavior.
