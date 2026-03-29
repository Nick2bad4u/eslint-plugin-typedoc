# Getting started

Install the plugin:

```bash
npm install --save-dev eslint-plugin-typedoc
```

Enable a preset in Flat Config:

```ts
import typedoc from "eslint-plugin-typedoc";

export default [typedoc.configs.recommended];
```

Or enable rules manually:

```ts
import typedoc from "eslint-plugin-typedoc";

export default [
    {
        files: ["**/*.{ts,tsx,mts,cts}"],
        plugins: { typedoc },
        rules: {
            "typedoc/no-typedoc-tag-alias": "error",
            "typedoc/enforce-typedoc-tags": "error",
        },
    },
];
```

## Recommended rollout

1. Start with `typedoc.configs.minimal` to normalize obvious issues.
2. Move to `typedoc.configs.recommended` once the baseline is clean.
3. Adopt `typedoc.configs.strict` for full exported API documentation enforcement.
