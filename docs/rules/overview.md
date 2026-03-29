---
title: Overview
description: README-style overview for eslint-plugin-typefest.
---

# eslint-plugin-typefest

ESLint plugin for teams that want consistent TypeScript-first conventions based on:

- [`type-fest`](https://github.com/sindresorhus/type-fest)
- [`ts-extras`](https://github.com/sindresorhus/ts-extras)

The plugin ships focused rule sets for modern Flat Config usage, with parser setup included in each preset.

## Installation

```bash
npm install --save-dev eslint-plugin-typefest typescript
```

> `@typescript-eslint/parser` is loaded automatically by plugin presets.

## Quick start (Flat Config)

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.recommended];
```

That is enough for TypeScript files (`**/*.{ts,tsx,mts,cts}`).

## Presets

| Preset                                            | Preset page                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------- |
| 🟢 `typefest.configs.minimal`                     | [Minimal](./presets/minimal.md)                                     |
| 🟡 `typefest.configs.recommended`                 | [Recommended](./presets/recommended.md)                             |
| 🟠 `typefest.configs["recommended-type-checked"]` | [Recommended (type-checked)](./presets/recommended-type-checked.md) |
| 🔴 `typefest.configs.strict`                      | [Strict](./presets/strict.md)                                       |
| 🟣 `typefest.configs.all`                         | [All](./presets/all.md)                                             |
| 🧪 `typefest.configs.experimental`                | [Experimental](./presets/experimental.md)                           |
| 💠 `typefest.configs["type-fest/types"]`          | [type-fest/types](./presets/type-fest-types.md)                     |
| ✴️ `typefest.configs["ts-extras/type-guards"]`    | [ts-extras/type-guards](./presets/ts-extras-type-guards.md)         |

## Next steps

- Open **Getting Started** in this sidebar.
- Browse [**Presets**](./presets/index.md) for preset-by-preset guidance.
- Use **Rules** to review every rule with examples.
