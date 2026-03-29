# prefer-type-fest-json-value

Prefers TypeFest `JsonObject` for serialization-bound string-keyed record contracts.

## Targeted pattern scope

This rule targets boundary-layer `Record<string, unknown/any>` payload aliases that are intended to represent JSON-compatible values.

- Payload/context-like contract aliases using `Record<string, unknown>`/`Record<string, any>` in JSON boundary folders.

General-purpose records outside configured JSON boundaries are intentionally excluded.

## What this rule reports

This rule reports boundary payload aliases that should use `JsonObject`.

- Payload/context-like contract aliases using `Record<string, unknown>`/`Record<string, any>` in JSON boundary folders.

## Why this rule exists

Serialization boundaries should declare JSON-compatible intent directly so type safety and runtime assumptions stay aligned.

## ❌ Incorrect

```ts
type Payload = Record<string, unknown>;
```

## ✅ Correct

```ts
type Payload = JsonObject;
```

## Behavior and migration notes

- `JsonObject` models JSON-compatible object payloads with string keys.
- Use `JsonObject` when your boundary contract must stay object-shaped.
- Replace open-ended `Record<string, unknown>`/`any` boundary contracts with `JsonObject` when schema intent is serialization.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type ConfigSnapshot = Record<string, unknown>;
```

### ✅ Correct — Additional example

```ts
type ConfigSnapshot = JsonObject;
```

### ✅ Correct — Repository-wide usage

```ts
type CacheEntry = JsonObject;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-value": "error",
        },
    },
];
```

## When not to use it

Disable this rule if boundary contracts intentionally allow non-JSON runtime values.

## Package documentation

TypeFest package documentation:

Source file: [`source/json-value.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts)

```ts
/**
Matches any valid JSON value.

@see `Jsonify` if you need to transform a type to one that is assignable to `JsonValue`.

@category JSON
*/
```

> **Rule catalog ID:** R046

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
