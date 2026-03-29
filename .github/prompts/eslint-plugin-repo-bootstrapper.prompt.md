---
name: eslint-plugin-repo-bootstrapper
description: "🤖🤖 Use this prompt to bootstrap a new ESLint plugin repository by migrating the source plugin into my modern template structure. IMPORTANT: treat eslint-plugin-typefest only as a structural and quality guide, never as rule content to port or convert unless the source plugin already has an equivalent rule."
argument-hint: Provide the folder name of the existing plugin to port, such as `eslint-plugin-legacy`.
---

This is a comprehensive, multi-step task to bootstrap a new ESLint plugin repository by migrating a source plugin into my standardized modern template. I will repeat this prompt as needed to give you time to accomplish all tasks. Work autonomously and use your intuition to figure out the next logical step. Copilot instructions for specific folders have already been added to the repo, so be sure to follow those as well.

## Critical framing: use the template as a guide, not as source rule content

The current repository may have been scaffolded from my `eslint-plugin-typefest` template, but that does **not** mean you should port, rename, reinterpret, or adapt the TypeFest-specific rules into the new plugin.

Treat this repo only as a **template and quality baseline** for:

- folder structure
- config layout
- helper patterns
- testing patterns
- docs format
- metadata shape
- release/configuration conventions

Do **not** do any of the following unless the source plugin already contains an equivalent concept that you are intentionally migrating:

- do not convert `eslint-plugin-typefest` rules into rules for the new plugin
- do not rename TypeFest or ts-extras rule implementations to fit the new plugin
- do not copy TypeFest rule docs/examples/options into the new plugin unless they are genuinely part of the source plugin being migrated
- do not infer that missing rules should be filled in by cloning rules from this template repo

The source of truth for **rule content** is the source plugin in `./[SOURCE_PLUGIN_FOLDER]` plus any clearly stated user requirements. The source of truth for **project structure and quality bar** is this template repo.

**Project Context & Current State:**
1. We are adapting an old plugin currently located in the folder: `./[SOURCE_PLUGIN_FOLDER]`
2. The root of this repository has been scaffolded using my template (based on my `eslint-plugin-typefest` repo). All root `package.json` dependencies & devDependencies are already installed.
3. The target stack uses TypeScript and a Docusaurus documentation site.
4. The root contains configuration files copied from my template. Do NOT just delete and recreate them (tsconfig, lint configs, etc.). Instead, **adapt** them. Use the strict rules and configs already present as your baseline. Keep the Typedoc, ESLint, Remark, tsconfig, testing, Docusaurus, and other configs mostly intact, only making adjustments if absolutely necessary to get the new code working. Scripts may need some slight changes. The Typedoc and Remark plugins are to be used to help keep the docs up to date and in sync with the code.

**Your Instructions:**
5. **Adapt & Migrate:** Move rules, tests, and docs from `./[SOURCE_PLUGIN_FOLDER]` into the template's strict folder structure (`src/`, `docs/`, `test/`). Only migrate rule behavior that exists in the source plugin or that is explicitly required to support the migration.
6. **Strict Linting:** Update the entire repo (from `package.json` to GitHub release workflows). The lint config is very strict and must stay that way. It should work for the most part, but make slight adjustments if absolutely necessary. The only thing you need to do is update the local plugin import in the ESLint config. You should never turn off a rule unless it's absolutely necessary, but prefer to use inline ESLint disable comments for any exceptions rather than changing the config. The goal is to have 0 lint warnings/errors with the new code.
7. **Typing & TSConfig:** We run an extremely strict TSConfig. You may need to add types or make adjustments to get the code to compile without errors. The goal is to have 0 type errors with the new code.
8. **Modernize:** Rewrite all migrated rules in TypeScript and update them to modern ESLint 10 plugin standards. Preserve the source plugin's intent; do not replace it with TypeFest-template rule ideas.
9. **Cleanup:** You may delete files from `./[SOURCE_PLUGIN_FOLDER]` ONLY after you have fully copied, updated, and verified the respective rule/doc.
10. **Documentation:** Update the Docusaurus config and docs for each migrated rule, ensuring they match the style and standards of my template. ESLint meta data CANNOT be runtime injected into the docs via helpers, it has to be static. You must manually copy and update all relevant information for each rule, such as descriptions, options, examples, etc. Use template docs structure as a formatting reference only, not as content to copy blindly.
11. **Testing:** Ensure all tests are updated and passing with well-written test cases that cover all edge cases.
12. **Docusaurus:** Ensure the Docusaurus site is fully functional with the copied config and updated documentation. Make sure any documentation, examples, or site content is updated to reflect the new rules and standards. Look for any references to the old plugin name or rules and update them accordingly.
13. **Scripts & Misc:** We have a few custom remark plugins and a few scripts that should help you keep the docs and readme in sync and up to date. Update any package.json scripts if needed, most of them should work without changes, but make adjustments if necessary to fit the new plugin's structure and rules.
14. **Review & Refine:** After you have everything ported and updated, do a thorough review of the entire codebase, documentation, and tests to ensure everything is perfect and meets the standards of my template. Make any necessary refinements or improvements to ensure the highest quality.
15. **Final Check:** Before considering the task complete, double-check that all migrated rules are updated for ESLint 10, written in TypeScript, and that there are 0 lint warnings/errors, 0 type errors, and 0 failing tests. Also, ensure the Docusaurus site is fully functional with updated documentation for every rule. Then go through all folders and files one last time to make sure there are no leftover references to the old plugin or any content that shouldn't be there.

## Decision rule when you are unsure

When deciding whether to copy something from the template repo, ask:

1. Is this **project infrastructure**? If yes, adapting from the template is usually correct.
2. Is this **rule behavior/content/docs/examples**? If yes, it must come from the source plugin or explicit user direction, not from TypeFest.

If a rule or doc section exists in the template but not in the source plugin, default to **not** porting it.

**Definition of Done (Final Goals):**
A. All migrated rules are updated for ESLint 10 and written in TypeScript.
B. **0 lint warnings/errors, 0 type errors, and 0 failing tests.**
C. Docusaurus site is fully functional via the copied config, with updated documentation for every rule, ready for release.
D. The entire project matches the layout, doc standards, and coding standards of my `eslint-plugin-typefest` template **without importing unrelated TypeFest-specific rule content**.
E. Feel free to make improvements to this template if you see anything that should be added to help with future plugin bootstrapping. I want to make this process as smooth and efficient as possible for future plugins.

Work methodically through these requirements without taking shortcuts or cheating. This prompt will repeat a few times to give you plenty of time to do accurate, high-quality work. If you hit limits, stop at a logical checkpoint so we can continue in the next prompt. Get as much done as you can in each prompt, but prioritize quality and accuracy over quantity. The goal is to have a perfectly bootstrapped plugin that meets all the criteria above.

## 🚨 ABSOLUTE RULE: REMOVE ALL TYPEFEST-SPECIFIC CONTENT

- **Do NOT** leave any TypeFest or ts-extras rule code, documentation, or examples in the new repository.
- **Do NOT** create new folders like `src/[New-Plugin-Name]/rules` or `src/[New-Plugin-Name]`.
- **Do NOT** keep, rename, or adapt any TypeFest rule implementations, tests, or docs unless the source plugin has a direct equivalent you are intentionally migrating.
- **Do NOT** leave any references to TypeFest, ts-extras, or their rules, options, or examples anywhere in the codebase, docs, or tests.

## Folder Structure

- All migrated rules must go into `src/rules/` (not `src/[New-Plugin-Name]/rules` or any other subfolder) unless the source plugin uses a different structure.
- All migrated tests must go into `test/` (not `test/[New-Plugin-Name]` or similar) unless the source plugin uses a different structure.
- All migrated docs must go into `docs/rules/` (not `docs/[New-Plugin-Name]` or similar) unless the source plugin uses a different structure.

## Migration Steps (Clarified)

1. **Delete all TypeFest rule code, docs, and tests** from the template repo before migrating anything from the source plugin.
2. **Migrate only the rules, tests, and docs that exist in the source plugin** (in `./[SOURCE_PLUGIN_FOLDER]`). Do not invent new rules or copy anything from TypeFest unless the source plugin has a direct equivalent.
3. **Update all configs, scripts, and docs** to remove any references to TypeFest, ts-extras, or their rules.
4. **Do not create new folders or subfolders** for rules, tests, or docs unless the source plugin already uses them.
5. **After migration, the only rules, tests, and docs present should be those from the source plugin** (migrated and modernized as needed), plus any new ones you are explicitly instructed to add.

## Final Review

- The final repo must have **zero** TypeFest or ts-extras rule code, docs, or references.
- The folder structure must match the source plugin (or the template’s default: `src/rules/`, `test/`, `docs/rules/`), not invent new subfolders.
- All configs, scripts, and docs must be updated to reflect the new plugin and its rules only.

**If you are ever unsure, default to deleting TypeFest content and only migrating what exists in the source plugin.**

---
