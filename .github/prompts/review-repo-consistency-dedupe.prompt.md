---
name: review-repo-consistency-dedupe
description: "🤖🤖 Use this prompt to audit the repository for consistency drift, duplicate logic, and normalization opportunities."
argument-hint: Provide any subsystems, rule families, files, or patterns to prioritize, if applicable.
---

# Task: Looping Repository Consistency, Dedupe, and Pattern Audit

Audit this eslint-plugin repository for consistency drift, duplicate logic, naming mismatches, and repeated patterns that should be centralized.

Use any user-provided focus areas first; otherwise inspect the full repo.

## Operating loop

Repeat the following until you run out of worthwhile, high-confidence improvements:

1. Inspect one layer at a time: rule implementations, rule metadata, internal utilities, tests, docs, presets/configs, scripts, or public entrypoints.
2. Look for issues such as:
   - repeated helper logic that should become a shared utility
   - inconsistent `messageId`s, option shapes, docs metadata, or fixer patterns
   - duplicate tests, fixtures, or docs blocks that can be normalized without losing clarity
   - naming drift across rules, docs, README tables, presets, and generated outputs
   - inconsistent import ordering, file structure, or rule registration patterns
3. Normalize and dedupe a small batch of findings.
4. Validate all touched areas with diagnostics, tests, and the relevant sync or lint commands.
5. Continue with the next batch.

## Standards

- Prefer deduplication that improves clarity and maintainability.
- Do not merge code paths if doing so would hide rule-specific intent or make fixes harder to reason about.
- Keep repo-wide patterns consistent across TypeScript, tests, docs, and configuration surfaces.

## Deliverables

At the end, provide:

- the consistency or duplication issues you found
- what you normalized or centralized
- how you validated the changes
- any remaining drift that should be handled in a follow-up pass
