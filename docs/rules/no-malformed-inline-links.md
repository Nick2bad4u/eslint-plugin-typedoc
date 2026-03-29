# no-malformed-inline-links

Disallow malformed inline `{@link ...}` tags in TypeDoc comments.

## Targeted pattern scope

This rule only inspects inline TypeDoc link tags inside block comments:

- `{@link Symbol}`
- `{@link Symbol|Label}`

It ignores non-TypeDoc comments and non-inline link syntax.

## What this rule reports

This rule reports inline links when the link target is missing or malformed, including:

- empty target (`{@link}`)
- label-only links (`{@link |label}`)
- link targets that contain whitespace (`{@link My Symbol}`)

## Why this rule exists

Malformed inline links break symbol navigation in generated TypeDoc output. Catching them in ESLint keeps docs validation close to normal code review and prevents broken references from shipping.

## ❌ Incorrect

```ts
/**
 * See {@link}.
 */
export function run(): void {}
```

```ts
/**
 * See {@link |integration docs}.
 */
export function run(): void {}
```

## ✅ Correct

```ts
/**
 * See {@link runIntegration}.
 */
export function run(): void {}
```

```ts
/**
 * See {@link runIntegration|integration docs}.
 */
export function run(): void {}
```

## Behavior and migration notes

The rule provides suggestions (not automatic fixes) to replace malformed links with a placeholder `{@link TODO}`. Suggestions keep edits explicit so maintainers can choose the right symbol target.

## ESLint flat config example

```ts
import typedocPlugin from "eslint-plugin-typedoc";

export default [
	{
		plugins: { typedoc: typedocPlugin },
		rules: {
			"typedoc/no-malformed-inline-links": "error",
		},
	},
];
```

## When not to use it

Disable this rule temporarily if your project intentionally stores non-TypeDoc inline link syntax during a migration period.

## Package documentation

TypeDoc package documentation:

- [Inline `@link` tag](https://typedoc.org/documents/Tags.__link_.html)

## Further reading

> **Rule catalog ID:** R001

- [TypeDoc tags reference](https://typedoc.org/documents/Tags.html)

## Adoption resources

- Start with `typedoc.configs.minimal` to surface malformed links quickly in existing code.
