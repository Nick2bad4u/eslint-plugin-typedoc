# Rule overview

`eslint-plugin-typedoc` brings TypeDoc-focused checks directly into ESLint runs.

## What these rules focus on

- Catch missing or malformed TypeDoc tags early.
- Keep inline `{@link ...}` references valid.
- Enforce documentation on exported/public API surfaces.
- Validate critical TypeDoc config options in JSON config files.

## Rule list

- [`enforce-typedoc-tags`](./enforce-typedoc-tags.md)
- [`no-typedoc-tag-alias`](./no-typedoc-tag-alias.md)
- [`no-unresolved-typedoc-link`](./no-unresolved-typedoc-link.md)
- [`require-export-docs`](./require-export-docs.md)
- [`require-typedoc-config-options`](./require-typedoc-config-options.md)

## Presets

See [preset documentation](./presets/index.md) for staged adoption guidance.
