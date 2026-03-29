---
slug: designing-safe-autofixes-for-eslint-plugin-typefest
title: Designing Safe Autofixes for eslint-plugin-typefest
authors:
  - nick
tags:
  - eslint
  - autofix
  - typescript
  - static-analysis
  - developer-experience
description: How eslint-plugin-typefest decides between automatic fixes and suggestions to protect runtime behavior.
---

Autofix is one of the biggest quality-of-life features in ESLint, but it is also one of the fastest ways to damage trust if a rule gets it wrong.

<!-- truncate -->

# Designing safe autofixes

In this plugin, a fix is not accepted just because it is convenient. A fix must be safe.

## The safety bar

Before a fixer is enabled, the rule needs confidence in three areas:

1. **Semantic stability:** The rewritten code must keep the same runtime meaning.
2. **Syntactic stability:** The output must stay valid TypeScript in real files.
3. **Formatting stability:** The change should cooperate with normal formatter and linter workflows.

If any of those checks are uncertain, we downgrade to a suggestion.

## Fix versus suggestion

### Use `fix` when

- the transformation is deterministic,
- there are no ambiguous symbols or scope collisions,
- and the replacement can be generated from source text without structural guesswork.

### Use `suggest` when

- there is a meaningful chance of behavior change,
- user intent cannot be derived from syntax alone,
- or code style constraints vary across teams.

This keeps automation helpful without becoming risky.

## Why this matters in TypeScript-heavy codebases

TypeScript projects frequently rely on utility types, narrowings, and overloaded APIs. Small rewrites can accidentally change constraints or type inference behavior.

A conservative strategy means developers still get guidance and one-click migrations, but only in places where the rule can prove safety.

## Practical rollout advice

If your team is adopting this plugin:

1. Start with a baseline preset.
2. Enable autofix in CI only after reviewing suggestion quality.
3. Move stricter rules from suggestion-first to fix-first once confidence is high.

That progression gives teams predictable upgrades instead of disruptive churn.
