# require-returns-description

Require `@returns` tags to include a human-readable description.

## Targeted pattern scope

This rule checks TypeDoc comments on function-like declarations and signatures that include a `@returns` (or `@return`) tag.

Supported anchors include exported and local arrow functions and function expressions, concrete/abstract/ambient class methods, function-valued class properties, declared functions, and TypeScript method/call signatures.

## What this rule reports

This rule reports return tags that have no prose description. Optional JSDoc type annotations may contain balanced nested object types; the complete annotation is ignored when deciding whether prose remains.

## Why this rule exists

Type annotations alone do not explain semantics. This rule ensures return docs communicate meaning, not just shape.

## ❌ Incorrect

```ts
/**
 * Add values.
 *
 * @param left Left value.
 * @param right Right value.
 *
 * @returns {Promise<{ id: string }>}
 */
export async function load(): Promise<{ id: string }> {
 return { id: "value" };
}
```

## ✅ Correct

```ts
/**
 * Add values.
 *
 * @param left Left value.
 * @param right Right value.
 *
 * @returns {Promise<{ id: string }>} Loaded record.
 */
export async function load(): Promise<{ id: string }> {
 return { id: "value" };
}
```

## Behavior and migration notes

No autofix is provided, because semantic return descriptions cannot be generated safely. A shared variable-declaration comment is checked once even when the declaration contains multiple function initializers.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
 {
  plugins: { typedoc: typedocPlugin },
  rules: {
   "typedoc/require-returns-description": "error",
  },
 },
];
```

## When not to use it

Disable when return semantics are documented externally and TypeDoc comments are intentionally concise.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@returns` tag](https://typedoc.org/documents/Tags._returns.html)

## Further reading

> **Rule catalog ID:** R020

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Pair with `require-returns-tag` for complete return-tag presence and quality checks.
