---
title: Snapshot testing guidance
description: How to use Vitest snapshots safely and effectively in eslint-plugin-typefest.
---

# Snapshot testing guidance

This guide explains where snapshot tests add value in this repository, where
they do not, and how to keep snapshots stable and reviewable.

## Why we use snapshots selectively

Snapshot tests are useful when they protect a stable, public contract.

In this plugin, high-value snapshots focus on:

- public plugin contracts (rules, presets, parser-option flags)
- normalized rule metadata matrices
- generated documentation artifacts (for example README rule tables)
- docs heading schemas and structural content contracts

Snapshot tests are intentionally not the default for all tests. Rule behavior,
autofixes, and diagnostics should still be asserted explicitly in `RuleTester`
cases.

## High-value snapshot targets in this repository

The current snapshot suites cover:

- `test/plugin-contract-snapshots.test.ts`
  - exported rule names and counts
  - preset matrix with normalized parser options and sorted rule IDs
- `test/rule-metadata-snapshots.test.ts`
  - normalized rule metadata contract summaries
- `test/readme-rules-table-sync.test.ts`
  - generated README rules section via file snapshot
- `test/docs-heading-snapshots.test.ts`
  - canonical rule-doc heading matrix per rule page

## Anti-patterns to avoid

Avoid snapshotting these unless there is a strong reason:

- raw AST trees (too noisy and version-fragile)
- full ESLint diagnostics objects for normal rule tests
- unnormalized runtime objects with unstable key ordering
- large snapshots that hide intent and are hard to review

If a test can use a precise explicit assertion, prefer that over a large
snapshot.

## Snapshot design checklist

Before adding a snapshot, ensure all of the following are true:

1. The value represents a stable contract, not incidental internals.
2. Fields are normalized and deterministic:
   - sort arrays and keys
   - remove volatile data (timestamps, environment-specific paths, random IDs)
3. The snapshot payload is intentionally small and reviewer-friendly.
4. The test name explains the contract, not just the mechanism.
5. A failing diff should be actionable in code review.

## Matcher selection

Choose the matcher based on the output shape:

- `toMatchSnapshot()`
  - best for small-to-medium normalized object graphs
- `toMatchInlineSnapshot()`
  - best for compact payloads (identity labels, short strings)
- `toMatchFileSnapshot()`
  - best for generated text artifacts where markdown/code readability matters

For generated Markdown sections or tables, prefer `toMatchFileSnapshot()`.

## Update workflow

Use focused updates first:

```bash
npx vitest run test/plugin-contract-snapshots.test.ts -u
npx vitest run test/rule-metadata-snapshots.test.ts -u
npm run sync:readme-rules-table:update
npx vitest run test/docs-heading-snapshots.test.ts -u
```

Then verify without update mode:

```bash
npx vitest run test/plugin-contract-snapshots.test.ts test/rule-metadata-snapshots.test.ts test/readme-rules-table-sync.test.ts test/docs-heading-snapshots.test.ts
```

Finally run repo checks before opening a PR:

```bash
npm run lint:all:fix:quiet
npm run typecheck
npm test
```

## PR review checklist for snapshot changes

- [ ] Snapshot diff reflects an intentional contract change.
- [ ] No volatile or environment-specific fields were added.
- [ ] Sorting/normalization is preserved.
- [ ] Rule behavior tests (explicit assertions) were updated when required.
- [ ] Generated docs snapshots still match canonical generators.

## Additional notes

- With async concurrent tests, use the local test context `expect` when
  snapshotting to avoid association issues.
- Prefer one logical contract per snapshot test block; split broad snapshots
  into smaller focused contracts.
- If a snapshot repeatedly churns from unrelated dependency updates, redesign
  the payload to snapshot less and assert more explicitly.

## Further reading

- [Vitest Snapshot Guide](https://v2.vitest.dev/guide/snapshot.html)
