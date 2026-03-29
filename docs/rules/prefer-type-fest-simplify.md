# prefer-type-fest-simplify

Require TypeFest [`Simplify<T>`](https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts) over imported `Prettify<T>` / `Expand<T>` aliases.

## Targeted pattern scope

This rule only matches type references that resolve to imported `Prettify` or `Expand` aliases and can be rewritten as `Simplify<T>`.

- Type references that resolve to imported `Prettify` aliases.
- Type references that resolve to imported `Expand` aliases.

Syntactically similar alternatives are intentionally out of scope unless they preserve the same AST shape.

## What this rule reports

This rule reports imported `Prettify` / `Expand` alias usages that should be replaced with `Simplify<T>`.

- Type references that resolve to imported `Prettify` aliases.
- Type references that resolve to imported `Expand` aliases.

## Why this rule exists

`Simplify` is the canonical flattening utility provided by type-fest. Standardizing on it reduces utility-name churn across codebases and keeps helper usage consistent with TypeFest defaults.

## ❌ Incorrect

```ts
import type { Prettify } from "type-aliases";

type ViewModel = Prettify<Base & Extra>;
```

## ✅ Correct

```ts
import type { Simplify } from "type-fest";

type ViewModel = Simplify<Base & Extra>;
```

## Behavior and migration notes

- `Simplify<T>` normalizes intersections and mapped-type output into a flattened object shape for editor display and assignability workflows.
- This rule targets imported alias names with overlapping semantics (`Prettify`, `Expand`).
- Keep aliases only when they intentionally add semantics beyond plain type flattening.

## Additional examples

### ❌ Incorrect — Additional example

```ts
import type { Expand } from "type-aliases";

type UIModel = Expand<Base & Extra>;
```

### ✅ Correct — Additional example

```ts
import type { Simplify } from "type-fest";

type UIModel = Simplify<Base & Extra>;
```

### ✅ Correct — Repository-wide usage

```ts
type ApiModel = Simplify<ResponseBase & ResponseExtra>;
```

## ESLint flat config example

```ts
import typefest from "eslint-plugin-typefest";

export default [
    {
        plugins: { typefest },
        rules: {
            "typefest/prefer-type-fest-simplify": "error",
        },
    },
];
```

## When not to use it

Disable this rule if internal tooling depends on existing alias names.

## Package documentation

TypeFest package documentation:

Source file: [`source/simplify.d.ts`](https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts)

````ts
/**
Useful to flatten the type output to improve type hints shown in editors. And also to transform an interface into a type to aide with assignability.

@example
```
import type {Simplify} from 'type-fest';

type PositionProps = {
    top: number;
    left: number;
};

type SizeProps = {
    width: number;
    height: number;
};

// In your editor, hovering over `Props` will show a flattened object with all the properties.
type Props = Simplify<PositionProps & SizeProps>;
```

Sometimes it is desired to pass a value as a function argument that has a different type. At first inspection it may seem assignable, and then you discover it is not because the `value`'s type definition was defined as an interface. In the following example, `fn` requires an argument of type `Record<string, unknown>`. If the value is defined as a literal, then it is assignable. And if the `value` is defined as type using the `Simplify` utility the value is assignable.  But if the `value` is defined as an interface, it is not assignable because the interface is not sealed and elsewhere a non-string property could be added to the interface.

If the type definition must be an interface (perhaps it was defined in a third-party npm package), then the `value` can be defined as `const value: Simplify<SomeInterface> = ...`. Then `value` will be assignable to the `fn` argument.  Or the `value` can be cast as `Simplify<SomeInterface>` if you can't re-declare the `value`.

@example
```
import type {Simplify} from 'type-fest';

interface SomeInterface {
    foo: number;
    bar?: string;
    baz: number | undefined;
}

type SomeType = {
    foo: number;
    bar?: string;
    baz: number | undefined;
};

const literal = {foo: 123, bar: 'hello', baz: 456};
const someType: SomeType = literal;
const someInterface: SomeInterface = literal;

declare function fn(object: Record<string, unknown>): void;

fn(literal); // Good: literal object type is sealed
fn(someType); // Good: type is sealed
// @ts-expect-error
fn(someInterface); // Error: Index signature for type 'string' is missing in type 'someInterface'. Because `interface` can be re-opened
fn(someInterface as Simplify<SomeInterface>); // Good: transform an `interface` into a `type`
```

@link https://github.com/microsoft/TypeScript/issues/15300
@see {@link SimplifyDeep}
@category Object
*/
````

> **Rule catalog ID:** R066

## Further reading

- [`type-fest` README](https://github.com/sindresorhus/type-fest)
- [`type-fest` npm documentation](https://www.npmjs.com/package/type-fest)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)

## Adoption resources

- [Rule adoption checklist](./guides/adoption-checklist.md)
- [Rollout and fix safety](./guides/rollout-and-fix-safety.md)
