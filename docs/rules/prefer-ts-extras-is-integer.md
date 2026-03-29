# prefer-ts-extras-is-integer

Prefer [`isInteger`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-integer.ts) from `ts-extras` over `Number.isInteger(...)`.

This keeps predicate usage consistent with other `ts-extras` narrowing helpers.

## Targeted pattern scope

This rule focuses on direct `Number.isInteger(value)` calls that can be migrated to `isInteger(value)` with deterministic fixes.

- `Number.isInteger(value)` call sites that can use `isInteger(value)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `isInteger(value)` migrations safe.

## What this rule reports

This rule reports `Number.isInteger(value)` call sites when `isInteger(value)` is the intended replacement.

- `Number.isInteger(value)` call sites that can use `isInteger(value)`.

## Why this rule exists

`isInteger` standardizes whole-number validation with the rest of the `ts-extras` numeric predicate family.

- Numeric guard naming is consistent.
- Native/helper predicate mixing is reduced.
- Integer validation reads the same across services and packages.

## ❌ Incorrect

```ts
const isWhole = Number.isInteger(value);
```

## ✅ Correct

```ts
const isWhole = isInteger(value);
```

## Behavior and migration notes

- Runtime behavior matches native `Number.isInteger`.
- Decimal numbers still return `false`.
- Numeric strings are not coerced to numbers.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (Number.isInteger(retryCount)) {
    useRetries(retryCount);
}
```

### ✅ Correct — Additional example

```ts
if (isInteger(retryCount)) {
    useRetries(retryCount);
}
```

### ✅ Correct — Repository-wide usage

```ts
const whole = isInteger(userInput);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-integer": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase requires direct `Number.isInteger` usage.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-integer.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-integer.ts)

```ts
/**
A strongly-typed version of `Number.isInteger()`.

@category Improved builtin
@category Type guard
*/
```

> **Rule catalog ID:** R020

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
