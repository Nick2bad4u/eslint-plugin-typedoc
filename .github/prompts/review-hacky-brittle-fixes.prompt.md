---
name: review-hacky-brittle-fixes
description: "🤖🤖 Use this prompt to perform a comprehensive audit of the repository, focusing on fragile, brittle, hacky, or legacy code paths."
argument-hint: Provide any trouble spots, files, or rule families to focus on, if applicable.
---

# Task: Looping Audit for Hacky, Brittle, and Legacy Fixes

Audit this eslint-plugin repository autonomously. Use any user-provided focus areas first; otherwise inspect the full repo.

## Operating loop

Repeat the following until you run out of high-confidence findings:

1. Map the next highest-risk area such as `src/rules`, `src/_internal`, `test/`, docs, configs, scripts, or plugin entrypoints.
2. Identify brittle, hacky, legacy, or overfit implementations such as:
	- one-off workarounds or special-case branches
	- regex or string parsing where AST-aware or utility-based logic would be safer
	- magic constants, hidden assumptions, or copy-pasted compatibility shims
	- unsafe casts, brittle assertions, or weak type narrowing
	- fragile autofix logic, import insertion, or fixer ordering
	- tests that only lock in the current hack instead of the intended contract
3. Fix a small batch of root-cause issues, not just surface symptoms.
4. Validate the touched areas with diagnostics, targeted tests, and relevant repo scripts.
5. Continue with the next batch.

## Standards

- Prefer shared utilities and established repo patterns over bespoke fixes.
- Remove legacy or brittle code only when you can preserve or improve behavior safely.
- Keep fixes minimal, high-signal, and maintainable.
- If something looks suspicious but cannot be changed safely in the current pass, record it in the follow-up list instead of forcing a speculative edit.

## Deliverables

At the end, provide:

- the issues you found
- what you changed
- how you validated the work
- any follow-up items that deserve a separate pass
