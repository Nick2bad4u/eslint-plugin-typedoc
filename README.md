# eslint-plugin-typedoc

[![npm license.](https://flat.badgen.net/npm/license/eslint-plugin-typedoc?color=purple)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/blob/main/LICENSE) [![npm total downloads.](https://flat.badgen.net/npm/dt/eslint-plugin-typedoc?color=pink)](https://www.npmjs.com/package/eslint-plugin-typedoc) [![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-typedoc?color=cyan)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/releases) [![GitHub stars.](https://flat.badgen.net/github/stars/Nick2bad4u/eslint-plugin-typedoc?color=yellow)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/stargazers) [![GitHub forks.](https://flat.badgen.net/github/forks/Nick2bad4u/eslint-plugin-typedoc?color=green)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/forks) [![GitHub open issues.](https://flat.badgen.net/github/open-issues/Nick2bad4u/eslint-plugin-typedoc?color=red)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/issues) [![codecov.](https://flat.badgen.net/codecov/github/Nick2bad4u/eslint-plugin-typedoc?color=blue)](https://codecov.io/gh/Nick2bad4u/eslint-plugin-typedoc)

ESLint rules for TypeDoc documentation quality, validation, and autofix workflows.

## Why this plugin

`eslint-plugin-typedoc` integrates TypeDoc-focused checks directly into ESLint so API documentation issues appear in the same feedback loop as code quality issues.

It helps teams:

- enforce exported API documentation coverage,
- validate TypeDoc tags and inline links,
- catch TypeDoc config mistakes early,
- adopt stricter documentation standards gradually via presets.

## Installation

```bash
npm install --save-dev eslint-plugin-typedoc typedoc
```

## Flat config usage

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    typedocPlugin.configs.recommended,
    {
        rules: {
            "typedoc/require-param-tags": "error",
        },
    },
];
```

## Presets

- `typedoc.configs.minimal`
- `typedoc.configs.recommended`
- `typedoc.configs.markdown`
- `typedoc.configs.tsdoc`
- `typedoc.configs.jsdoc`
- `typedoc.configs.strict`
- `typedoc.configs.all`

If you want configurable enforcement for required comments, required tags, or broader comment-policy auditing, pair this plugin with [`eslint-plugin-tsdoc-require-2`](https://www.npmjs.com/package/eslint-plugin-tsdoc-require-2).

See docs:

- [`docs/rules/presets/index.md`](./docs/rules/presets/index.md)
- Docusaurus rules reference: <https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/overview>

## Rules

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only
- `Preset key` legend:
  - [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) — [`typedoc.configs.minimal`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal)
  - [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) — [`typedoc.configs.recommended`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended)
  - [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) — [`typedoc.configs.markdown`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown)
  - [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) — [`typedoc.configs.tsdoc`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc)
  - [📘](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc) — [`typedoc.configs.jsdoc`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc)
  - [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) — [`typedoc.configs.strict`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict)
  - [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) — [`typedoc.configs.all`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all)

| Rule | Fix | Preset key |
| --- | :-: | :-- |
| [`no-duplicate-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-duplicate-param-tags) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-duplicate-type-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-duplicate-type-param-tags) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-empty-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-example-tag) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [📘](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-empty-private-remarks-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-private-remarks-tag) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-empty-remarks-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-remarks-tag) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-empty-see-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-empty-see-tag) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [📘](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-extra-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-extra-param-tags) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-extra-type-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-extra-type-param-tags) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-malformed-inline-links`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-malformed-inline-links) | 💡 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [📘](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-unknown-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-unknown-tags) | 🔧 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [📘](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`prefer-package-documentation-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-package-documentation-tag) | 🔧 | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`prefer-type-param-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-type-param-tag) | 🔧 | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-code-fence-language`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-code-fence-language) | 🔧 | [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-default-value-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-default-value-tag) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-deprecated-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-deprecated-tag-description) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [📘](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/jsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-example-tag) | 💡 | [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-exported-doc-comment`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment) | 💡 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-exported-doc-comment-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment-description) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-package-documentation`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation) | 💡 | [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-package-documentation-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation-description) | — | [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-param-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-param-tag-description) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-param-tags) | 💡 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-returns-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-returns-description) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-returns-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-returns-tag) | 💡 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-see-tag-link`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-see-tag-link) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-since-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-since-tag-description) | — | [📗](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/tsdoc) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-throws-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-throws-description) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-throws-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-throws-tag) | 💡 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-type-param-tag-description`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-type-param-tag-description) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-type-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-type-param-tags) | 💡 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`typedoc-config-requires-options`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/typedoc-config-requires-options) | 🔧 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [📝](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/markdown) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |

## Development workflow

```bash
npm run build
npm test
npm run typecheck
npm run sync:readme-rules-table:write
npm run sync:presets-rules-matrix -- --write
```

## License

MIT
