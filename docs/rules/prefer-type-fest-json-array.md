# prefer-type-fest-json-array

Require TypeFest [`JsonArray`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts) over explicit `JsonValue` array-union aliases.

## Targeted pattern scope

This rule matches explicit JSON array alias spellings where `JsonArray` communicates intent directly.

- `JsonValue[] | readonly JsonValue[]`
- `Array<JsonValue> | ReadonlyArray<JsonValue>`

This rule intentionally excludes other array aliases and non-JSON payload array forms.

## What this rule reports

This rule reports explicit `JsonValue` array alias forms that should use `JsonArray`.

- `JsonValue[] | readonly JsonValue[]`
- `Array<JsonValue> | ReadonlyArray<JsonValue>`

## Why this rule exists

`JsonArray` communicates JSON array intent directly and avoids repeating equivalent array union shapes.

## ❌ Incorrect

```ts
type Payload = JsonValue[] | readonly JsonValue[];
```

## ✅ Correct

```ts
type Payload = JsonArray;
```

## Behavior and migration notes

- `JsonArray` is the canonical alias for JSON arrays in `type-fest`.
- Keep `JsonValue[] | readonly JsonValue[]` usage out of shared contracts to avoid duplicate representations.
- Prefer one canonical alias per concept to reduce type alias drift across packages.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Payload = Array<JsonValue>;
```

### ✅ Correct — Additional example

```ts
type Payload = JsonArray;
```

### ✅ Correct — Repository-wide usage

```ts
type SerializedRows = JsonArray;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-array": "error",
        },
    },
];
```

## When not to use it

Disable this rule if public APIs must preserve existing custom alias names for compatibility.

## Package documentation

TypeFest package documentation:

Source file: [`source/json-value.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts)

```ts
/**
Matches a JSON array.

@category JSON
*/
```

> **Rule catalog ID:** R043

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
