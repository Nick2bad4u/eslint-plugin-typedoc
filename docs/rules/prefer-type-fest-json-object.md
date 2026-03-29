# prefer-type-fest-json-object

Require TypeFest [`JsonObject`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts) over equivalent explicit `Record<string, JsonValue>` aliases.

## Targeted pattern scope

This rule targets direct `Record<string, JsonValue>` aliases used as JSON object contracts.

- `Record<string, JsonValue>`

Broader record aliases and structurally different object constraints are intentionally left unchanged.

## What this rule reports

This rule reports `Record<string, JsonValue>` aliases that should use `JsonObject`.

- `Record<string, JsonValue>`

## Why this rule exists

`JsonObject` communicates intent directly and avoids repeating verbose JSON object alias patterns.

## ❌ Incorrect

```ts
type Payload = Record<string, JsonValue>;
```

## ✅ Correct

```ts
type Payload = JsonObject;
```

## Behavior and migration notes

- `JsonObject` is equivalent in intent to `Record<string, JsonValue>` for JSON object contracts.
- Standardize on `JsonObject` for shared payload/config types to avoid repeating low-level dictionary syntax.
- Keep runtime validation separate; this rule only normalizes compile-time type naming.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Payload = Record<string, JsonValue>;
```

### ✅ Correct — Additional example

```ts
type Payload = JsonObject;
```

### ✅ Correct — Repository-wide usage

```ts
type EventAttributes = JsonObject;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-json-object": "error",
        },
    },
];
```

## When not to use it

Disable this rule if a published API requires preserving existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/json-value.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/json-value.d.ts)

```ts
/**
Matches a JSON object.

This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. Don't use this as a direct return type as the user would have to double-cast it: `jsonObject as unknown as CustomResponse`. Instead, you could extend your CustomResponse type from it to ensure your type only uses JSON-compatible types: `interface CustomResponse extends JsonObject { … }`.

@category JSON
*/
```

> **Rule catalog ID:** R044

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
