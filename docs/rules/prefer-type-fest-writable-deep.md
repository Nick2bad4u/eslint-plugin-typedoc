# prefer-type-fest-writable-deep

Require TypeFest [`WritableDeep`](https://github.com/sindresorhus/type-fest/blob/main/source/writable-deep.d.ts) over `DeepMutable` and `MutableDeep` aliases.

## Targeted pattern scope

This rule reports `DeepMutable<T>`/`MutableDeep<T>` aliases and prefers `WritableDeep<T>` for deep mutability transforms.

## What this rule reports

- Type references named `DeepMutable`.
- Type references named `MutableDeep`.

### Detection boundaries

- ✅ Reports direct `DeepMutable<T>` and `MutableDeep<T>` references.
- ❌ Does not auto-fix where internal helpers intentionally diverge from `WritableDeep` behavior.

## Why this rule exists

`WritableDeep<T>` is the canonical TypeFest utility for recursively removing readonly constraints.

Standardizing on one helper name reduces confusion when mutability transitions are part of data-processing pipelines.

## ❌ Incorrect

```ts
type MutableConfigA = DeepMutable<AppConfig>;
type MutableConfigB = MutableDeep<AppConfig>;
```

## ✅ Correct

```ts
import type { WritableDeep } from "type-fest";

type MutableConfig = WritableDeep<AppConfig>;
```

## Behavior and migration notes

- `WritableDeep<T>` recursively removes readonly modifiers from nested members.
- Validate migration behavior for tuple/read-only array branches in critical types.
- Prefer local wrapper aliases if your domain needs a narrower deep-writable contract.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-writable-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes deep-mutable aliases over TypeFest naming.

## Package documentation

TypeFest package documentation:

Source file: [`source/writable-deep.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/writable-deep.d.ts)

````ts
/**
Create a deeply mutable version of an `object`/`ReadonlyMap`/`ReadonlySet`/`ReadonlyArray` type. The inverse of `ReadonlyDeep<T>`. Use `Writable<T>` if you only need one level deep.

This can be used to [store and mutate options within a class](https://github.com/sindresorhus/pageres/blob/4a5d05fca19a5fbd2f53842cbf3eb7b1b63bddd2/source/index.ts#L72), [edit `readonly` objects within tests](https://stackoverflow.com/questions/50703834), [construct a `readonly` object within a function](https://github.com/Microsoft/TypeScript/issues/24509), or to define a single model where the only thing that changes is whether or not some of the keys are writable.

@example
```
import type {WritableDeep} from 'type-fest';

type Foo = {
    readonly a: number;
    readonly b: readonly string[]; // To show that mutability is deeply affected.
    readonly c: boolean;
};

const writableDeepFoo: WritableDeep<Foo> = {a: 1, b: ['2'], c: true};
writableDeepFoo.a = 3;
writableDeepFoo.b[0] = 'new value';
writableDeepFoo.b = ['something'];
```

Note that types containing overloaded functions are not made deeply writable due to a [TypeScript limitation](https://github.com/microsoft/TypeScript/issues/29732).

@see {@link Writable}
@category Object
@category Array
@category Set
@category Map
*/
````

> **Rule catalog ID:** R076

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
