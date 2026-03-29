# prefer-type-fest-unknown-set

Require TypeFest [`UnknownSet`](https://github.com/sindresorhus/type-fest/blob/main/source/unknown-set.d.ts) over `ReadonlySet<unknown>`.

## Targeted pattern scope

This rule targets explicit unknown-set spellings that TypeFest standardizes as `UnknownSet`.

- `ReadonlySet<unknown>` type references.

Other collection contracts are left alone unless they match the exact unknown collection form listed below.

## What this rule reports

This rule reports unknown-set type forms that should migrate to `UnknownSet`.

- `ReadonlySet<unknown>` type references.

## Why this rule exists

`UnknownSet` provides a clearer shared alias for unknown-valued sets and keeps TypeFest utility usage consistent with other rules in this plugin.

## ❌ Incorrect

```ts
type Keys = ReadonlySet<unknown>;
```

## ✅ Correct

```ts
type Keys = UnknownSet;
```

## Behavior and migration notes

- `UnknownSet` is the canonical alias for unknown-valued readonly sets.
- Normalize `ReadonlySet<unknown>` usage to one alias to avoid duplicate naming patterns.
- Narrow member types after membership checks in consuming code.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Keys = ReadonlySet<unknown>;
```

### ✅ Correct — Additional example

```ts
type Keys = UnknownSet;
```

### ✅ Correct — Repository-wide usage

```ts
type DynamicSet = UnknownSet;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-set": "error",
        },
    },
];
```

## When not to use it

Disable this rule if exported type names must remain unchanged.

## Package documentation

TypeFest package documentation:

Source file: [`source/unknown-set.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/unknown-set.d.ts)

````ts
/**
Represents a set with `unknown` value.

Use case: You want a type that all sets can be assigned to, but you don't care about the value.

@example
```
import type {UnknownSet} from 'type-fest';

type IsSet<T> = T extends UnknownSet ? true : false;

type A = IsSet<Set<string>>;
//=> true

type B = IsSet<ReadonlySet<number>>;
//=> true

type C = IsSet<string>;
//=> false
```

@category Type
*/
````

> **Rule catalog ID:** R072

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
