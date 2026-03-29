# prefer-ts-extras-is-empty

Require [`isEmpty`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-empty.ts) from `ts-extras` over direct `array.length === 0` checks.

## Targeted pattern scope

This rule only matches strict zero-length comparisons against `.length` that can be rewritten as `isEmpty(array)`.

- Direct empty-array checks using length equality:
- `array.length === 0`
- `0 === array.length`

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports strict empty-check comparisons that can be replaced with `isEmpty(array)`.

- Direct empty-array checks using length equality:
- `array.length === 0`
- `0 === array.length`

## Why this rule exists

`isEmpty` gives one canonical emptiness predicate instead of repeated length comparisons.

- Emptiness checks are easier to search and standardize.
- Predicate style is consistent with other `ts-extras` guards.
- Repeated comparison variants are removed from call sites.

## ❌ Incorrect

```ts
if (items.length === 0) {
    return;
}
```

## ✅ Correct

```ts
if (isEmpty(items)) {
    return;
}
```

## Behavior and migration notes

- `isEmpty(array)` is equivalent to `array.length === 0`.
- Use `!isEmpty(array)` for non-empty checks.
- This rule is about array emptiness checks, not object key-count checks.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (items.length === 0) {
    return;
}
```

### ✅ Correct — Additional example

```ts
if (isEmpty(items)) {
    return;
}
```

### ✅ Correct — Repository-wide usage

```ts
const hasRows = !isEmpty(rows);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-empty": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team requires direct `.length` comparisons for emptiness checks.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-empty.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-empty.ts)

````ts
/**
Check whether an array is empty.

This is useful because doing `array.length === 0` on its own won't work as a type-guard.

@example
```
import {isEmpty} from 'ts-extras';

isEmpty([1, 2, 3]);
//=> false

isEmpty([]);
//=> true

// Works with tuples
const tuple: [string, number] | [] = Math.random() > 0.5 ? ['hello', 42] : [];
if (isEmpty(tuple)) {
    // tuple is now typed as []
} else {
    // tuple is now typed as [string, number]
}
```

@category Type guard
*/
````

> **Rule catalog ID:** R016

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
