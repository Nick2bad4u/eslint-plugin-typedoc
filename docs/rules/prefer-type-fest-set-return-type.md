# prefer-type-fest-set-return-type

Prefer [`SetReturnType`](https://github.com/sindresorhus/type-fest/blob/main/source/set-return-type.d.ts) from `type-fest` over direct function-type wrappers built from `Parameters`.

This rule lives only in the experimental preset and reports without autofixing.

## Targeted pattern scope

This rule focuses on direct function-type wrappers of the form:

- `(...args: Parameters<Function>) => Result`

It intentionally skips the async-specific `Promise<Awaited<ReturnType<Function>>>` shape so the more specific `prefer-type-fest-asyncify` rule can handle that case.

## What this rule reports

This rule reports function types when all of the following are true:

- the function type has exactly one rest parameter
- that rest parameter is typed as `Parameters<Function>`
- the return type is not the original `ReturnType<Function>`
- the return type is not the `Asyncify` shape `Promise<Awaited<ReturnType<Function>>>`

The rule is currently **report-only**. It does not autofix or suggest a replacement yet.

## Why this rule exists

`SetReturnType<Function, Result>` states the transformation directly.

- Readers can see that only the return type changes.
- The helper is easier to reuse consistently across wrapper types.
- It avoids repeating the same `Parameters<...>` boilerplate in local helper types.

## ❌ Incorrect

```ts
type WithResult<Function_ extends (...arguments_: any[]) => any, Result> =
    (...arguments_: Parameters<Function_>) => Result;
```

## ✅ Correct

```ts
import type {SetReturnType} from "type-fest";

type WithResult<Function_ extends (...arguments_: any[]) => any, Result> =
    SetReturnType<Function_, Result>;
```

## Behavior and migration notes

- This rule targets the narrow rest-parameter form `(...args: Parameters<F>) => R`.
- It ignores ordinary handwritten function types with explicit parameters.
- It intentionally defers asyncified wrappers to `prefer-type-fest-asyncify`.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [typefest.configs.experimental];
```

## When not to use it

Disable this rule if your team prefers to spell out the wrapper function type explicitly or if you need a custom helper name for return-type rewrites.

## Package documentation

TypeFest package documentation:

Source file: [`source/set-return-type.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/set-return-type.d.ts)

```ts
import type {SetReturnType} from "type-fest";

type Wrapped<Function_ extends (...arguments_: any[]) => any> =
    SetReturnType<Function_, string>;
```

> **Rule catalog ID:** R092

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Parameters](https://www.typescriptlang.org/docs/handbook/utility-types.html#parameterstype)
- [TypeScript Handbook: ReturnType](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
- [Preset selection strategy](./guides/preset-selection-strategy.md)
