# typedoc.configs.jsdoc

TypeDoc lint preset for projects authoring comments in a JSDoc-oriented style.

## What this preset optimizes for

This preset focuses on the TypeDoc-supported subset of JSDoc behavior:

- supported tag usage within TypeDoc's JSDoc compatibility model
- valid inline link syntax that TypeDoc can actually render
- non-empty `@example` and `@deprecated` sections when those tags are present

It does **not** try to emulate the full official JSDoc toolchain, because TypeDoc intentionally supports only a subset of JSDoc semantics.

## When to use this preset

Use this preset when your codebase is primarily written with JSDoc-style comments, but TypeDoc is the generator consuming those comments.

## Companion plugin for stricter comment policies

If you want configurable enforcement for required comments, required tags, or broader auditing rules, pair this plugin with [`eslint-plugin-tsdoc-require-2`](https://www.npmjs.com/package/eslint-plugin-tsdoc-require-2).

That companion plugin is the better home for exhaustive comment/tag requirement policies.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [typedocPlugin.configs.jsdoc];
```

## Rules in this preset

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only

| Rule | Fix |
| --- | :-: |
| [`no-empty-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-example-tag) | — |
| [`no-empty-see-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-see-tag) | — |
| [`no-malformed-inline-links`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-malformed-inline-links) | 💡 |
| [`no-unknown-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-unknown-tags) | 🔧 |
| [`require-deprecated-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-deprecated-tag-description) | — |
## Package documentation

TypeDoc package documentation:

- [TypeDoc JSDoc support](https://typedoc.org/documents/Doc_Comments.JSDoc_Support.html)
- [TypeDoc comments](https://typedoc.org/documents/Doc_Comments.html)
