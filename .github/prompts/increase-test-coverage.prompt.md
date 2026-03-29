---
name: increase-test-coverage
description: "🤖🤖 Use this prompt to systematically increase test coverage across the repository, fixing bugs if any are found, and working towards 100% coverage."
argument-hint: Provide any files, rule families, or areas to prioritize for coverage, if applicable.
---

# Task: Looping Test Coverage Maximization and Bug Fixing

Audit this eslint-plugin repository to maximize test coverage, aiming for 100% where practical. Use any user-provided focus areas first; otherwise, inspect the full repo.

## Operating loop

Repeat the following until you run out of meaningful coverage improvements:

1. Select the next uncovered or under-tested area (e.g., rules, utilities, plugin entrypoints, edge-case branches, error handling, or integration points).
2. Identify missing or insufficiently tested code paths, including:
   - untested branches, error cases, or edge conditions
   - complex logic, fixers, or suggestion code not covered by existing tests
   - integration points between rules, presets, and plugin exports
   - areas with only superficial or snapshot tests
3. Add or improve tests to cover the missing logic, prioritizing high-value and high-risk paths.
4. If any bugs or unexpected behaviors are discovered during testing, fix them as part of the same batch.
5. Validate all changes with diagnostics, full test runs, and coverage reports.
6. Continue with the next batch.

## Standards

- Strive for meaningful, maintainable tests that assert real behavior, not just line coverage.
- Prefer focused, high-signal tests over redundant or trivial assertions.
- When 100% coverage is impractical or would require meaningless tests, document the rationale for any intentional gaps.
- Fix bugs as they are discovered, not just surface symptoms.

## Deliverables

At the end, provide:

- the coverage gaps you found and addressed
- any bugs discovered and fixed
- how you validated the increased coverage and fixes
