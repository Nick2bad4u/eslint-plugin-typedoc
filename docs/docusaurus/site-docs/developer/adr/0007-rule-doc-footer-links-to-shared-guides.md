---
title: ADR 0007 - Rule Doc Footer Links to Shared Guides
description: Decision record for adding shared adoption/rollout guide links at the bottom of each rule page.
sidebar_position: 7
---

# ADR 0007: Add shared adoption-guide links at the bottom of each rule page

- Status: Accepted
- Date: 2026-02-25

## Context

Rule pages intentionally removed repeated checklist and rollout boilerplate to keep content rule-specific.

After removing repeated content, readers still need a predictable way to discover shared operational guidance from any rule page.

## Decision

Add a consistent footer section to each rule page (`docs/rules/prefer-*.md`):

- `## Adoption resources`
- link to `./guides/adoption-checklist.md`
- link to `./guides/rollout-and-fix-safety.md`

## Rationale

1. **Preserves rule-page focus**: avoids reintroducing duplicated operational prose.
2. **Maintains discoverability**: shared guidance remains one click away from every rule page.
3. **Supports scalable docs maintenance**: shared guidance updates happen in guide pages only.

## Consequences

- New rule pages should include the same footer section.
- Guide page URLs become a maintained dependency of rule-doc templates.

## Revisit Triggers

Re-evaluate if:

- docs navigation changes make footer links redundant,
- or user testing shows a different placement performs better for adoption guidance.
