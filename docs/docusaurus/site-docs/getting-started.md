---
sidebar_position: 2
---

# Getting Started

Install the plugin:

```bash
npm install --save-dev eslint-plugin-typefest
```

Then enable it in your Flat Config:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: {
            typefest,
        },
        rules: {
            "typefest/prefer-ts-extras-is-defined": "error",
        },
    },
];
```

## Recommended approach

- Start with one ruleset (`typefest.configs.recommended` or `typefest.configs.strict`).
- Fix violations in small batches.
- Promote warnings to errors after stabilization.

## Rule navigation

Use the sidebar **Rules** section for the full list of rule docs synced from the repository.
