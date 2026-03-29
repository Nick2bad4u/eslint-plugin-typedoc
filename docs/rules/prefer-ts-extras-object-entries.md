# prefer-ts-extras-object-entries

Prefer [`objectEntries`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-entries.ts) from `ts-extras` over `Object.entries(...)`.

`objectEntries(...)` preserves stronger key/value typing for object iteration and reduces local casting noise.

## Targeted pattern scope

This rule focuses on direct `Object.entries(value)` calls that can be migrated to `objectEntries(value)` with deterministic fixes.

- `Object.entries(value)` call sites that can use `objectEntries(value)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `objectEntries(value)` migrations safe.

## What this rule reports

This rule reports `Object.entries(value)` call sites when `objectEntries(value)` is the intended replacement.

- `Object.entries(value)` call sites that can use `objectEntries(value)`.

## Why this rule exists

`objectEntries` gives better static typing for entry iteration, especially when the object has known keys.

- Key unions are preserved more consistently in loops.
- Value access in tuple destructuring needs fewer local casts.
- Team code converges on one explicit runtime helper for entry iteration.

## ❌ Incorrect

```ts
const pairs = Object.entries(siteStatusById);
```

## ✅ Correct

```ts
const pairs = objectEntries(siteStatusById);
```

## Behavior and migration notes

- Runtime semantics stay aligned with `Object.entries` (own enumerable string-keyed entries only).
- Property order behavior remains the same as native `Object.entries`.
- Symbol keys are still excluded, just like native behavior.
- For loosely typed inputs (for example `Record<string, unknown>`), key type remains broad (`string`).

## Additional examples

### ❌ Incorrect — Additional example

```ts
const entries = Object.entries(settings);
```

### ✅ Correct — Additional example

```ts
const entries = objectEntries(settings);
```

### ✅ Correct — Repository-wide usage

```ts
for (const [key, value] of objectEntries(env)) {
    void key;
    void value;
}
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-entries": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you must use native `Object.entries` directly for interop constraints.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-entries.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-entries.ts)

````ts
/**
A strongly-typed version of `Object.entries()`.

This is useful since `Object.entries()` always returns an array of `Array<[string, T]>`. This function returns a strongly-typed array of the entries of the given object.

- [TypeScript issues about this](https://github.com/microsoft/TypeScript/pull/12253)

@example
```
import {objectEntries} from 'ts-extras';

const stronglyTypedEntries = objectEntries({a: 1, b: 2, c: 3});
//=> Array<['a' | 'b' | 'c', number]>

const untypedEntries = Object.entries({a: 1, b: 2, c: 3});
//=> Array<[string, number]>
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R026

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
