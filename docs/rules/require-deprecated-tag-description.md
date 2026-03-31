# require-deprecated-tag-description

Require `@deprecated` tags to explain the deprecation and, ideally, the preferred alternative.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@deprecated` block tags.

## What this rule reports

This rule reports `@deprecated` tags that do not contain meaningful explanatory text.

## Why this rule exists

TypeDoc renders deprecated members prominently in generated documentation.

An empty deprecation marker tells consumers that an API is going away, but gives them no migration path, replacement, or timeline. That is bad developer experience and creates churn during upgrades.

## ❌ Incorrect

```ts
/**
 * Legacy widget implementation.
 * @deprecated
 */
export class LegacyWidget {}
```

## ✅ Correct

```ts
/**
 * Legacy widget implementation.
 * @deprecated Use {@link ModernWidget} instead.
 */
export class LegacyWidget {}
```

## Behavior and migration notes

- This rule checks only comments that already contain `@deprecated`.
- A good deprecation note usually includes either the recommended replacement, the reason for deprecation, or the expected removal timeline.
- This rule does not autofix because deprecation guidance must be written intentionally.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-deprecated-tag-description": "error",
        },
    },
];
```

## When not to use it

Disable this rule only if your team intentionally uses bare `@deprecated` markers without any migration guidance.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@deprecated` tag](https://typedoc.org/documents/Tags._deprecated.html)

## Further reading

> **Rule catalog ID:** R027

- [TypeDoc tags overview](https://typedoc.org/documents/Tags.html)
- [TSDoc `@deprecated` tag](https://tsdoc.org/pages/tags/deprecated/)

## Adoption resources

- Pair with `require-exported-doc-comment-description` so deprecated APIs also have a clear lead summary before the migration note.
- Pair with `typedoc.configs.markdown` when your generated docs should provide actionable upgrade guidance instead of bare deprecation banners.
