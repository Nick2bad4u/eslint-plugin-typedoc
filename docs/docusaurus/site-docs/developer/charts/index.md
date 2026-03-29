---
title: Architecture and Operations Charts
description: Visual architecture and workflow diagrams for maintainers and contributors.
sidebar_position: 0
---

# Architecture and operations charts

This section provides high-signal diagrams for the plugin architecture, rule execution lifecycle, metadata/docs synchronization, validation planning, docs generation pipeline, and release quality gates.

## Chart set

- [System architecture overview](./system-architecture-overview.md)
- [Rule lifecycle and autofix flow](./rule-lifecycle-and-autofix-flow.md)
- [Docs and API pipeline](./docs-and-api-pipeline.md)
- [Rule catalog and docs synchronization](./rule-catalog-and-doc-sync.md)
- [Change impact and validation matrix](./change-impact-and-validation-matrix.md)
- [Quality gates and release flow](./quality-gates-and-release-flow.md)
- [Typed rule semantic analysis flow](./typed-rule-semantic-analysis-flow.md)
- [Import-safe autofix decision tree](./import-safe-autofix-decision-tree.md)
- [Preset composition and rule matrix](./preset-composition-and-rule-matrix.md)
- [Docs link integrity and anchor stability](./docs-link-integrity-and-anchor-stability.md)
- [Typed rule performance budget and hotspots](./typed-rule-performance-budget-and-hotspots.md)
- [Diagnostics and regression triage loop](./diagnostics-and-regression-triage-loop.md)
- [Preset semver and deprecation lifecycle](./preset-semver-and-deprecation-lifecycle.md)
- [Rule authoring to release lifecycle](./rule-authoring-to-release-lifecycle.md)
- [Typed services guard and fallback paths](./typed-services-guard-and-fallback-paths.md)

Use the **Charts** category in the Developer sidebar to navigate between these pages.

## Recommended reading order

1. Start with the system architecture overview.
2. Review rule lifecycle details to understand runtime behavior.
3. Understand docs and API generation dependencies.
4. Follow rule catalog/docs synchronization to prevent metadata drift.
5. Use the change-impact matrix to choose the right validation depth per change.
6. Use quality-gate and release flow for day-to-day maintenance and CI decisions.
7. Use the typed-rule semantic flow when debugging parser-services/checker failures.
8. Use the import-safe autofix tree for fix/suggest safety triage.
9. Use the preset composition matrix when modifying recommendation/config composition.
10. Use docs link integrity flow to triage broken anchor and route references quickly.
11. Use typed-rule performance budget flow before expanding semantic checks.
12. Use diagnostics triage loop to convert failing gates into root-cause fixes.
13. Use preset semver lifecycle when modifying preset membership or defaults.
14. Use rule authoring lifecycle as the contributor handoff/checklist map.
15. Use typed-services guard paths when debugging type-service availability and fallback behavior.
