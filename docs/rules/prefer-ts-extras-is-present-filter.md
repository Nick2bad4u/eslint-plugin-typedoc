# prefer-ts-extras-is-present-filter

Require [`isPresent`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-present.ts) from `ts-extras` in `Array.prototype.filter` callbacks instead of inline nullish checks.

## Targeted pattern scope

This rule only inspects inline `.filter(...)` predicates that perform explicit nullish checks.

- Inline nullish predicates inside `.filter(...)`, including:
- `filter((value) => value != null)`
- `filter((value): value is T => value !== null)`
- `filter((value): value is T => value !== null && value !== undefined)`

Named predicate references and broader callback logic are not matched unless they preserve this nullish-check shape.

## What this rule reports

This rule reports inline filter predicates that encode nullish checks and can be normalized with `isPresent`.

- Inline nullish predicates inside `.filter(...)`, including:
- `filter((value) => value != null)`
- `filter((value): value is T => value !== null)`
- `filter((value): value is T => value !== null && value !== undefined)`

## Why this rule exists

`filter(isPresent)` is the canonical pattern for removing nullish values in pipelines.

- Filtering logic is consistent across collections.
- Non-nullish narrowing is explicit in one helper name.
- Repeated null/undefined callback expressions are removed.

## ❌ Incorrect

```ts
const values = inputs.filter((value) => value != null);
```

## ✅ Correct

```ts
const values = inputs.filter(isPresent);
```

## Behavior and migration notes

- `array.filter(isPresent)` removes `null` and `undefined` entries.
- Callbacks with extra side effects should be reviewed before replacement.
- Non-filter nullish checks belong to `prefer-ts-extras-is-present`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const rows = maybeRows.filter((row) => row != null);
```

### ✅ Correct — Additional example

```ts
const rows = maybeRows.filter(isPresent);
```

### ✅ Correct — Repository-wide usage

```ts
const values = list.filter(isPresent);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-present-filter": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your filters intentionally use domain-specific predicate wrappers.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-present.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-present.ts)

````ts
/**
Check whether a value is present (non-nullable), meaning it is neither `null` nor `undefined`.

This can be useful as a type guard, as for example, `[1, null].filter(Boolean)` does not always type-guard correctly.

@example
```
import {isPresent} from 'ts-extras';

[1, null, 2, undefined].filter(isPresent);
//=> [1, 2]
```

@category Type guard
*/
````

> **Rule catalog ID:** R022

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
