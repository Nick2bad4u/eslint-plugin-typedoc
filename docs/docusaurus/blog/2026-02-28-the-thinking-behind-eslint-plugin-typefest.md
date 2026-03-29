---
slug: thinking-behind-eslint-plugin-typefest
title: The Thinking Behind eslint-plugin-typefest
authors:
  - nick
tags:
  - eslint
  - typescript
  - type-fest
  - ts-extras
  - architecture
description: Why this plugin exists, what constraints shaped it, and how we balance strictness with developer experience.
---

`eslint-plugin-typefest` was built around a simple goal: make safer TypeScript patterns easier to adopt at scale without turning linting into noise.

<!-- truncate -->

# Why this plugin exists

## The core motivation

Most teams using TypeScript still carry legacy utility patterns that were reasonable at the time but are now harder to maintain than modern `type-fest` and `ts-extras` alternatives.

This plugin tries to close that gap by doing three things:

1. Detect outdated or unsafe patterns reliably.
2. Offer clear, actionable diagnostics instead of vague “bad style” warnings.
3. Autofix only when semantics are preserved.

## Design constraints we intentionally accepted

### 1) Performance over cleverness

Rules run on every save. If a rule needs expensive type-checker calls in hot paths, it can become a drag on the whole developer workflow.

So we bias toward:

- syntax-first detection where possible,
- narrow AST selectors,
- type-aware fallbacks only where they materially improve correctness.

### 2) Correctness over aggressive autofixes

A fast autofix that changes runtime behavior is a bug.

When we can guarantee safety, we emit `fix`.
When a transformation is likely correct but not universally safe, we emit `suggest`.

This keeps trust high: developers know auto-applied changes are meant to be safe-by-default.

### 3) Documentation as part of the rule contract

A rule without clear documentation creates churn.

Every rule is expected to explain:

- the specific anti-pattern it flags,
- the safer alternative,
- concrete incorrect/correct examples,
- whether type information is required.

## Long-term direction

The roadmap is to keep tightening alignment with modern TypeScript utility ecosystems while preserving practical adoption paths:

- low-friction presets for gradual rollout,
- stricter presets for mature codebases,
- focused migration guidance in docs and examples.

If a rule cannot be explained explicitly, implemented performantly, and fixed safely, it does not belong in this plugin.
