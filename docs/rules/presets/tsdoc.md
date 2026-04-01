# typedoc.configs.tsdoc

TypeDoc lint preset for projects authoring comments in a TSDoc-oriented style.

## What this preset optimizes for

This preset focuses on the parts of TypeDoc comment authoring that line up most closely with canonical TSDoc usage:

- supported TypeDoc/TSDoc tag usage
- valid inline link syntax
- canonical TypeDoc spellings for package and type-parameter tags
- non-empty `@example`, `@remarks`, and `@deprecated` sections when those tags are present

It intentionally does **not** try to enforce exhaustive comment coverage or require every optional tag.

## When to use this preset

Use this preset when your codebase primarily writes TSDoc-style comments and you want TypeDoc-oriented hygiene without enabling the broader completeness requirements from `typedoc.configs.strict`.

## Companion plugin for stricter comment policies

If you want configurable enforcement for required comments, required tags, or stricter policy auditing, pair this plugin with [`eslint-plugin-tsdoc-require-2`](https://www.npmjs.com/package/eslint-plugin-tsdoc-require-2).

That companion plugin is a better fit for exhaustive tag-presence and comment-requirement policies.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [typedocPlugin.configs.tsdoc];
```

## Rules in this preset

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only

| Rule | Fix |
| --- | :-: |
| [`no-empty-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-example-tag) | — |
| [`no-empty-remarks-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-remarks-tag) | — |
| [`no-empty-see-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-see-tag) | — |
| [`no-malformed-inline-links`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-malformed-inline-links) | 💡 |
| [`no-unknown-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-unknown-tags) | 🔧 |
| [`prefer-package-documentation-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-package-documentation-tag) | 🔧 |
| [`prefer-type-param-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-type-param-tag) | 🔧 |
| [`require-deprecated-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-deprecated-tag-description) | — |
| [`require-since-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-since-tag-description) | — |
## Package documentation

TypeDoc package documentation:

- [TypeDoc TSDoc support](https://typedoc.org/documents/Doc_Comments.TSDoc_Support.html)
- [TypeDoc comments](https://typedoc.org/documents/Doc_Comments.html)
