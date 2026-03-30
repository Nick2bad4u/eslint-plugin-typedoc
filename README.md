# eslint-plugin-typedoc

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
- `typedoc.configs.strict`
- `typedoc.configs.all`

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
  - [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) — [`typedoc.configs.strict`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict)
  - [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) — [`typedoc.configs.all`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all)

| Rule | Fix | Preset key |
| --- | :-: | :-- |
| [`no-duplicate-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-duplicate-param-tags) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-duplicate-type-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-duplicate-type-param-tags) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-extra-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-extra-param-tags) | — | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-extra-type-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-extra-type-param-tags) | — | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-malformed-inline-links`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-malformed-inline-links) | 💡 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`no-unknown-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/no-unknown-tags) | 🔧 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`prefer-package-documentation-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-package-documentation-tag) | 🔧 | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`prefer-type-param-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/prefer-type-param-tag) | 🔧 | [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-code-fence-language`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-code-fence-language) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-example-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-example-tag) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-exported-doc-comment`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment) | 🔧 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-package-documentation`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-param-tags) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-returns-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-returns-tag) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-throws-tag`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-throws-tag) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`require-type-param-tags`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-type-param-tags) | 🔧 | [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |
| [`typedoc-config-requires-options`](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/typedoc-config-requires-options) | 🔧 | [🟢](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/minimal) [🔵](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/recommended) [🟠](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/strict) [🟣](https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/presets/all) |

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
