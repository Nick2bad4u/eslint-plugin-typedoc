# prefer-type-fest-constructor

Require TypeFest [`Constructor`](https://github.com/sindresorhus/type-fest/blob/main/source/basic.d.ts) over explicit constructor signatures.

## Targeted pattern scope

This rule reports explicit `new (...args) => T` signatures and prefers `Constructor<T>` for newable class contracts.

## What this rule reports

- `new (...args) => T` constructor type signatures.

### Detection boundaries

- ✅ Reports explicit non-abstract constructor signatures in type positions.
- ❌ Does not auto-fix when argument-generic relationships need manual preservation.

## Why this rule exists

`Constructor<T>` is a canonical alias for class factory contracts.

Using one alias across modules keeps dependency-injection and class-registry types uniform.

## ❌ Incorrect

```ts
type ExplicitCtor = new (host: string, port: number) => Service;
```

## ✅ Correct

```ts
import type { Constructor } from "type-fest";

type ServiceCtor = Constructor<Service>;
```

## Behavior and migration notes

- `Constructor<T>` expresses "newable" class values that produce `T`.
- Preserve specialized argument tuples with wrapper types when replacing explicit signatures.
- Prefer this alias in public APIs to avoid repeated constructor signature boilerplate.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-constructor": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally prefers explicit constructor signatures over TypeFest aliases.

## Package documentation

TypeFest package documentation:

Source file: [`source/basic.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/basic.d.ts)

```ts
/**
Matches a [`class` constructor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes).

@category Class
*/
```

> **Rule catalog ID:** R039

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
