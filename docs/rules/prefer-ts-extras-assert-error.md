# prefer-ts-extras-assert-error

Require [`assertError`](https://github.com/sindresorhus/ts-extras/blob/main/source/assert-error.ts) from `ts-extras` over manual `instanceof Error` throw
guards.

## Targeted pattern scope

This rule focuses on throw-only negative `instanceof Error` guards that map directly to `assertError(value)`.

### Matched patterns

- `if (!(value instanceof Error)) { throw ... }`

Only `if` statements with no `else` branch and a throw-only consequent are
reported.

### Detection boundaries

- ✅ Reports negative `instanceof Error` guards wrapped in `!()`.
- ❌ Does not report positive-form patterns like `if (value instanceof Error) { ... } else { throw ... }`.
- ❌ Does not report checks against custom error classes in this rule.
- ❌ Does not auto-fix.

These boundaries keep matching deterministic and avoid broad semantic overreach during migration.

## What this rule reports

Throw-only negative `instanceof Error` guards that can be replaced with `assertError(value)`.

## Why this rule exists

`assertError()` communicates intent directly: "this value must be an `Error`".
That reduces repetitive custom guard code in `catch` pipelines.

## ❌ Incorrect

```ts
if (!(error instanceof Error)) {
    throw new TypeError("Expected Error");
}
```

## ✅ Correct

```ts
assertError(error);
```

## Behavior and migration notes

- `assertError(value)` narrows unknown caught values to `Error`.
- This rule only targets throw-only negative guards with no `else` branch.
- Positive-form or custom-error-class guards are intentionally out of scope.

## Additional examples

### ❌ Incorrect — Additional example

```ts
if (!(reason instanceof Error)) {
    throw new TypeError("Expected Error instance");
}
```

### ✅ Correct — Additional example

```ts
assertError(reason);
```

### ✅ Correct — Repository-wide usage

```ts
assertError(caughtValue);
assertError(lastFailureReason);
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-ts-extras-assert-error": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your project intentionally avoids runtime helper
dependencies or enforces a different assertion utility layer.

## Package documentation

ts-extras package documentation:

Source file: [`source/assert-error.ts`](https://github.com/sindresorhus/ts-extras/blob/main/source/assert-error.ts)

````ts
/**
Assert that the given value is an `Error`.

If the value is not an `Error`, a helpful `TypeError` will be thrown.

This can be useful as any value could potentially be thrown, but in practice, it's always an `Error`. However, because of this, TypeScript makes the caught error in a try/catch statement `unknown`, which is inconvenient to deal with.

@example
```
import {assertError} from 'ts-extras';

try {
    fetchUnicorns();
} catch (error: unknown) {
    assertError(error);

    // `error` is now of type `Error`

    if (error.message === 'Failed to fetch') {
        retry();
        return;
    }

    throw error;
}
```

@category Type guard
*/
````

> **Rule catalog ID:** R012

## Further reading

- [`ts-extras` README](https://github.com/sindresorhus/ts-extras)
- [`ts-extras` package reference](https://www.npmjs.com/package/ts-extras)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
