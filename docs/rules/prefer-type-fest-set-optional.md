# prefer-type-fest-set-optional

Require TypeFest [`SetOptional<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/set-optional.d.ts) over imported aliases like `PartialBy`.

## Targeted pattern scope

This rule scopes matching to imported legacy aliases that model the same semantics as `SetOptional<T, Keys>`.

- Type references that resolve to imported `PartialBy` aliases.

Locally defined lookalikes or unrelated type references are excluded unless they resolve to the targeted imported alias.

## What this rule reports

This rule reports imported alias usages that should migrate to `SetOptional<T, Keys>`.

- Type references that resolve to imported `PartialBy` aliases.

## Why this rule exists

`SetOptional` is the canonical TypeFest utility for making selected keys optional. Standardizing on it improves discoverability and keeps utility naming consistent across projects.

## ❌ Incorrect

```ts
import type { PartialBy } from "type-aliases";

type PartialUser = PartialBy<User, "email">;
```

## ✅ Correct

```ts
import type { SetOptional } from "type-fest";

type PartialUser = SetOptional<User, "email">;
```

## Behavior and migration notes

- `SetOptional<T, Keys>` marks a selected subset of keys optional while preserving all other key modifiers.
- This rule targets imported alias names that represent the same semantics (`PartialBy`).
- Use this utility for draft/update shapes where only specific fields become optional.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { PartialBy } from "type-aliases";

type Draft = PartialBy<User, "email">;
```

### ✅ Correct — Additional example

```ts
import type { SetOptional } from "type-fest";

type Draft = SetOptional<User, "email">;
```

### ✅ Correct — Repository-wide usage

```ts
type PartialAddress = SetOptional<Address, "line2">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-optional": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external contracts require preserving existing aliases.

## Package documentation

TypeFest package documentation:

Source file: [`source/set-optional.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/set-optional.d.ts)

````ts
/**
Create a type that makes the given keys optional. The remaining keys are kept as is. The sister of the `SetRequired` type.

Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are optional.

@example
```
import type {SetOptional} from 'type-fest';

type Foo = {
    a: number;
    b?: string;
    c: boolean;
};

type SomeOptional = SetOptional<Foo, 'b' | 'c'>;
// type SomeOptional = {
//     a: number;
//     b?: string; // Was already optional and still is.
//     c?: boolean; // Is now optional.
// }
```

@category Object
*/
````

> **Rule catalog ID:** R063

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
