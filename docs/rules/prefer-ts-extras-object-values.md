# prefer-ts-extras-object-values

Prefer [`objectValues`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-values.ts) from `ts-extras` over `Object.values(...)`.

`objectValues(...)` preserves stronger value typing and keeps value iteration contracts explicit.

## Targeted pattern scope

This rule focuses on direct `Object.values(value)` calls that can be migrated to `objectValues(value)` with deterministic fixes.

- `Object.values(value)` call sites that can use `objectValues(value)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `objectValues(value)` migrations safe.

## What this rule reports

This rule reports `Object.values(value)` call sites when `objectValues(value)` is the intended replacement.

- `Object.values(value)` call sites that can use `objectValues(value)`.

## Why this rule exists

`objectValues` improves value typing during iteration and post-processing.

- Value unions are preserved more consistently.
- Downstream map/filter code needs fewer local casts.
- Value extraction style stays consistent across modules.

## ❌ Incorrect

```ts
const values = Object.values(siteStateMap);
```

## ✅ Correct

```ts
const values = objectValues(siteStateMap);
```

## Behavior and migration notes

- Runtime semantics align with `Object.values` (own enumerable string-keyed values).
- Symbol-keyed values remain excluded, matching native behavior.
- For broadly typed records, resulting value types remain broad.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const values = Object.values(features);
```

### ✅ Correct — Additional example

```ts
const values = objectValues(features);
```

### ✅ Correct — Repository-wide usage

```ts
const labels = objectValues(enumLikeObject);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-values": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct `Object.values` calls are required for interop constraints.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-values.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-values.ts)

````ts
/**
A strongly-typed version of `Object.values()`.

This is useful since `Object.values()` always returns `T[]`. This function returns a strongly-typed array of the values of the given object.

- [TypeScript issues about this](https://github.com/microsoft/TypeScript/pull/12253)

@example
```
import {objectValues} from 'ts-extras';

const object: {a: number; b?: string} = {a: 1, b: 'hello'};

const stronglyTypedValues = objectValues(object);
//=> Array<number | string>

const untypedValues = Object.values(object);
//=> Array<string | number | undefined>
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R031

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
