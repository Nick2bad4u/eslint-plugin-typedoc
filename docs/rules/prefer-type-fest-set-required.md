# prefer-type-fest-set-required

Require TypeFest [`SetRequired<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/set-required.d.ts) over imported aliases like
`RequiredBy`.

## Targeted pattern scope

This rule scopes matching to imported legacy aliases that model the same semantics as `SetRequired<T, Keys>`.

- Type references that resolve to imported `RequiredBy` aliases.

Locally defined lookalikes or unrelated type references are excluded unless they resolve to the targeted imported alias.

## What this rule reports

This rule reports imported alias usages that should migrate to `SetRequired<T, Keys>`.

- Type references that resolve to imported `RequiredBy` aliases.

## Why this rule exists

`SetRequired` is the canonical TypeFest utility for making selected keys
required. Standardizing on TypeFest naming reduces semantic drift between
utility libraries.

## ❌ Incorrect

```ts
import type { RequiredBy } from "type-aliases";

type CompleteUser = RequiredBy<User, "id">;
```

## ✅ Correct

```ts
import type { SetRequired } from "type-fest";

type CompleteUser = SetRequired<User, "id">;
```

## Behavior and migration notes

- `SetRequired<T, Keys>` forces selected optional keys to be required.
- This rule targets imported aliases with equivalent semantics (`RequiredBy`).
- Use this utility in post-validation and persisted-domain types where selected fields become mandatory.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { RequiredBy } from "type-aliases";

type Complete = RequiredBy<User, "id">;
```

### ✅ Correct — Additional example

```ts
import type { SetRequired } from "type-fest";

type Complete = SetRequired<User, "id">;
```

### ✅ Correct — Repository-wide usage

```ts
type Persisted = SetRequired<Order, "id" | "status">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-required": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported alias names are part of a compatibility contract.

## Package documentation

TypeFest package documentation:

Source file: [`source/set-required.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/set-required.d.ts)

````ts
/**
Create a type that makes the given keys required. The remaining keys are kept as is. The sister of the `SetOptional` type.

Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are required.

@example
```
import type {SetRequired} from 'type-fest';

type Foo = {
    a?: number;
    b: string;
    c?: boolean;
};

type SomeRequired = SetRequired<Foo, 'b' | 'c'>;
// type SomeRequired = {
//     a?: number;
//     b: string; // Was already required and still is.
//     c: boolean; // Is now required.
// }

// Set specific indices in an array to be required.
type ArrayExample = SetRequired<[number?, number?, number?], 0 | 1>;
//=> [number, number, number?]
```

@category Object
*/
````

> **Rule catalog ID:** R065

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
