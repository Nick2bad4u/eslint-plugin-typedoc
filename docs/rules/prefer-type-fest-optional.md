# prefer-type-fest-optional

Require TypeFest [`Optional<Value>`](https://github.com/sindresorhus/type-fest/blob/main/source/optional.d.ts) over `Exclude<T, null> | undefined` and `NonNullable<T> | undefined` patterns.

## Targeted pattern scope

This rule targets optional-value patterns that normalize `null` away and add `undefined`.

## What this rule reports

- `Exclude<T, null> | undefined`
- `Exclude<T, null | undefined> | undefined`
- `NonNullable<T> | undefined`

## Why this rule exists

`Optional<Value>` is the canonical TypeFest helper for “value or `undefined`, but never `null`”. Using it makes the intent obvious and standardizes on the new TypeFest utility.

## ❌ Incorrect

```ts
type MaybeName = Exclude<string | null, null> | undefined;
```

## ✅ Correct

```ts
import type { Optional } from "type-fest";

type MaybeName = Optional<string | null>;
```

## Behavior and migration notes

- This rule only targets explicit null-stripping plus `undefined` patterns.
- It does not report plain `T | undefined` unions.
- It will not autofix when `Optional` is shadowed in the local type scope.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type MaybeRegion = NonNullable<string | null> | undefined;
```

### ✅ Correct — Additional example

```ts
import type { Optional } from "type-fest";

type MaybeRegion = Optional<string | null>;
```

### ✅ Correct — Non-targeted usage

```ts
type MaybeRegion = string | undefined;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-optional": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally prefers native utility combinations over the TypeFest helper name.

## Package documentation

TypeFest package documentation:

Source file: [`source/optional.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/optional.d.ts)

```ts
/**
Create a type that represents either the value or `undefined`, while stripping `null` from the type.
*/
export type Optional<Value> = Exclude<Value, null> | undefined;
```

> **Rule catalog ID:** R079

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
