# require-typedoc-config-options

Require baseline options in TypeDoc JSON config files.

## Targeted pattern scope

This rule targets `.json` and `.jsonc` files with `typedoc` in the filename.

## What this rule reports

Missing required TypeDoc options (default):

- `entryPoints`
- `tsconfig`

## Why this rule exists

Misconfigured TypeDoc projects often fail late in CI or documentation builds. This rule reports missing baseline options as part of standard ESLint feedback.

## ❌ Incorrect

```json
{
    "entryPointStrategy": "expand"
}
```

## ✅ Correct

```json
{
    "entryPoints": ["./src/plugin.ts"],
    "entryPointStrategy": "expand",
    "tsconfig": "./tsconfig.json"
}
```

## Behavior and migration notes

Default option shape:

```ts
{
    requiredOptions: ["entryPoints", "tsconfig"],
}
```

The rule provides suggestions to insert missing options with conservative defaults.

## ESLint flat config example

```ts
import typedoc from "eslint-plugin-typedoc";

export default [
    {
        files: ["**/*.json"],
        plugins: { typedoc },
        rules: {
            "typedoc/require-typedoc-config-options": "error",
        },
    },
];
```

## When not to use it

Disable this rule if TypeDoc config is fully generated elsewhere and should not be source-controlled.

## Package documentation

- [TypeDoc options](https://typedoc.org/documents/Options.Input.html)

> **Rule catalog ID:** R005

## Further reading

- [TypeDoc documentation](https://typedoc.org/)
