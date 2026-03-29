---
sidebar_position: 2
---

# Getting started

## Install

```bash
npm install --save-dev eslint-plugin-typedoc typedoc
```

## Configure ESLint flat config

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

## Choose a preset

- `typedoc.configs.minimal` for baseline hygiene checks.
- `typedoc.configs.recommended` for exported docs + tag/link validation.
- `typedoc.configs.strict` for stronger API completeness enforcement.
- `typedoc.configs.all` for complete rule coverage.
