---
name: audit-rule-docs-tests-preset-sync
description: "🤖🤖 Use this prompt to audit the full rule surface for drift between implementation, docs, tests, presets, and public plugin metadata."
argument-hint: Provide any rule families, preset names, docs areas, or generated surfaces to prioritize, if applicable.
---

# Task: Looping Rule Surface Sync Audit

Audit the entire plugin surface so that rule implementations, docs, tests, presets, README tables, site docs, and public metadata remain synchronized.

Use any user-provided focus areas first; otherwise inspect the full repo.

## Operating loop

Repeat the following until you run out of high-confidence sync fixes:

1. Pick a rule family or public surface area.
2. Verify sync across the relevant surfaces, including:
   - source rule file and plugin registration
   - rule docs page and docs URL metadata
   - tests, fixtures, and integrity coverage
   - README rule tables and generated docs outputs
   - preset inclusion or exclusion
   - Docusaurus or site-doc references
   - snapshots, contract tests, and metadata tests
3. Fix drift, missing pieces, stale examples, or mismatched metadata.
4. Run the relevant validation commands or targeted tests.
5. Continue with the next rule family or surface area.

## Priorities

- missing docs or tests for existing rules
- stale examples, wrong `messageId`s, or incorrect options documentation
- preset/config surfaces that do not match actual rule metadata
- generated README or site drift
- public API or package-level inconsistencies that affect users

## Deliverables

At the end, provide:

- the sync issues you found
- what you corrected across the public surface
- how you validated the updates
- any remaining generated or architectural follow-up items
