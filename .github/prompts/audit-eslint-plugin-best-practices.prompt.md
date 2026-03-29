---
name: audit-eslint-plugin-best-practices
description: "🤖🤖 Use this prompt to audit the repository against modern ESLint plugin authoring best practices and official guidance."
argument-hint: Provide any surfaces to compare first, such as rule metadata, presets, docs, tests, or plugin exports.
---

# Task: Looping ESLint Plugin Best-Practices Audit

Compare this repository against modern ESLint plugin authoring and rule-authoring best practices, especially official ESLint guidance and relevant `typescript-eslint` guidance where applicable.

Use any user-provided focus areas first. Use web or documentation tools when available.

## Operating loop

Repeat the following until you run out of high-confidence improvements:

1. Compare one surface at a time, such as:
   - plugin entrypoints and exports
   - flat config presets and config ergonomics
   - rule metadata (`meta`, schema, docs, messages, `defaultOptions`)
   - typed rule patterns and parser-service usage
   - fixer safety, suggestions, and report quality
   - docs URLs, docs structure, and installation guidance
   - test coverage, RuleTester setup, and contract tests
   - compatibility claims for ESLint, TypeScript, Node.js, and Flat Config
2. Identify gaps, outdated patterns, or deviations from best practice.
3. Fix the high-confidence issues directly when safe.
4. Validate with diagnostics, tests, and the relevant repo scripts.
5. Continue until the remaining items are either already acceptable, too speculative, or better suited for a separate design discussion.

## Standards

- Favor official ESLint and `typescript-eslint` guidance over local habit when they conflict.
- Do not cargo-cult best practices that do not fit this plugin's scope or architecture.
- Distinguish must-fix issues from optional polish in the final summary.

## Deliverables

At the end, provide:

- the best-practice gaps you found
- what you changed to align the repo
- how you validated the work
- any recommendations that should be discussed before implementation
