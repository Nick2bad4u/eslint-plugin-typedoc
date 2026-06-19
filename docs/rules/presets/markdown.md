# typedoc.configs.markdown

TypeDoc lint preset tuned for projects that generate markdown output with `typedoc-plugin-markdown`.

## What this preset optimizes for

This preset focuses on the parts of TypeDoc comments that have the biggest effect on markdown output quality:

- readable summary paragraphs for exported APIs
- actionable deprecation guidance when APIs are marked with `@deprecated`
- meaningful `@remarks` sections when they are present
- package-level overview docs
- valid inline links
- non-empty examples
- fenced code blocks with explicit languages

It is intentionally more output-focused than `typedoc.configs.recommended`, but less exhaustive than `typedoc.configs.strict`.

## When to use this preset

Use this preset when your docs pipeline renders TypeDoc comments into markdown pages, READMEs, or Docusaurus content via `typedoc-plugin-markdown`.

## Companion TypeDoc plugins

This ESLint preset does **not** install or require TypeDoc runtime plugins by itself.

It pairs especially well with:

- [`typedoc-plugin-markdown`](https://www.npmjs.com/package/typedoc-plugin-markdown) for markdown page generation
- [`typedoc-plugin-mdn-links`](https://www.npmjs.com/package/typedoc-plugin-mdn-links) for links to global web and TypeScript utility types
- [`typedoc-plugin-dt-links`](https://www.npmjs.com/package/typedoc-plugin-dt-links) for links into `@types` packages

`typedoc-plugin-coverage` is also useful, but it is better treated as a reporting add-on in the TypeDoc pipeline than as part of this ESLint preset.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [typedocPlugin.configs.markdown];
```

## Rules in this preset

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only

| Rule                                                                                                                                                   | Fix |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | :-: |
| [`no-empty-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-example-tag)                                           |  —  |
| [`no-empty-remarks-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-remarks-tag)                                           |  —  |
| [`no-malformed-inline-links`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-malformed-inline-links)                                 | 💡  |
| [`no-unknown-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-unknown-tags)                                                     | 🔧  |
| [`prefer-package-documentation-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-package-documentation-tag)                   | 🔧  |
| [`require-code-fence-language`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-code-fence-language)                             | 🔧  |
| [`require-deprecated-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-deprecated-tag-description)               |  —  |
| [`require-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-example-tag)                                             | 💡  |
| [`require-exported-doc-comment`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment)                           | 💡  |
| [`require-exported-doc-comment-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment-description)   |  —  |
| [`require-package-documentation`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation)                         | 💡  |
| [`require-package-documentation-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation-description) |  —  |
| [`typedoc-config-requires-options`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/typedoc-config-requires-options)                     | 🔧  |
