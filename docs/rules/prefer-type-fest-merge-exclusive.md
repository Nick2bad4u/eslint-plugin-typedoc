# prefer-type-fest-merge-exclusive

Require TypeFest [`MergeExclusive`](https://github.com/sindresorhus/type-fest/blob/main/source/merge-exclusive.d.ts) over `XOR` aliases.

## Targeted pattern scope

This rule reports `XOR<...>` helper aliases and prefers `MergeExclusive<...>` for mutually exclusive object contracts.

## What this rule reports

- Type references named `XOR`.

### Detection boundaries

- ✅ Reports direct `XOR<...>` type references.
- ❌ Does not auto-fix when project-local `XOR` semantics differ from `MergeExclusive`.

## Why this rule exists

`MergeExclusive<A, B>` is the canonical TypeFest utility for object-level XOR constraints.

Unifying on one name reduces contract ambiguity in auth/selectors where two modes must be mutually exclusive.

## ❌ Incorrect

```ts
type Selector = XOR<{ email: string }, { id: string }>;
```

## ✅ Correct

```ts
import type { MergeExclusive } from "type-fest";

type Selector = MergeExclusive<{ email: string }, { id: string }>;
```

## Behavior and migration notes

- `MergeExclusive` ensures overlapping key sets cannot be simultaneously satisfied.
- Verify parity if your legacy `XOR` helper applied custom key normalization.
- Keep mutually exclusive contract types near API boundaries to improve review clarity.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-merge-exclusive": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `XOR` naming instead of TypeFest.

## Package documentation

TypeFest package documentation:

Source file: [`source/merge-exclusive.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/merge-exclusive.d.ts)

````ts
/**
Create a type that has mutually exclusive keys.

This type was inspired by [this comment](https://github.com/Microsoft/TypeScript/issues/14094#issuecomment-373782604).

This type works with a helper type, called `Without`. `Without<FirstType, SecondType>` produces a type that has only keys from `FirstType` which are not present on `SecondType` and sets the value type for these keys to `never`. This helper type is then used in `MergeExclusive` to remove keys from either `FirstType` or `SecondType`.

@example
```
import type {MergeExclusive} from 'type-fest';

type ExclusiveVariation1 = {
    exclusive1: boolean;
};

type ExclusiveVariation2 = {
    exclusive2: string;
};

type ExclusiveOptions = MergeExclusive<ExclusiveVariation1, ExclusiveVariation2>;

let exclusiveOptions: ExclusiveOptions;

exclusiveOptions = {exclusive1: true};
// Works

exclusiveOptions = {exclusive2: 'hi'};
// Works

// @ts-expect-error
exclusiveOptions = {exclusive1: true, exclusive2: 'hi'};
// Error
```

@category Object
*/
````

> **Rule catalog ID:** R049

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Unions and Intersections](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
