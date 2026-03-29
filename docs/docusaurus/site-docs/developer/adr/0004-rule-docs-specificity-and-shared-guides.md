---
title: ADR 0004 - Rule Docs Specificity and Shared Guides
description: Decision record for how rule documentation should balance rule-specific guidance with shared rollout/adoption content.
sidebar_position: 4
---

# ADR 0004: Keep rule pages rule-specific and move shared rollout guidance to dedicated guide pages

- Status: Accepted
- Date: 2026-02-25

## Context

Rule documentation had repeated prose across a large set of files (`docs/rules/prefer-*.md`), including:

- generic rollout/adoption checklists,
- repeated FAQ-style explanations,
- repeated boilerplate comments in additional examples.

This made rule pages noisy and reduced the amount of space available for rule-specific behavior, migration boundaries, and edge-case guidance.

## Decision

Adopt a **split documentation model**:

1. **Rule pages** (`docs/rules/prefer-*.md`) contain only rule-specific details:
   - exact match/report scope,
   - semantics and caveats,
   - focused examples,
   - precise “When not to use it”.
2. **Shared guidance** (checklists, rollout strategy, fix safety) is centralized in dedicated guide pages under:
   - `docs/rules/guides/adoption-checklist.md`
   - `docs/rules/guides/rollout-and-fix-safety.md`

## Rationale

1. **Higher signal in rule docs**: readers can quickly understand what a specific rule does and where it may not apply.
2. **Lower maintenance cost**: update shared operational guidance in one place instead of duplicated rule pages.
3. **Less drift risk**: avoids inconsistent repeated wording across rule pages.

## Consequences

- Rule pages are shorter, more concrete, and easier to review.
- Shared process content is maintained centrally and linked from docs navigation.
- Future rule-doc additions must avoid reintroducing shared checklist/rollout boilerplate.

## Revisit Triggers

Re-evaluate if:

- users report discoverability issues for shared adoption guidance,
- or Docusaurus navigation changes make shared guides hard to find from rule pages.
