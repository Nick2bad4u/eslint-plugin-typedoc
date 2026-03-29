---
name: discover-unique-eslint-plugin-rules
description: "🤖🤖 Use this prompt to discover net-new ESLint rules that fit the repository's niche and then IMPLEMENT the best candidates in the repo. This prompt is not just for brainstorming; it must end in real rule implementation work."
argument-hint: Provide any rule themes, ecosystems, or rule families to target first, if applicable. Optionally specify number of rules to implement.
---

# Task: Discover and Implement Net-New Rule Opportunities for This ESLint Plugin Repository

Research and identify rule ideas that are relevant to this repository's domain and goals but are not already well-covered by other major ESLint plugins.

We want rules that are useful, high quality, and not pointless duplicates of other plugins unless there is a compelling repository-specific benefit.

## Critical requirement: always implement, do not stop at ideation

This prompt is for **research + implementation**, not for research-only brainstorming.

You must always:

1. research the gap space
2. choose the strongest candidate rules
3. implement the selected rules in the repository
4. add tests, docs, metadata, and preset wiring
5. validate the result

Do **not** stop after listing ideas unless the user explicitly tells you to do research only.

If you identify 10 ideas but only 2 are strong enough to build right now, implement those 2. Do not end with a mere suggestion list.

Make sure to check the presets and adjust them for the new rules.

Use any user-provided direction first; otherwise scan the current rule catalog and repository goals.

## Operating loop

Repeat the following until you exhaust the high-value search space:

1. Inventory the current repo rule set, presets, docs, and utility themes.
2. Research nearby ecosystems and competing plugins such as `@typescript-eslint`, `eslint-plugin-unicorn`, `eslint-plugin-import`, `eslint-plugin-sonarjs`, `eslint-plugin-regexp`, `eslint-plugin-functional`, etc, and any other relevant plugin families. Use web or research tools when available.
3. Identify candidate rule gaps that are:
   - genuinely relevant to this repository's domain, target users, and plugin goals
   - not obvious duplicates of existing mainstream rules
   - implementable with reliable AST or type-aware detection
   - likely to support an autofix or high-quality suggestion when possible
4. For each strong candidate, capture:
   - proposed rule name
   - targeted pattern and example code
   - why it belongs in this repository specifically
   - novelty or non-duplication check
   - autofix or suggestion feasibility
   - likely preset placement
   - implementation complexity and risk
5. Keep iterating until the remaining ideas are low-value, redundant, or too speculative.
6. Select the strongest candidates that are actually worth shipping now.
7. Implement those selected candidates in the repository. For each implemented rule, add comprehensive tests, documentation, metadata, and preset integration.
8. After implementation, run all validation commands and ensure the new rules integrate well with the existing codebase and presets without causing issues. Make any necessary adjustments based on test results or feedback.

## Output expectations

When using this prompt, the final result should be code changes in the repository, not just a recommendation memo.

Your final deliverable should normally include:

- new or updated rule source files
- tests for each implemented rule
- docs for each implemented rule
- plugin/preset/catalog wiring updates
- validation results

Only leave implementation undone if the user explicitly narrowed the task to discovery-only research.
