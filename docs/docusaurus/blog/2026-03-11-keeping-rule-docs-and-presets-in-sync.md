---
slug: keeping-rule-docs-and-presets-in-sync
title: Keeping Rule Docs and Presets in Sync
authors:
  - nick
tags:
  - eslint
  - documentation
  - automation
  - adr
  - quality
description: How eslint-plugin-typefest keeps docs tables, preset matrices, and rule metadata aligned through canonical generators.
---

Documentation drift is one of the easiest ways to lose trust in a lint plugin.

<!-- truncate -->

# Keeping rule docs and presets in sync

This repository treats metadata-to-doc synchronization as a first-class quality gate, not a best-effort cleanup task.

## The core principle

Human-written explanation should stay human.

Mechanically derivable data should be generated and tested.

For us, that includes:

- README rules matrix
- presets rules matrix
- rule metadata snapshots and integrity contracts

## What this prevents

Without canonical generation, drift appears quickly:

- rule added to a preset but matrix unchanged
- fix/suggestion capability changes but docs lag
- links and IDs diverge between source and docs

That leads to wrong migration guidance and unnecessary issue churn.

## How we enforce it

- sync scripts produce canonical matrix sections
- CI checks fail when docs and generated sections diverge
- docs integrity tests enforce stable heading/catalog conventions

The result is less manual bookkeeping and fewer review-time surprises.

## Practical maintenance advice

When changing rules or preset composition:

1. update rule source and metadata
2. run matrix sync scripts
3. run docs integrity and snapshot suites
4. only then review prose-level docs edits

This ordering keeps intent and generated truth aligned.

## Related docs

- [Rule catalog and docs synchronization chart](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/developer/charts/rule-catalog-and-doc-sync)
- [Preset composition and rule matrix chart](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/developer/charts/preset-composition-and-rule-matrix)
- [Presets page](https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/presets)
