# prefer-type-fest-omit-index-signature

Require TypeFest [`OmitIndexSignature<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/omit-index-signature.d.ts) over imported aliases like
`RemoveIndexSignature`.

## Targeted pattern scope

This rule targets imported alias names used for removing index signatures from object types.

## What this rule reports

- Type references that resolve to imported `RemoveIndexSignature` aliases.

## Why this rule exists

`OmitIndexSignature` is the canonical TypeFest utility for stripping index
signatures while preserving explicitly-declared fields. Using the canonical
name improves consistency across utility libraries.

## ❌ Incorrect

```ts
import type { RemoveIndexSignature } from "type-zoo";

type StrictUser = RemoveIndexSignature<User>;
```

## ✅ Correct

```ts
import type { OmitIndexSignature } from "type-fest";

type StrictUser = OmitIndexSignature<User>;
```

## Behavior and migration notes

- `OmitIndexSignature<T>` strips broad index signatures while preserving explicit properties.
- This rule targets alias names with equivalent semantics (`RemoveIndexSignature`).
- Use it when converting permissive dictionary-like types into explicit contract shapes.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { RemoveIndexSignature } from "type-zoo";

type Explicit = RemoveIndexSignature<User>;
```

### ✅ Correct — Additional example

```ts
import type { OmitIndexSignature } from "type-fest";

type Explicit = OmitIndexSignature<User>;
```

### ✅ Correct — Repository-wide usage

```ts
type PublicModel = OmitIndexSignature<ModelWithIndex>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-omit-index-signature": "error",
        },
    },
];
```

## When not to use it

Disable this rule if external contract compatibility requires existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/omit-index-signature.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/omit-index-signature.d.ts)

````ts
/**
Omit any index signatures from the given object type, leaving only explicitly defined properties.

This is the counterpart of `PickIndexSignature`.

Use-cases:
- Remove overly permissive signatures from third-party types.

This type was taken from this [StackOverflow answer](https://stackoverflow.com/a/68261113/420747).

It relies on the fact that an empty object (`{}`) is assignable to an object with just an index signature, like `Record<string, unknown>`, but not to an object with explicitly defined keys, like `Record<'foo' | 'bar', unknown>`.

(The actual value type, `unknown`, is irrelevant and could be any type. Only the key type matters.)

```
const indexed: Record<string, unknown> = {}; // Allowed

// @ts-expect-error
const keyed: Record<'foo', unknown> = {}; // Error
// TS2739: Type '{}' is missing the following properties from type 'Record<"foo" | "bar", unknown>': foo, bar
```

Instead of causing a type error like the above, you can also use a [conditional type](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) to test whether a type is assignable to another:

```
type Indexed = {} extends Record<string, unknown>
    ? '✅ `{}` is assignable to `Record<string, unknown>`'
    : '❌ `{}` is NOT assignable to `Record<string, unknown>`';

type IndexedResult = Indexed;
//=> '✅ `{}` is assignable to `Record<string, unknown>`'

type Keyed = {} extends Record<'foo' | 'bar', unknown>
    ? '✅ `{}` is assignable to `Record<\'foo\' | \'bar\', unknown>`'
    : '❌ `{}` is NOT assignable to `Record<\'foo\' | \'bar\', unknown>`';

type KeyedResult = Keyed;
//=> '❌ `{}` is NOT assignable to `Record<\'foo\' | \'bar\', unknown>`'
```

Using a [mapped type](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#further-exploration), you can then check for each `KeyType` of `ObjectType`...

```
type OmitIndexSignature<ObjectType> = {
    [KeyType in keyof ObjectType // Map each key of `ObjectType`...
    ]: ObjectType[KeyType]; // ...to its original value, i.e. `OmitIndexSignature<Foo> == Foo`.
};
```

...whether an empty object (`{}`) would be assignable to an object with that `KeyType` (`Record<KeyType, unknown>`)...

```
type OmitIndexSignature<ObjectType> = {
    [KeyType in keyof ObjectType
    // Is `{}` assignable to `Record<KeyType, unknown>`?
    as {} extends Record<KeyType, unknown>
        ? never // ✅ `{}` is assignable to `Record<KeyType, unknown>`
        : KeyType // ❌ `{}` is NOT assignable to `Record<KeyType, unknown>`
    ]: ObjectType[KeyType];
};
```

If `{}` is assignable, it means that `KeyType` is an index signature and we want to remove it. If it is not assignable, `KeyType` is a "real" key and we want to keep it.

@example
```
import type {OmitIndexSignature} from 'type-fest';

type Example = {
    // These index signatures will be removed.
    [x: string]: any;
    [x: number]: any;
    [x: symbol]: any;
    [x: `head-${string}`]: string;
    [x: `${string}-tail`]: string;
    [x: `head-${string}-tail`]: string;
    [x: `${bigint}`]: string;
    [x: `embedded-${number}`]: string;

    // These explicitly defined keys will remain.
    foo: 'bar';
    qux?: 'baz';
};

type ExampleWithoutIndexSignatures = OmitIndexSignature<Example>;
//=> {foo: 'bar'; qux?: 'baz'}
```

@see {@link PickIndexSignature}
@category Object
*/
````

> **Rule catalog ID:** R051

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
