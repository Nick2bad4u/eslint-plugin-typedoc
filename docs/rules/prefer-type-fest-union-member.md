# prefer-type-fest-union-member

Require TypeFest [`UnionMember<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/union-member.d.ts) over custom union-member extraction helpers based on `UnionToIntersection`.

## Targeted pattern scope

This rule targets exact custom helper definitions that reproduce TypeFest `UnionMember<T>` semantics with `UnionToIntersection`, distributive function wrappers, and the optional `IsNever<T>` guard.

## What this rule reports

- `UnionToIntersection<T extends any ? () => T : never> extends () => infer R ? R : never`
- The guarded variant `IsNever<T> extends true ? never : ...`

## Why this rule exists

`UnionMember<T>` is the canonical TypeFest helper for extracting an arbitrary union member. Using it avoids re-declaring a brittle conditional-type helper and standardizes on the TypeFest utility name.

## ❌ Incorrect

```ts
type LastOfUnion<Union> = IsNever<Union> extends true
    ? never
    : UnionToIntersection<Union extends any ? () => Union : never> extends () => infer Last
      ? Last
      : never;
```

## ✅ Correct

```ts
import type { UnionMember } from "type-fest";

type LastOfUnion<Union> = UnionMember<Union>;
```

## Behavior and migration notes

- This rule intentionally matches only exact, high-confidence helper shapes.
- Similar custom helpers that differ structurally are ignored.
- It will not autofix when `UnionMember` is shadowed in the local type scope.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type MemberOfUnion<Union> = UnionToIntersection<Union extends any ? () => Union : never> extends () => infer Member
    ? Member
    : never;
```

### ✅ Correct — Additional example

```ts
import type { UnionMember } from "type-fest";

type MemberOfUnion<Union> = UnionMember<Union>;
```

### ✅ Correct — Non-targeted usage

```ts
type LastOfUnion<Union> = UnionToIntersection<Union extends unknown ? () => Union : never> extends () => infer Last
    ? Last
    : never;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-union-member": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project intentionally keeps local helper names for compatibility or if your custom helper intentionally differs from TypeFest `UnionMember<T>` semantics.

## Package documentation

TypeFest package documentation:

Source file: [`source/union-member.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/union-member.d.ts)

```ts
/**
Returns an arbitrary member of a union type.

Use-cases:
- Implementing recursive type functions that accept a union type.
*/
export type UnionMember<T> =
    IsNever<T> extends true
        ? never
        : UnionToIntersection<T extends any ? () => T : never> extends () => (infer R)
            ? R
            : never;
```

> **Rule catalog ID:** R081

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
