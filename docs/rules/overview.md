# Rules overview

`eslint-plugin-typedoc` provides rules that bring TypeDoc feedback directly into your ESLint workflow.

## Available rules

| Rule                                                                            | Description                                                                           | Fix |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | :-: |
| [`no-duplicate-param-tags`](./no-duplicate-param-tags.md)                       | Disallow duplicate `@param` tags for the same parameter name.                         |  ❌  |
| [`no-duplicate-type-param-tags`](./no-duplicate-type-param-tags.md)             | Disallow duplicate `@typeParam`/`@template` tags for the same type parameter name.    |  ❌  |
| [`no-extra-param-tags`](./no-extra-param-tags.md)                               | Disallow stale `@param` tags that no longer map to real parameters.                   |  ❌  |
| [`no-extra-type-param-tags`](./no-extra-type-param-tags.md)                     | Disallow stale generic tags (`@typeParam`/`@template`) that do not map to signatures. |  ❌  |
| [`no-malformed-inline-links`](./no-malformed-inline-links.md)                   | Disallow malformed inline `{@link ...}` tags.                                         |  💡 |
| [`no-unknown-tags`](./no-unknown-tags.md)                                       | Disallow unknown TypeDoc tags and normalize common aliases.                           |  🔧 |
| [`prefer-package-documentation-tag`](./prefer-package-documentation-tag.md)     | Prefer canonical `@packageDocumentation` tags instead of `@module`.                   |  🔧 |
| [`prefer-type-param-tag`](./prefer-type-param-tag.md)                           | Prefer canonical `@typeParam` tags instead of `@template`.                            |  🔧 |
| [`require-code-fence-language`](./require-code-fence-language.md)               | Require Markdown code fences in TypeDoc comments to declare a language.               |  🔧 |
| [`require-example-tag`](./require-example-tag.md)                               | Require `@example` tags on documented exported API declarations.                      |  🔧 |
| [`require-exported-doc-comment`](./require-exported-doc-comment.md)             | Require exported declarations to include a TypeDoc comment.                           |  🔧 |
| [`require-package-documentation`](./require-package-documentation.md)           | Require top-level `@packageDocumentation` comments in exporting modules.              |  🔧 |
| [`require-param-tag-description`](./require-param-tag-description.md)           | Require `@param` tags to include descriptive prose.                                   |  ❌  |
| [`require-param-tags`](./require-param-tags.md)                                 | Require documented declarations to include `@param` tags for every parameter.         |  🔧 |
| [`require-returns-description`](./require-returns-description.md)               | Require `@returns` tags to include semantic descriptions, not only type annotations.  |  ❌  |
| [`require-returns-tag`](./require-returns-tag.md)                               | Require `@returns` tags for documented declarations with non-void return types.       |  🔧 |
| [`require-throws-description`](./require-throws-description.md)                 | Require `@throws` tags to describe throw conditions, not only error types.            |  ❌  |
| [`require-throws-tag`](./require-throws-tag.md)                                 | Require `@throws` tags when documented functions and methods throw.                   |  🔧 |
| [`require-type-param-tag-description`](./require-type-param-tag-description.md) | Require generic tags to include descriptive prose.                                    |  ❌  |
| [`require-type-param-tags`](./require-type-param-tags.md)                       | Require `@typeParam` tags for all declared generic type parameters.                   |  🔧 |
| [`typedoc-config-requires-options`](./typedoc-config-requires-options.md)       | Require essential options in TypeDoc config objects.                                  |  🔧 |

## Preset summary

- [`typedoc.configs.minimal`](./presets/minimal.md)
- [`typedoc.configs.recommended`](./presets/recommended.md)
- [`typedoc.configs.strict`](./presets/strict.md)
- [`typedoc.configs.all`](./presets/all.md)

See [preset docs](./presets/index.md) for full matrix details.
