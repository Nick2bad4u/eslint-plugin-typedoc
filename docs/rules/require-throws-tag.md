# require-throws-tag

Require `@throws` tags for documented functions and methods that throw.

## Targeted pattern scope

This rule checks documented functions/methods with block bodies and reports when they contain `throw` statements but no `@throws` (or `@throw`) tag.

## What this rule reports

This rule reports missing throw documentation when a function body includes throw logic.

## Why this rule exists

Exception behavior is critical API contract information. Missing `@throws` tags make error handling expectations unclear in generated docs.

## ❌ Incorrect

```ts
/**
 * Parse JSON content.
 * @param input JSON source.
 * @returns Parsed object.
 */
export function parseJson(input: string): unknown {
    if (input.length === 0) {
        throw new TypeError("Input must not be empty.");
    }

    return JSON.parse(input);
}
```

## ✅ Correct

```ts
/**
 * Parse JSON content.
 * @param input JSON source.
 * @returns Parsed object.
 * @throws {TypeError} When the input is empty.
 */
export function parseJson(input: string): unknown {
    if (input.length === 0) {
        throw new TypeError("Input must not be empty.");
    }

    return JSON.parse(input);
}
```

## Behavior and migration notes

This rule does **not** apply changes during `--fix`.

It provides an editor suggestion that inserts a minimal `@throws` tag, so authors can document real error conditions intentionally.

By default, this rule ignores non-production paths:

- `test/**`, `tests/**`
- `benchmark/**`, `benchmarks/**`
- `fixture/**`, `fixtures/**`
- `temp/**`, `coverage/**`, `dist/**`, `build/**`, `generated/**`

Use `ignorePatterns` to override those defaults, and `ignoreDeclarationFiles: true` to skip declaration files such as `.d.ts` / `.d.mts`.

Rule options:

```ts
type RuleOptions = [
    {
        ignoreDeclarationFiles?: boolean;
        ignorePatterns?: string[];
    }?
];
```

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-throws-tag": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your team intentionally keeps throw semantics out of TypeDoc prose.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@throws` tag](https://typedoc.org/documents/Tags._throws.html)

## Further reading

> **Rule catalog ID:** R011

- [TypeDoc comments and tags](https://typedoc.org/documents/Doc_Comments.html)

## Adoption resources

- Enable this in strict rollout stages after baseline doc completeness rules.
