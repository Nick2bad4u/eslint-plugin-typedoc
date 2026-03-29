---
title: ADR 0013 - Docs Link Integrity and Anchor Stability Policy
description: Decision record for treating broken documentation links and anchors as first-class quality signals in maintainer workflows.
sidebar_position: 13
---

# ADR 0013: Treat documentation link integrity and anchor stability as quality-critical

- Status: Accepted
- Date: 2026-03-09

## Context

Documentation quality depends on route and anchor stability across authored markdown, sidebars, and generated API pages.

Broken anchors reduce trust in maintainer guides and slow contributor onboarding because navigation paths become non-deterministic.

The repository already runs docs builds and markdown validation, but link integrity handling needs explicit architecture-level guidance.

## Decision

Adopt a link-integrity policy for maintainer docs:

1. Treat broken docs links/anchors as actionable quality failures, not cosmetic warnings.
2. Prefer stable, intentional section headings for heavily referenced anchors.
3. When generated-anchor links are fragile, prefer linking to stable page-level sections or explicit maintained anchors.
4. Validate link integrity during docs-impacting changes using docs build commands.

## Rationale

1. **DX reliability**: contributors should trust navigation in docs and ADRs.
2. **Maintenance efficiency**: explicit policy reduces repeated ad hoc link fixes.
3. **Release quality**: documentation breakage should be detected before publish readiness.

## Consequences

- Docs-impacting changes require intentional link/anchor checks.
- Maintainers may add or retain dedicated headings to preserve stable references.
- ADRs and chart docs should favor resilient references over brittle generated fragments.

## Revisit Triggers

Re-evaluate if:

- Docusaurus or TypeDoc introduces stronger stable-anchor primitives,
- repository policy changes to hard-fail docs builds on all link warnings,
- or docs architecture migrates to a different static-site pipeline.
