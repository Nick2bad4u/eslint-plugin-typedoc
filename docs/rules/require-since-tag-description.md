# require-since-tag-description

Require `@since` tags to specify a version or introductory context.

## Targeted pattern scope

This rule checks TypeDoc comments containing `@since` block tags.

## What this rule reports

This rule reports `@since` tags that do not contain meaningful content — no version string, no descriptive context, and no code.

## Why this rule exists

`@since` tags communicate API lifecycle information: when a feature was introduced, in which release it stabilized, or at what version a behavior changed. An empty `@since` tag tells readers that the API has version information assigned to it, but leaves the version itself blank.

This makes the tag actively misleading. Generated documentation with an empty `@since` may render a "Since:" label with no value, creating a confusing gap in the API changelog.

## ❌ Incorrect

```ts
/**
 * Parse the given JSON string.
 * @since
 */
export function parseJson(input: string): unknown {
    return JSON.parse(input);
}
```

## ✅ Correct

```ts
/**
 * Parse the given JSON string.
 * @since 1.2.0
 */
export function parseJson(input: string): unknown {
    return JSON.parse(input);
}
```

```ts
/**
 * Parse the given JSON string.
 * @since
 * Introduced in the 1.2.0 release as a replacement for `legacyParse`.
 */
export function parseJson(input: string): unknown {
    return JSON.parse(input);
}
```

## Behavior and migration notes

- This rule checks only comments that already contain `@since`. It does not require you to use `@since` on all exports.
- A version string like `1.2.0`, `v2.0.0-beta.1`, or a release date is sufficient to satisfy this rule.
- This rule does not autofix because the version information must be determined by the author.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
    {
        plugins: { typedoc: typedocPlugin },
        rules: {
            "typedoc/require-since-tag-description": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project does not track per-member API version history via `@since`, or if `@since` tags are filled in by automation that runs after lint.

## Package documentation

TypeDoc package documentation:

- [TypeDoc `@since` tag](https://typedoc.org/documents/Tags._since.html)

## Further reading

> **Rule catalog ID:** R030

- [TypeDoc tags overview](https://typedoc.org/documents/Tags.html)
- [JSDoc `@since` tag](https://jsdoc.app/tags-since)

## Adoption resources

- Pair with `typedoc/require-exported-doc-comment` to ensure all public APIs have comments, then with this rule so versioned APIs carry complete `@since` metadata.
