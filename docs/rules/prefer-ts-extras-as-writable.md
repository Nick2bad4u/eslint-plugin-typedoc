# prefer-ts-extras-as-writable

Prefer [`asWritable`](https://github.com/sindresorhus/ts-extras/blob/main/source/as-writable.ts) from `ts-extras` over `Writable<...>` type assertions.

## Targeted pattern scope

This rule focuses on mutation-intent type assertions that map directly to `asWritable(value)`.

### Matched patterns

- `as` assertions where the asserted type is `Writable<...>` imported from `type-fest`.
- Namespace-qualified assertions such as `TypeFest.Writable<...>` when `TypeFest` comes from `type-fest`.

### Detection boundaries

- ✅ Reports `Writable`-based type assertions that are direct helper replacements.
- ❌ Does not report unrelated `as` assertions with non-`Writable` target types.

These boundaries keep matching deterministic and avoid broad semantic overreach during migration.

## What this rule reports

`Writable<...>`-based type assertions that can be replaced with `asWritable(value)`.

## Why this rule exists

`asWritable(value)` communicates intent directly and keeps mutation-intent casts aligned with the `ts-extras` helper API.

## ❌ Incorrect

```ts
import type { Writable } from "type-fest";

const writableUser = readonlyUser as Writable<User>;
```

## ✅ Correct

```ts
import { asWritable } from "ts-extras";

const writableUser = asWritable(readonlyUser);
```

## Behavior and migration notes

- `asWritable(value)` preserves runtime behavior while expressing mutability intent through one helper.
- Direct `as Writable<T>` / `as TypeFest.Writable<T>` assertions are reported.
- This rule does not rewrite unrelated type assertions.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const mutable = config as Writable<typeof config>;
```

### ✅ Correct — Additional example

```ts
const mutable = asWritable(config);
```

### ✅ Correct — Repository-wide usage

```ts
const draft = asWritable(readonlyDraft);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-as-writable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if mutation boundaries are enforced through explicit type assertions by policy.

## Package documentation

ts-extras package documentation:

Source file: [`source/as-writable.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/as-writable.ts)

````ts
/**
Cast the given value to be [`Writable`](https://github.com/sindresorhus/type-fest/blob/main/source/writable.d.ts).

This is useful because of a [TypeScript limitation](https://github.com/microsoft/TypeScript/issues/45618#issuecomment-908072756).

@example
```
import {asWritable} from 'ts-extras';

const writableContext = asWritable((await import('x')).context);
```

@category General
*/
````

> **Rule catalog ID:** R010

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
