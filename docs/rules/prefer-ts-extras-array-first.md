# prefer-ts-extras-array-first

Require [`arrayFirst`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-first.ts) from `ts-extras` over direct `array[0]` access.

## Targeted pattern scope

This rule only matches direct first-element index access (`receiver[0]`) where the receiver expression can be reused unchanged in `arrayFirst(receiver)`.

- Direct first-element access using index form (`array[0]`).

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports direct `receiver[0]` access sites that can be safely replaced with `arrayFirst(receiver)`.

- Direct first-element access using index form (`array[0]`).

## Why this rule exists

`arrayFirst` makes first-element access explicit and keeps tuple/readonly inference consistent with the rest of the `ts-extras` helper set.

- First-element lookups are easier to search and standardize.
- Tuple-aware access patterns are consistent in shared utilities.
- Teams avoid mixing helper-based and index-based first-item access.

## ❌ Incorrect

```ts
const first = values[0];
```

## ✅ Correct

```ts
const first = arrayFirst(values);
```

## Behavior and migration notes

- Runtime behavior matches `array[0]` access.
- Empty arrays still yield `undefined`.
- This rule targets index access; optional chaining around access (`array?.[0]`) should be reviewed manually during migration.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const first = rows[0];
```

### ✅ Correct — Additional example

```ts
const first = arrayFirst(rows);
```

### ✅ Correct — Repository-wide usage

```ts
const header = arrayFirst(headers);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-array-first": "error",
        },
    },
];
```

## When not to use it

Disable this rule if direct index access is required in performance-sensitive hotspots.

## Package documentation

ts-extras package documentation:

Source file: [`source/array-first.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/array-first.ts)

````ts
/**
Return the first item of an array with stronger typing for tuples.

This mirrors getting `array[0]` but with better type safety and handling for empty arrays.

@example
```
import {arrayFirst} from 'ts-extras';

const tuple = ['abc', 123, true] as const;
const first = arrayFirst(tuple);
//=> 'abc'
//   ^? 'abc'

const array = ['a', 'b', 'c'];
const maybeFirst = arrayFirst(array);
//=> 'a'
//   ^? string | undefined

// Empty arrays
const empty: string[] = [];
const noFirst = arrayFirst(empty);
//=> undefined
//   ^? string | undefined
```

@category Improved builtin
*/
````

> **Rule catalog ID:** R006

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
