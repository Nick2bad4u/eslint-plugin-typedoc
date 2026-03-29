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

For gradual adoption:

1. Start with `typedoc.configs.minimal`.
2. Move to `typedoc.configs.recommended` once baseline issues are fixed.
3. Adopt `typedoc.configs.strict` for full exported API documentation enforcement.
