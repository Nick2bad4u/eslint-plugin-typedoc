# prefer-type-fest-asyncify

Prefer [`Asyncify`](https://github.com/sindresorhus/type-fest/blob/main/source/asyncify.d.ts) from `type-fest` over manual asyncified function-type wrappers.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on two narrow shapes:

- direct function-type wrappers of the form `(...args: Parameters<Function>) => Promise<Awaited<ReturnType<Function>>>`
- `SetReturnType<Function, Promise<Awaited<ReturnType<Function>>>>` compositions

It intentionally skips broader promise-returning wrappers so the report signal stays specific to `Asyncify`.

## What this rule reports

This rule reports when all of the following are true:

- the wrapper keeps the original parameter list through `Parameters<Function>` or `SetReturnType<Function, ...>`
- the new return type is exactly `Promise<Awaited<ReturnType<Function>>>`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`Asyncify<Function>` communicates the intent directly.

- Readers can tell immediately that a synchronous function type is being boxed into an async equivalent.
- The helper avoids repeating the `Promise<Awaited<ReturnType<...>>>` boilerplate.
- It composes naturally with other Type-Fest function helpers.

## ❌ Incorrect

```ts
type AsyncVersion<Function_ extends (...arguments_: any[]) => any> =
    (...arguments_: Parameters<Function_>) =>
        Promise<Awaited<ReturnType<Function_>>>;
```

## ✅ Correct

```ts
import type {Asyncify} from "type-fest";

type AsyncVersion<Function_ extends (...arguments_: any[]) => any> =
    Asyncify<Function_>;
```

## Behavior and migration notes

- This rule intentionally overlaps with `SetReturnType` only for the exact asyncified return shape, and it takes precedence there.
- It reports both the raw wrapper and the `SetReturnType<..., Promise<Awaited<ReturnType<...>>>>` composition.
- It ignores non-async `SetReturnType` usage.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers the explicit wrapper signature or if you want to reserve `Asyncify` for only a subset of wrapper types.

## Package documentation

TypeFest package documentation:

Source file: [`source/asyncify.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/asyncify.d.ts)

```ts
import type {Asyncify} from "type-fest";

type AsyncVersion<Function_ extends (...arguments_: any[]) => any> =
    Asyncify<Function_>;
```

> **Rule catalog ID:** R093

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Awaited](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype)
- [TypeScript Handbook: ReturnType](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
