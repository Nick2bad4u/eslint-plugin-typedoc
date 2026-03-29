# prefer-type-fest-value-of

Require TypeFest [`ValueOf<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/value-of.d.ts) over direct `T[keyof T]` indexed-access unions when extracting object value unions.

## Targeted pattern scope

This rule narrows matching to indexed-access type shapes that are semantically equivalent to `ValueOf<T>`.

- Type-level indexed access patterns shaped like `T[keyof T]`.

Indexed accesses with additional constraints or non-equivalent key domains are intentionally excluded.

## What this rule reports

This rule reports `T[keyof T]`-style indexed-access aliases that should use `ValueOf<T>`.

- Type-level indexed access patterns shaped like `T[keyof T]`.

## Why this rule exists

`ValueOf<T>` is clearer and more intent-revealing than repeating indexed-access unions. It also keeps value-union typing conventions consistent with other TypeFest-based utility types in the codebase.

## ❌ Incorrect

```ts
type Values = User[keyof User];
```

## ✅ Correct

```ts
type Values = ValueOf<User>;
```

## Behavior and migration notes

- `ValueOf<T>` replaces raw `T[keyof T]` value-union extraction patterns.
- Use keyed form `ValueOf<T, K>` when you need a subset of value types.
- Standardize on this alias in shared type utilities to avoid repeated indexed-access spelling.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type StatusValue = StatusMap[keyof StatusMap];
```

### ✅ Correct — Additional example

```ts
type StatusValue = ValueOf<StatusMap>;
```

### ✅ Correct — Repository-wide usage

```ts
type Selected = ValueOf<User, "id" | "email">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-value-of": "error",
        },
    },
];
```

## When not to use it

Disable this rule if explicit indexed-access expressions are required in a published API.

## Package documentation

TypeFest package documentation:

Source file: [`source/value-of.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/value-of.d.ts)

````ts
/**
Create a union of the given object's values, and optionally specify which keys to get the values from.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/31438) if you want to have this type as a built-in in TypeScript.

@example
```
import type {ValueOf} from 'type-fest';

type A = ValueOf<{id: number; name: string; active: boolean}>;
//=> string | number | boolean

type B = ValueOf<{id: number; name: string; active: boolean}, 'name'>;
//=> string

type C = ValueOf<{id: number; name: string; active: boolean}, 'id' | 'name'>;
//=> string | number
```

@category Object
*/
````

> **Rule catalog ID:** R074

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
