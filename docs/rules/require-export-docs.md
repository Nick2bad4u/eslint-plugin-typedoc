# require-export-docs

Require TypeDoc blocks for exported declarations.

## Targeted pattern scope

This rule targets exported declarations that are part of your module's public API surface.

## What this rule reports

- Exported functions, classes, and enums without TypeDoc blocks.
- Exported interfaces/type aliases without TypeDoc blocks (configurable).
- Exported variables without TypeDoc blocks (configurable).

## Why this rule exists

Undocumented exports create expensive review cycles and weaker generated documentation quality. This rule makes public API documentation requirements explicit during linting.

## ❌ Incorrect

```ts
export function parseInput(raw: string): string {
    return raw.trim();
}
```

## ✅ Correct

```ts
/**
 * Parse raw user input into normalized text.
 */
export function parseInput(raw: string): string {
    return raw.trim();
}
```

## Behavior and migration notes

Default option shape:

```ts
{
    allowDefaultExportWithoutDocs: false,
    ignorePrivateUnderscore: true,
    includeTypes: true,
    includeVariables: true,
    summaryTemplate: "TODO: Document {{name}}.",
}
```

The rule offers suggestions that insert starter TypeDoc blocks.

## ESLint flat config example

```ts
import typedoc from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc },
        rules: {
            "typedoc/require-export-docs": "error",
        },
    },
];
```

## When not to use it

Disable this rule for internal-only packages where public API documentation is intentionally deferred.

## Package documentation

- [TypeDoc comment syntax](https://typedoc.org/documents/Doc_Comments.html)

> **Rule catalog ID:** R004

## Further reading

- [TypeDoc documentation](https://typedoc.org/)
