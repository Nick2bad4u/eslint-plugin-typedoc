# prefer-ts-extras-array-at

Prefer [`arrayAt`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-at.ts) from `ts-extras` over `array.at(...)`.

`arrayAt(...)` preserves stronger element typing for indexed array access.

## Targeted pattern scope

This rule focuses on direct `array.at(index)` calls that can be migrated to `arrayAt(array, index)` with deterministic fixes.

- `array.at(index)` call sites that can use `arrayAt(array, index)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayAt(array, index)` migrations safe.

## What this rule reports

This rule reports `array.at(index)` call sites when `arrayAt(array, index)` is the intended replacement.

- `array.at(index)` call sites that can use `arrayAt(array, index)`.

## Why this rule exists

`arrayAt` keeps indexed access explicit and improves type inference for tuples and readonly arrays.

- Indexing logic is standardized across modules.
- Tuple element access needs fewer local casts.
- Call sites remain explicit about both source array and index.

## ❌ Incorrect

```ts
const firstStatus = statuses.at(0);
```

## ✅ Correct

```ts
const firstStatus = arrayAt(statuses, 0);
```

## Behavior and migration notes

- Runtime semantics align with `Array.prototype.at`.
- Negative indexes are supported (`-1` means last element).
- Out-of-range access still returns `undefined`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const selected = tuple.at(-1); // Weaker tuple index inference
```

### ✅ Correct — Additional example

```ts
const selected = arrayAt(tuple, -1);
```

### ✅ Correct — Repository-wide usage

```ts
const first = arrayAt(users, 0);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-at": "error",
        },
    },
];
```

## When not to use it

Disable this rule if native `.at()` usage is required by a local coding standard.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-at.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-at.ts)

````ts
/**
Return the item at the given index like `Array#at()`, but with stronger typing for tuples. Supports `-1` on tuples.

This mirrors the runtime behavior of `Array#at()` and returns `undefined` for out-of-bounds indices. For tuples, a negative index of `-1` resolves to the tuple’s last element type. Positive literal indices for tuples resolve to the corresponding element type.

@example
```
import {arrayAt} from 'ts-extras';

const tuple = ['abc', 123, true] as const;
const last = arrayAt(tuple, -1);
//=> true
//   ^? true | undefined

const first = arrayAt(tuple, 0);
//=> 'abc'
//   ^? 'abc' | undefined

const array = ['a', 'b', 'c'];
const maybeItem = arrayAt(array, -1);
//=> 'c'
//   ^? string | undefined
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R001

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
