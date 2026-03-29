# prefer-ts-extras-array-includes

Prefer [`arrayIncludes`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-includes.ts) from `ts-extras` over `array.includes(...)`.

`arrayIncludes(...)` improves inference and narrowing when checking whether unknown values belong to a known tuple/array.

## Targeted pattern scope

This rule focuses on direct `array.includes(value)` calls that can be migrated to `arrayIncludes(array, value)` with deterministic fixes.

- `array.includes(value)` call sites that can use `arrayIncludes(array, value)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayIncludes(array, value)` migrations safe.

## What this rule reports

This rule reports `array.includes(value)` call sites when `arrayIncludes(array, value)` is the intended replacement.

- `array.includes(value)` call sites that can use `arrayIncludes(array, value)`.

## Why this rule exists

`arrayIncludes` is especially useful when checking if an unknown value belongs to a known literal tuple.

- Membership checks can narrow candidate values in control flow.
- Guard logic is consistent with other `ts-extras` predicates.
- Native `.includes` call sites that need manual casts are reduced.

## ❌ Incorrect

```ts
const hasStatus = statuses.includes(inputStatus);
```

## ✅ Correct

```ts
const hasStatus = arrayIncludes(statuses, inputStatus);
```

## Behavior and migration notes

- Runtime semantics follow native `Array.prototype.includes`.
- Comparison uses SameValueZero (`NaN` matches `NaN`, `+0` equals `-0`).
- Return type remains boolean, with improved narrowing behavior when array values are literal unions.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (roles.includes(candidate)) {
    grantAccess(candidate);
}
```

### ✅ Correct — Additional example

```ts
if (arrayIncludes(roles, candidate)) {
    grantAccess(candidate);
}
```

### ✅ Correct — Repository-wide usage

```ts
const isKnownStatus = arrayIncludes(statuses, value);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-includes": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes on native `.includes()`.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-includes.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-includes.ts)

````ts
/**
A strongly-typed version of `Array#includes()` that properly acts as a type guard.

When `arrayIncludes` returns `true`, the type is narrowed to the array's element type.
When it returns `false`, the type remains unchanged (i.e., `unknown` stays `unknown`).

It was [rejected](https://github.com/microsoft/TypeScript/issues/26255#issuecomment-748211891) from being done in TypeScript itself.

@example
```
import {arrayIncludes} from 'ts-extras';

const values = ['a', 'b', 'c'] as const;
const valueToCheck: unknown = 'a';

if (arrayIncludes(values, valueToCheck)) {
    // We now know that the value is of type `typeof values[number]`.
} else {
    // The value remains `unknown`.
}
```

@category Improved builtin
@category Type guard
*/
````

> **Rule catalog ID:** R007

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
