---
name: "Copilot-Instructions-ESLint-Plugin-Source"
description: "Authoring rules and source modules in the ESLint plugin template under src/."
applyTo: "src/**"
---

<instructions>
  <goal>

## Your Goal in `src/`

- Treat `src/` as the canonical source of truth for the plugin runtime, rule implementations, shared analysis helpers, and preset wiring.
- Prefer changing source modules and shared helpers here instead of patching generated outputs, docs copies, or benchmark-only code.
- New rules should follow the repository's typed-rule template exactly so metadata, docs, presets, tests, and package exports stay consistent.

  </goal>

  <layout>

## Source Layout

- `src/plugin.ts`
  - Public plugin entrypoint.
  - Owns exported plugin metadata, preset/config wiring, and public runtime shape.
  - If rule or preset metadata changes, verify whether `plugin.ts` derived output or exported types need to change too.
- `src/rules/*.ts`
  - One rule per file.
  - File name should match the unqualified rule name.
  - Default export should be the rule module.
- `src/_internal/**`
  - Shared rule helpers, analysis utilities, import/fix coordination, metadata derivation, and internal-only types.
  - Prefer moving reusable logic here instead of duplicating AST/type-checker logic across rules.
  - Do not treat `_internal` as a stable public API unless the repo explicitly exports it.

  </layout>

  <rule_template>

## Canonical Rule Template

- Prefer the shared rule creator used by the repository template (in this repo: `createTypedRule(...)` from `src/_internal/typed-rule.ts`).
- Rule files should usually have this shape:
  1. imports
  2. small file-local constants/default options
  3. `createTypedRule({...})` call
  4. static `meta` definition
  5. default export
- Keep the `create(...)` function focused on runtime lint behavior only.
- Pull reusable selector logic, import analysis, type guards, safe autofix helpers, and typed AST utilities into `_internal` helpers instead of open-coding them repeatedly.

### Runtime vs static data

- The runtime inputs for a rule should be limited to:
  - ESLint `context`
  - source text / AST
  - parser services / type checker when required
  - user-provided rule options
- **Do not dynamically compute, fetch, or inject authored docs metadata at runtime.**
- **Do not build docs metadata from README files, markdown files, process env, or external JSON at lint time.**
- In this template, infrastructure helpers may stamp canonical catalog fields or normalize URLs centrally, but authored rule metadata must still be written as static literals in the rule definition.
- The only authored values that should vary per lint invocation are rule options and data derived from the file being linted.

  </rule_template>

  <metadata>

## Required Rule Metadata

Every rule should define a complete static metadata contract.

### Core ESLint metadata

- `name`
  - Must match the rule file name and the rule registry entry.
- `defaultOptions`
  - Must be explicitly typed.
  - Prefer `const defaultOption = ... as const` / `const defaultOptions = [...] as const` when options exist.
  - Avoid implicit `any[]` or mutable option defaults.
- `meta.type`
  - Use the correct ESLint category (`problem`, `suggestion`, or `layout`).
- `meta.schema`
  - Must describe every supported option.
  - Prefer precise JSON-schema objects with `additionalProperties: false` where appropriate.
- `meta.messages`
  - Use stable `messageId`s.
  - Messages must be actionable and specific.
- `meta.fixable`
  - Use only when the rule provides a safe autofix.
- `meta.hasSuggestions`
  - Set when the rule emits suggestions.
- `meta.deprecated`
  - Must be explicit.
  - If `true`, keep deprecation metadata and migration guidance accurate.

### Extended docs metadata used by this template

Write these as static literals in `meta.docs` whenever the template expects them:

- `description`
- `recommended`
- `requiresTypeChecking`
- `frozen`
- `url`
- preset-membership metadata used by the repo (for example this template tracks config/preset membership in docs metadata)

If the repository template maintains a stable rule catalog, also make sure the rule is registered in that catalog so canonical rule IDs / numbers stay stable.

### `deprecated` guidance

- Use `deprecated: true` only when the rule is intentionally retired.
- Deprecated rules should still have correct docs, tests, and replacement guidance until removal.
- Do not silently repurpose a deprecated rule into a different behavior.

### `frozen` guidance

- `docs.frozen: true` means the rule behavior/options are intentionally closed to new feature work except for bug fixes, compatibility fixes, or maintenance.
- Do not mark a rule as frozen casually.
- Do not add new options to a frozen rule unless the repository explicitly relaxes that policy.

### Type-aware rules

- If a rule calls `getTypedRuleServices(...)`, `ESLintUtils.getParserServices(...)`, or otherwise depends on a TypeScript `Program`, set `docs.requiresTypeChecking: true`.
- If the rule can run safely without type services, keep `requiresTypeChecking: false` and avoid hidden parser-service assumptions.

  </metadata>

  <implementation>

## Rule Implementation Expectations

- Use the narrowest viable selectors.
- Fail fast on obviously irrelevant nodes.
- Avoid repeated expensive type-checker calls when a cached/shared helper can do the same work.
- Keep report descriptors deterministic.
- Prefer safe autofixes over clever ones.
- If import insertion or symbol rewrites are needed, use the repository's shared import/fix coordination helpers instead of ad-hoc string surgery.
- If a fix might change runtime behavior or become ambiguous, emit a suggestion instead of an autofix.
- Preserve comments, formatting boundaries, and import ordering whenever possible.

### Performance

- Rule code runs frequently; avoid whole-file rescans inside node visitors.
- Cache repeated computations per file when useful.
- Keep typed-rule logic especially disciplined: type-checker calls should be deliberate, necessary, and batched through shared helpers when possible.

### Reuse

- If two rules need the same AST or type-analysis primitive, build or extend an internal helper in `src/_internal/`.
- Do not copy/paste import insertion, type narrowing, or safe-fix logic between rule files.

  </implementation>

  <workflow>

## New Rule Workflow in This Template

When adding a rule, usually all of the following are required:

1. Add the rule module in `src/rules/<rule-id>.ts`.
2. Register it in the runtime rule registry.
3. Add or update stable rule-catalog data if the repo uses one.
4. Ensure the docs metadata lines up with the canonical docs URL and preset/config membership rules.
5. Add the rule docs page.
6. Add tests and typed fixtures when relevant.
7. Update any generated README/preset tables via the repo's sync scripts.
8. Verify public plugin wiring, package exports, and type surface if the change affects them.

Do not add a rule file without finishing the surrounding registry/docs/tests/sync work.

  </workflow>

  <donts>

## What Not To Do in `src/`

- Do not hand-edit `dist/` instead of `src/`.
- Do not runtime-inject docs metadata from helpers, markdown, or config files.
- Do not hide missing static metadata by computing it inside `create()`.
- Do not bypass the shared rule helper unless there is a strong architectural reason.
- Do not add public exports from `_internal` casually.
- Do not duplicate rule registry entries, preset membership, or docs URLs in multiple competing places when the template already derives them from one canonical source.

  </donts>
</instructions>
