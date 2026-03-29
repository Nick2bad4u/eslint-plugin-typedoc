# prefer-type-fest-except

Require TypeFest [`Except<T, K>`](https://github.com/sindresorhus/type-fest/blob/main/source/except.d.ts) over `Omit<T, K>` when removing keys from object types.

## Targeted pattern scope

This rule targets `Omit<T, K>` object-shaping references and imported aliases such as `HomomorphicOmit` that can be replaced by the TypeFest canonical utility.

## What this rule reports

- Type references shaped like `Omit<T, K>`.
- Type references that resolve to imported `HomomorphicOmit` aliases.

### Detection boundaries

- ✅ Reports built-in `Omit<T, K>` by default.
- ✅ Reports imported aliases with direct named imports.
- ❌ Does not report namespace-qualified aliases.
- ✅ Auto-fixes imported alias references to `Except` when replacement is syntactically safe.
- ❌ Does not auto-fix built-in `Omit<T, K>` references.
- ✅ Built-in `Omit<T, K>` coverage is configurable with `enforceBuiltinOmit`.

## Why this rule exists

`Except<T, K>` from type-fest models omitted keys more strictly and keeps object-shaping conventions aligned with other TypeFest utilities used in this plugin.

## ❌ Incorrect

```ts
type PublicUser = Omit<User, "password">;
```

## ✅ Correct

```ts
type PublicUser = Except<User, "password">;
```

## Behavior and migration notes

- `Except<T, K>` is the canonical object-key removal utility in this plugin's type-fest style.
- Migrate direct `Omit<T, K>` aliases in shared contracts to keep one naming convention.
- Review constraint behavior if existing helper wrappers add semantics beyond key omission.

### Options

This rule accepts a single options object:

```ts
type PreferTypeFestExceptOptions = {
    /**
     * Whether to report built-in Omit<T, K> usages.
     *
     * @default true
     */
    enforceBuiltinOmit?: boolean;
};
```

Default configuration:

```ts
{
    enforceBuiltinOmit: true,
}
```

Flat config setup (default behavior):

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-except": [
                "error",
                { enforceBuiltinOmit: true },
            ],
        },
    },
];
```

#### `enforceBuiltinOmit: true` (default)

Reports both built-in `Omit<T, K>` and imported aliases.

#### `enforceBuiltinOmit: false`

Reports imported aliases, but ignores built-in `Omit<T, K>`:

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-except": [
                "error",
                { enforceBuiltinOmit: false },
            ],
        },
    },
];
```

```ts
import type { HomomorphicOmit } from "type-aliases";

type A = Omit<User, "password">; // ✅ Not reported
type B = HomomorphicOmit<User, "password">; // ❌ Reported
```

## Additional examples

### ❌ Incorrect — Additional example

```ts
type PublicUser = Omit<User, "password" | "token">;
```

### ✅ Correct — Additional example

```ts
type PublicUser = Except<User, "password" | "token">;
```

### ✅ Correct — Repository-wide usage

```ts
type Internalless = Except<ApiResponse, "internal">;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-except": "error",
        },
    },
];
```

## When not to use it

Disable this rule if public type contracts intentionally expose `Omit` as part of the API surface.

## Package documentation

TypeFest package documentation:

Source file: [`source/except.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/except.d.ts)

````ts
/**
Create a type from an object type without certain keys.

We recommend setting the `requireExactProps` option to `true`.

This type is a stricter version of [`Omit`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-5.html#the-omit-helper-type). The `Omit` type does not restrict the omitted keys to be keys present on the given type, while `Except` does. The benefits of a stricter type are avoiding typos and allowing the compiler to pick up on rename refactors automatically.

This type was proposed to the TypeScript team, which declined it, saying they prefer that libraries implement stricter versions of the built-in types ([microsoft/TypeScript#30825](https://github.com/microsoft/TypeScript/issues/30825#issuecomment-523668235)).

@example
```
import type {Except} from 'type-fest';

type Foo = {
    a: number;
    b: string;
};

type FooWithoutA = Except<Foo, 'a'>;
//=> {b: string}

// @ts-expect-error
const fooWithoutA: FooWithoutA = {a: 1, b: '2'};
// errors: 'a' does not exist in type '{ b: string; }'

type FooWithoutB = Except<Foo, 'b', {requireExactProps: true}>;
//=> {a: number} & Partial<Record<'b', never>>

// @ts-expect-error
const fooWithoutB: FooWithoutB = {a: 1, b: '2'};
// errors at 'b': Type 'string' is not assignable to type 'undefined'.

// The `Omit` utility type doesn't work when omitting specific keys from objects containing index signatures.

// Consider the following example:

type UserData = {
    [metadata: string]: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
};

// `Omit` clearly doesn't behave as expected in this case:
type PostPayload = Omit<UserData, 'email'>;
//=> {[x: string]: string; [x: number]: string}

// In situations like this, `Except` works better.
// It simply removes the `email` key while preserving all the other keys.
type PostPayloadFixed = Except<UserData, 'email'>;
//=> {[x: string]: string; name: string; role: 'admin' | 'user'}
```

@category Object
*/
````

> **Rule catalog ID:** R040

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
