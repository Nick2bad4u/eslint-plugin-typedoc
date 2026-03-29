# prefer-type-fest-set-non-nullable

Require TypeFest [`SetNonNullable<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/set-non-nullable.d.ts) over imported aliases like
`NonNullableBy`.

## Targeted pattern scope

This rule scopes matching to imported legacy aliases that model the same semantics as `SetNonNullable<T, Keys>`.

- Type references that resolve to imported `NonNullableBy` aliases.

Locally defined lookalikes or unrelated type references are excluded unless they resolve to the targeted imported alias.

## What this rule reports

This rule reports imported alias usages that should migrate to `SetNonNullable<T, Keys>`.

- Type references that resolve to imported `NonNullableBy` aliases.

## Why this rule exists

`SetNonNullable` is the canonical TypeFest utility for making selected keys
non-nullable. Standardizing on canonical TypeFest naming keeps utility usage
predictable in public TypeScript codebases.

## ❌ Incorrect

```ts
import type { NonNullableBy } from "type-aliases";

type PersistedUser = NonNullableBy<User, "id">;
```

## ✅ Correct

```ts
import type { SetNonNullable } from "type-fest";

type PersistedUser = SetNonNullable<User, "id">;
```

## Behavior and migration notes

- `SetNonNullable<T, Keys>` enforces non-nullability on selected keys while preserving the rest of the shape.
- This rule targets imported alias names that duplicate the same semantics (`NonNullableBy`).
- Use this utility for persisted/entity states where selected fields must be present and non-null after validation.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { NonNullableBy } from "type-aliases";

type Persisted = NonNullableBy<User, "id">;
```

### ✅ Correct — Additional example

```ts
import type { SetNonNullable } from "type-fest";

type Persisted = SetNonNullable<User, "id">;
```

### ✅ Correct — Repository-wide usage

```ts
type SafeOrder = SetNonNullable<Order, "orderId" | "createdAt">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-non-nullable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported aliases must remain stable.

## Package documentation

TypeFest package documentation:

Source file: [`source/set-non-nullable.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/set-non-nullable.d.ts)

````ts
/**
Create a type that makes the given keys non-nullable, where the remaining keys are kept as is.

If no keys are given, all keys will be made non-nullable.

Use-case: You want to define a single model where the only thing that changes is whether or not some or all of the keys are non-nullable.

@example
```
import type {SetNonNullable} from 'type-fest';

type Foo = {
    a: number | null;
    b: string | undefined;
    c?: boolean | null;
};

type SomeNonNullable = SetNonNullable<Foo, 'b' | 'c'>;
// type SomeNonNullable = {
//     a: number | null;
//     b: string; // Can no longer be undefined.
//     c?: boolean; // Can no longer be null, but is still optional.
// }

type AllNonNullable = SetNonNullable<Foo>;
// type AllNonNullable = {
//     a: number; // Can no longer be null.
//     b: string; // Can no longer be undefined.
//     c?: boolean; // Can no longer be null, but is still optional.
// }
```

@category Object
*/
````

> **Rule catalog ID:** R062

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
