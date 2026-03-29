# prefer-type-fest-promisable

Require TypeFest [`Promisable<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/promisable.d.ts) for sync-or-async callback contracts currently expressed as `Promise<T> | T` unions.

## Targeted pattern scope

This rule narrows matching to strict two-member Promise/base unions where `Promisable<T>` is the canonical replacement.

- Type unions shaped like `Promise<T> | T` in architecture-critical runtime layers.

Multi-member unions and Promise-adjacent variants stay out of scope unless they exactly match the authored pair form.

## What this rule reports

This rule reports strict `Promise<T> | T`-shaped unions that should be expressed as `Promisable<T>`.

- Type unions shaped like `Promise<T> | T` in architecture-critical runtime layers.
- Type references that resolve to imported legacy aliases such as `MaybePromise`.

### Detection boundaries

- ✅ Reports strict `Promise<T> | T` / `T | Promise<T>` unions by default.
- ✅ Reports imported legacy aliases such as `MaybePromise` by default.
- ❌ Does not report namespace-qualified aliases.
- ✅ Auto-fixes imported legacy alias references when replacement is syntactically safe.
- ❌ Does not auto-fix `Promise<T> | T` union declarations.
- ✅ Enforcement surface is configurable with `enforcePromiseUnions` and `enforceLegacyAliases`.

## Why this rule exists

`Promisable<T>` communicates intent directly, keeps callback contracts consistent, and avoids repeating equivalent sync-or-async unions throughout the codebase.

## ❌ Incorrect

```ts
type HookResult = Promise<Result> | Result;
```

## ✅ Correct

```ts
type HookResult = Promisable<Result>;
```

## Behavior and migration notes

- `Promisable<T>` captures sync-or-async return contracts in one reusable alias.
- It normalizes both `Promise<T> | T` and `T | Promise<T>` forms.
- Use this alias in hook/callback contracts where callers may return either immediate or async values.

### Options

This rule accepts a single options object:

```ts
type PreferTypeFestPromisableOptions = {
    /**
     * Whether to report imported legacy aliases such as MaybePromise.
     *
     * @default true
     */
    enforceLegacyAliases?: boolean;

    /**
     * Whether to report Promise<T> | T sync-or-async unions.
     *
     * @default true
     */
    enforcePromiseUnions?: boolean;
};
```

Default configuration:

```ts
{
    enforceLegacyAliases: true,
    enforcePromiseUnions: true,
}
```

Flat config setup (default behavior):

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-promisable": [
                "error",
                {
                    enforceLegacyAliases: true,
                    enforcePromiseUnions: true,
                },
            ],
        },
    },
];
```

#### `enforcePromiseUnions: false`

Ignores union-shaped contracts while still enforcing legacy aliases:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-promisable": [
                "error",
                {
                    enforceLegacyAliases: true,
                    enforcePromiseUnions: false,
                },
            ],
        },
    },
];
```

```ts
import type { MaybePromise } from "type-aliases";

type A = Promise<Result> | Result; // ✅ Not reported
type B = MaybePromise<Result>; // ❌ Reported
```

#### `enforceLegacyAliases: false`

Ignores legacy aliases while still enforcing union-shaped contracts:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-promisable": [
                "error",
                {
                    enforceLegacyAliases: false,
                    enforcePromiseUnions: true,
                },
            ],
        },
    },
];
```

```ts
import type { MaybePromise } from "type-aliases";

type A = MaybePromise<Result>; // ✅ Not reported
type B = Promise<Result> | Result; // ❌ Reported
```

## Additional examples

### ❌ Incorrect — Additional example

```ts
type MaybeAsync = Result | Promise<Result>;
```

### ✅ Correct — Additional example

```ts
type MaybeAsync = Promisable<Result>;
```

### ✅ Correct — Repository-wide usage

```ts
type HookOutput = Promisable<void>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-promisable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if runtime policy requires explicitly spelling out promise unions.

## Package documentation

TypeFest package documentation:

Source file: [`source/promisable.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/promisable.d.ts)

````ts
/**
Create a type that represents either the value or the value wrapped in `PromiseLike`.

Use-cases:
- A function accepts a callback that may either return a value synchronously or may return a promised value.
- This type could be the return type of `Promise#then()`, `Promise#catch()`, and `Promise#finally()` callbacks.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/31394) if you want to have this type as a built-in in TypeScript.

@example
```
import type {Promisable} from 'type-fest';

async function logger(getLogEntry: () => Promisable<string>): Promise<void> {
    const entry = await getLogEntry();
    console.log(entry);
}

await logger(() => 'foo');
await logger(() => Promise.resolve('bar'));
```

@category Async
*/
````

> **Rule catalog ID:** R054

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
