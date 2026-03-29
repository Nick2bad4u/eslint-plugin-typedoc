# prefer-type-fest-set-readonly

Require TypeFest [`SetReadonly<T, Keys>`](https://github.com/sindresorhus/type-fest/blob/main/source/set-readonly.d.ts) over imported aliases like
`ReadonlyBy`.

## Targeted pattern scope

This rule scopes matching to imported legacy aliases that model the same semantics as `SetReadonly<T, Keys>`.

- Type references that resolve to imported `ReadonlyBy` aliases.

Locally defined lookalikes or unrelated type references are excluded unless they resolve to the targeted imported alias.

## What this rule reports

This rule reports imported alias usages that should migrate to `SetReadonly<T, Keys>`.

- Type references that resolve to imported `ReadonlyBy` aliases.

## Why this rule exists

`SetReadonly` is the canonical TypeFest utility for making selected keys
readonly. Canonical naming improves discoverability and consistency across
projects.

## ❌ Incorrect

```ts
import type { ReadonlyBy } from "type-aliases";

type ImmutableUser = ReadonlyBy<User, "id">;
```

## ✅ Correct

```ts
import type { SetReadonly } from "type-fest";

type ImmutableUser = SetReadonly<User, "id">;
```

## Behavior and migration notes

- `SetReadonly<T, Keys>` applies readonly modifiers to selected keys only.
- This rule targets imported aliases with equivalent semantics (`ReadonlyBy`).
- Use it for immutable identity fields while keeping the rest of a shape mutable.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { ReadonlyBy } from "type-aliases";

type Frozen = ReadonlyBy<User, "id">;
```

### ✅ Correct — Additional example

```ts
import type { SetReadonly } from "type-fest";

type Frozen = SetReadonly<User, "id">;
```

### ✅ Correct — Repository-wide usage

```ts
type ImmutableAudit = SetReadonly<AuditEntry, "timestamp" | "actor">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-set-readonly": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing exported alias names must be preserved.

## Package documentation

TypeFest package documentation:

Source file: [`source/set-readonly.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/set-readonly.d.ts)

````ts
/**
Create a type that makes the given keys readonly. The remaining keys are kept as is.

Use-case: You want to define a single model where the only thing that changes is whether or not some of the keys are readonly.

@example
```
import type {SetReadonly} from 'type-fest';

type Foo = {
    a: number;
    readonly b: string;
    c: boolean;
};

type SomeReadonly = SetReadonly<Foo, 'b' | 'c'>;
// type SomeReadonly = {
//     a: number;
//     readonly b: string; // Was already readonly and still is.
//     readonly c: boolean; // Is now readonly.
// }
```

@category Object
*/
````

> **Rule catalog ID:** R064

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
