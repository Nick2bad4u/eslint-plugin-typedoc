# prefer-ts-extras-is-defined-filter

Require [`isDefined`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-defined.ts) from `ts-extras` in `Array.prototype.filter` callbacks instead of inline undefined checks.

## Targeted pattern scope

This rule only inspects inline `.filter(...)` predicates that perform explicit undefined checks.

- Inline undefined predicates inside `.filter(...)`, including:
- `filter((value) => value !== undefined)`
- `filter((value) => typeof value !== "undefined")`
- `filter((value): value is T => value !== undefined)`

Named predicate references and broader callback logic are not matched unless they keep this exact inline-check structure.

## What this rule reports

This rule reports inline filter predicates that encode undefined checks and can be normalized with `isDefined`.

- Inline undefined predicates inside `.filter(...)`, including:
- `filter((value) => value !== undefined)`
- `filter((value) => typeof value !== "undefined")`
- `filter((value): value is T => value !== undefined)`

## Why this rule exists

`filter(isDefined)` is a canonical narrowing form that removes repeated callback boilerplate.

- Filter chains are shorter and easier to scan.
- Narrowing to defined values is consistent.
- Inline predicate duplication is eliminated.

## ❌ Incorrect

```ts
const values = inputs.filter((value) => value !== undefined);
```

## ✅ Correct

```ts
const values = inputs.filter(isDefined);
```

## Behavior and migration notes

- `array.filter(isDefined)` keeps elements where value is not `undefined`.
- Manual predicate bodies with additional side effects should not be auto-converted.
- Non-filter undefined checks belong to `prefer-ts-extras-is-defined`.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const ids = maybeIds.filter((id) => id !== undefined);
```

### ✅ Correct — Additional example

```ts
const ids = maybeIds.filter(isDefined);
```

### ✅ Correct — Repository-wide usage

```ts
const values = readings.filter(isDefined);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-is-defined-filter": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your filters intentionally use named local predicates for domain-specific semantics.

## Package documentation

ts-extras package documentation:

Source file: [`source/is-defined.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/is-defined.ts)

````ts
/**
Check whether a value is defined, meaning it is not `undefined`.

This can be useful as a type guard, as for example, `[1, undefined].filter(Boolean)` does not always type-guard correctly.

@example
```
import {isDefined} from 'ts-extras';

[1, undefined, 2].filter(isDefined);
//=> [1, 2]
```

@category Type guard
*/
````

> **Rule catalog ID:** R015

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
