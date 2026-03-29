# prefer-type-fest-async-return-type

Require TypeFest [`AsyncReturnType<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/async-return-type.d.ts) over `Awaited<ReturnType<T>>` compositions.

## Targeted pattern scope

This rule targets nested built-in utility compositions used for async return extraction.

## What this rule reports

- Type references shaped like `Awaited<ReturnType<T>>`.

## Why this rule exists

`AsyncReturnType<T>` is easier to scan and more explicit about intent than stacking two utility types. Using the TypeFest alias also keeps async return extraction conventions consistent across the codebase.

## ❌ Incorrect

```ts
type Output = Awaited<ReturnType<typeof fetchData>>;
```

## ✅ Correct

```ts
type Output = AsyncReturnType<typeof fetchData>;
```

## Behavior and migration notes

- `AsyncReturnType<F>` is the canonical replacement for `Awaited<ReturnType<F>>` in function-return extraction.
- This rule targets the exact composition shape rather than all uses of `Awaited` or `ReturnType`.
- Keep direct built-in utilities when you intentionally need non-function or partially-unwrapped patterns.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Data = Awaited<ReturnType<typeof fetchUser>>; // Repeated built-in composition
```

### ✅ Correct — Additional example

```ts
type Data = AsyncReturnType<typeof fetchUser>;
```

### ✅ Correct — Repository-wide usage

```ts
type MutationResult = AsyncReturnType<typeof saveSettings>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-async-return-type": "error",
        },
    },
];
```

## When not to use it

Disable this rule if explicit built-in utility composition is required for local style consistency.

## Package documentation

TypeFest package documentation:

Source file: [`source/async-return-type.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/async-return-type.d.ts)

````ts
/**
Unwrap the return type of a function that returns a `Promise`.

There has been [discussion](https://github.com/microsoft/TypeScript/pull/35998) about implementing this type in TypeScript.

@example
```ts
import type {AsyncReturnType} from 'type-fest';

declare function asyncFunction(): Promise<{foo: string}>;

// This type resolves to the unwrapped return type of `asyncFunction`.
type Value = AsyncReturnType<typeof asyncFunction>;
//=> {foo: string}

declare function doSomething(value: Value): void;

const value = await asyncFunction();
doSomething(value);
```

@category Async
*/
````

> **Rule catalog ID:** R037

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
