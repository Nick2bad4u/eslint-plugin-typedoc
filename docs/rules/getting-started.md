# Getting started

This plugin integrates TypeDoc-focused documentation checks directly into ESLint so doc quality issues show up alongside normal lint diagnostics.

## Install

```bash
npm install --save-dev eslint-plugin-typedoc typedoc
```

## Flat config setup

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

- `typedoc.configs.minimal` for baseline TypeDoc hygiene.
- `typedoc.configs.recommended` for exported API + tag/link validation.
- `typedoc.configs.markdown` for markdown-oriented output quality with `typedoc-plugin-markdown`.
- `typedoc.configs.tsdoc` for TSDoc-oriented comment authoring.
- `typedoc.configs.jsdoc` for JSDoc-style comments interpreted by TypeDoc.
- `typedoc.configs.strict` for tighter API doc completeness checks.
- `typedoc.configs.all` to enable every shipped rule.

See [preset docs](./presets/index.md) for the full matrix.

If you want configurable enforcement for required comments or required tags, pair this plugin with [`eslint-plugin-tsdoc-require-2`](https://www.npmjs.com/package/eslint-plugin-tsdoc-require-2).
