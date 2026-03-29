# prefer-type-fest-iterable-element

Require TypeFest [`IterableElement<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/iterable-element.d.ts) over imported aliases like `SetElement`, `SetEntry`, and `SetValues`.

## Targeted pattern scope

This rule focuses on imported legacy iterable helper aliases that TypeFest now models via `IterableElement`.

- Type references that resolve to imported `SetElement` aliases.
- Type references that resolve to imported `SetEntry` aliases.
- Type references that resolve to imported `SetValues` aliases.

Unrelated type references and aliases from non-targeted imports are intentionally left untouched.

## What this rule reports

This rule reports imported iterable helper aliases that should be consolidated to `IterableElement`.

- Type references that resolve to imported `SetElement` aliases.
- Type references that resolve to imported `SetEntry` aliases.
- Type references that resolve to imported `SetValues` aliases.

## Why this rule exists

`IterableElement` is the canonical TypeFest utility for extracting element types from iterable collections. Consolidating on one name makes collection type extraction patterns easier to audit and maintain.

## ❌ Incorrect

```ts
import type { SetElement } from "type-aliases";

type Value = SetElement<Set<string>>;
```

## ✅ Correct

```ts
import type { IterableElement } from "type-fest";

type Value = IterableElement<Set<string>>;
```

## Behavior and migration notes

- This rule targets imported alias names that duplicate `IterableElement` semantics (`SetElement`, `SetEntry`, `SetValues`).
- Standardize on `IterableElement<T>` for sync and async iterable extraction patterns.
- Keep legacy alias names only when external libraries expose them as a required public API.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { SetElement } from "type-aliases";

type Item = SetElement<Set<number>>;
```

### ✅ Correct — Additional example

```ts
import type { IterableElement } from "type-fest";

type Item = IterableElement<Set<number>>;
```

### ✅ Correct — Repository-wide usage

```ts
type StreamChunk = IterableElement<AsyncIterable<string>>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-iterable-element": "error",
        },
    },
];
```

## When not to use it

Disable this rule if compatibility requires preserving external alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/iterable-element.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/iterable-element.d.ts)

````ts
/**
Get the element type of an `Iterable`/`AsyncIterable`. For example, `Array`, `Set`, `Map`, generator, stream, etc.

This can be useful, for example, if you want to get the type that is yielded in a generator function. Often the return type of those functions are not specified.

This type works with both `Iterable`s and `AsyncIterable`s, so it can be use with synchronous and asynchronous generators.

Here is an example of `IterableElement` in action with a generator function:

@example
```
import type {IterableElement} from 'type-fest';

function * iAmGenerator() {
    yield 1;
    yield 2;
}

type MeNumber = IterableElement<ReturnType<typeof iAmGenerator>>;
```

And here is an example with an async generator:

@example
```
import type {IterableElement} from 'type-fest';

async function * iAmGeneratorAsync() {
    yield 'hi';
    yield true;
}

type MeStringOrBoolean = IterableElement<ReturnType<typeof iAmGeneratorAsync>>;
```

Many types in JavaScript/TypeScript are iterables. This type works on all types that implement those interfaces.

An example with an array of strings:

@example
```
import type {IterableElement} from 'type-fest';

type MeString = IterableElement<string[]>;
```

@example
```
import type {IterableElement} from 'type-fest';

const fruits = new Set(['🍎', '🍌', '🍉'] as const);

type Fruit = IterableElement<typeof fruits>;
//=> '🍎' | '🍌' | '🍉'
```

@category Iterable
*/
````

> **Rule catalog ID:** R042

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
