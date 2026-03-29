# prefer-ts-extras-object-from-entries

Prefer [`objectFromEntries`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-from-entries.ts) from `ts-extras` over `Object.fromEntries(...)`.

`objectFromEntries(...)` preserves stronger key/value typing and avoids local casting after entry reconstruction.

## Targeted pattern scope

This rule focuses on direct `Object.fromEntries(entries)` calls that can be migrated to `objectFromEntries(entries)` with deterministic fixes.

- `Object.fromEntries(entries)` call sites that can use `objectFromEntries(entries)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `objectFromEntries(entries)` migrations safe.

## What this rule reports

This rule reports `Object.fromEntries(entries)` call sites when `objectFromEntries(entries)` is the intended replacement.

- `Object.fromEntries(entries)` call sites that can use `objectFromEntries(entries)`.

## Why this rule exists

`objectFromEntries` improves the reconstructed object type when building objects from typed entry tuples.

- Reconstructed key/value relationships are preserved more consistently.
- Follow-up casting after reconstruction is needed less often.
- Object reconstruction uses one explicit helper across modules.

## ❌ Incorrect

```ts
const statusById = Object.fromEntries(statusEntries);
```

## ✅ Correct

```ts
const statusById = objectFromEntries(statusEntries);
```

## Behavior and migration notes

- Runtime semantics align with `Object.fromEntries`.
- Duplicate keys keep the last assigned entry, matching native behavior.
- Input must still be iterable entry pairs (`[key, value]`).
- If your entries are already widened to `[string, unknown]`, resulting object types remain broad.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const config = Object.fromEntries(entries);
```

### ✅ Correct — Additional example

```ts
const config = objectFromEntries(entries);
```

### ✅ Correct — Repository-wide usage

```ts
const grouped = objectFromEntries(pairs);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-object-from-entries": "error",
        },
    },
];
```

## When not to use it

Disable this rule if you must keep direct `Object.fromEntries` calls for interop or platform constraints.

## Package documentation

ts-extras package documentation:

Source file: [`source/object-from-entries.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/object-from-entries.ts)

````ts
/**
A strongly-typed version of `Object.fromEntries()`.

This is useful since `Object.fromEntries()` always returns `{[key: string]: T}`. This function returns a strongly-typed object from the given array of entries.

- [TypeScript issues about this](https://github.com/microsoft/TypeScript/issues/35745)

@example
```
import {objectFromEntries} from 'ts-extras';

const stronglyTypedObjectFromEntries = objectFromEntries([
    ['a', 123],
    ['b', 'someString'],
    ['c', true],
]);
//=> {a: number; b: string; c: boolean}

const untypedEntries = Object.fromEntries([['a', 123], ['b', 'someString'], ['c', true]]);
//=> {[key: string]: unknown}
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R027

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
