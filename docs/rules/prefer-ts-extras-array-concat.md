# prefer-ts-extras-array-concat

Prefer [`arrayConcat`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-concat.ts) from `ts-extras` over `array.concat(...)`.

`arrayConcat(...)` preserves stronger tuple and readonly-array typing across generic flows.

## Targeted pattern scope

This rule focuses on direct `left.concat(right)` calls that can be migrated to `arrayConcat(left, right)` with deterministic fixes.

- `left.concat(right)` call sites that can use `arrayConcat(left, right)`.

Alias indirection, wrapper helpers, and non-canonical call shapes are excluded to keep `arrayConcat(left, right)` migrations safe.

## What this rule reports

This rule reports `left.concat(right)` call sites when `arrayConcat(left, right)` is the intended replacement.

- `left.concat(right)` call sites that can use `arrayConcat(left, right)`.

## Why this rule exists

`arrayConcat` preserves tuple/readonly array typing better when concatenating heterogeneous arrays.

- The output element type is inferred more predictably in generic utilities.
- Concatenation style is consistent with other `ts-extras` array helpers.
- Post-concat casts are needed less often.

## ❌ Incorrect

```ts
const allIds = primaryIds.concat(secondaryIds);
```

## ✅ Correct

```ts
const allIds = arrayConcat(primaryIds, secondaryIds);
```

## Behavior and migration notes

- Runtime behavior matches native `Array.prototype.concat`.
- Concatenation is still shallow (no deep cloning).
- Array arguments are flattened one level, matching native concat semantics.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const combined = left.concat(right);
```

### ✅ Correct — Additional example

```ts
const combined = arrayConcat(left, right);
```

### ✅ Correct — Repository-wide usage

```ts
const merged = arrayConcat(baseFlags, envFlags);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-concat": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase standardizes on native `.concat()` for framework interop.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-concat.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-concat.ts)

````ts
/**
A strongly-typed version of `Array#concat()` that properly handles arrays of different types.

TypeScript's built-in `Array#concat()` has issues with type inference when concatenating arrays of different types or empty arrays. This function provides proper type inference for heterogeneous array concatenation.

Note: This function preserves array holes, matching the native `Array#concat()` behavior.

@example
```
import {arrayConcat} from 'ts-extras';

const strings = ['a', 'b'];
const numbers = [1, 2];

// TypeScript's built-in concat would error here
const mixed = arrayConcat(strings, numbers);
//=> ['a', 'b', 1, 2]
//   ^? (string | number)[]

// Works with tuples
const tuple = arrayConcat(['x'] as const, [1] as const);
//=> ['x', 1]
//   ^? (1 | 'x')[]

// Handles empty arrays correctly
const withEmpty = arrayConcat([], ['hello']);
//=> ['hello']
//   ^? string[]
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R002

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
