# prefer-ts-extras-object-keys

Prefer [`objectKeys`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-keys.ts) from `ts-extras` over `Object.keys(...)`.

`objectKeys(...)` preserves stronger key typing and avoids repeated casts in iteration paths.

## Targeted pattern scope

This rule focuses on direct `Object.keys(value)` calls that can be migrated to `objectKeys(value)` with deterministic fixes.

- `Object.keys(value)` call sites that can use `objectKeys(value)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `objectKeys(value)` migrations safe.

## What this rule reports

This rule reports `Object.keys(value)` call sites when `objectKeys(value)` is the intended replacement.

- `Object.keys(value)` call sites that can use `objectKeys(value)`.

## Why this rule exists

`objectKeys` improves key typing for indexed access and iteration paths.

- Fewer `as Array<keyof T>` casts in loops.
- Safer indexed reads after key iteration.
- One canonical helper for key iteration patterns.

## ❌ Incorrect

```ts
const keys = Object.keys(monitorConfig);
```

## ✅ Correct

```ts
const keys = objectKeys(monitorConfig);
```

## Behavior and migration notes

- Runtime semantics align with `Object.keys` (own enumerable string keys only).
- Symbol keys are excluded, same as native behavior.
- Numeric keys are still returned as strings, matching native output.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const keys = Object.keys(model);
```

### ✅ Correct — Additional example

```ts
const keys = objectKeys(model);
```

### ✅ Correct — Repository-wide usage

```ts
for (const key of objectKeys(theme)) {
    void key;
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-keys": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you must keep direct `Object.keys` calls for interop constraints.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-keys.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-keys.ts)

````ts
/**
A strongly-typed version of `Object.keys()`.

This is useful since `Object.keys()` always returns an array of strings. This function returns a strongly-typed array of the keys of the given object.

- [Explanation](https://stackoverflow.com/questions/55012174/why-doesnt-object-keys-return-a-keyof-type-in-typescript)
- [TypeScript issues about this](https://github.com/microsoft/TypeScript/issues/45390)

@example
```
import {objectKeys} from 'ts-extras';

const stronglyTypedItems = objectKeys({a: 1, b: 2, c: 3}); // => Array<'a' | 'b' | 'c'>
const untypedItems = Object.keys({a: 1, b: 2, c: 3}); // => Array<string>
```

@category Improved builtin
@category Type guard
*/
````

> **Rule catalog ID:** R030

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
