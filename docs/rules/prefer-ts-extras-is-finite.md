# prefer-ts-extras-is-finite

Prefer [`isFinite`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-finite.ts) from `ts-extras` over `Number.isFinite(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## Targeted pattern scope

This rule focuses on direct `Number.isFinite(value)` calls that can be migrated to `isFinite(value)` with deterministic fixes.

- `Number.isFinite(value)` call sites that can use `isFinite(value)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `isFinite(value)` migrations safe.

## What this rule reports

This rule reports `Number.isFinite(value)` call sites when `isFinite(value)` is the intended replacement.

- `Number.isFinite(value)` call sites that can use `isFinite(value)`.

## Why this rule exists

`isFinite` keeps numeric predicate usage aligned with the rest of the `ts-extras` guard set.

- Numeric validation helpers use one naming/style convention.
- Native/helper mixing in guard-heavy code is reduced.
- Number guard logic stays consistent across modules.

## ❌ Incorrect

```ts
const isValid = Number.isFinite(value);
```

## ✅ Correct

```ts
const isValid = isFinite(value);
```

## Behavior and migration notes

- Runtime behavior matches native `Number.isFinite`.
- Only numbers are considered; numeric strings are not coerced.
- `NaN`, `Infinity`, and `-Infinity` still return `false`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (Number.isFinite(metric)) {
    consume(metric);
}
```

### ✅ Correct — Additional example

```ts
if (isFinite(metric)) {
    consume(metric);
}
```

### ✅ Correct — Repository-wide usage

```ts
const valid = isFinite(durationMs);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-finite": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team explicitly standardizes on native `Number.isFinite` calls.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-finite.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-finite.ts)

```ts
/**
A strongly-typed version of `Number.isFinite()`.

@category Improved builtin
@category Type guard
*/
```

> **Rule catalog ID:** R018

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
