# prefer-type-fest-writable

Require TypeFest [`Writable`](https://github.com/sindresorhus/type-fest/blob/main/source/writable.d.ts) over manual mapped types that remove `readonly` with `-readonly`, and over imported aliases like `Mutable`.

## Targeted pattern scope

This rule targets manual readonly-removal mapped types and legacy mutability alias names.

## What this rule reports

- `{-readonly [K in keyof T]: T[K]}`
- Type references that resolve to imported `Mutable` aliases.

## Why this rule exists

`Writable<T>` is a standard TypeFest utility for expressing “mutable version of T” and avoids repeating a verbose mapped type pattern.

## ❌ Incorrect

```ts
type Mutable<T> = {
    -readonly [K in keyof T]: T[K];
};
```

## ✅ Correct

```ts
type MutableUser = Writable<User>;
```

## Behavior and migration notes

- `Writable<T>` is the canonical mutable-view utility in this plugin's type-fest conventions.
- This rule targets both structural mapped types (`-readonly`) and alias references (`Mutable`).
- Keep mapped-type definitions only when they intentionally differ from simple readonly removal.

## Additional examples

### ❌ Incorrect — Additional example

```ts
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
```

### ✅ Correct — Additional example

```ts
type Mutable<T> = Writable<T>;
```

### ✅ Correct — Repository-wide usage

```ts
type EditableOrder = Writable<ReadonlyOrder>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-writable": "error",
        },
    },
];
```

## When not to use it

Disable this rule if existing mapped-type aliases are required by public contracts.

## Package documentation

TypeFest package documentation:

Source file: [`source/writable.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/writable.d.ts)

````ts
/**
Create a type that strips `readonly` from the given type. Inverse of `Readonly<T>`.

The 2nd argument will be ignored if the input type is not an object.

Note: This type can make readonly `Set` and `Map` writable. This behavior is different from `Readonly<T>` (as of TypeScript 5.2.2). See: https://github.com/microsoft/TypeScript/issues/29655

This can be used to [store and mutate options within a class](https://github.com/sindresorhus/pageres/blob/4a5d05fca19a5fbd2f53842cbf3eb7b1b63bddd2/source/index.ts#L72), [edit `readonly` objects within tests](https://stackoverflow.com/questions/50703834), [construct a `readonly` object within a function](https://github.com/Microsoft/TypeScript/issues/24509), or to define a single model where the only thing that changes is whether or not some of the keys are writable.

@example
```
import type {Writable} from 'type-fest';

type Foo = {
    readonly a: number;
    readonly b: readonly string[]; // To show that only the mutability status of the properties, not their values, are affected.
    readonly c: boolean;
};

const writableFoo: Writable<Foo> = {a: 1, b: ['2'], c: true};
writableFoo.a = 3;
// @ts-expect-error
writableFoo.b[0] = 'new value'; // Will still fail as the value of property "b" is still a readonly type.
writableFoo.b = ['something']; // Will work as the "b" property itself is no longer readonly.

type SomeWritable = Writable<Foo, 'b' | 'c'>;
// type SomeWritable = {
//     readonly a: number;
//     b: readonly string[]; // It's now writable. The type of the property remains unaffected.
//     c: boolean; // It's now writable.
// }

// Also supports array
const readonlyArray: readonly number[] = [1, 2, 3];
// @ts-expect-error
readonlyArray.push(4); // Will fail as the array itself is readonly.
const writableArray: Writable<typeof readonlyArray> = readonlyArray as Writable<typeof readonlyArray>;
writableArray.push(4); // Will work as the array itself is now writable.
```

@category Object
*/
````

> **Rule catalog ID:** R075

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
