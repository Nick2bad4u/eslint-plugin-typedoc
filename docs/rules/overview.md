# Rules overview

`eslint-plugin-typedoc` provides rules that bring TypeDoc feedback directly into your ESLint workflow.

## Available rules

| Rule                                                                      | Description                                                                     | Fix |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | :-: |
| [`no-malformed-inline-links`](./no-malformed-inline-links.md)             | Disallow malformed inline `{@link ...}` tags.                                   |  💡 |
| [`no-unknown-tags`](./no-unknown-tags.md)                                 | Disallow unknown TypeDoc tags and normalize common aliases.                     |  🔧 |
| [`require-exported-doc-comment`](./require-exported-doc-comment.md)       | Require exported declarations to include a TypeDoc comment.                     |  🔧 |
| [`require-param-tags`](./require-param-tags.md)                           | Require documented declarations to include `@param` tags for every parameter.   |  🔧 |
| [`require-returns-tag`](./require-returns-tag.md)                         | Require `@returns` tags for documented declarations with non-void return types. |  🔧 |
| [`typedoc-config-requires-options`](./typedoc-config-requires-options.md) | Require essential options in TypeDoc config objects.                            |  🔧 |

## Preset summary

- [`typedoc.configs.minimal`](./presets/minimal.md)
- [`typedoc.configs.recommended`](./presets/recommended.md)
- [`typedoc.configs.strict`](./presets/strict.md)
- [`typedoc.configs.all`](./presets/all.md)

See [preset docs](./presets/index.md) for full matrix details.
