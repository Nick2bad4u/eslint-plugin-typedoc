---
name: "Copilot-Instructions-ESLint-Docs"
description: "Instructions for writing perfect ESLint rule documentation."
applyTo: "docs/**"
---

<instructions>
  <goal>

## Your Goal for ESLint Rule Documentation

- Your goal is to make every ESLint rule documentation file (commonly `docs/rules/<rule-id>.md`) totally self-contained, allowing a developer to understand *why* the rule exists, *what* it flags, and *how* to fix it without looking at the source code.
- For adjacent rule-docs pages such as guides, preset pages, `overview.md`, or `getting-started.md`, keep the same tone and accuracy standards, but do not force rule-only sections where they do not fit.
- You adhere strictly to the `typescript-eslint` and standard ESLint documentation style guides.

## Documentation Quality Bar

- Every rule doc should be **hand-written, specific, and high quality**.
- Do **not** use a script or helper to stamp the same shallow prose into every rule doc.
- Do **not** rely on runtime metadata injection to make docs look complete.
- Shared guides, shared tables, or synced indexes are fine, but the actual rule page content must still be authored intentionally for that rule.
- If two rules need different rationale, caveats, migration notes, or examples, the docs must say so explicitly instead of collapsing into boilerplate.

## Static docs over generated filler

- Rule docs should not depend on runtime helpers to inject core explanatory content.
- Metadata can help validate, link, or classify docs, but it should not replace authoring.
- Write the description, rationale, examples, options explanation, edge cases, and "when not to use it" section manually.

  </goal>

  <structure>

## Documentation Structure

Rule documentation files in the repository's rule-docs location (commonly `docs/rules/<rule-id>.md`) should follow this structure closely:

1.  **Title:** The bare rule ID as the H1 header (e.g., `# no-unsafe-push`).
2.  **Description:** A short, one-sentence description of what the rule does.
3.  **Meta Badges (Optional):** Badges for `Recommended`, `Fixable`, or `Type Checked` only if the repository’s current docs pattern uses them.
4.  **Rule Details:** An explanation of the problem the rule solves. Why is this pattern bad?
5.  **Examples:**
    - Use `❌ Incorrect` and `✅ Correct` headers.
    - **Crucial:** Always include code blocks with specific comments explaining *why* a line is incorrect.
    - If the rule is configurable, show examples for different configurations.
6.  **Options (if applicable):**
    - A TypeScript interface definition of the options object.
    - Default values clearly marked.
    - Examples for each option.
7.  **When Not To Use It:** specific scenarios where disabling this rule is acceptable.
8.  **Further Reading:** Links to MDN, TypeScript docs, or relevant specs.

  </structure>

  <style>

## Style & Tone

- **Voice:** Professional, objective, and helpful. Avoid slang.
- **Clarity:** Use active voice. "This rule reports..." instead of "This rule is used to report...".
- **Code Blocks:**
  - Always tag code blocks with `ts` or `tsx` (since this is a TypeScript plugin).
  - Use `// eslint-disable-next-line` or specific comments in examples only if necessary to clarify context, but usually, just show the raw code that triggers the error.
- **Configuration:**
  - Assume **Flat Config** (`eslint.config.mjs`) for all configuration examples.
  - Do not use legacy `.eslintrc` JSON snippets.

  </style>

  <guidelines>

## Writing Guidelines

- **The "Why":** Never just say "Don't do X." Explain the consequence.
  - *Bad:* "Don't use `any`."
  - *Good:* "Using `any` bypasses the TypeScript type checker, which can lead to runtime errors that strict typing would otherwise catch."
- **The "Fix":** If the rule is `fixable`, explicitly state what the auto-fixer does (e.g., "The auto-fixer will replace `var` with `let`.").
- **Type Information:** If the rule requires type information (`parserServices`), add a specific note at the top of the docs:
  > ⚠️ This rule requires type information to run. It will not work without `projectService` (or equivalent typed parser setup) configured.
- **Preset awareness:** If the repository already exposes presets/configs that wire typed parser setup for users, mention that clearly instead of implying that every consumer must configure typed linting by hand.
- **Consistency:** Ensure the examples actually trigger the rule. Do not use hypothetical examples that strictly wouldn't fail the specific AST selector of the rule.
- **No copy-paste filler:** Avoid reusing the same generic paragraph across many rule docs unless it is truly shared guidance that belongs in a separate guide page.
- **No fake completeness:** A shorter but precise doc is better than a long page padded with repetitive or template-only text.
- **Manual curation:** If the repo has scripts that sync rule tables, sidebars, preset matrices, or indexes, use those only for derived navigation/data. They are not a substitute for authoring the page itself.

  </guidelines>

  <examples>

## Example Doc

```markdown
# no-unsafe-push

Disallow pushing values into arrays when the value type is not safely compatible with the array element type.

This rule helps preserve type safety in mutation-heavy code paths.

## Targeted pattern scope

This rule focuses on `.push(...)` calls where the argument type is wider, unknown, or otherwise incompatible with the destination array's element type.

- `items.push(value)` when `value` is not safely assignable to the array element type.

Indirect wrapper helpers and cases without enough information to prove the push is unsafe can be excluded to keep reporting accurate.

## What this rule reports

This rule reports `.push(...)` call sites when the pushed value may violate the declared array element type.

- `.push(...)` calls with values that are not safely compatible with the target array.

## Why this rule exists

Unsafe pushes weaken the guarantees that typed arrays are supposed to provide.

- Invalid values can spread through later reads and force additional runtime checks.
- The bug often appears far away from the original mutation site.
- Consistent reporting makes unsafe mutations easier to eliminate across a codebase.

## ❌ Incorrect

```ts
const ids: string[] = [];
const input: unknown = 123;

ids.push(input);
```

## ✅ Correct

```ts
const ids: string[] = [];
const input = "user-123";

ids.push(input);
```

## Behavior and migration notes

- Prefer validating or narrowing unknown values before mutating typed collections.
- Safe local conversions are usually easier to review than broad type assertions.
- If the rule provides a fixer or suggestion, explain the exact transformation and any safety limitations.

## Additional examples

### ❌ Incorrect — Additional example

```ts
const flags: boolean[] = [];
const value: string | boolean = Math.random() > 0.5 ? true : "yes";

flags.push(value);
```

### ✅ Correct — Additional example

```ts
const flags: boolean[] = [];
const value: string | boolean = Math.random() > 0.5 ? true : "yes";

if (typeof value === "boolean") {
  flags.push(value);
}
```

### ✅ Correct — Repository-wide usage

```ts
const names: string[] = [];
const candidate: unknown = getCandidateName();

if (typeof candidate === "string") {
  names.push(candidate);
}
```

## ESLint flat config example

```ts
import examplePlugin from "eslint-plugin-example";

export default [
    {
        plugins: { example: examplePlugin },
        rules: {
          "example/no-unsafe-push": "error",
        },
    },
];
```

> Replace `eslint-plugin-example`, `example`, and `no-unsafe-push` with the actual package name, namespace, and rule ID used in the target repository.

## When not to use it

Disable this rule if the project intentionally accepts looser array mutation patterns and the added strictness is not worth the migration cost.

## Package documentation

Link to the real package, language, or platform documentation that explains the behavior your rule enforces. Avoid copying template-specific dependency links into unrelated plugins.

> **Rule catalog ID:** R005

## Further reading

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

## Adoption resources

- Link to repository-local adoption or rollout guides when they exist.
- Prefer relative documentation links over hard-coded production URLs when linking within the same repository.

```

  </examples>
</instructions>
