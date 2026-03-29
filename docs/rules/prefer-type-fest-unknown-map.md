# prefer-type-fest-unknown-map

Require TypeFest [`UnknownMap`](https://github.com/sindresorhus/type-fest/blob/main/source/unknown-map.d.ts) over `ReadonlyMap<unknown, unknown>`.

## Targeted pattern scope

This rule targets explicit unknown-map spellings that TypeFest standardizes as `UnknownMap`.

- `ReadonlyMap<unknown, unknown>` type references.

Other collection contracts are left alone unless they match the exact unknown collection form listed below.

## What this rule reports

This rule reports unknown-map type forms that should migrate to `UnknownMap`.

- `ReadonlyMap<unknown, unknown>` type references.

## Why this rule exists

`UnknownMap` communicates intent directly and keeps unknown-container aliases consistent with other TypeFest-first conventions in this plugin.

## ❌ Incorrect

```ts
type Meta = ReadonlyMap<unknown, unknown>;
```

## ✅ Correct

```ts
type Meta = UnknownMap;
```

## Behavior and migration notes

- `UnknownMap` is a canonical alias for maps with unknown key/value pairs.
- Normalize map ingress contracts to one alias instead of repeating `ReadonlyMap<unknown, unknown>`.
- Narrow key/value types at use sites after validating actual runtime shapes.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Store = ReadonlyMap<unknown, unknown>;
```

### ✅ Correct — Additional example

```ts
type Store = UnknownMap;
```

### ✅ Correct — Repository-wide usage

```ts
type Metadata = UnknownMap;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-unknown-map": "error",
        },
    },
];
```

## When not to use it

Disable this rule if published contracts must preserve existing map alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/unknown-map.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/unknown-map.d.ts)

````ts
/**
Represents a map with `unknown` key and value.

Use case: You want a type that all maps can be assigned to, but you don't care about the value.

@example
```
import type {UnknownMap} from 'type-fest';

type IsMap<T> = T extends UnknownMap ? true : false;

type A = IsMap<Map<string, number>>;
//=> true

type B = IsMap<ReadonlyMap<number, string>>;
//=> true

type C = IsMap<string>;
//=> false
```

@category Type
*/
````

> **Rule catalog ID:** R070

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
