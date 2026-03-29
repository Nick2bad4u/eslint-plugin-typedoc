# eslint-plugin-typedoc

[![npm license.](https://flat.badgen.net/npm/license/eslint-plugin-typedoc?color=purple)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/blob/main/LICENSE) [![npm total downloads.](https://flat.badgen.net/npm/dt/eslint-plugin-typedoc?color=pink)](https://www.npmjs.com/package/eslint-plugin-typedoc) [![latest GitHub release.](https://flat.badgen.net/github/release/Nick2bad4u/eslint-plugin-typedoc?color=cyan)](https://github.com/Nick2bad4u/eslint-plugin-typedoc/releases)

`eslint-plugin-typedoc` integrates TypeDoc-focused validation directly into ESLint workflows.

## Why this plugin exists

- Surface TypeDoc issues as normal ESLint diagnostics.
- Apply safe autofixes/suggestions for common documentation problems.
- Enforce consistent public API documentation standards.
- Validate baseline TypeDoc config options during linting.

## Installation

```sh
npm install --save-dev eslint-plugin-typedoc
```

## Quick start (Flat Config)

```ts
import typedoc from "eslint-plugin-typedoc";

export default [typedoc.configs.recommended];
```

## Presets

| Preset                        | Purpose                                          |
| ----------------------------- | ------------------------------------------------ |
| `typedoc.configs.minimal`     | Baseline hygiene checks with low migration cost. |
| `typedoc.configs.recommended` | Default balanced ruleset for most teams.         |
| `typedoc.configs.strict`      | Adds exported API documentation enforcement.     |
| `typedoc.configs.all`         | Enables every shipped rule.                      |

## Rules

| Rule                                     | Fix |
| ---------------------------------------- | --- |
| `typedoc/enforce-typedoc-tags`           | 🔧  |
| `typedoc/no-typedoc-tag-alias`           | 🔧  |
| `typedoc/no-unresolved-typedoc-link`     | 💡  |
| `typedoc/require-export-docs`            | 💡  |
| `typedoc/require-typedoc-config-options` | 💡  |

## Documentation

- Rule docs: [`docs/rules`](./docs/rules)
- Docusaurus site: [`docs/docusaurus`](./docs/docusaurus)

## License

MIT © [Nick2bad4u](https://github.com/Nick2bad4u)
