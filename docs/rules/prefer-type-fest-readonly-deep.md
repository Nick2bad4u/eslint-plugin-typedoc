# prefer-type-fest-readonly-deep

Require TypeFest [`ReadonlyDeep`](https://github.com/sindresorhus/type-fest/blob/main/source/readonly-deep.d.ts) over `DeepReadonly` aliases.

## Targeted pattern scope

This rule reports `DeepReadonly<T>` aliases and prefers `ReadonlyDeep<T>` for recursive immutability contracts.

## What this rule reports

- Type references named `DeepReadonly`.

### Detection boundaries

- ✅ Reports direct `DeepReadonly<T>` type references.
- ❌ Does not auto-fix when legacy helper semantics differ for containers.

## Why this rule exists

`ReadonlyDeep<T>` is TypeFest's canonical deep immutability utility.

Canonical naming prevents mixed deep-readonly conventions in shared contract packages.

## ❌ Incorrect

```ts
type Config = DeepReadonly<AppConfig>;
```

## ✅ Correct

```ts
import type { ReadonlyDeep } from "type-fest";

type Config = ReadonlyDeep<AppConfig>;
```

## Behavior and migration notes

- `ReadonlyDeep<T>` recursively applies readonly semantics to nested structures.
- Verify behavior for maps/sets/tuples if your prior alias had custom handling.
- Prefer applying deep readonly at API boundaries where mutation should be prevented.

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-readonly-deep": "error",
        },
    },
];
```

## When not to use it

Disable this rule if your codebase intentionally standardizes `DeepReadonly` naming instead of TypeFest.

## Package documentation

TypeFest package documentation:

Source file: [`source/readonly-deep.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/readonly-deep.d.ts)

````ts
/**
Convert `object`s, `Map`s, `Set`s, and `Array`s and all of their keys/elements into immutable structures recursively.

This is useful when a deeply nested structure needs to be exposed as completely immutable, for example, an imported JSON module or when receiving an API response that is passed around.

Please upvote [this issue](https://github.com/microsoft/TypeScript/issues/13923) if you want to have this type as a built-in in TypeScript.

@example
```
import type {ReadonlyDeep} from 'type-fest';

declare const foo: {
    a: string;
    b: {c: number};
    d: Array<{e: number}>;
};

foo.a = 'bar'; // Allowed

foo.b = {c: 3}; // Allowed

foo.b.c = 4; // Allowed

foo.d = [{e: 5}]; // Allowed

foo.d.push({e: 6}); // Allowed

const last = foo.d.at(-1);
if (last) {
    last.e = 7; // Allowed
}

declare const readonlyFoo: ReadonlyDeep<typeof foo>;

// @ts-expect-error
readonlyFoo.a = 'bar';
// Error: Cannot assign to 'a' because it is a read-only property.

// @ts-expect-error
readonlyFoo.b = {c: 3};
// Error: Cannot assign to 'b' because it is a read-only property.

// @ts-expect-error
readonlyFoo.b.c = 4;
// Error: Cannot assign to 'c' because it is a read-only property.

// @ts-expect-error
readonlyFoo.d = [{e: 5}];
// Error: Cannot assign to 'd' because it is a read-only property.

// @ts-expect-error
readonlyFoo.d.push({e: 6});
// Error: Property 'push' does not exist on type 'ReadonlyArray<{readonly e: number}>'.

const readonlyLast = readonlyFoo.d.at(-1);
if (readonlyLast) {
    // @ts-expect-error
    readonlyLast.e = 8;
    // Error: Cannot assign to 'e' because it is a read-only property.
}
```

Note that types containing overloaded functions are not made deeply readonly due to a [TypeScript limitation](https://github.com/microsoft/TypeScript/issues/29732).

@category Object
@category Array
@category Set
@category Map
*/
````

> **Rule catalog ID:** R055

## Further reading

- [TypeFest README](https://github.com/sindresorhus/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
