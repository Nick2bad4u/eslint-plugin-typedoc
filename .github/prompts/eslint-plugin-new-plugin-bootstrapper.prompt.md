---
name: eslint-plugin-new-plugin-bootstrapper
description: "🤖🤖 Use this prompt to scaffold a brand-new ESLint plugin repository from my modern template. IMPORTANT: treat eslint-plugin-typefest only as a structural and quality guide, never as rule content to keep, rename, or adapt unless I explicitly ask for a similar rule."
argument-hint: Provide the new package name, plugin namespace, short purpose, and optionally the initial rules to create, such as `@acme/eslint-plugin-sdk, namespace: acme-sdk, purpose: safer ACME SDK usage, initial rules: no-unsafe-client, require-result-check`.
---

This is a comprehensive, multi-step task to scaffold a brand-new ESLint plugin repository from my standardized modern template. I will repeat this prompt as needed to give you time to accomplish all tasks. Work autonomously and use your intuition to figure out the next logical step. Copilot instructions for specific folders have already been added to the repo, so be sure to follow those as well.

## Critical framing: use the template as a guide, not as source rule content

The current repository may have been scaffolded from my `eslint-plugin-typefest` template, but that does **not** mean you should keep, port, rename, reinterpret, or adapt the TypeFest-specific rules into the new plugin unless I explicitly ask for a similar rule.

Treat this repo only as a **template and quality baseline** for:

- folder structure
- config layout
- helper patterns
- testing patterns
- docs format
- metadata shape
- release/configuration conventions
- Docusaurus setup
- script and sync workflows

Do **not** do any of the following unless I explicitly request it:

- do not keep `eslint-plugin-typefest` rules as starter rules for the new plugin
- do not rename TypeFest or ts-extras rule implementations to fit the new plugin
- do not copy TypeFest rule docs/examples/options into the new plugin as filler
- do not infer that missing rule ideas should be filled in by cloning rules from this template repo
- do not leave any TypeFest-specific rule content in place "for now"

The source of truth for **rule content** is my request in this prompt session: package identity, plugin purpose, desired first rules, and any explicitly requested behavior. The source of truth for **project structure and quality bar** is this template repo.

## 🚫 Non-destructive migration policy (no cheating)

You must adapt mature files in place. Do **not** “pass quickly” by deleting and recreating large files with tiny replacements.

Hard requirements:

- Do not wipe and recreate mature root files (`eslint.config.mjs`, `tsconfig*`, docs config, scripts, workflows, README, major docs pages) unless replacement is strictly necessary.
- Prefer surgical edits that preserve existing structure, comments, ordering, and quality controls.
- Do not replace rich docs/tests/configs with minimal stubs or placeholder content just to get green checks.
- If a full-file rewrite is truly unavoidable, keep equal-or-better depth/coverage and explicitly state why the old structure could not be adapted.
- Delete only obsolete plugin-specific rule artifacts; preserve shared infrastructure.

Forbidden shortcuts:

- “Delete entire config and re-scaffold a tiny version.”
- “Replace docs with 5-line placeholders.”
- “Drop tests/sync scripts/quality gates to reduce work.”
- “Mass-delete first, figure out parity later.”

## Required input to interpret correctly

Use the user-provided prompt arguments as the product brief for the new plugin. Extract or infer the following carefully:

1. **Package name**
   - Example: `eslint-plugin-acme` or `@acme/eslint-plugin-sdk`
2. **Plugin namespace / rule prefix**
   - Example: `acme` or `acme-sdk`
3. **Short plugin purpose**
   - Example: "ESLint plugin for safer ACME SDK usage"
4. **Initial rules to create** (optional)
   - If specific rule IDs or behaviors are provided, implement those.
   - If no concrete rules are provided, scaffold the plugin identity and infrastructure cleanly without inventing speculative rule behavior.

If the package name implies the namespace, use the obvious derived namespace unless the user says otherwise.

## Project Context & Current State

1. The root of this repository has been scaffolded using my template (based on my `eslint-plugin-typefest` repo). All root `package.json` dependencies & devDependencies are already installed unless the user says otherwise.
2. The target stack uses TypeScript and a Docusaurus documentation site.
3. The root contains configuration files copied from my template. Do NOT just delete and recreate them (tsconfig, lint configs, Docusaurus config, scripts, workflows, etc.). Instead, **adapt** them.
4. Use the strict rules and configs already present as your baseline. Keep the Typedoc, ESLint, Remark, tsconfig, testing, Docusaurus, and other configs mostly intact, only making adjustments if absolutely necessary to get the new plugin working.
5. ESLint metadata and rule docs content must remain **static and authored**. Do **not** rely on runtime helpers to inject real rule documentation.

## Your Instructions

6. **Establish the new plugin identity:**
   - Replace the template package identity throughout the repository:
     - package name
     - plugin namespace
     - display name / description
     - docs URLs
     - repository metadata
     - README references
     - Docusaurus site metadata
     - workflow/release labels where appropriate
   - Remove or update all stale references to `eslint-plugin-typefest`, `typefest`, and `ts-extras`.

7. **Adapt infrastructure, do not re-scaffold it from scratch:**
   - Keep the template's structure, strictness, and quality bar.
   - Adapt configs and scripts instead of deleting and rewriting them unnecessarily.
   - Update local plugin imports in lint/test/docs config as needed.
   - Preserve modern Flat Config, strict TS, strict linting, docs pipeline, and package-validation flows unless a change is truly necessary.

8. **Remove template-only rule content:**
   - Delete the template's existing TypeFest-specific rules, docs, tests, examples, README references, and preset references unless the user explicitly asked for an equivalent rule.
   - Removals must be targeted and surgical. Do not delete whole mature files/directories if they also contain reusable infrastructure.
   - Do not leave old rule files around as placeholders.
   - Do not keep template rule IDs in docs tables, presets, tests, or snapshots.

9. **Scaffold the plugin runtime correctly:**
   - Ensure `src/`, `src/rules/`, `src/_internal/`, `src/plugin.ts`, tests, docs, and package exports reflect the new plugin.
   - Use the repository's typed rule template and metadata conventions.
   - Keep rule metadata static and complete.
   - If the user provided initial rules, implement them properly in TypeScript with modern ESLint 10-compatible patterns.
   - If the user did **not** provide initial rules, prefer a clean empty/minimal plugin over inventing arbitrary rule behavior.

10. **Rules, docs, and tests:**
   - For every explicitly requested rule, create:
     - a proper rule module
     - matching docs
     - robust tests
     - any necessary typed fixtures
     - proper registration in the plugin and preset/config surfaces
   - Use the template's docs/testing structure as a formatting and quality reference only, not as content to copy blindly.
   - Rule docs must be manually authored and high quality.
   - If the plugin is about a specfic program, library, or framework, ensure the rules, docs, and tests reflect that context accurately rather than being generic or template-like. Use the web search tools to do as much research as needed to understand the domain and write accurate, relevant rules, docs, and tests.

11. **Strict linting and typing:**
   - Update the repo so it works under the existing strict linting and TypeScript settings.
   - Prefer fixing code and types over weakening lint or TS config.
   - The goal is to have **0 lint warnings/errors** and **0 type errors**.

12. **Docusaurus and docs site:**
   - Ensure the Docusaurus site is fully functional with the new plugin name, links, docs, sidebar content, and generated API/doc tooling.
   - Look for stale template branding, URLs, nav links, sidebar items, generated-doc assumptions, or inspector output paths and update them appropriately.

13. **Scripts, sync flows, and package quality:**
   - Update package scripts only where necessary.
   - Respect and update sync flows for README tables, preset matrices, docs indexes, or similar generated surfaces if they exist.
   - If package exports, entrypoints, or public types change, ensure package-validation flows still make sense.

14. **Review & refine:**
   - After the new plugin is scaffolded, do a thorough review of the entire codebase, documentation, and tests to ensure everything is consistent, high quality, and aligned with the template's standards.
   - Make any necessary refinements or improvements to ensure the highest quality.

15. **Final check:**
   - Before considering the task complete, double-check that:
     - the plugin identity is fully updated
     - all requested rules are implemented in TypeScript and wired correctly
     - there are **0 lint warnings/errors, 0 type errors, and 0 failing tests**
     - the Docusaurus site is functional and correctly branded
     - there are no leftover TypeFest or ts-extras references
     - there are no fake starter rules/docs/tests copied from the template

## Decision rules when you are unsure

When deciding whether to keep, copy, or create something, ask:

1. Is this **project infrastructure**? If yes, adapting from the template is usually correct.
2. Is this **rule behavior/content/docs/examples**? If yes, it must come from the user's explicit requirements, not from TypeFest.
3. Did the user actually ask for this rule or behavior? If not, default to **not** inventing it.
4. If no initial rules are provided, is a clean empty/minimal plugin acceptable here? Usually yes — prefer that over speculative starter rules.

If a rule, doc section, test, or README block exists in the template but is not part of the requested new plugin, default to **removing** it.

## Definition of Done (Final Goals)

A. The repository is fully re-identified as the new plugin rather than `eslint-plugin-typefest`.
B. All explicitly requested rules are implemented in TypeScript using modern ESLint plugin patterns.
C. If no rules were requested yet, the repository is still a coherent, clean plugin scaffold with no leftover template rule content.
D. **0 lint warnings/errors, 0 type errors, and 0 failing tests.**
E. Docusaurus site is fully functional, correctly branded, and aligned with the new plugin.
F. The entire project matches the layout, doc standards, and coding standards of my `eslint-plugin-typefest` template **without importing unrelated TypeFest-specific rule content**.
G. Feel free to improve the template or instructions if you see anything that should be added to make future from-scratch plugin creation smoother.

Work methodically through these requirements without taking shortcuts or cheating. This prompt will repeat a few times to give you plenty of time to do accurate, high-quality work. If you hit limits, stop at a logical checkpoint so we can continue in the next prompt. Get as much done as you can in each prompt, but prioritize quality and accuracy over quantity. The goal is to have a perfectly scaffolded plugin that meets all the criteria above.

## 🚨 ABSOLUTE RULE: REMOVE ALL TYPEFEST-SPECIFIC CONTENT

- **Do NOT** leave any TypeFest or ts-extras rule code, documentation, or examples in the new repository.
- **Do NOT** keep template rule files around as starter examples unless I explicitly ask for that.
- **Do NOT** create new folders like `src/[New-Plugin-Name]/rules` or `src/[New-Plugin-Name]` unless there is a clearly justified repo-specific reason.
- **Do NOT** keep, rename, or adapt any TypeFest rule implementations, tests, or docs unless I explicitly requested an equivalent rule.
- **Do NOT** leave any references to TypeFest, ts-extras, or their rules, options, or examples anywhere in the codebase, docs, or tests.

## Folder Structure

- New rules should go into `src/rules/` unless the user explicitly wants a different structure.
- Tests should go into `test/` or `tests/` according to the repo's chosen convention, but do not invent plugin-name subfolders unnecessarily.
- Rule docs should go into `docs/rules/` unless the repo intentionally uses a different rule-docs location.
- Shared helpers should live in `src/_internal/` or the repo's existing shared-internal location.

## Creation Flow (Clarified)

1. **Inventory TypeFest-specific rule/docs/test artifacts and remove them surgically.**
   - Do not perform blanket file wipes.
   - Preserve reusable infrastructure and adapt it.
2. **Re-identify the repository** for the new package name, namespace, docs site, and metadata.
3. **Adapt configs and scripts** so the template works for the new plugin instead of replacing the whole setup.
4. **Implement only the rules the user actually requested.**
5. **If no rules are requested yet, leave a clean minimal plugin rather than inventing fake rule content.**
6. **Update docs, tests, package exports, presets/configs, and sync surfaces** to match the new plugin only.
7. **Run a final pass** to remove leftover template references and ensure the repo is coherent.

## Final Review

- The final repo must have **zero** TypeFest or ts-extras rule code, docs, or references.
- The folder structure must stay clean and template-aligned rather than inventing new nested plugin-name folders.
- All configs, scripts, docs, tests, and package metadata must reflect the new plugin and only the new plugin.
- If no rules were requested, the repo should still read as an intentional new plugin scaffold, not a half-cleaned template.

**If you are ever unsure, default to preserving infrastructure and performing targeted removals of obsolete TypeFest-specific artifacts only.**
