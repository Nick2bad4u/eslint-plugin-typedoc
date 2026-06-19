# typedoc-config-requires-options

Require essential options in TypeDoc configuration objects.

## Targeted pattern scope

This rule checks TypeDoc config files such as `typedoc.json`, `typedoc.config.ts`, or `typedoc.config.mjs`.

## What this rule reports

This rule reports TypeDoc config objects missing required keys:

- `entryPoints`
- `tsconfig`

## Why this rule exists

Missing core TypeDoc config options is a common setup mistake. Catching it in ESLint prevents broken or incomplete docs pipelines from reaching CI.

## ❌ Incorrect

```ts
export default {
 plugin: ["typedoc-plugin-markdown"],
};
```

## ✅ Correct

```ts
export default {
 entryPoints: ["src/plugin.ts"],
 tsconfig: "./tsconfig.json",
};
```

## Behavior and migration notes

When the configuration object shape is safe to edit, autofix inserts missing keys with conservative defaults.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  files: ["typedoc.config.{ts,mts,cts,js,mjs,cjs}", "typedoc.json"],
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/typedoc-config-requires-options": "error",
  },
 },
];
```

## When not to use it

Disable this rule if TypeDoc config is generated dynamically and your team validates required keys elsewhere.

## Package documentation

TypeDoc package documentation:

- [TypeDoc options reference](https://typedoc.org/options/)

## Further reading

> **Rule catalog ID:** R006

- [TypeDoc configuration guide](https://typedoc.org/guides/options/)

## Adoption resources

- Start with this rule in `typedoc.configs.minimal` so config correctness is validated before stricter API-doc rules.
