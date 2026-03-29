# prefer-type-fest-union-to-intersection

Prefer [`UnionToIntersection`](https://github.com/sindresorhus/type-fest/blob/main/source/union-to-intersection.d.ts) from `type-fest` over custom distributive conditional helpers that convert unions into intersections.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on the canonical conditional-type recipe that turns a union into an intersection by distributing a function wrapper over the union and then inferring the merged parameter type.

- `(Union extends unknown ? (value: Union) => void : never) extends (value: infer Intersection) => void ? Intersection : never`
- the common assignable variant that returns `Intersection & Union`

It intentionally skips unrelated conditional helpers and non-canonical extraction tricks to keep reporting narrow.

## What this rule reports

This rule reports conditional helpers when all of the following are true:

- the inner conditional distributes over the same `Union` type with `extends unknown` or `extends any`
- the inner true branch wraps that union in a single-parameter function type
- the outer conditional infers the merged parameter type from a single-parameter function type
- the outer true branch returns either the inferred type alone or the inferred type intersected with the original union

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`UnionToIntersection<Union>` states the intent directly.

- Readers do not need to unpack a dense conditional-type trick.
- The canonical helper is easier to search for across a codebase.
- Type-Fest owns the edge cases and maintenance burden for the pattern.

## ❌ Incorrect

```ts
type MergeUnion<Union> =
    (Union extends unknown ? (value: Union) => void : never) extends
        (value: infer Intersection) => void
        ? Intersection
        : never;
```

## ✅ Correct

```ts
import type {UnionToIntersection} from "type-fest";

type MergeUnion<Union> = UnionToIntersection<Union>;
```

## Behavior and migration notes

- This rule only reports the narrow distributive function-wrapper pattern.
- It also accepts the `Intersection & Union` variant because that still expresses the same underlying conversion.
- It ignores unrelated conditionals and other custom extraction helpers that do not match the canonical structure closely enough.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type MergeUnion<Union> =
    (Union extends any ? (value: Union) => void : never) extends
        (value: infer Intersection) => void
        ? Intersection & Union
        : never;
```

### ✅ Correct — Additional example

```ts
import type {UnionToIntersection} from "type-fest";

type MergeUnion<Union> = UnionToIntersection<Union>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your project intentionally prefers hand-written conditional-type recipes for educational reasons or if you are using a different local utility type and do not want to standardize on Type-Fest.

## Package documentation

TypeFest package documentation:

Source file: [`source/union-to-intersection.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/union-to-intersection.d.ts)

```ts
import type {UnionToIntersection} from "type-fest";

type Union = {a: string} | {b: number};

type Combined = UnionToIntersection<Union>;
//=> {a: string} & {b: number}
```

> **Rule catalog ID:** R089

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` package reference](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
