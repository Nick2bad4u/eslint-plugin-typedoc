<!-- markdownlint-disable -->
<!-- eslint-disable markdown/no-missing-label-refs -->
# Changelog

All notable changes to this project will be documented in this file.

## [1.0.1] - 2026-03-13


[c94f474...c94f474](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/c94f47418c00ccf8e84b8a7dd1539db18518d22a...c94f47418c00ccf8e84b8a7dd1539db18518d22a)


### 🧹 Chores

- Release v1.0.1 [`(c94f474)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c94f47418c00ccf8e84b8a7dd1539db18518d22a)






## [1.0.0] - 2026-03-13


[d233b9c...fe9afd2](https://github.com/Nick2bad4u/eslint-plugin-typefest/compare/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3...fe9afd26fe79835b171003e19575a90518e14be6)


### ✨ Features

- ✨ [feat] Add Prettier configuration and bootstrap instructions
📝 [docs] Update ESLint configuration with package installation guidance
🧪 [test] Enhance type safety and fix assertions in prefer-ts-extras-key-in tests
🔧 [chore] Include prettier.config.ts in TypeScript configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8219846)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/82198469abc5897572fba1dc3e17a4929daaf7e3)


- ✨ [feat] Enhance ESLint configuration and improve scope resolution utilities

- Disable `vitest/prefer-expect-type-of` rule due to typechecking issues with current typings.
- Refactor scope resolution logic by introducing `getScopeFromContextSourceCode` for modern ESLint API compatibility.
- Replace legacy scope retrieval methods in `typed-rule.ts` with the new utility.
- Add new `scope-resolution.ts` file containing scope resolution helpers.
- Update various test files to ensure proper type checks and function assertions.
- Improve type safety in tests by refining fix function checks and ensuring expected types.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3d0c909)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d0c909e2649b1603e278ba9774d35b7fe9694c1)


- ✨ [feat] Add contributors section and update package dependencies

- 📝 Create .all-contributorsrc for managing contributors

- 📝 Add CONTRIBUTORS.md to display contributors with badges

- 📝 Update README.md to include a Contributors section

- 🔧 Update package.json and package-lock.json for dependency upgrades

- 🛠️ Modify eslint.config.mjs to enhance package.json rules

- 🧹 Remove outdated RELEASING.md file

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1d5fa24)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1d5fa24bbea2842389a350d0e5389134b16ee4c3)


- ✨ [feat] Add strict profile configuration and enhance module exports

- Introduced a new `.attw.json` file with strict profile settings

- Updated `package.json` to support CommonJS and ES module exports

- Modified build scripts to generate CommonJS compatible files

- Added new linting command for strict package checks
🧪 [test] Extend tests for runtime plugin shape validation

- Implemented tests to verify the exported structure of the runtime plugin

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7ff063c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7ff063cd9834399920a111b9c48c3e6ef3ae624c)


- ✨ [feat] Enhance Mermaid configuration and add presets rules synchronization


- 🛠️ [fix] Update `mermaid.config.json` to include `ishikawa` settings for improved diagram layout.

- 🔧 [build] Upgrade `eslint-plugin-package-json` from version `0.90.0` to `0.90.1` for better linting support.

- 📝 [docs] Modify `package.json` to include a new script `sync:presets-rules-matrix` for synchronizing presets rules.

- 🛠️ [feat] Introduce `sync-presets-rules-matrix.mjs` script to generate and validate the presets rules matrix from plugin metadata.

- 🧪 [test] Add `presets-rules-matrix-sync.test.ts` to ensure the generated matrix matches the canonical rules.

- 🧪 [test] Update `readme-rules-table-sync.test.ts` to normalize markdown table spacing for consistency in tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(292e4a4)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/292e4a49f94c517cb317dbf77cbad13bccdfa3d0)


- ✨ [feat] Add blog link to navigation menu

- Introduced a new link to the blog section in the navigation menu for easier access.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(76ff1fe)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/76ff1fe85bdff07695c59e70cdd023603de59b7f)


- ✨ [feat] Add rule catalog ID validation and normalize markdown table spacing


- 📝 Introduced a new function `assertRuleCatalogIdLine` to validate that each rule documentation contains exactly one canonical Rule catalog ID line.
  
- 📜 This function checks for the presence of the Rule catalog ID line and ensures it is correctly positioned relative to the "Further reading" heading.
  
- ✅ Added assertions to verify the expected format and order of the Rule catalog ID line.


- 🛠️ Enhanced the `normalizeRulesSectionMarkdown` function to standardize markdown table row spacing.
  
- 🔄 This function normalizes the spacing of markdown tables to ensure consistent formatting across generated tables.
  
- 📏 It trims whitespace and adjusts column alignment for better comparison between generated and expected markdown tables.


- 🧪 Updated tests to utilize the new normalization function for comparing readme rules sections, ensuring snapshot stability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c1caabb)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c1caabb730504b1ad1d737428b156c8675b7e0eb)


- ✨ [feat] Introduce default operators for nullish comparison parsing

- Added a constant for default nullish comparison operators to improve maintainability

- Updated `getNullishComparison` to use the new default operators instead of hardcoded values

- Enhanced flexibility by allowing custom operators while maintaining default behavior

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(473f8d6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/473f8d6329ade1b3e203c7c1fb7a0d2961a41b05)


- ✨ [feat] Enhance typed rule functionality and validation

- 🛠️ [fix] Add non-canonical docs.url validation in createTypedRule

- 🛠️ [fix] Simplify preset membership metadata checks in derivePresetRuleNamesByConfig

- 🛠️ [fix] Refactor typed services retrieval to getTypedRuleServicesOrUndefined

- 🧪 [test] Add tests for non-canonical docs.url handling in createTypedRule

- 🧪 [test] Ensure typed services retrieval behaves correctly in various contexts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(370a7cd)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/370a7cd7d545a20d0b9047adb75094fa5fbc7709)


- ✨ [feat] Enhance sidebar readability and button styles

- 🆕 Introduced a new sidebar label token coloring feature to improve readability by highlighting leading tokens in sidebar links.

- 🔧 Added utility functions to check if a sidebar link belongs to the runtime API category or a numbered rules subsection.

- 🎨 Implemented a new CSS class for hero action buttons, enhancing their visual appearance with gradients, shadows, and hover effects.

- 📝 Updated the index page to utilize the new button styles for primary and secondary actions.

- 🧪 Added tests to ensure the integrity of rule metadata, enforcing required metadata invariants including the new `ruleCatalogId`.

- 🔄 Refactored the `typed-rule.ts` file to centralize the injection of `ruleCatalogId` in the rule creation process.

- 🔍 Updated ESLint configuration to disable specific rules and enforce new package.json requirements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(719bab6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/719bab6821895a1509e99e2c263776f94f407ae6)


- ✨ [feat] Implement telemetry for typed rule paths

- 🛠️ [fix] Add telemetry recording for prefilter evaluations in array-like expression checks

- 🛠️ [fix] Integrate telemetry for expensive type calls and fallback invocations in constrained type resolution

- 📝 [docs] Create typed service path inventory documentation

- 🔧 [build] Update rules to include telemetry file paths for better diagnostics

- 🧪 [test] Enhance tests to mock typed rule services and validate telemetry functionality

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8bb7d79)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8bb7d79ac483fd2336235c0018d072d76a78e060)


- ✨ [feat] Enhance rule documentation and argument validation

- 🆕 [feat] Add `createRuleDocsUrl` function for generating canonical rule documentation URLs

- 🔧 [build] Integrate `createRuleDocsUrl` into `createTypedRule` for consistent URL handling

- 🛠️ [fix] Implement `minimumArgumentCount` validation in `reportTsExtrasGlobalMemberCall`

- 📝 [docs] Add `parseMarkdownHeadingsAtLevel` for improved Markdown heading extraction in tests

- 🧪 [test] Extend tests for observer failure reporting in `safeTypeOperation`

- 🧪 [test] Update rule docs integrity tests to utilize new URL generation logic

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(36e010b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/36e010b654605c0c0bc1f0fd570bc5e3557dd272)


- ✨ [feat] Enhance rule reporting and configuration management

- 🛠️ Refactor rule reporting to enforce policy-aware handling

- 🔧 Introduce `reportWithOptionalFix` to manage autofix settings

- 🎨 Update README rules table synchronization in CI workflow

- 🔧 Add `sync:readme-rules-table` script for README consistency

- 📝 Expand typefest configuration metadata for better documentation

- 🧪 Add contract tests to ensure rule modules use shared reporting helpers

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ef3e2b0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ef3e2b0f505bd52bf9043ce4f3061c5fa9d26343)


- ✨ [feat] Enhance rule metadata with ruleId and ruleNumber


- 🆕 Introduced `ruleId` and `ruleNumber` properties in the `RuleDocsMetadata` type to uniquely identify rules.

- 🔍 Updated the `getRuleDocsContract` function to validate the format of `ruleId` as 'R###' and ensure `ruleNumber` is a positive integer.

- 📜 Modified the `createTypedRule` function to include `ruleId` and `ruleNumber` from the rule catalog entry, ensuring all rules have consistent metadata.

- 🧪 Added tests to verify the integrity of `ruleId` and `ruleNumber`, ensuring they are unique and correctly formatted across all rules.

- 📸 Updated snapshot tests to reflect the new metadata structure, including `ruleId` and `ruleNumber` for each rule.

- 🔄 Refactored existing tests to check for the presence and correctness of the new properties in the rule metadata.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dae1c27)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dae1c27f6a81ce85d86580020ac57dc5ac73e58e)


- ✨ [feat] Enhance logging functionality in scripts

- 📝 Update log-prompt.ps1 to include success and failure messages for prompt logging

- 📝 Add directory creation for logs if it doesn't exist

- 📝 Improve error handling with detailed output in log-prompt.ps1

- 📝 Modify remove-temp.ps1 to provide success/failure messages for temp directory cleanup

- 📝 Update remove-temp.sh to include success/failure messages and dry run feedback

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(954d614)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/954d6144b034d79a7fd4cf013b1396ac2aea67ce)


- ✨ [feat] Enhance TypeScript ESLint integration with new utilities and benchmarks

- 🆕 Add `getConstrainedTypeAtLocationWithFallback` utility to resolve TypeScript types with resilient fallbacks for partially mocked parser services.

- 🔧 Update `array-like-expression.ts` to utilize the new utility for type resolution, improving type checking for array-like expressions.

- 🔧 Refactor `type-checker-compat.ts` to use `isTypeReferenceType` from `@typescript-eslint/type-utils` for better type checking.

- 🔧 Modify `typescript-eslint-node-autofix.ts` to leverage the new type resolution utility, enhancing type safety in autofix scenarios.

- 🔧 Update rules in `prefer-ts-extras-safe-cast-to.ts`, `prefer-ts-extras-set-has.ts`, and `prefer-ts-extras-string-split.ts` to incorporate the new type resolution utility, improving type checks and suggestions.

- 🧪 Add tests for new type resolution scenarios, including handling of `any`, `unknown`, and `never` types, ensuring robust linting behavior.

- 🧪 Extend existing tests to cover cases for generic types constrained to `Set` and `String`, ensuring linting rules are applied correctly in these contexts.

- 🧪 Introduce tests for ignored type aliases, ensuring that linting suggestions are appropriately filtered for `any`, `never`, and `unknown` aliases.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(021b3e9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/021b3e936183cb36f498cb5904e2e60a1467170c)


- ✨ [feat] Add type annotations to exported constants and introduce new tsconfig for Vitest type-checking

- 🛠️ [fix] Update `isPresentStressFixture`, `recommendedZeroMessageBaseline`, `safeCastToStressFixture`, `setHasStressFixture`, and `stringSplitStressFixture` with explicit type annotations

- 🛠️ [fix] Modify `createSafeTypeOperationCounter` to use default type for `Reason`

- 📝 [docs] Add type-level contract tests for public plugin exports and runtime entrypoint declarations

- 🔧 [build] Create new `tsconfig.vitest-typecheck.json` for improved type-checking with Vitest

- 🔧 [build] Update `vite.config.ts` to use the new tsconfig and include patterns for type-test discovery

- 🔧 [build] Refactor `vitest.stryker.config.ts` to define and export the Vitest configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(21e0d49)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/21e0d498a8ed4c996ad2844795716c2cfdd01593)


- ✨ [feat] Add sync:readme-rules-table script to package.json and optimize rule handling

- Introduced a new script command to synchronize the README rules table.

- Refactored rule name checks to utilize Set for improved performance in sync-readme-rules-table.mjs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(92bd316)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/92bd316192d7f16ca8cbcd9d13565b1751a503af)


- ✨ [feat] Enhance typefest plugin with new functionality and documentation updates

- 📝 Add JSDoc comments for `getSafeLocalNameForImportedValue` to clarify its purpose and parameters

- 📝 Update `createSafeTypeOperationCounter` to include typed reason literals for better type inference

- 📝 Refine documentation for `typefestConfigNames` to ensure clarity on preset keys

- 📝 Introduce rule module definitions for `prefer-ts-extras-array-last` and `prefer-ts-extras-is-infinite`

- 🧪 Improve test mocks for `typed-rule.js` in `prefer-ts-extras-set-has` and `prefer-ts-extras-string-split` tests

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b496d4e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b496d4e9e7b79d90c1ca42dd8de32437f25a398d)


- ✨ [feat] Enhance ESLint Plugin with various improvements and optimizations

- 🛠️ [fix] Update memoization logic in `expression-boolean-memoizer.ts` to use `isDefined` for cache checks

- 🚜 [refactor] Simplify import handling in `import-insertion.ts` by removing unused functions and optimizing imports

- 🛠️ [fix] Improve type operation counter in `safe-type-operation.ts` by removing unnecessary parameters

- ✨ [feat] Add runtime plugin shape validation in `plugin-entry.test.ts` to ensure correct exports

- 🧪 [test] Enhance test coverage for `prefer-ts-extras-set-has` and `prefer-ts-extras-string-split` rules with mock utilities

- 📝 [docs] Update comments and documentation for clarity and consistency across multiple files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(00fc246)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/00fc24679cd832ceed639e19414838bcad265851)


- ✨ [feat] Enhance ESLint Plugin with New Rules and Performance Improvements

- 🆕 Add `prefer-ts-extras-set-has` rule to improve set membership checks.

- 🆕 Introduce `prefer-ts-extras-string-split` rule for string manipulation.

- 🔍 Implement benchmarks for new rules to ensure performance and correctness.

- 🛠️ Refactor existing rules to utilize `safeCastTo` for better type safety.

- 🛠️ Introduce `memoizeExpressionBooleanPredicate` for efficient boolean expression evaluation.

- 📦 Add stress test fixtures for `set-has` and `string-split` to validate performance.

- 📝 Update documentation to include pre-publish checklist for package validation.

- 🧪 Add unit tests for `memoizeExpressionBooleanPredicate` to ensure caching behavior.

- 🧪 Improve existing tests for `prefer-ts-extras-set-has` and `prefer-ts-extras-string-split` rules.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a1e6f4b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a1e6f4ba9c120d62306db5a2868e1495f5a3a5df)


- ✨ [feat] Update dependencies and enhance parser options handling

- 🔧 Update `@eslint/compat` to version `2.0.3` and `@eslint/config-helpers` to `0.5.3` in package.json and package-lock.json

- 🔧 Upgrade `eslint` to version `10.0.3` in package.json and package-lock.json

- 🛠️ Introduce `FlatParserOptions` type for normalized parser options in plugin.ts

- 🛠️ Implement `normalizeParserOptions` function to handle default parser options

- 🧪 Refactor parser options retrieval in `withTypefestPlugin` function to use `normalizeParserOptions`

- 📝 Update test cases in plugin-source-configs.test.ts for renamed config variables

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(be1768e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/be1768ecb0caa251823fc6c1092d59ce7d103df9)


- ✨ [feat] Introduce 'recommended-type-checked' configuration for ESLint plugin

- 🆕 Added 'recommended-type-checked' to typefestConfigNames for enhanced type checking.

- 🆕 Updated typefestConfigReferenceToName to include 'recommended-type-checked'.

- 🔄 Modified typefestConfigsDefinition to include a new preset for 'recommended-type-checked' with type-aware rules.

- 🔄 Adjusted rule configurations to set 'recommended' to false for several rules, now included in 'recommended-type-checked'.

- 🔄 Updated rule metadata to ensure compatibility with the new configuration.

- 🔄 Refactored rule definitions to ensure they align with the new type-checked recommendations.

- 🧪 Added tests to validate the new 'recommended-type-checked' configuration and its rules.

- 🧪 Updated existing tests to reflect changes in rule recommendations and configurations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3e11f34)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3e11f3414a7deda15d7ca4ce1dc9b33175f9cea5)


- ✨ [feat] Add deMorgan ESLint plugin and update dependencies

- 🆕 Import `eslint-plugin-de-morgan` for enhanced rule checks

- 📦 Update `@vitest/ui` and `eslint-plugin-de-morgan` versions in package files

- 🗑️ Remove obsolete `rule-docs-url.ts` file

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ab8742)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ab87429abba03528830985abc2645c04f1d56b8)


- ✨ [feat] auto-enable parser services and centralize preset membership

✨ Add automatic `projectService` parserOptions for any preset that needs type checking and note the behavior in README/docs

- `recommended` preset now enables type-aware parsing by default

- manual configs can override but wiring is automatic when `requiresTypeChecking` is true

🚜 Extract rule‑to‑preset membership into a new static registry

- drop dynamic metadata scanning, normalization, and `docs.url` boilerplate in each rule

- validate membership arrays and dedupe rule lists during preset derivation

- simplify plugin startup and remove legacy syncing helpers

🧹 Simplify plugin exports and package metadata

- streamlined `plugin.mjs` to spread builtPlugin

- updated `package.json` exports structure and added Typescript peer dependency

- disable `require-meta-docs-url` rule in lint config

🧪 Revise tests accordingly

- import source plugin instead of built entry

- remove extensive runtime‑branch and metadata‑decoration tests

- add coverage for parserOptions.projectService and preset membership

- adjust docs‑integrity and config tests to reflect new behavior

📝 Update documentation

- clarify parser setup notes across README and docusaurus pages

- mention that presets include `projectService` and when to extend configs

These changes aim to reduce duplication, improve reliability of presets, and make parser setup seamless for users.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3e52bb0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3e52bb09e51b587351e8927e947ee7d34ca57c7f)


- ✨ [feat] Enhance import insertion functionality and add failure handling


- 🛠️ [fix] Modify `createImportInsertionFix` to accept an optional `moduleSpecifierHint` parameter, allowing for more flexible import handling when the specifier cannot be inferred from the import text.

- 🔧 [build] Update calls to `createImportInsertionFix` in `imported-type-aliases.ts` and `imported-value-symbols.ts` to include the new `moduleSpecifierHint` parameter.

- 📝 [docs] Add detailed comments to `createImportInsertionFix` explaining the new parameter and its purpose.

- ⚡ [perf] Introduce a maximum recursive depth in `areEquivalentNodeValues` to prevent stack overflow errors during deep structural comparisons.

- 🧪 [test] Add tests for `createImportInsertionFix` to verify correct behavior when using `moduleSpecifierHint`.

- 🧪 [test] Implement tests for `areEquivalentNodeValues` to ensure it fails gracefully for deeply nested structures.

- 🧪 [test] Create comprehensive tests for the new failure handling in `safe-type-operation`, including local and global observer notifications.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f06b2d9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f06b2d997d21d0567915dbabcac36bbc49f50ae5)


- ✨ [feat] Enhance TypeFest rules with new options and improvements

- 🛠️ [fix] Update `prefer-ts-extras-set-has` rule to support `unionBranchMatchingMode` options for better union handling

- 🛠️ [fix] Modify `prefer-type-fest-except` rule to include `enforceBuiltinOmit` option for controlling Omit enforcement

- 🛠️ [fix] Add `enforceLegacyAliases` and `enforcePromiseUnions` options to `prefer-type-fest-promisable` rule for more flexible alias handling

- 🛠️ [fix] Introduce `enforcedAliasNames` option in `prefer-type-fest-require-exactly-one` rule to customize alias enforcement

- 🛠️ [fix] Enhance `prefer-type-fest-tagged-brands` rule with options for ad-hoc brand intersections and legacy alias enforcement

- 🛠️ [fix] Add `enforcedAliasNames` option to `prefer-type-fest-tuple-of` rule for better alias management

- 🧪 [test] Update tests for `prefer-ts-extras-set-has` to validate new union matching options

- 🧪 [test] Enhance tests for `prefer-type-fest-except` to check behavior with `enforceBuiltinOmit` option

- 🧪 [test] Add tests for `prefer-type-fest-promisable` to ensure correct handling of legacy aliases and promise unions

- 🧪 [test] Update tests for `prefer-type-fest-require-exactly-one` to validate alias enforcement options

- 🧪 [test] Enhance tests for `prefer-type-fest-tagged-brands` to check new enforcement options

- 🧪 [test] Add tests for `prefer-type-fest-tuple-of` to validate alias enforcement behavior

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(46a0938)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/46a0938464a8b70ba3aea1023157589517fc8b17)


- ✨ [feat] Enhance TypeFest ESLint rules with ts-extras utilities

- 🔧 [refactor] Update `prefer-type-fest-literal-union.ts` to use `arrayFirst` and `arrayJoin` for improved literal union text generation.

- 🔧 [refactor] Modify `prefer-type-fest-primitive.ts` to utilize `setHas` for checking primitive keyword types.

- 🔧 [refactor] Revise `prefer-type-fest-promisable.ts` to incorporate `isDefined` and `arrayFirst` for better promise inner type extraction.

- 🔧 [fix] Correct parameter order in `keyIn` function in `prefer-ts-extras-key-in` tests for consistency with utility function.

- 🔧 [fix] Adjust `prefer-ts-extras-key-in` and `prefer-ts-extras-key-in.valid.ts` tests to reflect the correct usage of `keyIn`.

- 🔧 [test] Add new test cases for `arrayFirst`, `arrayIncludes`, and `arrayLast` to ensure proper handling of optional chains and return-like patterns.

- 🔧 [test] Implement logical guard checks in `prefer-ts-extras-array-includes` and `prefer-ts-extras-object-has-in` tests to validate suggestions for `arrayIncludes` and `objectHasIn`.

- 🔧 [test] Introduce logical guard and side-effect checks in `prefer-ts-extras-set-has` to ensure correct usage of `setHas`.

- 🔧 [test] Enhance `prefer-ts-extras-object-has-own` tests with logical guard checks to validate suggestions for `objectHasOwn`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6a02cd3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6a02cd3f09977c68334884e0f51efc61de550d8d)


- ✨ [feat] Add comprehensive audit prompt for repository quality and scalability

- Introduce a new prompt for deep-scan and refactor tasks aimed at enhancing stability, performance, and maintainability.

- Outline categories of issues to address, including fragility, consistency, architectural integrity, and production readiness.

- Provide a structured execution plan for searching, analyzing, refactoring, and validating code changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(042e729)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/042e729588719f03e61fab404d0cfdd6c8bfbe7f)


- ✨ [feat] Introduce isDefined utility from ts-extras for nullish checks

- 🔧 Update nullish-comparison.ts to use isDefined for better readability and consistency in null checks.

- 🔧 Modify report-adapter.ts to replace undefined checks with isDefined for clarity.

- 🔧 Refactor scope-variable.ts to utilize isDefined for variable existence checks.

- ✨ Add typescript-eslint-node-autofix.ts to implement type-aware guardrails for suppressing risky autofixes on AST-node expressions.

- 🔧 Update plugin.ts to enhance parser options validation using isDefined.

- 🔧 Refactor multiple rules (prefer-ts-extras-is-defined, prefer-ts-extras-is-empty, prefer-ts-extras-is-equal-type, etc.) to leverage isDefined for improved null checks.

- 🧪 Add tests to ensure correct behavior of new isDefined checks in various rules.

- 🧪 Enhance test coverage for scope-variable to handle cyclic scope chains.

- 🧪 Introduce new test cases for inline AST node checks to validate autofix suppression logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(647d69f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/647d69f6f8475e274d3e02e4e806df224f46da47)


- ✨ [feat] Implement import insertion coordination and enhance type import handling

- Introduced `ImportFixIntent` type for managing autofix and suggestion intents in import insertion.

- Added `shouldIncludeImportInsertionForReportFix` function to determine if import insertion should be included based on context.

- Refactored existing type import functions to utilize the new import insertion logic.

- Updated ESLint rule implementations to support suggestion intents for type imports.

- Enhanced unit tests to verify self-contained suggestion-intent fixes with import insertion.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5879928)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5879928457bb7615018776d8c03f0ea213e0388f)


- ✨ [feat] Enhance import insertion handling and deduplication logic

- 🛠️ Introduced a caching mechanism for import-insertion claims using a WeakMap to prevent duplicate import fixes within the same lint pass.

- 🔧 Added functions to create deduplication keys for import insertions and to check if an import insertion has already been claimed for a given program node.

- ⚡ Updated the logic in various fixer functions to conditionally attach import insertion fixes based on deduplication checks.

- 📝 Modified parameters in several functions to include a new `dedupeImportInsertionFixes` flag, allowing for more granular control over import insertion behavior.

🧪 [test] Add tests for deduplication of import insertions

- ✅ Implemented tests to verify that multiple reports in the same lint pass correctly deduplicate import insertion fixes.

- ✅ Ensured that the tests cover scenarios where multiple references to the same import are made, confirming that only one import statement is added to the output.

🧹 [chore] Clean up test outputs

- 🧹 Removed redundant output arrays in test cases, simplifying the expected output to focus on the second pass output for clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e5b98f0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e5b98f0f409c34817972c2da205e1c7e8eb5d936)


- ✨ [feat] Introduce runtime harness for prefer-ts-extras-assert-present tests

- 🆕 Added a new file `prefer-ts-extras-assert-present-runtime-harness.ts` containing utilities for testing the `prefer-ts-extras-assert-present` rule.

- 📜 Defined types for `ReplaceTextOnlyFixer` and `ReportDescriptor` to facilitate structured reporting in tests.

- 🔧 Implemented various functions to build guard text, throw text, and assert present guard code, enhancing test coverage for different scenarios.

- 🔍 Included parsing utilities to extract relevant AST nodes from code, improving the ability to analyze and test the rule's behavior.

🧪 [test] Refactor tests for prefer-ts-extras-assert-present rule

- 🔄 Updated `prefer-ts-extras-assert-present.test.ts` to utilize the new runtime harness for generating test cases.

- 🧩 Removed redundant inline code snippets and replaced them with structured test cases using the new harness functions.

- ✅ Ensured that invalid and valid test cases are clearly defined and utilize the new utilities for better maintainability and readability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f0826fe)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f0826fe3c507b5dcd2fc7a6d9c68c6cc318f9021)


- ✨ [feat] Enhance fixer parse-safety coverage tests

- 🛠️ Refactor `collectRuleIdsRequiringParseSafety` to utilize `typefestPlugin.rules` directly, removing the need for file system access.

- 🔍 Introduce `ruleRequiresParseSafetyCoverage` function to determine if a rule requires parse safety coverage based on its metadata.

- 📝 Add helper functions `pushRuleIdIfMarkerMissing` and `expectNoMissingRuleCoverage` for better test assertions regarding missing markers in rule tests.

- 📜 Update test logic to check for multiple markers in rule test files, including `parseForESLint`, `fc.assert`, `fc.property`, and `fast-check:`.

🧪 [test] Improve test coverage for `prefer-ts-extras-is-present`

- 🔧 Add new test cases to ensure that autofixes for loose null comparisons remain parseable and do not trigger second-pass binary reports.

- 🔄 Implement checks for aliased imports of `isPresent` to ensure they are preserved after autofixes.

- 🛠️ Introduce utility functions for parsing variable initializers and extracting call expressions to streamline test logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(25e991b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25e991bb37399af03b9e1d19e9abe9248095f24e)


- ✨ [feat] Enhance homepage with GitHub stats and improve layout

- 🆕 Add GitHubStats component to display live repository badges

- 🎨 Update index.jsx to include GitHubStats and improve hero section layout

- 🎨 Refactor hero badges to include descriptions and icons for better clarity

- 🎨 Revamp CSS styles for hero section, badges, and stats for improved aesthetics

- 🎨 Adjust layout and spacing in index.module.css for better responsiveness

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1489fe5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1489fe589c1e44b4fdb47256ced3177967844d7c)


- ✨ [feat] Enforce canonical docs & expand rule guides

📝 [docs] Flesh out every helper rule page with

- “Targeted pattern scope” sections, clearer example labels,
   package‑documentation blocks, migration notes and links.

- Added dozens of ts‑extras/type‑fest helper snippets and
   canonical headings so the guides are self‑contained.

✨ [feat] Introduce a remark‑lint plugin to verify and
 enforce the H1/H2 schema for rule docs

- wired into .remarkrc and used by test suite.

🧪 [test] Update docs‑integrity spec to assert heading order,
 package labels and redact legacy patterns.

- Add new cases for reversed `typeof undefined` to the
   prefer‑ts‑extras‑is‑defined‑filter rule.

🛠️ [fix] Improve prefer‑ts‑extras‑is‑defined‑filter logic to
 catch inverted typeof checks and add corresponding tests.

🧹 [chore] [dependency] Update various dev dependencies (stylelint‑a11y,
 stryker, npm‑check‑updates, eslint‑plugin‑package‑json, etc.)
 and tidy package.json.

The changes raise documentation quality, make future edits
deterministic and reduce manual review churn while
handling a subtle predicate bug.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5ef9c15)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5ef9c157b9304ef69f1c4c3b9fa3ede02ddae86f)


- ✨ [feat] Enhance unicode and emoji support in autofixes

- 🛠️ Add tests for preserving unicode, emoji, and nerd-font glyphs in argument text

- 🛠️ Implement trimming of unicode spacing around argument text before replacement

- 🛠️ Introduce autofix for canonical undefined guard in unicode-rich source text

- 🛠️ Add autofix for canonical nullish guard in unicode-rich source text

- 🛠️ Support unicode and emoji in loose null equality checks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7349e48)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7349e48baf605c4457a8fe27765bb29cd998122a)


- ✨ [feat] Add global identifier guards and expand test coverage

✨ Introduce robust global‑scope helpers and apply them across rules

- add `isGlobalIdentifierNamed`, `isGlobalUndefinedIdentifier` and
   `getVariableInScopeChain` to typed‑rule

- export new regex constants for test file detection and normalize
   lookup logic

- adapt rule implementations to accept context and use the new checks
   so shadowed globals (e.g. `undefined`, `Number`, `Object`, `Error`,
   etc.) no longer trigger false positives

🚜 Refactor internal helpers for clarity

- update `isReadonlyUtilityWrappedText` to trim and use constant name

- sprinkle `RuleContext` aliases and tidy imports for TSESLint/TSESTree

- simplify test‑file path routine with reusable patterns

🧪 Vastly expand automated tests

- add coverage for array‑like expressions, import insertion, imported
   type/value symbols, normalization, typed‑rule utilities, plugin
   entry runtime branches and new rule‑guard suite

- enrich rule specs with shadowing, malformed AST ranges, recursive
   types, non‑identifier guards, undocumented edge cases and more

- ensure every rule short‑circuits on test file paths

🛠️ Fix edge cases and add safe fallbacks

- handle invalid program ranges, disabled import fixes and detached
   nodes in import insertion

- guard against volatile/throwing fix getters in report descriptors

- protect listeners from synthetic or malformed nodes

💡 Improve detection logic and source assertions

- weave global checks into rule source tests

- reuse patterns for test directory segments and suffixes

🧹 Miscellaneous cleanup

- update typings, add `UnknownArray` imports, and minor style tweaks

These changes reduce false positives, harden rules against variable
shadowing, and significantly improve test reliability and coverage.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6ae4136)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6ae41360a5a5e5c6bdc1fafd67aa9400b0472e2f)


- ✨ [feat] Add plugin settings to control autofixes and shared helper utilities

✨ [feat] introduce global configuration flags for disabling import‑insertion
and all autofixes, with documentation and examples in README
🔧 [build] update eslint/tsconfig/package dependencies for new helpers and
plugins
🚜 [refactor] extract common logic into new internal modules (ast‑node,
filter‑callback, import‑insertion, plugin‑settings, type‑reference‑node,
normalize‑expression‑text) to eliminate duplication across rules
🚜 [refactor] migrate dozens of rules to use the shared helpers, simplify
type/node comparisons, and remove ad‑hoc parent traversal code
✨ [feat] enhance `createTypedRule` to respect disable‑all‑autofixes setting
and guard type assignability checks against checker errors
🧪 [test] add exhaustive unit tests for new utilities and settings; extend
rule tests for autofix gating and import‑insertion behaviour, update source
assertions
📝 [docs] add “Global settings” section to README; reorder table of contents
🧹 [chore] clean up package.json, tsconfig files, eslint config entries and
remove unused plugins
📦 [style] adjust formatting and comments across configuration files

These changes let users suppress unwanted fixes, ensure safe import insertion,
and reduce code drift by centralizing shared functionality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6b530ec)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6b530ece7f5f101f9d599fdacd7f526321060d6c)


- ✨ [feat] Update test coverage scripts and enhance JUnit reporting

- 🔧 Modify coverage job to run tests with JUnit report generation

- 📄 Add verification for JUnit artifact existence

- 📤 Implement upload of test results to Codecov

- 🔍 Refactor assertions in prefer-ts-extras-is-empty, prefer-ts-extras-is-infinite, and prefer-ts-extras-not tests to use regex matching for improved accuracy

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fe9b0b3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fe9b0b3d4133560154045a82ec981920ba847574)


- ✨ [feat] Add ESLint 9 compatibility checks and update documentation

- 🛠️ [fix] Implement ESLint 9 compatibility smoke checks in a new script

- 🔧 [build] Update CI configuration to include ESLint 9 compatibility job

- 📝 [docs] Add compatibility section to README with supported ESLint versions

- 🔧 [build] Update package.json and package-lock.json for ESLint 9 compatibility

- 🚜 [refactor] Simplify regex patterns in typed-rule.ts for test file detection

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8e7a5a8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8e7a5a8890c707d01bd8af285ff7bd3eb53a9698)


- ✨ [feat] Enhance ESLint Benchmarking and Add New Fixtures

- 🛠️ [fix] Update ESLint rule types to use `import("eslint").Linter.RulesRecord` for better type safety.

- ✨ [feat] Introduce new benchmark file globs for `recommendedZeroMessageFixture` and `safeCastToStressFixture`.

- 📝 [docs] Add `recommended-zero-message.baseline.ts` to provide a baseline workload for the recommended preset.

- 📝 [docs] Create `safe-cast-to.stress.ts` to test the `prefer-ts-extras-safe-cast-to` rule under stress conditions.

- ⚡ [perf] Improve `assertMeaningfulBenchmarkSignal` to accept options for maximum and minimum reported problems.

- ✨ [feat] Add new benchmarks for the `prefer-ts-extras-safe-cast-to` rule with both fixing and non-fixing scenarios.

- 👷 [ci] Update `run-eslint-stats.mjs` to handle new benchmark scenarios and improve reporting with comparison capabilities.

- 🧹 [chore] Introduce `codecov.yml` for better coverage reporting and management.

- 🎨 [style] Refactor `lint-actionlint.mjs` to improve output readability with colored console messages.

- ⚡ [perf] Optimize `vite.config.ts` to include source files in coverage reporting.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(72b72c3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72b72c3d76e79c5c48b80909a5f26f5d304afd53)


- ✨ [feat] Update rules to require 'frozen: false' for typefest ESLint rules

- 📝 Added 'frozen: false' to the documentation of multiple TypeFest ESLint rules to indicate that these rules are not frozen and can be modified in the future.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(110d7dd)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/110d7dd4ad77096226ed311227c6e9dc54b8669a)


- ✨ [feat] Adds preset-tagged rule recommendations

✨ [feat] Expands rule documentation metadata to support preset-based recommendation tags, so guidance maps cleanly to multiple preset levels.

- Adds stricter metadata typing to improve consistency and catch invalid recommendation values earlier.

✨ [feat] Populates recommendation targets across the rule set, including core preset tiers and specialized preset groups.

- Improves downstream docs and config tooling by making recommendation intent explicit per rule.

🛠️ [fix] Tightens runtime validation for optional configuration inputs and nullable objects.

- Prevents empty or non-string values from being treated as valid and reduces fragile fallback behavior.

🚜 [refactor] Applies consistency cleanups in scripts and internal utilities, including style normalization and stricter readonly typing.
🧪 [test] Updates test helpers and mocks to align with stricter type expectations and explicit undefined checks.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(155c352)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/155c352f4fdb9a3ac38104a5b11b67ede23aefe4)


- ✨ [feat] Enhance TypeFest rule tests with detailed metadata and messages

- 🛠️ [fix] Refactor rule tests to include `ruleId`, `docsDescription`, and `messages` for better clarity and maintainability

- 📝 [docs] Update documentation strings to specify the purpose of each rule, emphasizing the preference for TypeFest types over aliases

- 🔧 [build] Add inline invalid and valid test cases for various TypeFest rules, ensuring comprehensive coverage

- ⚡ [perf] Optimize test structure by consolidating repetitive code patterns into reusable functions

- 🧪 [test] Introduce new test cases for edge scenarios, including whitespace formatting and generic type handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db8f3d9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db8f3d907e5b7dff0f98dc648045e96776573ba2)


- ✨ [feat] Enhance prefer-ts-extras-is-equal-type tests with metadata validation

- 📝 Add metadata loading function for `prefer-ts-extras-is-equal-type` rule

- ✅ Implement tests for stable report and suggestion messages

- 🔍 Include checks for default options, documentation, and suggestion messages

- 🔄 Add inline code examples for conflicting bindings and named imports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b7735ff)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b7735fff0c81b9b0e938e11e80f466824d347ee6)


- ✨ [feat] Enhance prefer-ts-extras-is-equal-type rule with ts-extras integration

- 🛠️ [fix] Add support for isEqualType function from ts-extras in ESLint rule

- 🔧 [build] Update test fixtures to include ts-extras imports and expected outputs

- 🧪 [test] Extend tests for aliased imports and ensure correct suggestions are provided

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(64beea6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/64beea69975339a2924f307a80baf25d38e4c3c7)


- ✨ [feat] Introduce local Typefest plugin dogfooding rules

- Added local Typefest plugin for manual dogfooding in ESLint configuration

- Defined explicit rules for Typefest utilities to enhance linting experience

- Updated section headers from "MARK" to "SECTION" for consistency across the config

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df8b7be)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/df8b7be5d4074457f8d826c979149f8f861f7c73)


- ✨ [feat] Implement script for temp directory cleanup

- 🛠️ Update hooks to use new PowerShell script for removing temp files

- 🛠️ Replace inline commands with calls to `.github/hooks/scripts/remove-temp.ps1`

- 🛠️ Add logging prompts for Linux and OSX in hooks

- 📝 Create `remove-temp.ps1` script to handle temp directory cleanup

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(98e032b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/98e032b352efbe56862f5912aaab20d094319018)


- ✨ [feat] Update node configuration and dependencies

- 🔧 Change "test" directory to "tests" in node options for file system read permissions

- 🔧 Add additional files to allow file system read permissions including package-lock.json, tsconfig.build.json, eslint.config.js, README.md, CHANGELOG.md, and LICENSE

- 🔧 Enable extra info on fatal exceptions in node options

- 🔧 Update test runner configuration to include new test file patterns and coverage settings

- 🔧 Add support for TypeScript files with .mts extension in coverage include patterns

- 🔧 Update test coverage thresholds for branches, functions, and lines to 80%

- 🔧 Adjust test concurrency settings based on CI environment

🔧 [chore] Update package dependencies

- 🔧 Add @stryker-ignorer/console-all package for improved mutation testing

- 🔧 Update stylelint-plugin-use-baseline to version 1.2.4

- 🔧 Update typedoc-plugin-dt-links to version 2.0.43

- 🔧 Remove eslint-plugin-no-hardcoded-strings as it is no longer needed

🧪 [test] Enhance test coverage for imported type aliases and value symbols

- 🧪 Add new tests for createSafeTypeNodeReplacementFix and createSafeTypeNodeTextReplacementFix functions

- 🧪 Implement tests for imported-value-symbols including collectDirectNamedValueImportsFromSource and related functions

- 🧪 Ensure tests cover various scenarios including type-only imports, different source modules, and multiple local aliases

🧪 [test] Add tests for plugin source configurations

- 🧪 Verify that plugin configurations build correctly and contain expected rules

- 🧪 Ensure parser defaults and plugin namespace are registered properly

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c39e3d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5c39e3d5254fd081c9bd94a35933f21cd396893e)


- ✨ [feat] Add Stryker mutation testing configuration

- 🛠️ [config] Create .github/workflows/stryker.yml for scheduled and manual mutation testing

- 🔧 [build] Update package.json scripts for Stryker with concurrency and incremental file options

- 🔧 [build] Upgrade knip dependency to version 5.85.0

- 🛠️ [config] Enhance stryker.config.mjs with dashboard integration and improved concurrency settings

- 🛠️ [config] Adjust thresholds for mutation testing to improve quality metrics

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7608574)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7608574ff670f60b3822c80f981c06e41e61e748)


- ✨ [feat] Update ESLint configuration and dependencies

- 🔧 Update environment variable for JSON schema validation from `UW_ENABLE_JSON_SCHEMA_VALIDATION` to `ENABLE_JSON_SCHEMA_VALIDATION`

- 🔧 Change ESLint progress mode variable from `UW_ESLINT_PROGRESS` to `ESLINT_PROGRESS`

- 🔧 Upgrade `eslint-plugin-node-dependencies` from `1.3.0` to `2.0.0`

- 🔧 Update dependencies in `eslint-plugin-node-dependencies` to their latest versions

- 🔧 Modify `package.json` to reflect the updated version of `eslint-plugin-node-dependencies`

🛠️ [fix] Refactor internal logic for variable resolution in scope

- 🔧 Introduce `getVariableInScopeChain` to streamline variable resolution across scopes

- 🔧 Refactor `isLocalNameBoundToExpectedImport` to utilize the new variable resolution function

✨ [feat] Enhance TypeFest plugin rule definitions

- 🔧 Define new rule names for TypeFest and TypeScript extras

- 🔧 Refactor `typefestRules` to use a more structured approach for rule definitions

- 🔧 Update the `TypefestRuleId` and `TypefestRuleName` types for better type safety

🧪 [test] Improve typed rule tester and runtime tests

- 🔧 Specify the type of `typedRuleTester` for better type inference

- 🔧 Refactor runtime tests to ensure proper mocking and reset of modules

📝 [docs] Update TypeScript configuration files

- 🔧 Set `isolatedDeclarations` to `true` in `tsconfig.build.json` for better module isolation

- 🔧 Adjust `tsconfig.eslint.json` to include `isolatedDeclarations` for consistency

- 🔧 Modify `tsconfig.json` to enable `declaration` and `declarationMap` for improved type definitions

🎨 [style] Refactor Vite configuration for clarity

- 🔧 Define `vitestConfig` with explicit type for better readability and maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8afc040)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8afc040b174fd9de7074b1ef149837163aa8dddf)


- ✨ [feat] Adds import-safe autofixes to lint rules

✨ [feat] Expands many helper/type preference diagnostics to deliver automatic fixes or targeted suggestions, reducing manual migrations while keeping behavior stable.

- Applies rewrites only when required imports exist and local scope checks confirm replacements are safe.

- Falls back to non-fixing reports or suggestions when safety cannot be proven.

- Tightens pattern matching for guard, nullish, and infinity checks so automatic rewrites only occur for semantically reliable forms.

🚜 [refactor] Introduces shared safe-replacement utilities for full type-node and custom-text substitutions, unifying fix generation across value and type rule paths.

🛠️ [fix] Preserves runtime boolean semantics in type-equality rewrites to prevent logical drift during suggested replacements.

🔧 [build] Updates lint-related dependency versions to align with newer parser/plugin compatibility.

🧪 [test] Adds broad invalid-case coverage with expected autofix and suggestion outputs to verify safety gates and rewrite correctness.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bfc3d8d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bfc3d8d98165dd6866d558d059a2f6cd46369752)


- ✨ [feat] Adds safe autofixes for preference rules

✨ [feat] Enables automatic rewrites to preferred utility-style calls when compatible value imports are already in scope.

- Improves rule usability by turning actionable guidance into one-step fixes.

- Preserves behavior by rewriting receiver-based method/member usage into equivalent function-call forms.

🚜 [refactor] Introduces shared, scope-aware import resolution and fixer builders used across array/object preference checks.

- Resolves direct named and aliased value imports while ignoring type-only imports.

- Verifies symbol binding through scope lookup to avoid unsafe fixes when names are shadowed or unresolved.

- Applies fixes only for safe syntax patterns and marks the updated rules as code-fixable for consistent tooling behavior.

🧪 [test] Expands coverage with inline autofix scenarios for all updated preference checks.

- Validates expected transformed output when safe imports exist.

- Retains non-fixable and report-only paths to reduce regression risk.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(25a1784)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25a1784bf26d1d3e9023f21ed2d2023e1d628e02)


- ✨ [feat] Add authors configuration for blog

- Introduced authors.yml to define contributors for the blog

- Added Alice Example with image, title, and social links

- Added Nick2bad4u with image, title, permalink, and social links

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(53bf4a6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/53bf4a66503c9a0274fea8af7b4cc1ee70c485ac)


- ✨ [feat] Add favicon and enhance ESLint Config Inspector build script

- 🆕 Introduce favicon.ico to Docusaurus static assets for improved branding

- 🔧 Refactor build-eslint-inspector.mjs to streamline the build process

- 📦 Implement local testing version creation for easier development

- 🔄 Update asset path fixing logic for better subdirectory deployment

- 📄 Create index redirect page for improved SEO and usability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2359e0c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2359e0c73d136715759ac931708f1f494a23a447)


- ✨ [feat] Enhance documentation and CI workflow

- 📝 [docs] Add CLI debugging and config inspection guide

- 📝 [docs] Create IDE integration guide for VS Code

- 📝 [docs] Introduce maintainer performance profiling documentation

- 📝 [docs] Provide examples for Node.js ESLint API usage

- 🔧 [build] Update deploy workflow to include full git history and build steps

- 🛠️ [fix] Add processors property to plugin contract for compatibility

- 🧪 [test] Implement rule metadata integrity tests to ensure proper documentation and schema

- 🎨 [style] Add logo images for improved branding

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a8ce34a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a8ce34af2b417febf44ca290ff535ba226c44a7f)


- ✨ [feat] Integrate Stryker for mutation testing and enhance changelog generation

- 🔧 Add scripts for changelog generation, preview, and release notes using git-cliff

- 🛠️ Introduce Stryker configuration for mutation testing with TypeScript support

- 🧪 Add mutation testing commands to package.json for local and CI environments

- 🎨 Create a new vitest configuration file for Stryker to manage test execution

- 📝 Update tsconfig for ESLint to include new vitest configuration

- 🎨 Refactor type casting in imported-type-aliases test for improved readability

- 🎨 Adjust formatting in prefer-type-fest-tagged-brands test for consistency

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2c6b5ef)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2c6b5ef32519e49d3162d67786ba71cce83daf01)


- ✨ [feat] Adds TypeFest typing preference rules

✨ [feat] Expands typed linting to standardize common type patterns on canonical utility aliases.

- Replaces ad-hoc constructor, abstract-constructor, deep utility, and exclusive-union patterns with consistent utility-first guidance.

- Improves type consistency across projects and reduces alias drift between teams.

- Preserves better literal-union authoring ergonomics while keeping primitive compatibility.

🚜 [refactor] Updates plugin registration and typed rule grouping to include the new preferences.

- Ensures new rules are exposed and categorized with existing type-focused rule sets.

- Keeps test-file paths excluded to avoid noisy or misleading diagnostics in test code.

📝 [docs] Adds full rule documentation for each new preference.

- Provides rationale, incorrect/correct examples, flat-config usage, and opt-out guidance to support adoption.

🧪 [test] Adds typed fixtures and rule coverage for valid, invalid, and skipped-path scenarios.

- Confirms diagnostics trigger only on intended patterns and remain silent in test fixtures.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(dcd7a6f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/dcd7a6ffeea657c615551a71e08bcf6e7afbc4df)


- ✨ [feat] Add modern docs UI enhancements

✨ [feat] Adds a client-side enhancement module to improve documentation site UX with scroll progress feedback, interactive hover behavior, fallback reveal animations, theme-toggle animation, dynamic accents, and desktop cursor lighting.

- Re-initializes effects after route transitions and cleans up listeners, observers, timers, and injected elements to keep SPA navigation stable and prevent stale handlers.

- Respects reduced-motion preferences and mobile breakpoints so enhancements stay accessible and lightweight across devices.

📝 [docs] Updates rule and test helper comments to use clearer, more consistent parameter and return wording.

- Improves readability and maintenance confidence without changing runtime or linting behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d81f477)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d81f47784ebb46ade581d9f8f58fd073bd088608)


- ✨ [feat] Enhance documentation structure and content for eslint-plugin-typefest

- 📝 [docs] Update docusaurus configuration to include new pages for rules overview and getting started

- 📝 [docs] Add new sidebar categories and links for presets and rules

- 📝 [docs] Create detailed markdown files for each preset: minimal, recommended, strict, all, type-fest types, and type-guards

- 📝 [docs] Introduce getting started and overview documentation to guide users

- 🎨 [style] Update CSS styles to accommodate new sidebar categories and enhance visual hierarchy

- 🧹 [chore] Add type definitions for custom CSS modules to improve TypeScript support

- 🔧 [build] Include typed-css-modules in package.json for CSS module type generation

- 🧹 [chore] Clean up package.json and package-lock.json to ensure proper dependency management

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a73ec43)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a73ec4395f4b8c8977837a94ca16fbb998da3989)


- ✨ [feat] Update Docusaurus homepage links and text

- 🔗 Change the primary button link from "/docs/getting-started" to "/docs/intro"

- 📝 Update button text from "Read the docs" to "Start with Overview"

- 🔗 Change the secondary button link from "/docs/rules" to "/docs/developer/api"

- 📝 Update button text from "Browse rules" to "Explore Developer API"

🛠️ [fix] Enhance ESLint configuration for CSS and Docusaurus

- 🎨 Add new ESLint plugins: "@docusaurus/eslint-plugin", "eslint-plugin-css-modules", "eslint-plugin-no-hardcoded-strings", and "eslint-plugin-undefined-css-classes"

- ⚙️ Update ESLint rules for CSS files to include checks for empty blocks and undefined CSS classes

- 🔧 Adjust Docusaurus ESLint rules to improve code quality and maintainability

🔧 [build] Update package dependencies

- 📦 Upgrade "eslint-plugin-compat" to version 6.2.0

- 📦 Upgrade "eslint-plugin-jsdoc" to version 62.6.0

- 📦 Upgrade "eslint-plugin-sonarjs" to version 4.0.0

- 📦 Upgrade "eslint-plugin-storybook" to version 10.2.10

- 📦 Upgrade "eslint-plugin-toml" to version 1.1.1

- 📦 Upgrade "eslint-plugin-yml" to version 3.2.1

- 📦 Upgrade "storybook" to version 10.2.10

- 📦 Upgrade "typescript" peer dependency to version 5.9.3

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(413a896)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/413a896d53a2576852b4bc02e554478137e50477)


- ✨ [feat] Enhance ESLint Plugin and Documentation


- 🛠️ [build] Add workspaces support for Docusaurus in package.json

- 📝 [docs] Introduce new scripts for documentation management:
  
- 📜 [scripts] Add build-eslint-inspector.mjs to build static ESLint Config Inspector
  
- 🔗 [scripts] Implement check-doc-links.mjs to verify documentation links
  
- 🧹 [scripts] Create lint-actionlint.mjs for linting GitHub Actions workflows
  
- ✅ [scripts] Add verify-eslint-inspector.mjs to validate ESLint Inspector integration

- 🛠️ [fix] Update tsconfig.eslint.json to include TypeScript files in docs directory

- 📝 [docs] Add tsdoc.json for TypeScript documentation configuration

- 🧹 [chore] Clean up and optimize existing scripts for better maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(17f1583)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/17f1583bc3a8ca11d587c827ac23d73895fd8c98)


- ✨ [feat] Enhance TypeFest ESLint Plugin with TypeScript Support

- 🆕 Add TypeScript parser as a dependency to improve compatibility with TypeScript files.

- 🔧 Update package.json to include TypeScript as a peer dependency, ensuring users have the correct version.

- 🛠️ Refactor plugin structure to utilize TypeScript types for improved type safety and clarity.

- 📜 Introduce detailed documentation for ESLint rules related to TypeFest and TypeScript utilities.

- 🔄 Restructure rule definitions to enhance maintainability and readability.

- 🧪 Update tests to validate new configurations and ensure all rules are correctly registered.

- 🔍 Ensure that experimental rules are properly categorized and excluded from stable configurations.

- 📝 Modify test cases to reflect changes in the plugin's configuration structure and rule registration.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(58d2f8d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/58d2f8dad12ea27c2417c65490cc542b18a0bcbd)


- ✨ [feat] Add new ESLint rules for TypeScript extras

- 🎉 Introduced `prefer-ts-extras-is-equal-type` rule to encourage the use of `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertions.

- 🎉 Introduced `prefer-ts-extras-is-present` rule to promote the use of `isPresent(value)` from `ts-extras` instead of inline nullish comparisons outside filter callbacks.

- 🛠️ Implemented logic to identify and suggest replacements for `IsEqual<T, U>` and nullish checks in the codebase.

- 📚 Updated documentation links for both rules to ensure users can access relevant information.

🧪 [test] Add tests for new ESLint rules

- ✅ Created test cases for `prefer-ts-extras-is-equal-type` to validate correct identification and suggestion of type equality checks.

- ✅ Created test cases for `prefer-ts-extras-is-present` to ensure proper detection of nullish comparisons and provide suggestions for using `isPresent`.

📝 [docs] Update documentation and test fixtures

- 📄 Added new documentation files for the newly created rules to guide users on their usage.

- 📄 Created valid and invalid test fixtures for both rules to ensure comprehensive testing coverage.

🎨 [style] Refactor existing test and configuration files

- 🧹 Cleaned up import statements in test files for consistency.

- 🧹 Adjusted test structure to improve readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e731149)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e7311497fccdd2a094cde912c332f28b562a9adb)


- ✨ [feat] Enhance ESLint configuration with new rules and plugins

- 🔧 Import `defineConfig` and `globalIgnores` from `@eslint/config-helpers`

- 🔧 Update ESLint rules to include `@eslint-community/eslint-comments` for better comment handling

- 🔧 Reintroduce TypeScript rules for `tsdoc` and `unused-imports`

- 🔧 Adjust various rule settings for improved linting accuracy and performance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2cb3cac)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2cb3cac8a808b97edc8e28aecad7c65bce1c22b0)


- ✨ [feat] Introduce new rules for TypeScript extras


- ✨ [feat] Add `prefer-ts-extras-as-writable` rule
  
- Enforces the use of `asWritable(value)` from `ts-extras` over `Writable<T>` assertions from `type-fest`.
  
- Includes logic to identify and report incorrect usages in TypeScript files.
  
- Provides comprehensive tests for valid and invalid cases.


- ✨ [feat] Add `prefer-ts-extras-safe-cast-to` rule
  
- Requires the use of `safeCastTo<T>(value)` from `ts-extras` for type-safe assertions instead of direct `as` casts.
  
- Implements checks to ensure type safety and reports violations.
  
- Includes tests to validate the functionality of the rule.


- 🛠️ [fix] Update imports to use `import type` for TypeScript types
  
- Changes imports in multiple files to use `import type` for better type-only imports, improving performance and clarity.


- 🧪 [test] Add tests for new rules
  
- Comprehensive test cases for both `prefer-ts-extras-as-writable` and `prefer-ts-extras-safe-cast-to` rules.
  
- Includes valid and invalid scenarios to ensure robust rule enforcement.


- 🧹 [chore] Update rule tester utilities
  
- Adjustments to the rule tester to accommodate new rules and ensure compatibility with existing tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7702d74)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7702d7457c6a6f278e1a3ed786e9c46fa04dc6d0)


- ✨ [feat] Add .madgerc and .npmpackagejsonlintrc.json configuration files

- Introduced .madgerc for managing TypeScript file extensions and visualization settings

- Configured file extensions including ts, tsx, js, and others for better compatibility

- Set up detective options for TypeScript and TSX with specific configurations

- Added .npmpackagejsonlintrc.json for npm package JSON linting rules

- Defined strict rules for dependencies, devDependencies, and various package properties

- Included validation for author names and license types to ensure compliance

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(52dea7a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/52dea7a2b170f4a07f7975d2c12f26773aa6fd5c)


- ✨ [feat] Enhance ESLint configuration and testing setup

- 🔧 [build] Update global ignores to include test fixtures

- 🔧 [build] Modify test file patterns for improved matching

- 🧪 [test] Refactor assertions to use toBeTruthy() for clarity

- 🧪 [test] Update test descriptions for better readability

- 🧪 [test] Ensure all exported configs register the plugin correctly

- 🧪 [test] Validate existence of documentation files for rules

- 🔧 [build] Adjust Vite configuration for parallel test execution

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(570a740)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/570a7402f6ea936368bf1dd9364c107327357582)


- ✨ [feat] Adds canonical TypeFest alias lint rules

✨ [feat] Adds new typed lint coverage that prefers canonical utility-type naming for index-signature omission and key-level non-nullable, readonly, and required transformations.

- Reduces migration friction across utility libraries and keeps public typing patterns consistent.

- Keeps intentional test-file skip behavior so checks stay focused on production-facing type usage.

📝 [docs] Documents the new rule set with clear check scope and rationale.

- Improves discoverability and explains why canonical naming is enforced.

🔧 [build] Updates lint and test infrastructure to better support rule adoption and test reliability.

- Introduces a dedicated test lint profile with testing-focused plugins and safeguards against focused-only tests.

- Adds serial and parallel test run scripts plus environment-driven worker and file-parallelism controls for faster local runs and safer CI defaults.

- Expands resolver project coverage and aligns configuration compatibility notes for newer ESLint runtime behavior.

🧪 [test] Adds comprehensive fixtures and rule tests for valid, invalid, namespace, and test-path skip scenarios.

- Strengthens plugin export assertions so newly added rules stay registered in exposed presets.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fdaf37b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fdaf37b4f0b1e9185e9d6b82c8cc11befb8f32d8)


- ✨ [feat] Adds canonical TypeFest alias rules

✨ [feat] Adds typed lint coverage that flags imported legacy aliases for all-or-none and at-least-one key groups, and steers usage toward canonical TypeFest utilities to reduce semantic drift.

- ✨ [feat] Registers the new checks in exported rules and the minimal preset so enforcement is available by default.

- ✨ [feat] Aligns plugin rule availability by including a previously missing TypeFest preference rule in registration and presets.

📝 [docs] Adds focused rule guides that explain detection scope and why canonical naming improves consistency and migration clarity.

🧪 [test] Expands typed fixtures and rule tests for invalid alias imports, valid canonical usage, namespace import exceptions, and skip-on-test-file behavior.

- 🧪 [test] Improves existing typed fixtures with additional non-trigger patterns to better guard against false positives.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f3d1dfc)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f3d1dfcb50479d3e1319af1e2f213eb5bb1692d1)


- ✨ [feat] Enforces canonical TypeFest aliases

✨ [feat] Adds broad lint coverage to prefer canonical utility names over legacy or deprecated imported aliases.

- Improves consistency and lowers migration friction by standardizing type utility vocabulary.

- Avoids unsafe autofix where migration requires semantic rewrites.

🚜 [refactor] Centralizes imported type-alias detection in a shared internal matcher.

- Reduces duplicated rule logic and keeps alias matching behavior uniform across checks.

✨ [feat] Expands preset exports with clearer semantic aliases and matching flat variants.

- Improves preset discoverability while preserving existing preset behavior.

🔧 [build] Upgrades lint tooling to the latest major and updates flat-config compatibility handling.

- Improves reliability by conditionally skipping incompatible third-party presets.

- Improves lint runtime with caching, content-based cache strategy, and higher memory limits.

📝 [docs] Documents new rule expectations and clarifies alias-based enforcement in existing guidance.

🧪 [test] Adds comprehensive typed fixtures and rule coverage, including namespace-import pass cases, test-file skip scenarios, and helper property tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(38e7310)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/38e73102067f20b68f8508b95171511b178e3705)


- ✨ [feat] Implement prefer-type-fest-non-empty-tuple rule

- 📝 Add documentation for the prefer-type-fest-non-empty-tuple rule

- 🛠️ Create the prefer-type-fest-non-empty-tuple rule logic

- 🔧 Integrate the rule into the ESLint plugin

- 🧪 Add test cases for valid and invalid usages of NonEmptyTuple

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4715139)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4715139acd6f3d0f1d0e4a506eee30c84f5fea23)


- ✨ [feat] Enhance TypeScript Extras with New Array and Assertion Utilities

- 🆕 [feat] Introduce `arrayFirst` and `arrayLast` utilities with valid and invalid test cases

- 🆕 [feat] Add `assertDefined`, `assertError`, and `assertPresent` utilities with corresponding test cases

- 🆕 [feat] Implement `isEmpty` and `isInfinite` checks with tests to validate their functionality

- 🆕 [feat] Create `objectHasIn` utility for object property checks with tests

- 🆕 [feat] Expand TypeFest integration with `Arrayable`, `JsonArray`, `JsonObject`, and `JsonPrimitive` types

- 🆕 [feat] Add tests for TypeFest utilities to ensure correct usage and validation

- 🧪 [test] Add comprehensive tests for all new features to ensure expected behavior and error handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e2d0ec0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e2d0ec00a7925321774f10dcbf9c8237464584b3)


- ✨ [feat] Update package.json and package-lock.json with new remark packages

- Add "remark" and "remark-cli" for enhanced markdown processing

- Include "remark-lint" for linting markdown files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a324362)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a3243623759d4219255e750c02b216e6bb5f224d)


- ✨ [feat] Update package.json and package-lock.json with new remark-lint rules

- 🆕 Add "remark-lint-check-toc" version 1.0.0 for table of contents checks

- 🆕 Add "remark-lint-heading-capitalization" version 1.3.0 for heading capitalization checks

- 🆕 Add "remark-lint-list-item-spacing" version 5.0.1 for list item spacing checks

- 🆕 Add "remark-lint-maximum-heading-length" version 4.1.1 for heading length checks

- 🆕 Add "remark-lint-maximum-line-length" version 4.1.1 for line length checks

- 🆕 Add "remark-lint-mdx-jsx-attribute-sort" version 1.0.1 for MDX JSX attribute sorting

- 🆕 Add "remark-lint-mdx-jsx-no-void-children" version 1.0.1 for MDX JSX void children checks

- 🆕 Add "remark-lint-no-duplicate-defined-urls" version 3.0.1 for duplicate URL checks

- 🆕 Add "remark-lint-no-empty-url" version 4.0.1 for empty URL checks

- 🆕 Add "remark-lint-no-file-name-mixed-case" version 3.0.1 for mixed case file name checks

- 🆕 Add "remark-lint-no-heading-punctuation" version 4.0.1 for heading punctuation checks

- 🆕 Add "remark-lint-no-literal-urls" version 4.0.1 for literal URL checks

- 🆕 Add "remark-lint-strikethrough-marker" version 3.0.1 for strikethrough marker checks

- 🆕 Add "remark-lint-table-cell-padding" version 5.1.1 for table cell padding checks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(55a2687)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/55a26876bf6c5a78873fe449590b9fde596ec41d)


- ✨ [feat] Enhance TypeScript rule testing and add new type utilities


- 🔧 [build] Update `tsconfig` files to improve project structure and exclude unnecessary directories
  
- Adjust `tsconfig.build.json` to include `exclude` patterns for `.cache`, `dist`, and `node_modules`
  
- Modify `tsconfig.eslint.json` to include additional `include` patterns for TypeScript files
  
- Refactor `tsconfig.js.json` to streamline configuration and exclude unnecessary files
  
- Clean up `tsconfig.json` by removing redundant options and improving `exclude` patterns


- 🛠️ [fix] Improve type safety in rule tests
  
- Refactor `typed-rule-tester.ts` to enhance project service options and allow default projects
  
- Create new test fixtures for `prefer-type-fest-*` rules to ensure proper type handling
  
- Update existing tests for `prefer-ts-extras-*` rules to use the new testing structure


- ✨ [feat] Introduce new type utilities using `type-fest`
  
- Add `prefer-type-fest-async-return-type` rule to enforce the use of `AsyncReturnType`
  
- Implement `prefer-type-fest-except` rule to promote the use of `Except` for type manipulation
  
- Create tests for `UnknownArray`, `UnknownMap`, and `UnknownSet` to validate type safety


- 🧪 [test] Add comprehensive tests for new and existing rules
  
- Implement tests for `prefer-type-fest-*` rules to ensure they function as expected
  
- Update test cases for `prefer-ts-extras-*` rules to align with new testing methodology

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c7085da)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c7085daeaa35a5fc9a980e327d28113b35a8dcee)


- ✨ [feat] Update dependencies and add Vite configuration for linting


- 🔧 [build] Upgrade various ESLint plugins and configurations in `package.json` to enhance linting capabilities
  
- Added new plugins: `@eslint/config-helpers`, `@eslint/css`, `@eslint/json`, `@eslint/markdown`, `@html-eslint/eslint-plugin`, `@html-eslint/parser`, `@vitest/eslint-plugin`, and many others for improved code quality and support for various file types
  
- Updated existing plugins to their latest versions for better performance and features
  
- Included `vite` and `vite-tsconfig-paths` for better integration with TypeScript and Vite tooling


- 🎨 [style] Introduce `vite.config.ts` for Vitest configuration
  
- Configured Vitest to run linting and tooling tests with detailed coverage settings
  
- Set up environment variables and paths for better project structure and maintainability
  
- Defined test settings including coverage thresholds, file exclusions, and test timeouts to ensure robust testing practices
  
- Implemented caching and optimization settings for improved performance during test runs

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bd59068)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bd5906889751671df9f18db89fa218f2cbcd763c)


- ✨ [feat] Update package.json with new dependencies for enhanced linting and markdown processing

- 🆕 Added "@double-great/remark-lint-alt-text" for alt text linting in markdown

- 🆕 Included "@typescript-eslint/eslint-plugin" and "@typescript-eslint/parser" for improved TypeScript linting

- 🆕 Introduced "actionlint" for GitHub Actions linting

- 🆕 Added various "remark-lint" plugins to enforce markdown style and consistency

- 🆕 Included "remark-math" and "rehype-katex" for better math rendering in markdown

- 🆕 Added "remark-validate-links" to ensure all links in markdown are valid

- 🆕 Included "remark-toc" for automatic table of contents generation in markdown files

- 🆕 Added "remark-preset-lint-recommended" and other presets for consistent linting rules

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a7c1162)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a7c1162a1e8a86c7543310ef491fc7a4cbcaf1a9)


- ✨ [feat] Enhance ESLint Plugin with New Rules and TypeScript Configurations

- 🆕 [feat] Introduce `prefer-ts-extras-array-concat` rule to enforce usage of `arrayConcat` from `ts-extras` for better typing.

- 🆕 [feat] Add `prefer-ts-extras-is-finite`, `prefer-ts-extras-is-integer`, and `prefer-ts-extras-is-safe-integer` rules to promote consistent predicate helper usage over native `Number` methods.

- 🔧 [build] Update `package.json` to include new linting scripts for actions and prettier, and adjust TypeScript configurations for better build management.

- 🔧 [build] Modify `typecheck` script to include additional TypeScript configurations for comprehensive type checking.

- 🔧 [build] Update `tsconfig.json` and related configurations to improve project structure and build performance.

- 🧪 [test] Add tests for new rules to ensure correct functionality and adherence to coding standards.

- 🧪 [test] Create valid and invalid fixture files for each new rule to facilitate thorough testing.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4c55f69)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4c55f695e4a6214348d084e0756ea4af6fac83f1)


- Add prefer-ts-extras rules for array and object utilities [`(e7bdca6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e7bdca6ae1d25f5fcd0ada0b2234d1cf86f5cf03)


- Add prefer-type-fest-value-of rule to enforce ValueOf<T> usage [`(6aa5b95)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6aa5b955e06d923a1e6754e3edb7fa378d095f0c)



### 🛠️ Bug Fixes

- 🛠️ [fix] Update module imports to use dynamic import syntax


- Refactor multiple test files to replace static module imports with dynamic imports using `import()`.

- This change enhances the flexibility of module loading and may improve performance in certain scenarios.

- The following files were updated:
  
- `prefer-ts-extras-set-has.test.ts`
  
- `prefer-ts-extras-string-split.test.ts`
  
- `prefer-type-fest-abstract-constructor.test.ts`
  
- `prefer-type-fest-arrayable.test.ts`
  
- `prefer-type-fest-async-return-type.test.ts`
  
- `prefer-type-fest-constructor.test.ts`
  
- `prefer-type-fest-except.test.ts`
  
- `prefer-type-fest-if.test.ts`
  
- `prefer-type-fest-iterable-element.test.ts`
  
- `prefer-type-fest-json-array.test.ts`
  
- `prefer-type-fest-json-object.test.ts`
  
- `prefer-type-fest-json-primitive.test.ts`
  
- `prefer-type-fest-json-value.test.ts`
  
- `prefer-type-fest-literal-union.test.ts`
  
- `prefer-type-fest-non-empty-tuple.test.ts`
  
- `prefer-type-fest-promisable.test.ts`
  
- `prefer-type-fest-simplify.test.ts`
  
- `prefer-type-fest-tuple-of.test.ts`
  
- `prefer-type-fest-unknown-array.test.ts`
  
- `prefer-type-fest-unknown-map.test.ts`
  
- `prefer-type-fest-unknown-set.test.ts`
  
- `prefer-type-fest-value-of.test.ts`
  
- `prefer-type-fest-writable-deep.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3786790)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3786790627efa5dda227e8ae1d4b23d4efed40b3)


- 🛠️ [fix] Replace appendPendingValues function with inline logic for better clarity

- 🔄 Updated multiple instances in typescript-eslint-node-autofix.ts to directly push values into arrays

- 🧹 Removed the unused appendPendingValues function to streamline the code
🛠️ [fix] Enhance type safety in prefer-ts-extras-safe-cast-to rule

- 🔄 Utilized isDefined from ts-extras for improved null checks on expressionTsNode

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a1e119d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a1e119de70162a3600b02853761cd8a30df50fea)


- 🛠️ [fix] Improve import-aware fixes and type handling


- 🔧 Update `createImportAwareFixes` to handle replacement fixes for both autofix and suggestion intents.

- 🛠️ Adjust `resolveImportInsertionDecisionForReportFix` to block duplicate autofix replacements after the first claim.

- 🔧 Enhance `createImportInsertionFix` to accept empty-string from-clause module specifiers, ensuring correct positioning before relative imports.

- 🛠️ Modify `createSafeTypeReferenceReplacementFixGroup` to ensure correct text edits and type references.

- 🛠️ Add null checks for method receivers that are `super` in `createMethodToFunctionCallFix` and `createMemberToFunctionCallFix`.

- 🔧 Update tests to reflect changes in expected text edits and fix handling.

- 🧪 Add new tests for member call matching helpers and text character utilities, ensuring comprehensive coverage for identifier checks and whitespace handling.

- 🧪 Introduce tests for TypeScript ESLint node expression skip-checker fallbacks, validating behavior for qualified type references.

- 🧪 Refactor existing tests to accommodate multiple output scenarios for various rules, ensuring robust validation of fixture outputs.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(be7cea7)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/be7cea7dfc090bfcd00cbedbd70ac16aad978948)


- 🛠️ [fix] Update prefer-type-fest-json-value rule documentation and implementation

- Clarify the requirement for TypeFest `JsonObject` in serialization-bound string-keyed record contracts.

- Adjust reporting to use `JsonObject` instead of `JsonValue` for boundary payload aliases.

- Enhance message clarity for suggested replacements in the rule's documentation.

🧪 [test] Improve tests for prefer-type-fest-json-value rule

- Update test descriptions to reflect changes in the rule's requirements.

- Ensure tests align with the new expectations for `JsonObject` usage.

🛠️ [fix] Correct ESLint configuration for global ignores

- Fix path for ignored test fixtures to ensure proper linting behavior.

🚜 [refactor] Simplify array-like expression checker logic

- Replace manual parent node handling with a utility function for better readability.

🚜 [refactor] Streamline import analysis return value

- Return local names directly instead of creating a new Map for efficiency.

🚜 [refactor] Optimize import-aware fixes logic

- Consolidate replacement fix creation to reduce redundancy.

🧪 [test] Add coverage for import insertion behavior

- Introduce tests for handling empty-string side-effect module specifiers.

🧪 [test] Update prefer-type-fest-json-value tests for new messaging

- Ensure test messages reflect the updated rule documentation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(17b8f52)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/17b8f5264091ca2d6089637834b7fa04e007acb8)


- 🛠️ [fix] Update ESLint rule configurations and improve import handling

- 🔧 Modify "node-dependencies/no-deprecated" rule to allow "prettier-plugin-packagejson" for better compatibility

- 🚜 Refactor import insertion logic to handle named imports and relative imports more effectively

- 📝 Add utility functions for parsing quoted strings and identifying import declarations

- 🧪 Enhance tests for import insertion to validate new behavior with named imports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(892f32c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/892f32c53b0175d189eded52181d4fef5c806920)


- 🛠️ [fix] Refactor ESLint rule implementations for improved reporting and fixes

- 🔧 Update `prefer-type-fest-value-of.ts` to use `reportWithOptionalFix` for cleaner reporting

- 🔧 Update `prefer-type-fest-writable.ts` to utilize `reportWithOptionalFix` for consistent reporting

- 📝 Modify documentation tests in `docs-integrity.test.ts` to use async file reading for better performance

- 🛠️ Refactor file reading in `fixer-parse-safety-coverage.test.ts` to use async methods

- 🧹 Clean up unnecessary file reading in multiple tests, including `prefer-ts-extras-as-writable.test.ts`, `prefer-ts-extras-assert-defined.test.ts`, and others

- 🧪 Update tests to focus on runtime safety assertions instead of source assertions for various `prefer-ts-extras` rules

- 🧪 Remove redundant source assertions from tests for `prefer-ts-extras-*` rules to streamline test coverage

- 🧪 Ensure all tests maintain focus on runtime behavior and safety checks

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9375d77)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9375d778d50fb7feb5362597759820de5e1b40a3)


- 🛠️ [fix] Update source assertions for TypeScript extras rules


- 🔧 Refactor `prefer-ts-extras-as-writable` test to check for new structure and metadata.

- 🔧 Refactor `prefer-ts-extras-assert-defined` test to ensure stability in matcher and report/fix wiring.

- 🔧 Refactor `prefer-ts-extras-assert-present` test to maintain consistency in matcher and report/fix wiring.

- 🔧 Refactor `prefer-ts-extras-is-defined-filter` test to include optional-chain filter calls.

- 🔧 Refactor `prefer-ts-extras-is-empty` test to ensure stable matcher and fix wiring.

- 🔧 Refactor `prefer-ts-extras-is-equal-type` test to check for new matcher and suggestion wiring.

- 🔧 Refactor `prefer-ts-extras-is-finite` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-is-infinite` test to ensure stable matcher and fix wiring.

- 🔧 Refactor `prefer-ts-extras-is-integer` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-is-present-filter` test to include optional-chain filter calls.

- 🔧 Refactor `prefer-ts-extras-is-safe-integer` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-not` test to ensure stable matcher and fix wiring.

- 🔧 Refactor `prefer-ts-extras-object-has-in` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-object-has-own` test to update identifier checks.

- 🔧 Refactor `prefer-ts-extras-string-split` test to ensure stable analysis and fix wiring.

- 🔧 Refactor `prefer-type-fest-async-return-type` test to ensure stability in source assertions.

- 🔧 Refactor `prefer-type-fest-json-primitive` test to ensure stable matcher and fixer wiring.

- 🔧 Refactor `prefer-type-fest-literal-union` test to ensure stable matcher and fixer wiring.

- 🔧 Refactor `prefer-type-fest-promisable` test to ensure stability in source assertions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(415b2fe)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/415b2fe2a972bdff91f115d610ee5c9b9761115a)


- 🛠️ [fix] Remove unnecessary isTestFilePath mocks from test files

- 🧪 Cleaned up multiple test files by removing the isTestFilePath mock function, which was consistently set to return false.

- 📂 Affected files include:
  
- prefer-ts-extras-array-find-last.test.ts
  
- prefer-ts-extras-array-find.test.ts
  
- prefer-ts-extras-array-first.test.ts
  
- prefer-ts-extras-array-includes.test.ts
  
- prefer-ts-extras-array-join.test.ts
  
- prefer-ts-extras-array-last.test.ts
  
- prefer-ts-extras-as-writable.test.ts
  
- prefer-ts-extras-assert-defined.test.ts
  
- prefer-ts-extras-assert-error.test.ts
  
- prefer-ts-extras-assert-present.test.ts
  
- prefer-ts-extras-is-defined-filter.test.ts
  
- prefer-ts-extras-is-defined.test.ts
  
- prefer-ts-extras-is-empty.test.ts
  
- prefer-ts-extras-is-infinite.test.ts
  
- prefer-ts-extras-is-present-filter.test.ts
  
- prefer-ts-extras-is-present.test.ts
  
- prefer-ts-extras-key-in.test.ts
  
- prefer-ts-extras-object-entries.test.ts
  
- prefer-ts-extras-object-from-entries.test.ts
  
- prefer-ts-extras-object-has-own.test.ts
  
- prefer-ts-extras-object-keys.test.ts
  
- prefer-ts-extras-object-values.test.ts
  
- prefer-ts-extras-safe-cast-to.test.ts
  
- prefer-ts-extras-set-has.test.ts
  
- prefer-ts-extras-string-split.test.ts
  
- prefer-type-fest-abstract-constructor.test.ts
  
- prefer-type-fest-arrayable.test.ts
  
- prefer-type-fest-async-return-type.test.ts
  
- prefer-type-fest-conditional-pick.test.ts
  
- prefer-type-fest-constructor.test.ts
  
- prefer-type-fest-except.test.ts
  
- prefer-type-fest-if.test.ts
  
- prefer-type-fest-iterable-element.test.ts
  
- prefer-type-fest-json-array.test.ts
  
- prefer-type-fest-json-object.test.ts
  
- prefer-type-fest-json-primitive.test.ts
  
- prefer-type-fest-json-value.test.ts
  
- prefer-type-fest-literal-union.test.ts
  
- prefer-type-fest-non-empty-tuple.test.ts
  
- prefer-type-fest-promisable.test.ts
  
- prefer-type-fest-simplify.test.ts
  
- prefer-type-fest-tuple-of.test.ts
  
- prefer-type-fest-unknown-array.test.ts
  
- prefer-type-fest-unknown-map.test.ts
  
- prefer-type-fest-unknown-set.test.ts
  
- prefer-type-fest-value-of.test.ts
  
- prefer-type-fest-writable-deep.test.ts
  
- prefer-type-fest-writable.test.ts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(42e9cfd)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/42e9cfdda964ac07b32d4f31a313d7e6b3e5b65e)


- 🛠️ [fix] Refactor and optimize test cases for prefer-ts-extras and prefer-type-fest rules


- 🔧 Update `prefer-ts-extras-set-has.test.ts` to import runtime harness utilities and remove redundant code.

- 🧹 Clean up `prefer-ts-extras-string-split.test.ts` by consolidating fixture definitions and removing unused variables.

- 🚜 Refactor `prefer-type-fest-arrayable.test.ts` to streamline test cases and remove unnecessary inline definitions.

- 🎨 Enhance `prefer-type-fest-literal-union.test.ts` by organizing and optimizing test case definitions, removing redundant code.

- 🧪 Improve `prefer-type-fest-promisable.test.ts` by consolidating valid test cases and removing commented-out code for clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(78c8608)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/78c86080b31c14fffe92eb341db9d32286566361)


- 🛠️ [fix] Refactor prefer-ts-extras-set-has and prefer-type-fest-promisable tests


- 🔧 [test] Import test cases from prefer-ts-extras-set-has-cases for better organization

- 🧹 [chore] Remove redundant inline code definitions in prefer-ts-extras-set-has.test.ts

- 🔧 [test] Import test cases from prefer-type-fest-promisable-cases to streamline test setup

- 🧹 [chore] Clean up inline code definitions in prefer-type-fest-promisable.test.ts

- ⚡ [refactor] Enhance readability and maintainability by consolidating test case definitions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ad971e5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ad971e53cdc971a24de6338a3384389187ba37ea)


- 🛠️ [fix] Enhance type handling and error reporting in ESLint synchronization script

- 📜 Add detailed JSDoc comments for better documentation and understanding

- 🔍 Implement error handling in `readPackageJson` and `writeFile` functions

- 🔄 Refactor `resolvePeerFloorRange` to ensure compatibility with minimum ESLint version

- 🧪 Introduce type checks for `devDependencies` and `peerDependencies` in the main function

- 📝 Update synchronization process to log errors and exit with a non-zero code on failure

🧪 [test] Improve test coverage for `prefer-type-fest-if` and `prefer-type-fest-json-array`

- 🔍 Add fast-check properties to validate replacement logic for type aliases

- 📜 Enhance parsing functions to ensure generated code remains valid

- 🧪 Introduce assertions to verify that replacements are correctly applied in tests

🧪 [test] Expand tests for `prefer-type-fest-simplify` to ensure type alias replacements

- 🔄 Implement fast-check tests to validate simplification logic

- 📜 Ensure that all type references are correctly parsed and replaced in test cases

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(72e9b70)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72e9b70f084fd2f63509b01eb0e596d2844bc338)


- 🛠️ [fix] Refactor type-fest rule tests for improved fixture handling and parsing


- 🔧 Update `prefer-type-fest-abstract-constructor.test.ts` to use a dynamic fixture creation function for generating fixable output code, enhancing maintainability and readability.

- 🔧 Introduce `createFixtureFixableOutputCode` function to replace constructor signatures in `prefer-type-fest-constructor.test.ts`, ensuring consistent fixture generation.

- 🔧 Implement `replaceOrThrow` utility function in `prefer-type-fest-async-return-type.test.ts` and other tests to streamline the replacement process and improve error handling.

- 🔧 Enhance test coverage for `prefer-type-fest-literal-union.test.ts` by applying the new replacement strategy for fixture outputs.

- 🔧 Refactor `prefer-type-fest-tuple-of.test.ts` to include a more robust fixture generation method, ensuring that the tests remain valid and easy to update.

- 🔧 Update `prefer-type-fest-value-of.test.ts` to include comprehensive parsing and validation for indexed access types, improving the accuracy of the tests.

- 🧪 Add fast-check properties to various tests to ensure that generated code remains parseable and adheres to expected structures, enhancing test reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(24f4d30)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/24f4d30b7003eda3f09e41895c3ee54cf34afaae)


- 🛠️ [fix] Update dependencies in package.json and package-lock.json

- 🔧 Upgrade @double-great/stylelint-a11y to version 3.4.5

- 🔧 Upgrade @eslint-community/eslint-plugin-eslint-comments to version 4.7.0

- 🔧 Upgrade @types/node to version 25.3.3

- 🔧 Upgrade cognitive-complexity-ts to version 0.8.1

- 🔧 Upgrade globals to version 17.4.0

- 🔧 Upgrade publint to version 0.3.18

- 🔧 Upgrade typedoc-plugin-dt-links to version 2.0.44

- 🔧 Upgrade @easyops-cn/docusaurus-search-local to version 0.55.1

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(99f276b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/99f276bf7e98e8077b80cd77c51cc5b122eec66d)


- 🛠️ [fix] Update TypeFest rules and documentation for improved clarity and accuracy

- 📝 [docs] Refine descriptions in `prefer-type-fest-json-primitive.md` to clarify targeted patterns and reporting criteria

- 📝 [docs] Enhance `prefer-type-fest-json-value.md` documentation for better understanding of JSON-compatible value representation

- 📝 [docs] Adjust `prefer-type-fest-promisable.md` to specify strict matching criteria for Promise/base unions

- 📝 [docs] Clarify `prefer-type-fest-set-non-nullable.md` to focus on imported legacy aliases for non-nullable types

- 📝 [docs] Update `prefer-type-fest-set-optional.md` to emphasize imported legacy aliases for optional types

- 📝 [docs] Modify `prefer-type-fest-set-readonly.md` to specify imported legacy aliases for readonly types

- 📝 [docs] Revise `prefer-type-fest-set-required.md` to clarify the focus on imported legacy aliases for required types

- 📝 [docs] Improve `prefer-type-fest-simplify.md` to specify matching for imported `Prettify` and `Expand` aliases

- 📝 [docs] Update `prefer-type-fest-unknown-array.md` to clarify targeting of unknown-array spellings

- 📝 [docs] Refine `prefer-type-fest-unknown-map.md` to specify targeting of unknown-map spellings

- 📝 [docs] Enhance `prefer-type-fest-unknown-record.md` to clarify targeting of unknown-record spellings

- 📝 [docs] Update `prefer-type-fest-unknown-set.md` to specify targeting of unknown-set spellings

- 📝 [docs] Revise `prefer-type-fest-value-of.md` to clarify matching for indexed-access type shapes

- 🔧 [build] Adjust peer dependencies in `package.json` and `package-lock.json` to support ESLint versions 9.0.0 and 10.0.2

- 🧪 [test] Refactor fast-check configurations in tests to use a unified default run count

- 🧪 [test] Update multiple test files to replace specific run counts with the new default configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4894a46)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4894a469b4d5d1f1305737470312152b63a27cab)


- 🛠️ [fix] Improve type handling and testing for TypeScript rules


- 🔧 [build] Update test files to include necessary imports for TypeScript parsing

- 🧪 [test] Enhance tests for prefer-type-fest-arrayable with fast-check integration
  
- Introduce new utilities for generating arrayable types and unions
  
- Implement comprehensive tests to ensure correct reporting and fixing of arrayable types

- 🧪 [test] Refactor prefer-type-fest-async-return-type tests for clarity and consistency

- 🧪 [test] Adjust prefer-type-fest-json-primitive tests to correct type declaration handling

- 🧪 [test] Expand prefer-type-fest-literal-union tests with fast-check for better coverage
  
- Add generators for various literal union cases and cross-family unions
  
- Ensure that generated unions are correctly reported and parsed

- 🧪 [test] Update prefer-type-fest-promisable tests to validate autofix behavior
  
- Ensure that the autofix preserves parseability and correctly inserts necessary imports

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(48155f0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/48155f0b4a6693d72f38a2aa6016621b07a99900)


- 🛠️ [fix] Improve type normalization and documentation across rules

- 🔧 Update `prefer-type-fest-promisable.ts` to enhance type extraction and add documentation for `getPromiseInnerType`.

- 🔧 Refactor `prefer-type-fest-tagged-brands.ts` to improve brand detection logic and document the purpose of helper functions.

- 🔧 Enhance `prefer-type-fest-tuple-of.ts` with better alias normalization and detailed comments for tuple replacement logic.

- 🔧 Improve `prefer-type-fest-unknown-array.ts` to clarify checks for `ReadonlyArray` and document type reference candidates.

- 🔧 Update `prefer-type-fest-unknown-map.ts` to refine checks for `ReadonlyMap` and document type argument validation.

- 🔧 Enhance `prefer-type-fest-unknown-record.ts` to clarify detection of `Record<string, unknown>` references.

- 🔧 Improve `prefer-type-fest-unknown-set.ts` to clarify checks for `ReadonlySet` and document type reference candidates.

- 🔧 Update `prefer-type-fest-writable.ts` to enhance checks for writable mapped types and document the logic.

- 📝 Add detailed comments and documentation across various test files to improve clarity and maintainability.

- 📝 Update test files to include more descriptive comments for test setup and assertions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(95fdc29)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/95fdc29c3b3754079161967f6f28f630e8cb6fcf)


- 🛠️ [fix] Improve import insertion and type handling


- 🛠️ Update `isArrayLikeType` to provide clearer documentation on its purpose and parameters.

- 🛠️ Refactor `isWriteTargetMemberExpression` to enhance readability and ensure it correctly identifies member expressions as write targets.

- 🛠️ Modify `createImportInsertionFix` to handle cases where the program node's range is undefined, ensuring robust import insertion.

- 🛠️ Introduce `isImportDeclarationFromSource` utility to streamline checks for import declarations against expected module sources.

- 🛠️ Enhance `createSafeValueArgumentFunctionCallFix` and related functions to wrap sequence expressions, preserving single-argument semantics.

- 🛠️ Improve `areEquivalentNodeValues` to handle cyclic references and prevent infinite loops during comparison.

- 📝 Update documentation in `README.md` to clarify the behavior of autofixes when certain settings are enabled.

- 🧪 Add tests for new functionality in `import-insertion` and `imported-type-aliases`, ensuring correct behavior under various conditions.

- 🧪 Extend tests in `typed-rule` to verify that fix getters do not crash when they throw errors, enhancing stability.

- 🧪 Implement tests for settings caching to ensure that different program contexts do not share settings, maintaining isolation.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(338f913)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/338f9131139d00ce9c875eed219d2ce38e98be42)


- 🛠️ [fix] Remove unused prettier-plugin-jsdoc-type from configuration

- Eliminated "prettier-plugin-jsdoc-type" from the plugins list in multiple sections of the .prettierrc file

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3d31bbc)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d31bbc7a6e3e09429df3cc42c134218158c9ee2)


- 🛠️ [fix] Update messages for TypeFest rule tests to improve clarity

- 📝 Refactor error messages in `prefer-type-fest-set-non-nullable.test.ts` to specify making selected keys non-nullable instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-set-optional.test.ts` to clarify making selected keys optional instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-set-readonly.test.ts` to indicate marking selected keys as readonly instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-set-required.test.ts` to specify making selected keys required instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-simplify.test.ts` to clarify flattening resolved object and intersection types instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-tagged-brands.test.ts` to indicate using canonical tagged-brand aliases instead of legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-tuple-of.test.ts` to clarify modeling fixed-length homogeneous tuples instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-unknown-array.test.ts` to specify using `Readonly<UnknownArray>` instead of legacy types.

- 📝 Refactor error messages in `prefer-type-fest-unknown-map.test.ts` to clarify using `Readonly<UnknownMap>` instead of legacy types.

- 📝 Refactor error messages in `prefer-type-fest-unknown-record.test.ts` to improve clarity on reporting unknown record aliases.

- 📝 Refactor error messages in `prefer-type-fest-unknown-set.test.ts` to specify using `Readonly<UnknownSet>` instead of legacy types.

- 📝 Refactor error messages in `prefer-type-fest-unwrap-tagged.test.ts` to clarify unwrapping Tagged/Opaque values instead of using legacy aliases.

- 📝 Refactor error messages in `prefer-type-fest-value-of.test.ts` to improve clarity on indexed-access value unions.

- 📝 Refactor error messages in `prefer-type-fest-writable.test.ts` to specify removing readonly modifiers from selected keys instead of using legacy aliases.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c606fd2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c606fd2b73ca23cfb48854fc0170aae43635d1c6)


- 🛠️ [fix] Adds missing-import insertion to autofixes

🛠️ [fix] Improves autofix reliability by applying safe rewrites even when required helper imports are not already present.

- Adds import insertion for both type-level and value-level replacements, so fixes remain usable instead of failing closed.

- Preserves safety by keeping scope/shadowing checks before deciding whether direct names can be introduced.

🚜 [refactor] Unifies replacement generation behind shared fix builders to reduce duplicated rule logic.

- Centralizes how replacements resolve local names, build replacement text, and compose multi-part fixes.

- Keeps import placement deterministic by inserting after existing imports or at file start when none exist.

- Tightens internal typing with shared unknown collection types to improve consistency across rule contexts.

🧪 [test] Expands autofix and suggestion coverage to lock in import-aware behavior.

- Updates many invalid cases to assert concrete transformed output, including scenarios that now require inserted imports.

- Adds multi-pass expected outputs for fixtures where several findings are fixed across repeated runs.

- Strengthens suggestion output assertions and mixed line-ending fixtures to guard against regression in real editor flows.

🎨 [style] Applies minor formatting and comment cleanup in auxiliary scripts and config text for readability without changing runtime behavior.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7639e4d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7639e4d3d04fd40ec505141ee4c9d5a6fce34388)


- 🛠️ [fix] Improve documentation link checker functionality

- Enhance `isUrlLike` function comment for clarity

- Add pathExists caching to optimize link validation

- Implement concurrency control for file checks

- Introduce metrics tracking for link validation results

- Update error handling and logging for better feedback

- Refactor link validation logic to reduce redundancy

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(721700d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/721700d4f551e3b9b70675dc68c11b9ccd4f0c72)


- 🛠️ [fix] Guard missing filenames in lint rules

🛠️ [fix] Prevents undefined-path behavior by defaulting missing lint context filenames before test-file short-circuit checks.

- Improves runtime safety for rule execution in nonstandard or mocked contexts.

🧹 [chore] Expands prompt audit records with host, user, shell version, and ISO timestamp metadata.

- Improves traceability for local hook activity and environment diagnostics.

👷 [ci] Stabilizes mutation-report publishing metadata.

- Normalizes repository identity casing and pins dashboard version labeling to a stable branch value.

🧪 [test] Adds broad mutation-focused coverage for rule metadata, filename fallbacks, and edge-case matching/fixing behavior.

- Introduces shared metadata smoke checks and extends many rule suites with no-fix, suggestion, whitespace-normalization, shadowing, and qualified-type scenarios to reduce survivor regressions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c7c99db)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c7c99dba2a2b84979ad8462087f8c60348cbda73)


- 🛠️ [fix] Improves rule matching and early exits

🛠️ [fix] Improves array-like type detection to reduce missed matches.

- Normalizes rendered type text before checking suffixes.

- Uses a single `[]`-based check so readonly array forms are handled consistently.

🚜 [refactor] Moves test-file short-circuiting ahead of import scanning across rules.

- Avoids unnecessary analysis work for excluded files.

- Improves rule setup efficiency and keeps behavior consistent.

🛠️ [fix] Makes replacement-name handling explicit in autofix paths.

- Switches from truthy checks to null checks to prevent accidentally skipping valid replacements.

🔧 [build] Repositions dependency override metadata.

- Keeps package configuration ordering consistent while retaining the parser version override.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ede063)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ede06303b78cea7525adb221778dea080e352a9)


- 🛠️ [fix] Stabilizes plugin export defaults

🛠️ [fix] Ensures the published plugin always exposes a complete, predictable object shape.

- Prevents runtime and integration failures when optional sections are missing from built output.

- Removes brittle undefined-path handling by applying safe defaults at the entry boundary.

🧪 [test] Improves shared test-run behavior and test failure diagnostics.

- Uses proper focused-test wiring and generates readable fallback names for unnamed cases.

- Preserves explicit case names while making anonymous case failures easier to identify.

🧪 [test] Expands rule coverage with broader, named valid/invalid edge cases.

- Adds stronger regression protection for unions, callback shapes, guard patterns, skip-path behavior, and non-target method/property lookalikes.

📝 [docs] Strengthens quality-first contribution guidance.

- Reinforces correctness and maintainability over shortcuts, including iterative follow-up when needed.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8f4b499)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8f4b499a6c0285c3cc0b92c4ba08b78af04e8a08)


- 🛠️ [fix] Update type aliases to use TypeScript's type-fest library


- 🔧 [fix] Replace `MaybePromise` with `Promisable` in `prefer-type-fest-promisable.test.ts`

- 🔧 [fix] Replace `DeepReadonly` with `ReadonlyDeep` in `prefer-type-fest-readonly-deep.test.ts`

- 🔧 [fix] Replace `DeepRequired` with `RequiredDeep` in `prefer-type-fest-required-deep.test.ts`

- 🔧 [fix] Replace `RecordDeep` with `Schema` in `prefer-type-fest-schema.test.ts`

- 🔧 [fix] Replace `NonNullableBy` with `SetNonNullable` in `prefer-type-fest-set-non-nullable.test.ts`

- 🔧 [fix] Replace `PartialBy` with `SetOptional` in `prefer-type-fest-set-optional.test.ts`

- 🔧 [fix] Replace `ReadonlyBy` with `SetReadonly` in `prefer-type-fest-set-readonly.test.ts`

- 🔧 [fix] Replace `RequiredBy` with `SetRequired` in `prefer-type-fest-set-required.test.ts`

- 🔧 [fix] Replace `Expand` with `Simplify` in `prefer-type-fest-simplify.test.ts`

- 🔧 [fix] Replace `Opaque` with `Tagged` in `prefer-type-fest-tagged-brands.test.ts`

- 🔧 [fix] Replace `ReadonlyTuple` with `Readonly<TupleOf<Length, Element>>` in `prefer-type-fest-tuple-of.test.ts`

- 🔧 [fix] Replace `readonly unknown[]` with `unknown[]` in `prefer-type-fest-unknown-array.test.ts`

- 🔧 [fix] Replace `ReadonlyMap<unknown, unknown>` with `Map<unknown, unknown>` in `prefer-type-fest-unknown-map.test.ts`

- 🔧 [fix] Replace `ReadonlySet<unknown>` with `Set<unknown>` in `prefer-type-fest-unknown-set.test.ts`

- 🔧 [fix] Replace `UnwrapOpaque` with `UnwrapTagged` in `prefer-type-fest-unwrap-tagged.test.ts`

- 🔧 [fix] Replace `Mutable` with `Writable` in `prefer-type-fest-writable.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(895cb41)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/895cb413648d9421fcfd6c557cb66025ebc1cb8d)



### 🛡️ Security

- 🔧 [build] Update package dependencies for improved stability and features


- 📦 Upgrade "@stylistic/eslint-plugin" from "^5.9.0" to "^5.10.0" for enhanced linting capabilities.

- 📦 Upgrade "@types/node" from "^25.3.3" to "^25.3.5" to ensure compatibility with the latest Node.js features and types.

- 📦 Upgrade "eslint-plugin-no-secrets" from "^2.2.2" to "^2.3.3" to incorporate the latest security checks and improvements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b76ce59)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b76ce59b0a7317ddb8d5cac096f30d2859963dfe)


- *(deps)* [dependency] Update the github-actions group across 1 directory with 7 updates [`(7b08932)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7b089328816b87606e9b80a03a22495aecfd7de0)


- *(deps)* [dependency] Update the github-actions group across 1 directory with 8 updates [`(acd2932)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/acd29320fdc5e4e99afe81e099e3f6beb622f455)


- [StepSecurity] Apply security best practices

Signed-off-by: StepSecurity Bot <bot@stepsecurity.io> [`(de875de)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/de875ded17a8f5ee5851d27586215eeb2bf1d419)


- 📝 [docs] Add comprehensive guidelines for various file types in the repository


- ✨ [feat] Introduce JSON guidelines to ensure clarity and consistency in JSON files
  
- Emphasize strictness and intentionality in JSON structure
  
- Provide style recommendations, structural best practices, and security considerations


- ✨ [feat] Add MJS guidelines for modern JavaScript modules
  
- Focus on ESM usage, syntax preferences, and async patterns
  
- Encourage documentation and type annotations for better maintainability


- ✨ [feat] Establish Markdown guidelines for documentation and content creation
  
- Outline content rules, formatting standards, and front matter usage
  
- Include tooling alignment instructions for maintaining Markdown quality


- ✨ [feat] Create detailed instructions for testing ESLint rules
  
- Define goals for ESLint rule testing, setup requirements, and coding standards
  
- Highlight best practices for writing tests, including valid and invalid cases


- ✨ [feat] Provide TypeScript 5.9+ development guidelines
  
- Focus on modern TypeScript features, strict typing, and utility types
  
- Emphasize error handling, async patterns, and coding style best practices


- ✨ [feat] Introduce YAML guidelines for robust YAML authoring
  
- Stress predictability and readability in YAML files
  
- Offer style, structure, and tooling recommendations for YAML usage


- ✨ [feat] Add Copilot instructions for ESLint plugin development
  
- Define the role, architecture, and constraints for ESLint rule creation
  
- Emphasize code quality, testing standards, and tool usage for effective development


- 🧹 [chore] Remove instructions folder from .gitignore to allow tracking of new guidelines

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(976452b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/976452b5c39227330fa42d56f08eab88968d53a6)


- 📝 [docs] Add configuration files for various tools

- Created `.taplo.toml` for TOML formatting rules, aligning with Prettier's style.

- Introduced `.yamllint` for YAML linting configuration, specifying rules and ignored paths.

- Added `cliff.toml` for git-cliff configuration to generate changelogs based on conventional commits.

- Implemented `commitlint.config.mjs` to enforce commit message standards, including emoji and scope validation.

- Established `jscpd.json` for configuring the jscpd tool to detect code duplication.

- Created `kics.yaml` for KICS configuration, focusing on Infrastructure as Code security scanning.

- Added `lychee.toml` for configuring the lychee link checker, including caching and request settings.

- Introduced `markdownlint.json` for markdown linting rules, ensuring consistent formatting across markdown files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(20a6723)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/20a672338e3a0d93f3a85dca1dd1df52e48b18eb)



### 🛠️ Other Changes

- Add tests and TypeScript configuration for uptime-watcher plugin

- Implement tests for various rules in the uptime-watcher plugin, including:
 
- prefer-ts-extras-is-present-filter
 
- prefer-ts-extras-object-has-own
 
- prefer-type-fest-json-value
 
- prefer-type-fest-promisable
 
- prefer-type-fest-tagged-brands
 
- prefer-type-fest-unknown-record
 
- prefer-type-fest-value-of
 
- preload-no-local-is-plain-object
 
- renderer-no-browser-dialogs
 
- renderer-no-direct-bridge-readiness
 
- renderer-no-direct-electron-log
 
- renderer-no-direct-networking
 
- renderer-no-direct-preload-bridge
 
- renderer-no-electron-import
 
- renderer-no-import-internal-service-utils
 
- renderer-no-ipc-renderer-usage
 
- renderer-no-preload-bridge-writes
 
- renderer-no-process-env
 
- renderer-no-window-open
 
- require-ensure-error-in-catch
 
- require-error-cause-in-catch
 
- shared-no-outside-imports
 
- shared-types-no-local-is-plain-object
 
- store-actions-require-finally-reset
 
- test-no-mock-return-value-constructors
 
- tsdoc-no-console-example
 
- typed-eventbus-payload-assignable

- Add TypeScript configuration files for linting and building the uptime-watcher plugin.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d233b9c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d233b9c2b49f5f87e10e2c2ee04deed9765f54a3)



### 🚜 Refactor

- 🚜 [refactor] Derive canonical rule metadata and sync README with plugin

✨ Centralize all rule docs/preset/typed‑rule metadata in new derivation helpers

- remove hand‑authored membership and type‑checked lists; derive from `meta.docs`

- update plugin to build preset maps and typed‑rule set from derived data

- add `requiresTypeChecking` flag on rules and tighten selector patterns

🧹 Add tooling to keep README accurate

- new CLI/script generates `## Rules` table from plugin metadata

- tests verify README section matches generated output

🛠️ Enforce policy and settings uniformly

- create policy‑aware reporter & helpers, guard WeakMap keys

- simplify `createTypedRule` and strip outdated autofix logic

🧪 Extend and modernize test infra

- selector‑aware listener helpers, global Vitest setup included

- robust metadata integrity suite and README sync test

- update dozens of rule tests to use new helpers and respect selectors

🗑️ Remove obsolete modules/files

- delete static preset membership, type‑checked name exports

- clean up report adapter and simplify plugin settings

👷 Adjust configs and types

- include test declaration files in TS configs, update eslint.cfg

- add new d.ts for script exports, expand vite/vitest setup

Overall this refactor makes metadata authoritative, automates documentation, and strengthens verification across the codebase.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(93ac9b2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/93ac9b21c4af4817d278a6b28c0076d8f275b6f2)


- 🚜 [refactor] Remove open-pull-requests-limit from Dependabot configuration


- Eliminated the open-pull-requests-limit setting from GitHub Actions and npm updates

- Streamlined the Dependabot configuration for better flexibility in handling pull requests

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(043d8e0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/043d8e0e4e13ce0b50b9962b8f62c838f6ac8647)


- 🚜 [refactor] Remove versioning strategy from GitHub Actions updates

- Eliminated the `versioning-strategy: increase` line for GitHub Actions updates in the Dependabot configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bc34602)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bc34602c5d2bfdb727f39932458712012a0b1f5a)


- 🚜 [refactor] Simplify Dependabot configuration in YAML file

- Remove unnecessary comments and redundant settings for clarity

- Consolidate schedule settings under multi-ecosystem-groups

- Streamline update configurations for GitHub Actions and npm ecosystems

- Eliminate unused grouping configurations for better maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(cc09090)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/cc09090b487eac05c34f854a0e9aaabef9406d08)


- 🚜 [refactor] Remove unnecessary name from Docusaurus NPM dependencies in Dependabot configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(625bf6c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/625bf6c76b4fdd57ce7775faab33cb9f2fa30e30)


- 🚜 [refactor] Remove unnecessary naming and versioning strategy for Dependabot updates

- Eliminated 'name' and 'versioning-strategy' fields from GitHub Actions and NPM dependencies

- Streamlined configuration for better clarity and maintainability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(50e9b6e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/50e9b6ecb39f81e9ffe2214166b5143302aff525)


- 🚜 [refactor] centralize documentation URL base for rules

🚜 expose a shared `RULE_DOCS_URL_BASE` constant from the internal helper
 previously the base URL lived silently inside the module as a private
 value; exporting it makes the canonical docs prefix configurable and
 avoids repeated literals.

🚜 adjust every rule module to import the base and build a local
 `RULE_DOCS_URL` by appending its own name
 this replaces dozens of hard‑coded links, keeping metadata urls in
 sync and making a future change to the host/path trivial.


- reduces duplication across the codebase

- improves maintainability and consistency of documentation links

- paves the way for easier customization or relocation of the docs site

The change is purely structural; rule behavior is unaffected.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(08e3bab)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/08e3babbd1e0599cb734c359a1a40f2c686256b0)


- 🚜 [refactor] Centralize member‑call and throw‑consequent logic and streamline rules

🚜 [refactor] Extract shared helpers

- add `_internal/member-call.ts` with strongly‑typed `getIdentifierMemberCall`/`getIdentifierPropertyMemberCall` and related types

- add `_internal/throw-consequent.ts` for throw‑only consequent detection and extraction

- rename and export `isFilterCallExpression` from filter‑callback helper

🛠️ [fix] Migrate rules to new utilities

- replace manual MemberExpression/property checks with shared matchers across nearly every `prefer‑ts‑extras‑*` rule

- use `isFilterCallExpression` in filter‑related rules and rework callback logic in `not` rule

- plug throw‑consequent helpers into assert‑defined, assert‑error, and assert‑present rules, removing duplicated code

- update `is‑finite`/`is‑integer`/`is‑safe‑integer`/`object‑*` rules to leverage member call helper for safer matching

- adjust `set‑has` and `string‑split` rules similarly

- adapt tests to verify import of new helpers and expected source structure

🚜 [refactor] Improve ts‑eslint node autofix internals

- rename types/functions from “Node” to “Ast” for clarity

- broaden regex pattern and add text‑based AST reference checks

- drop backward‑compat alias and tidy import/type definitions

- add namespace‑name scanning utility

🧹 [chore] Miscellaneous cleanup

- reformat some import lists and update type imports (`UnknownRecord`)

- amend tests to assert helper usage and remove obsolete source assertions

- ensure all call sites updated for renamed helpers

This consolidation reduces duplication, strengthens type safety, and simplifies future maintenance of rule logic.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3d21778)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3d21778f72cabd910c1d79136fc01fd0a7807a4b)


- 🚜 [refactor] Simplify array-like type checks and improve code reuse


- 🔧 [build] Refactor `prefer-ts-extras-array-includes` and `prefer-ts-extras-array-join` rules to utilize a shared `createIsArrayLikeExpressionChecker` function for determining array-like expressions.

- 🔧 [build] Remove redundant `isArrayLikeType` functions from `prefer-ts-extras-array-last`, `prefer-ts-extras-assert-present`, `prefer-ts-extras-is-empty`, and `prefer-ts-extras-string-split` rules, replacing them with the new shared utility.

- 🔧 [build] Enhance `prefer-ts-extras-set-has` rule to improve set type detection using a more comprehensive approach that checks for union and intersection types.

- 🔧 [build] Update `prefer-ts-extras-is-infinite` rule to utilize `areEquivalentExpressions` for comparing expressions, enhancing clarity and maintainability.

- 🔧 [build] Introduce `areEquivalentExpressions` utility to normalize expression comparisons, allowing for better handling of TypeScript assertion wrappers.

- 🧪 [test] Add tests for `areEquivalentExpressions` to ensure accurate expression comparison, including cases for identical expressions, different expressions, and unwrapping TypeScript assertions.

- 🧪 [test] Update existing tests across various rules to reflect the new utility functions and ensure they correctly validate the intended behavior.

- 📝 [docs] Improve documentation for rules to clarify the purpose of changes and the benefits of using the new utilities.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e3c8cda)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e3c8cda4cc05fec1a9b7f353473bb1e0ebf54e73)


- 🚜 [refactor] switch rule docs to Docusaurus routes & add footer links

📝 [docs] add ADR 0006/0007 entries and pages, update sidebar/index with new decisions
🚜 [refactor] change docs‑URL base constants and rule‑creator logic to use live site routes (`…/rules/<id>`) instead of GitHub blob markdown links
🚜 [refactor] update all rule metadata defaults and inline urls accordingly
🧪 [test] adjust smoke, integration and individual rule tests to expect `/rules/<id>` URLs and remove `.md` suffix checks
📝 [docs] append a consistent “Adoption resources” footer to every rule page linking shared guides
📝 [docs] create ADRs explaining canonical URL strategy and footer link rationale

Enhances user experience by pointing editors and links at rendered documentation, stabilizes the public docs surface independent of repo layout, and keeps shared guidance discoverable without duplicating boilerplate. Tests and sources no longer assume `.md` filenames; route stability is now a compatibility concern.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(91a136d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/91a136dbd7dd14660f9a4b9a6aeffc0e4a6b7657)


- 🚜 [refactor] Improve code readability and formatting in inspect_pr_checks.py

- 🛠️ Adjust function signatures for better clarity

- 🎨 Reformat argument lists and string literals for consistency

- 🔧 Enhance error handling messages for better debugging

- 🎨 Improve indentation and line breaks for better readability

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a62ba9e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a62ba9eb919101eabe2fde50818be1b64866cdd4)


- 🚜 [refactor] Treats tests like other files

🚜 [refactor] Aligns plugin/test heuristics

- 🧪 Removes test-path skips and the heuristic so rules always lint tests while relying on config scoping, and cleans up fixtures that only exercised the skip path.

- ⚙️ Updates benchmark scripts/config to build before running stats/timing suites and adds explicit namespace metadata to the plugin entry for clearer identification.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(72c85a8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/72c85a8e2335f64003b42f78dc8104a105169f03)


- 🚜 [refactor] Remove redundant defaultOptions stubs

🚜 [refactor]
- Drops the explicit defaultOptions arrays from typed rule definitions so configuration relies on implicit defaults and keeps source definitions concise.
🎨 [style]
- Refreshes doc/test helpers with tighter formatting for import/type utilities and assertion checks to match the cleaned-up style.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(60e7e00)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/60e7e0073c1a54ac8b6611e269bc74a53537aa3c)


- 🚜 [refactor] Enforce readonly parameter typing

🚜 [refactor] Expands readonly annotations across core typed utilities and rule logic so function inputs stay immutable by default.

- Improves type-safety consistency and reduces accidental mutation paths without changing runtime behavior.

🔧 [build] Tunes readonly-parameter linting to stay strict on explicit APIs while avoiding noisy inferred-parameter churn.

- Adds practical allowlists for common external types and method handling so enforcement remains useful and sustainable.

🧪 [test] Aligns test helpers and listener harness typings with the stricter immutability model.

- Applies safer optional access and targeted writable casts only where test scaffolding must mutate nodes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0422fd8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0422fd8f088a1e8f6231815f795e57e4a01a916c)


- Migrate plugin to TypeScript and restructure codebase [`(2101a3e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2101a3ec1f446f93c0351941344f34603bfb3f13)



### 📝 Documentation

- 📝 [docs] Update documentation link check command to include API verification

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e095a9f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e095a9f3bfee6d69d1e9091a10b3e31176c1d32f)


- 📝 [docs] Update Stylelint configuration with installation instructions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(15d3bea)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/15d3beaba202108f75ac0ad87962bac935f63c2f)


- 📝 [docs] Update contributor badge formatting and documentation guidelines
✨ [feat] Enhance commit message guidelines with hybrid Gitmoji format
🔧 [build] Add devEngines configuration for Node.js and npm version enforcement

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9339c8c)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9339c8c73edde7b0d0577e3d92624ce000d0d06b)


- 📝 [docs] Update commit message guidelines to include Gitmoji format and examples
🔧 [build] Add commitlint-config-gitmoji as a dependency for enforcing commit message format

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ee06635)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ee06635387e8a07fd4a5072ccebfdb37551e2ee1)


- 📝 [docs] Add blank line before "Further reading" section in rule documentation


- Added a blank line before the "## Further reading" section in multiple TypeScript extra and TypeFest rule documentation files to improve readability and adhere to documentation standards.

- Updated the regex pattern in the `remark-lint-rule-doc-headings` script to enforce this formatting rule.

- Modified the test case in `docs-integrity.test.ts` to check for exactly one blank line between the rule catalog ID and the "Further reading" section.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8350423)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/835042393b7b31364243bfe9f851e12b1c07fcb9)


- 📝 [docs] Add comprehensive charts for developer documentation


- ✨ [feat] Introduce "Docs Link Integrity and Anchor Stability" chart
  
- Provides a flowchart for maintaining stable documentation links and anchors.
  
- Includes a maintainer policy and suggested command sequence for validation.


- ✨ [feat] Add "Import-Safe Autofix Decision Tree" chart
  
- Outlines decision-making for safe import rewrites and suggestions.
  
- Highlights the importance of symbol safety and parse safety.


- ✨ [feat] Create "Preset Composition and Rule Matrix" chart
  
- Explains how rule metadata integrates into user-facing documentation.
  
- Provides practical use cases and common failure modes.


- ✨ [feat] Implement "Preset Semver and Deprecation Lifecycle" chart
  
- Details the lifecycle for managing preset changes with semver awareness.
  
- Offers maintainer guidance on handling preset modifications.


- ✨ [feat] Develop "Rule Authoring to Release Lifecycle" chart
  
- Maps the entire process from rule proposal to publication.
  
- Emphasizes the importance of documentation throughout the lifecycle.


- ✨ [feat] Add "Typed Rule Performance Budget and Hotspots" chart
  
- Analyzes performance considerations for typed rules.
  
- Suggests policies for managing semantic type resolution.


- ✨ [feat] Introduce "Typed Rule Semantic Analysis Flow" chart
  
- Details the semantic path for typed rules, focusing on service acquisition and type operations.
  
- Encourages fail-fast behavior in typed rule contexts.


- 🧹 [chore] Update index.md to include new charts in the developer section
  
- Ensures all new charts are listed for easy navigation.


- 🧹 [chore] Modify typedoc configuration to expand entry points
  
- Adjusts entry point strategy to include internal files for better documentation generation.


- 🛠️ [fix] Refactor various internal functions for improved clarity and performance
  
- Simplifies function signatures and enhances readability across multiple files.
  
- Ensures consistent error handling and type safety in type operations.


- 🧪 [test] Enhance rule metadata tests for improved validation
  
- Introduces new utility functions for validating rule metadata integrity.
  
- Ensures that rule IDs and numbers are correctly formatted and sequenced.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2f9b6d3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2f9b6d386efd59b703aefa982a483257ec424500)


- 📝 [docs] Update developer documentation and charts


- ✨ [feat] Add "Rule Catalog & Doc Sync" and "Change Impact Matrix" to sidebars

- 📝 [docs] Create "Change Impact and Validation Matrix" documentation with flowchart

- 📝 [docs] Create "Rule Catalog and Docs Synchronization" documentation with flowchart

- 📝 [docs] Update "Docs and API Pipeline" documentation to include sidebar wiring

- 📝 [docs] Update "Quality Gates and Release Flow" documentation with failure loops

- 📝 [docs] Update "System Architecture Overview" documentation to include generated tooling assets

- 🎨 [style] Enhance sidebar styles for developer charts

- 🔧 [build] Update TypeDoc configuration to adjust private class field visibility and type conversion depth

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4817427)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/481742759795f51f0b053217f9a8dbbb41307b1c)


- 📝 [docs] Add snapshot tests for rule documentation headings

- Introduced `docs-heading-snapshots.test.ts` to ensure stability of rule documentation headings.

- Implemented functions to parse H2 headings and determine package labels from markdown files.

- Created a test to verify that the rule documentation headings remain consistent.

📝 [docs] Add snapshot tests for plugin contracts

- Created `plugin-contract-snapshots.test.ts` to validate the stability of public plugin contracts.

- Normalized parser options and collected sorted rule IDs for each config preset.

- Added tests to ensure exported rule names and preset contracts remain stable.

📝 [docs] Enhance README rules table synchronization tests

- Updated `readme-rules-table-sync.test.ts` to include a test for generated rules markdown.

- Ensured that the generated rules section matches a snapshot for consistency.

📝 [docs] Introduce snapshot tests for rule metadata

- Added `rule-metadata-snapshots.test.ts` to capture normalized rule metadata contracts.

- Implemented functions to normalize and collect metadata for all exported rules.

- Created a test to ensure that the rule metadata contracts remain stable.

🔧 [build] Update Vite configuration for hanging process reporter

- Added a flag to control the activation of the hanging-process reporter.

- Adjusted the reporters list based on the environment variable for better diagnostics.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(015b85e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/015b85e5ec5405a89807ba1767f361084f5df7d7)


- 📝 [docs] Add documentation URLs for TypeFest ESLint rules


- 📜 Updated the `prefer-ts-extras-is-empty` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-equal-type` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-finite` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-infinite` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-integer` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-present-filter` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-present` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-is-safe-integer` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-key-in` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-not` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-entries` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-from-entries` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-has-in` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-has-own` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-keys` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-object-values` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-safe-cast-to` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-set-has` rule to include a documentation URL.

- 📜 Updated the `prefer-ts-extras-string-split` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-abstract-constructor` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-arrayable` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-async-return-type` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-conditional-pick` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-constructor` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-except` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-if` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-iterable-element` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-array` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-object` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-primitive` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-json-value` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-keys-of-union` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-literal-union` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-merge-exclusive` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-non-empty-tuple` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-omit-index-signature` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-partial-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-primitive` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-promisable` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-readonly-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-all-or-none` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-at-least-one` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-exactly-one` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-require-one-or-none` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-required-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-schema` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-non-nullable` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-optional` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-readonly` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-set-required` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-simplify` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-tagged-brands` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-tuple-of` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-array` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-map` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-record` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unknown-set` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-unwrap-tagged` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-value-of` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-writable-deep` rule to include a documentation URL.

- 📜 Updated the `prefer-type-fest-writable` rule to include a documentation URL.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bef8875)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bef8875701aae3580b2a1b137a3d0738267457b0)


- 📝 [docs] Update description for review-hacky-brittle-fixes prompt


- Clarify the purpose of the prompt to perform a comprehensive audit of the repository, focusing on fragile, brittle, or hacky code.

- Remove outdated agent reference for improved clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(12454e9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/12454e9f6e7e4499ac9082c122d0287455fe3bab)


- 📝 [docs] Add blog and architecture decision records for eslint-plugin-typefest

- ✨ [feat] Introduce blog for eslint-plugin-typefest with posts on design and governance

- 📝 [docs] Create ADR 0008 for TypeDoc generation strategy in CI and local development

- 📝 [docs] Create ADR 0009 to establish the blog as an official documentation channel

- 📝 [docs] Create ADR 0010 for governing autofix behavior with safety semantics

- 📝 [docs] Create ADR 0011 for type-aware rule contract and fail-fast behavior

- 🛠️ [fix] Update docusaurus configuration to support blog features and improve navigation

- 🎨 [style] Enhance homepage stats display for better user experience

- 🎨 [style] Refine CSS styles for hero section and overall layout

- 🧪 [test] Add tests for new features and ensure existing functionality remains intact

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6541e53)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6541e53092db4bc31702088ad4a203a3262dfe0b)


- 📝 [docs] Update TypeFest rule documentation for clarity and consistency

- 📝 [docs] Revise `prefer-type-fest-tuple-of` to emphasize deprecated alias usage

- 📝 [docs] Clarify behavior and migration notes in `prefer-type-fest-unknown-array`

- 📝 [docs] Enhance `prefer-type-fest-unknown-map` documentation with intent and usage

- 📝 [docs] Improve `prefer-type-fest-unknown-record` to focus on boundary contracts

- 📝 [docs] Refine `prefer-type-fest-unknown-set` to highlight shared alias benefits

- 📝 [docs] Update `prefer-type-fest-unwrap-tagged` to target deprecated alias usage

- 📝 [docs] Clarify `prefer-type-fest-value-of` to emphasize clarity in value extraction

- 📝 [docs] Revise `prefer-type-fest-writable-deep` to standardize deep mutability usage

- 📝 [docs] Update `prefer-type-fest-writable` to clarify targeted patterns and behavior

- 📝 [docs] Add alternative configuration example for applying recommended rules selectively
🛠️ [fix] Normalize line endings in typed rule tester fixtures

- 🛠️ [fix] Implement line ending normalization to ensure consistent fixture reading

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9acb9a8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9acb9a8bb27cf23d4503b52c095c48120bf5f568)


- 📝 [docs] Adds ADR hub and updates docs build flow

📝 [docs] Adds an ADR section with an index and three accepted decisions to capture architectural intent and reduce repeated dependency-adoption discussions.

- Defines why current internal rule/runtime patterns remain in place and when those decisions should be revisited.

🎨 [style] Updates sidebar badges and accent styling so architecture decisions are easier to find and remain visually consistent with existing documentation sections.

🔧 [build] Updates documentation build orchestration to rely on workspace-level inspector build commands and introduces a faster docs build path for quicker iteration.

- Improves local build ergonomics and keeps generated docs steps aligned across environments.

🧹 [chore] Refreshes selected lint and style tooling versions and expands script-level documentation comments to improve maintenance clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(51d6a5d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/51d6a5d7ca6f3c5e14f32794f20f4c6ddb91f5cd)


- 📝 [docs] Update Code of Conduct to reflect no formal guidelines
🔧 [build] Change logo file types in manifest.json from SVG to PNG
🎨 [style] Enhance case name formatting in ruleTester.ts for better visibility
🔧 [build] Simplify project name label in vite.config.ts from "Frontend" to "Test"
🔧 [build] Update vitest configuration in vitest.stryker.config.ts for improved test handling

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7d246f8)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7d246f84d4928bbae4ddfb3d51bb092a56864ef0)


- 📝 [docs] Update documentation scripts in package.json


- 🔧 Reordered the `docs:toc` and `docs:validate-links` scripts for better clarity and consistency.

- 🛠️ Removed the old `docs:validate-links` script and added it back after `docs:toc` to maintain logical flow.

- 🔧 Updated the `remark` dependencies to ensure the latest features and fixes are utilized.

- 🧹 Removed unused `mdast` dependency to clean up package.json and reduce bloat.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f099e8d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f099e8d191c3e432d3f50535834e08cef9ce09cb)


- 📝 [docs] Update strict and type-fest-types presets documentation


- 📜 Refactor the rules table in `strict.md` for better readability
  
- Added new rules: `prefer-type-fest-abstract-constructor`, `prefer-type-fest-constructor`, `prefer-type-fest-literal-union`, `prefer-type-fest-merge-exclusive`, `prefer-type-fest-required-deep`, `prefer-type-fest-readonly-deep`, and `prefer-type-fest-writable-deep`
  
- Removed outdated rules: `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, `prefer-type-fest-value-of`, and `prefer-type-fest-writable`


- 📜 Refactor the rules table in `type-fest-types.md` for better readability
  
- Added new rules: `prefer-type-fest-abstract-constructor`, `prefer-type-fest-constructor`, `prefer-type-fest-literal-union`, `prefer-type-fest-merge-exclusive`, `prefer-type-fest-required-deep`, `prefer-type-fest-readonly-deep`, and `prefer-type-fest-writable-deep`
  
- Removed outdated rules: `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, `prefer-type-fest-value-of`, and `prefer-type-fest-writable`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(92500d2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/92500d25d901851046813ee34b0d0ba1bc29663f)


- 📝 [docs] Update presets documentation with rule matrices and details


- 📜 Added a comprehensive rule matrix to `index.md` for better visibility of rules, fixes, and preset keys.

- 📜 Included specific rules in the `minimal.md` preset documentation to clarify which rules are included.

- 📜 Expanded the `recommended.md` preset documentation to list all applicable rules, enhancing user guidance.

- 📜 Updated `strict.md` preset documentation with a detailed list of rules to inform users of strict configurations.

- 📜 Enhanced `ts-extras-type-guards.md` with a complete list of rules to provide clarity on type guard functionalities.

- 📜 Updated `type-fest-types.md` to include a detailed list of rules, ensuring users understand the available type fest functionalities.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b8b30d5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b8b30d533d1ccda5f5d9450da6013c9eb6997a57)


- 📝 [docs] Enhance documentation across multiple rules and tests


- 📝 [docs] Add JSDoc comments for utility functions in `prefer-ts-extras-is-empty.ts`

- 📝 [docs] Document utility functions in `prefer-ts-extras-is-infinite.ts`

- 📝 [docs] Improve documentation for helper functions in `prefer-ts-extras-is-present-filter.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-ts-extras-is-present.ts`

- 📝 [docs] Document utility functions in `prefer-ts-extras-not.ts`

- 📝 [docs] Enhance documentation for helper functions in `prefer-ts-extras-object-has-in.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-ts-extras-safe-cast-to.ts`

- 📝 [docs] Document utility functions in `prefer-type-fest-arrayable.ts`

- 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-async-return-type.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-except.ts`

- 📝 [docs] Document utility functions in `prefer-type-fest-json-array.ts`

- 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-json-object.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-json-primitive.ts`

- 📝 [docs] Document utility functions in `prefer-type-fest-json-value.ts`

- 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-non-empty-tuple.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-primitive.ts`

- 📝 [docs] Document utility functions in `prefer-type-fest-promisable.ts`

- 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-tagged-brands.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-unknown-array.ts`

- 📝 [docs] Document utility functions in `prefer-type-fest-unknown-map.ts`

- 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-unknown-record.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `prefer-type-fest-unknown-set.ts`

- 📝 [docs] Document utility functions in `prefer-type-fest-value-of.ts`

- 📝 [docs] Enhance documentation for utility functions in `prefer-type-fest-writable.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `imported-type-aliases.test.ts`

- 📝 [docs] Document utility functions in `ruleTester.ts`

- 📝 [docs] Enhance documentation for utility functions in `configs.test.ts`

- 📝 [docs] Add JSDoc comments for utility functions in `docs-integrity.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(562ff90)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/562ff901516df7171c834f22ed0b83b92cdcc693)


- 📝 [docs] Enhance ESLint rule documentation across multiple files


- ✨ [feat] Add detailed ESLint rule definitions and metadata for `prefer-ts-extras-object-keys`, `prefer-ts-extras-object-values`, `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, `prefer-ts-extras-string-split`, `prefer-type-fest-arrayable`, `prefer-type-fest-async-return-type`, `prefer-type-fest-conditional-pick`, `prefer-type-fest-except`, `prefer-type-fest-if`, `prefer-type-fest-iterable-element`, `prefer-type-fest-json-array`, `prefer-type-fest-json-object`, `prefer-type-fest-json-primitive`, `prefer-type-fest-json-value`, `prefer-type-fest-keys-of-union`, `prefer-type-fest-non-empty-tuple`, `prefer-type-fest-omit-index-signature`, `prefer-type-fest-primitive`, `prefer-type-fest-promisable`, `prefer-type-fest-require-all-or-none`, `prefer-type-fest-require-at-least-one`, `prefer-type-fest-require-exactly-one`, `prefer-type-fest-require-one-or-none`, `prefer-type-fest-schema`, `prefer-type-fest-set-non-nullable`, `prefer-type-fest-set-optional`, `prefer-type-fest-set-readonly`, `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, and `prefer-type-fest-value-of`.

- 📝 [docs] Add JSDoc comments to clarify the purpose and usage of each rule, enhancing maintainability and developer understanding.

- 🧹 [chore] Update `ruleTester` utility functions with additional documentation to improve clarity on their usage and functionality.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ef195de)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ef195de3aaabb27a1e3542df4c1a025a2d28c701)


- 📝 [docs] Update CSS documentation and global styles for Docusaurus

- Added global CSS overrides for Docusaurus documentation site.

- Enhanced comments to clarify the purpose and scope of the CSS file.

- Updated hover background color for sidebar menu links for better accessibility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6863895)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/68638954b10b776b033cd5a207f83531347f28ab)


- 📝 [docs] Adds package-level module docs

📝 [docs] Improves maintainability and generated docs clarity by adding consistent package-level headers across core modules, plugin wiring, and rule implementations.

- 📝 [docs] Clarifies module intent so contributors and tooling can understand responsibilities faster.

📝 [docs] Updates the rules reference table layout to improve readability and quick scanning.

- 🎨 [style] Normalizes column alignment while preserving existing rule metadata.

🧪 [test] Applies the same package-level documentation pattern to test utilities and suites for repository-wide consistency.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(84bc8a1)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/84bc8a1d500497e1ce3bd9302f1aefd69b698c79)


- 📝 [docs] Update documentation for type-fest utility rules


- 🔧 Refactor rule documentation to replace "Legacy" terminology with "Non-canonical" for clarity.

- 📝 Enhance examples in `prefer-type-fest-require-one-or-none.md`, `prefer-type-fest-schema.md`, and other related files to reflect updated import aliases.

- 📝 Modify adoption tips across multiple rule documents to emphasize direct canonical imports and discourage compatibility aliases.

- 📚 Update rollout strategies in various rule documents to clarify migration processes and reduce review noise.

- 🔍 Ensure consistency in references to `typefest.configs["type-fest/types"]` across all relevant documentation files.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(07214d3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/07214d3546cf52dafafc26936403cf090ddffb3c)


- 📝 [docs] Update documentation for type-fest utility types


- 📝 Improve clarity in examples for `prefer-type-fest-set-required`, `prefer-type-fest-simplify`, `prefer-type-fest-tagged-brands`, `prefer-type-fest-tuple-of`, `prefer-type-fest-unknown-array`, `prefer-type-fest-unknown-map`, `prefer-type-fest-unknown-record`, `prefer-type-fest-unknown-set`, `prefer-type-fest-unwrap-tagged`, and `prefer-type-fest-value-of` rules.

- 🔄 Replace non-canonical patterns with comments indicating legacy patterns repeated inline across modules.

- 📚 Enhance the "Why this helps in real projects" section to emphasize shared type vocabulary, safer API evolution, and no runtime overhead.

- 🛠️ Update `eslint.config.mjs` to fix plugin imports and improve configuration.

- 🔄 Update `package-lock.json` and `package.json` to reflect version upgrades for various ESLint plugins, ensuring compatibility and access to new features.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9a45e98)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9a45e98c3c63a49374ed2dbfe37e1a45b518a564)



### ⚡ Performance

- ⚡️ [perf] Update import-x/no-unused-modules rule configuration

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(83baba7)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/83baba78bad3ad109c19e0aee332ffa54f5c0bac)



### 🎨 Styling

- 🎨 [style] Consistent quote style and formatting updates across multiple files

- Changed single quotes to double quotes in `bootstrap-eslint-repo.mjs` for consistency

- Updated script commands in `bootstrap-eslint-repo.mjs` to use double quotes

- Adjusted import statements in `eslint9-compat-smoke.mjs` and test files to use double quotes

- Reformatted code for better readability and consistency in `plugin-entry.test.ts`, `plugin-public-types.test-d.ts`, `plugin-runtime-entry-types.test-d.ts`, `prefer-type-fest-except.test.ts`, `prefer-type-fest-unknown-map.test.ts`, and `prefer-type-fest-unknown-set.test.ts`

- Ensured consistent use of double quotes in mock imports
✨ [feat] Enhance ESLint compatibility and plugin versioning

- Added `toPosixPath` and `collectStringEntries` utility functions in `eslint9-compat-smoke.mjs`

- Modified `createCompatibilityConfig` to accept `fixturePath` and adjust project service options accordingly

- Updated tests in `plugin-entry.test.ts` to assert plugin version against package.json

- Enhanced type assertions in `plugin-runtime-entry-types.test-d.ts` to use the imported plugin directly

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4b8520f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4b8520f0d1e192b2cd41dda6ea899bb5dbc6faa2)


- 🎨 [style] Update Docusaurus config and documentation for improved UI


- Update icon labels in Docusaurus config for better visual consistency

- Enhance project and support section titles with emojis for clarity

- Add nested items under Docs and Rules for better navigation

- Introduce new Blog and Dev sections with structured items for user guidance

- Add rule catalog ID to prefer-ts-extras-array-find-last documentation

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2c033a5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2c033a5e68a590b8d3f08d105957dc468dd7b6b7)


- 🎨 [style] Adjust doMock method signature formatting


- Refactor doMock method declaration to align with TypeScript interface augmentation guidelines.

- Ensure method signature is clearly defined for better readability and maintainability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(f72a493)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/f72a49344875884878dd937a71ae7553da492276)


- 🎨 [style] Update icons and labels in Docusaurus configuration

- Replace emoji labels with Font Awesome icons for consistency in sidebar and navigation

- Adjust styles for improved alignment and spacing in hero cards

🛠️ [fix] Ensure null returns in constrained type retrieval

- Modify return statements to return null instead of undefined for better type handling

- Update conditional checks to include null values for constrained type results

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5c9c3d3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5c9c3d30b1892862be5cdd337cd45ee5034e4d92)


- 🎨 [style] Remove unnecessary whitespace in rule configuration files

- Cleaned up multiple TypeScript rule files by removing trailing whitespace in the configuration sections.

- This change improves code readability and maintains consistency across the codebase.

- Affected files include:
  
- `prefer-ts-extras-assert-present.ts`
  
- `prefer-ts-extras-is-defined-filter.ts`
  
- `prefer-ts-extras-is-defined.ts`
  
- `prefer-ts-extras-is-empty.ts`
  
- `prefer-ts-extras-is-equal-type.ts`
  
- `prefer-ts-extras-is-finite.ts`
  
- `prefer-ts-extras-is-infinite.ts`
  
- `prefer-ts-extras-is-integer.ts`
  
- `prefer-ts-extras-is-present-filter.ts`
  
- `prefer-ts-extras-is-present.ts`
  
- `prefer-ts-extras-is-safe-integer.ts`
  
- `prefer-ts-extras-key-in.ts`
  
- `prefer-ts-extras-not.ts`
  
- `prefer-ts-extras-object-entries.ts`
  
- `prefer-ts-extras-object-from-entries.ts`
  
- `prefer-ts-extras-object-has-in.ts`
  
- `prefer-ts-extras-object-has-own.ts`
  
- `prefer-ts-extras-object-keys.ts`
  
- `prefer-ts-extras-object-values.ts`
  
- `prefer-ts-extras-safe-cast-to.ts`
  
- `prefer-ts-extras-set-has.ts`
  
- `prefer-ts-extras-string-split.ts`
  
- `prefer-type-fest-arrayable.ts`
  
- `prefer-type-fest-async-return-type.ts`
  
- `prefer-type-fest-conditional-pick.ts`
  
- `prefer-type-fest-constructor.ts`
  
- `prefer-type-fest-except.ts`
  
- `prefer-type-fest-if.ts`
  
- `prefer-type-fest-iterable-element.ts`
  
- `prefer-type-fest-json-array.ts`
  
- `prefer-type-fest-json-object.ts`
  
- `prefer-type-fest-json-primitive.ts`
  
- `prefer-type-fest-json-value.ts`
  
- `prefer-type-fest-keys-of-union.ts`
  
- `prefer-type-fest-literal-union.ts`
  
- `prefer-type-fest-merge-exclusive.ts`
  
- `prefer-type-fest-non-empty-tuple.ts`
  
- `prefer-type-fest-omit-index-signature.ts`
  
- `prefer-type-fest-partial-deep.ts`
  
- `prefer-type-fest-primitive.ts`
  
- `prefer-type-fest-promisable.ts`
  
- `prefer-type-fest-readonly-deep.ts`
  
- `prefer-type-fest-require-all-or-none.ts`
  
- `prefer-type-fest-require-at-least-one.ts`
  
- `prefer-type-fest-require-exactly-one.ts`
  
- `prefer-type-fest-require-one-or-none.ts`
  
- `prefer-type-fest-required-deep.ts`
  
- `prefer-type-fest-schema.ts`
  
- `prefer-type-fest-set-non-nullable.ts`
  
- `prefer-type-fest-set-optional.ts`
  
- `prefer-type-fest-set-readonly.ts`
  
- `prefer-type-fest-set-required.ts`
  
- `prefer-type-fest-simplify.ts`
  
- `prefer-type-fest-tagged-brands.ts`
  
- `prefer-type-fest-tuple-of.ts`
  
- `prefer-type-fest-unknown-array.ts`
  
- `prefer-type-fest-unknown-map.ts`
  
- `prefer-type-fest-unknown-record.ts`
  
- `prefer-type-fest-unknown-set.ts`
  
- `prefer-type-fest-unwrap-tagged.ts`
  
- `prefer-type-fest-value-of.ts`
  
- `prefer-type-fest-writable-deep.ts`
  
- `prefer-type-fest-writable.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c37f3cc)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c37f3cca935850135cb83007efd1baf9c4550e2a)


- 🎨 [style] Refactor code for consistency and readability

- Standardize import statements by removing unnecessary spaces

- Align code formatting for better readability

🛠️ [fix] Update type handling in ESLint plugin

- Replace `Omit` with `Except` from `type-fest` for better type safety in `TypefestPluginContract`

- Improve error handling in `loadTypeScriptParser` function

⚡ [perf] Optimize rule implementations for TypeScript extras

- Replace `setHas` with `setContainsValue` for improved performance in multiple rules

- Utilize `getFunctionCallArgumentText` for consistent argument text retrieval in rules

🧪 [test] Enhance test coverage for TypeScript extras rules

- Add tests for new argument text retrieval logic in `prefer-ts-extras-*` rules

- Remove outdated tests that reference `setHas` in favor of `setContainsValue`

📝 [docs] Update documentation for rule behavior

- Clarify the purpose of `prefer-ts-extras-set-has` rule in documentation

- Ensure all rule descriptions reflect the latest implementation changes

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9a70578)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/9a70578fa48e099426d2a71df8f63046a88b9b09)


- 🎨 [style] Clean up trailing whitespace in TypeScript rule files

- Removed trailing whitespace from multiple TypeScript rule files to maintain code consistency and cleanliness.

- Affected files include:
  
- `prefer-ts-extras-is-finite.ts`
  
- `prefer-ts-extras-is-infinite.ts`
  
- `prefer-ts-extras-is-integer.ts`
  
- `prefer-ts-extras-is-present-filter.ts`
  
- `prefer-ts-extras-is-present.ts`
  
- `prefer-ts-extras-is-safe-integer.ts`
  
- `prefer-ts-extras-key-in.ts`
  
- `prefer-ts-extras-not.ts`
  
- `prefer-ts-extras-object-entries.ts`
  
- `prefer-ts-extras-object-from-entries.ts`
  
- `prefer-ts-extras-object-has-in.ts`
  
- `prefer-ts-extras-object-has-own.ts`
  
- `prefer-ts-extras-object-keys.ts`
  
- `prefer-ts-extras-object-values.ts`
  
- `prefer-ts-extras-safe-cast-to.ts`
  
- `prefer-ts-extras-set-has.ts`
  
- `prefer-ts-extras-string-split.ts`
  
- `prefer-type-fest-arrayable.ts`
  
- `prefer-type-fest-async-return-type.ts`
  
- `prefer-type-fest-conditional-pick.ts`
  
- `prefer-type-fest-constructor.ts`
  
- `prefer-type-fest-except.ts`
  
- `prefer-type-fest-if.ts`
  
- `prefer-type-fest-iterable-element.ts`
  
- `prefer-type-fest-json-array.ts`
  
- `prefer-type-fest-json-object.ts`
  
- `prefer-type-fest-json-primitive.ts`
  
- `prefer-type-fest-json-value.ts`
  
- `prefer-type-fest-keys-of-union.ts`
  
- `prefer-type-fest-literal-union.ts`
  
- `prefer-type-fest-merge-exclusive.ts`
  
- `prefer-type-fest-non-empty-tuple.ts`
  
- `prefer-type-fest-omit-index-signature.ts`
  
- `prefer-type-fest-partial-deep.ts`
  
- `prefer-type-fest-primitive.ts`
  
- `prefer-type-fest-promisable.ts`
  
- `prefer-type-fest-readonly-deep.ts`
  
- `prefer-type-fest-require-all-or-none.ts`
  
- `prefer-type-fest-require-at-least-one.ts`
  
- `prefer-type-fest-require-exactly-one.ts`
  
- `prefer-type-fest-require-one-or-none.ts`
  
- `prefer-type-fest-required-deep.ts`
  
- `prefer-type-fest-schema.ts`
  
- `prefer-type-fest-set-non-nullable.ts`
  
- `prefer-type-fest-set-optional.ts`
  
- `prefer-type-fest-set-readonly.ts`
  
- `prefer-type-fest-set-required.ts`
  
- `prefer-type-fest-simplify.ts`
  
- `prefer-type-fest-tagged-brands.ts`
  
- `prefer-type-fest-tuple-of.ts`
  
- `prefer-type-fest-unknown-array.ts`
  
- `prefer-type-fest-unknown-map.ts`
  
- `prefer-type-fest-unknown-record.ts`
  
- `prefer-type-fest-unknown-set.ts`
  
- `prefer-type-fest-unwrap-tagged.ts`
  
- `prefer-type-fest-value-of.ts`
  
- `prefer-type-fest-writable-deep.ts`
  
- `prefer-type-fest-writable.ts`
🧪 [test] Update test files for consistency

- Adjusted test files to remove trailing whitespace and ensure consistent formatting.

- Affected test files include:
  
- `imported-type-aliases.test.ts`
  
- `prefer-type-fest-arrayable.test.ts`
  
- `prefer-type-fest-async-return-type.test.ts`
  
- `prefer-type-fest-json-array.test.ts`
  
- `prefer-type-fest-json-object.test.ts`
  
- `prefer-type-fest-partial-deep.test.ts`
  
- `prefer-type-fest-require-all-or-none.test.ts`
  
- `prefer-type-fest-require-exactly-one.test.ts`
  
- `prefer-type-fest-required-deep.test.ts`
  
- `prefer-type-fest-set-non-nullable.test.ts`
  
- `prefer-type-fest-set-optional.test.ts`
  
- `prefer-type-fest-set-required.test.ts`
  
- `prefer-type-fest-simplify.test.ts`
  
- `prefer-type-fest-tagged-brands.test.ts`
  
- `prefer-type-fest-unknown-array.test.ts`
  
- `prefer-type-fest-unwrap-tagged.test.ts`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e6eeff5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e6eeff586d1d69f4c812df893a00f836dde93222)


- 🎨 [style] Refine stylelint disable comments in custom.css

- Updated stylelint disable comments to remove unnecessary rules

- Maintained essential rules for Docusaurus CSS compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6eb9b0f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6eb9b0ff35cb5769ce2142ae048c29e8e05ec5f9)


- 🎨 [style] Refine stylelint disable comments in CSS module

- Removed unnecessary stylelint rules for improved clarity

- Maintained essential rules to ensure Docusaurus CSS compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1d8c4af)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1d8c4af3441e33c1a4db469903c731a91ea80470)


- 🎨 [style] Improve code formatting and consistency in scripts

- Adjust spacing in parameter definitions in `.github/CleanReleases.ps1` and `.github/RepoSize.ps1`

- Standardize spacing in output formatting for better readability

- Enhance clarity by ensuring consistent spacing in condition checks
✨ [feat] Add bootstrap script for GitHub labels

- Introduce `scripts/bootstrap-labels.ps1` to manage GitHub issue/PR labels

- Implement features for creating/updating labels using GitHub CLI

- Include options for reading label names from `.github/labeler.yml`

- Provide audit and export functionalities for label management

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7f84870)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7f84870ac38c2d089a0bfb6fe85025cce034c2ce)


- 🎨 [style] Clean up code formatting and improve readability

- Removed unnecessary trailing whitespace in multiple files to maintain consistent formatting.

- Adjusted comment formatting for better clarity in several rule files, ensuring that return descriptions are properly wrapped for readability.

🛠️ [fix] Enhance type checks and improve rule implementations

- Added checks for undefined elements in tuple types within `prefer-type-fest-non-empty-tuple.ts` to prevent runtime errors.

- Improved type handling in `prefer-type-fest-promisable.ts` to ensure proper identification of identifier type references.

- Updated logic in `prefer-type-fest-tuple-of.ts` to handle shadowed type parameters correctly, ensuring accurate suggestions for replacements.

🧪 [test] Update and expand test cases for rule validation

- Added new test cases for `prefer-type-fest-value-of` to ensure correct handling of shadowed identifiers.

- Enhanced tests for `prefer-type-fest-tuple-of` to cover scenarios with shadowed type parameters and ensure proper output.

- Refactored existing tests for clarity and consistency, ensuring they align with the latest rule implementations.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b4b1929)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b4b1929c19e9e23e7e2c88229979a2c23473a4b3)


- 🎨 [style] Improve code formatting and consistency across multiple files

- ✨ Adjust spacing around object destructuring in `prefer-ts-extras-array-first.ts`

- 🎨 Standardize spacing in `prefer-type-fest-json-primitive.ts` for better readability

- 🎨 Refactor spacing in `prefer-type-fest-primitive.ts` to enhance clarity

- 🎨 Clean up spacing in `prefer-type-fest-tagged-brands.ts` for uniformity

- 🎨 Normalize spacing in `prefer-type-fest-writable.ts` to maintain style consistency

- 🎨 Update spacing in `imported-type-aliases.test.ts` for improved code aesthetics

- 🎨 Modify spacing in `docs-integrity.test.ts` to align with style guidelines

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(22c06f3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/22c06f32690751743723df370ee9f648bb27b943)


- 🎨 [style] Refactor code formatting for consistency and readability

- Cleaned up import statements across multiple test files by consolidating imports from "vitest"

- Adjusted line breaks and indentation in various test fixtures for improved clarity

- Reformatted conditional statements in test fixtures to enhance readability

🧪 [test] Enhance test coverage for typed rules

- Added tests for `getTypedRuleServices` to ensure correct parser services and type checker retrieval

- Implemented tests for `getSignatureParameterTypeAt` to validate behavior with parameter indices

- Created new test files for `prefer-ts-extras-not` rule to validate its functionality

🛠️ [fix] Corrected issues in test fixtures

- Fixed invalid TypeScript syntax in several test fixtures by ensuring proper function declarations

- Adjusted conditional checks in test fixtures to prevent unexpected behavior during tests

✨ [feat] Introduce new rule: prefer-ts-extras-not

- Developed a new rule to encourage the use of `not` for filtering non-nullable values

- Created corresponding valid and invalid test fixtures to validate the rule's functionality

⚡ [perf] Optimize Vite configuration for better performance

- Updated Vite configuration to improve test execution speed and resource management

- Adjusted coverage settings to ensure accurate reporting and exclude unnecessary files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ab154d)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ab154d52bb4581406410e848c69daebc6d0e847)



### 🧪 Testing

- 🧪 [test] Enhance type safety and listener functionality across multiple test files

- 🧪 [test] Update `prefer-ts-extras-is-present.test.ts` to utilize `getSelectorAwareNodeListener` for `LogicalExpression` listener, improving type safety and ensuring proper function references.
- 🧪 [test] Modify `prefer-ts-extras-key-in.test.ts` to enhance fix handling by checking for mock calls and ensuring proper fallback mechanisms for replacement text.
- 🧪 [test] Refactor `prefer-ts-extras-safe-cast-to.test.ts` to include fallback type checkers and parser services, enhancing the robustness of type checks in the tests.
- 🧪 [test] Improve `prefer-ts-extras-set-has.test.ts` by adding fallback checkers and parser services, ensuring accurate type handling and reporting in tests.
- 🧪 [test] Revise `prefer-ts-extras-string-split.test.ts` to implement fallback type checkers and enhance error handling in parser services.
- 🧪 [test] Update `prefer-type-fest-async-return-type.test.ts` to ensure proper listener references and improve mock handling for type node replacements.
- 🧪 [test] Enhance `prefer-type-fest-json-array.test.ts` by implementing listener checks and ensuring proper handling of mock calls for type node replacements.
- 🧪 [test] Refactor `prefer-type-fest-json-object.test.ts` to improve listener handling and ensure fallback mechanisms are in place for type replacements.
- 🧪 [test] Update `prefer-type-fest-json-primitive.test.ts` to enhance listener functionality and ensure proper handling of mock calls for type replacements.
- 🧪 [test] Revise `prefer-type-fest-unknown-array.test.ts` to implement listener checks for type operators and references, improving type safety in tests.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(2193ed9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/2193ed9abc153379bcb5c989ded4729d78ebd5d6)


- 🧪 [test] Update error handling assertions in tests

- Refactored multiple test cases to replace `.toThrowError()` with `.toThrow()`, aligning with updated Jest practices for error assertions.
- Adjusted tests across various files including `imported-value-symbols.test.ts`, `rule-catalog.test.ts`, `safe-type-operation.test.ts`, and others to ensure consistency and maintainability.
- This change enhances readability and standardizes error handling across the test suite, improving overall test quality and clarity.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(02a1f4e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/02a1f4ea66ef3dda4e2ab79f03851ddaacdd9d70)


- 🧪 [test] Enhance type safety and parsing for TypeFest rules


- ✨ [feat] Introduce `replaceOrThrow` utility function to streamline text replacements in test fixtures across multiple test files.

- 🛠️ [fix] Update `prefer-type-fest-unknown-map.test.ts` to ensure `ReadonlyMap<unknown, unknown>` is correctly replaced with `Readonly<UnknownMap>`, enhancing type safety.

- 🛠️ [fix] Modify `prefer-type-fest-unknown-record.test.ts` to replace `Record<string, unknown>` with `UnknownRecord`, ensuring consistent type usage.

- 🛠️ [fix] Adjust `prefer-type-fest-unknown-set.test.ts` to replace `ReadonlySet<unknown>` with `Readonly<UnknownSet>`, improving type clarity.

- 🛠️ [fix] Revise `prefer-type-fest-unwrap-tagged.test.ts` to replace `UnwrapOpaque<` with `UnwrapTagged<`, ensuring correct type transformation.

- 🛠️ [fix] Update `prefer-type-fest-value-of.test.ts` to replace `T[keyof T]` with `ValueOf<T>`, enhancing type inference.

- 🛠️ [fix] Modify `prefer-type-fest-writable-deep.test.ts` to replace `DeepMutable<TeamConfig>` with `WritableDeep<TeamConfig>`, improving type consistency.

- 🛠️ [fix] Adjust `prefer-type-fest-writable.test.ts` to replace `Mutable<` with `Writable<`, ensuring correct type aliasing.

- 🧪 [test] Add fast-check properties to validate that replacements remain parseable across various test cases, enhancing test coverage and reliability.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d1092f9)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d1092f9268d3ba4649775868068210e930ef9df9)


- 🧪 [test] bolster guards and metadata across rules

- 🛠️ [fix] grow ESLint ignorePattern with v8/c8/nyc/codecov/coveralls tokens to prevent spurious warnings

- 🛠️ [fix] configure minimal plugin preset with explicit `ecmaVersion: "latest"` and `sourceType: "module"`

- 🛠️ [fix] sprinkle defensive `/* v8 ignore */` comments in helper logic to handle sparse‑array and malformed AST cases

- 🧪 [test] add `vi` imports and hook new metadata‑and‑filename smoke helpers in dozens of rule tests

- 🧪 [test] introduce extensive internal listener‑guard suites covering malformed nodes, AST drift, missing imports, shadowed identifiers, empty predicates, test‑file early exits and more

- 🧪 [test] expand valid/invalid examples with spread arguments, non‑literal offsets, super access, nested operator mismatches, recursion cycles, union anomalies, shadowed replacements, disabled fixes, and numerous edge conditions

- ✨ [feat] enhance test infrastructure for rule metadata verification and simplify repeated patterns across specs

- 🧪 [test] update many existing tests with new fixtures, outputs and scenario names to improve coverage and resilience

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4c685cb)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4c685cbac3253139b206443b8fa80571a470b30b)


- 🧪 [test] Refactor test cases to use 'test' instead of 'it' for consistency

- Updated all test files to replace 'it' with 'test' for better readability and consistency across the test suite.

- Ensured that all relevant test cases maintain their functionality after the change.

🛠️ [fix] Change boolean checks to use 'toBeTruthy()' for clarity

- Modified assertions in multiple test files to use 'toBeTruthy()' instead of 'toBe(true)' for improved clarity in boolean checks.

🎨 [style] Clean up import statements and formatting

- Removed duplicate import statements and ensured consistent formatting across test files.

- Added spacing and line breaks for better readability in several test files.

📝 [docs] Update documentation comments for clarity

- Enhanced documentation comments in various test files to provide clearer context and explanations for the tests being conducted.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(10c699a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/10c699af540ea73a73ab0e69acb9d2c217b3d9ff)


- 🧪 [test] Expands type-utility rule coverage

🧪 [test] Strengthens rule reliability by adding edge-case assertions for detection and autofix behavior across multiple type-utility preference rules.

- Adds reversed-union, whitespace-normalized, extra/missing generic argument, and nested-type scenarios to reduce false positives and false negatives.

- Verifies non-fix behavior when required imports are missing, so diagnostics stay accurate without unsafe edits.
🧪 [test] Broadens valid-case coverage for multi-member unions and duplicate-member combinations to ensure rules trigger only on exact intended patterns.
🎨 [style] Normalizes import ordering and modernizes matcher assertions and regex flags in metadata checks to keep tests consistent and less brittle.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(145743a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/145743a270bfa524527bdcfd1ff264a7fce87aa1)


- 📝 [test] Enhance type-fest rule tests with additional cases


- ✨ [test] Add valid cases for Awaited with Promise and qualified ReturnType

- ✨ [test] Introduce inline fixable cases for ConditionalPick and update error messages

- ✨ [test] Add tests for constructor signature validation

- ✨ [test] Expand Except tests with inline fixable cases and valid namespace aliases

- ✨ [test] Introduce inline fixable cases for IfAny and IsAny

- ✨ [test] Add tests for IterableElement and SetElement with inline fixable cases

- ✨ [test] Enhance JsonArray tests with various valid and invalid cases

- ✨ [test] Add tests for JsonObject with inline invalid cases

- ✨ [test] Expand JsonValue tests with inline invalid cases and valid types

- ✨ [test] Introduce KeysOfUnion tests with inline fixable cases

- ✨ [test] Add tests for NonEmptyTuple with various valid cases

- ✨ [test] Enhance OmitIndexSignature tests with inline fixable cases

- ✨ [test] Introduce RequireAllOrNone tests with inline fixable cases

- ✨ [test] Add RequireAtLeastOne tests with inline fixable cases

- ✨ [test] Introduce RequireExactlyOne tests with inline fixable cases

- ✨ [test] Add RequireOneOrNone tests with inline fixable cases

- ✨ [test] Enhance TaggedBrands tests with inline invalid cases

- ✨ [test] Add UnknownArray tests with various valid and invalid cases

- ✨ [test] Introduce UnknownMap tests with additional valid cases

- ✨ [test] Add UnknownRecord tests with inline invalid cases

- ✨ [test] Enhance UnknownSet tests with additional valid cases

- ✨ [test] Expand Writable tests with various valid cases and namespace aliases

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ec44a53)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ec44a53779b9a5e7d5ea0f2e0f08c7c318a92366)



### 🧹 Chores

- Release v1.0.0 [`(fe9afd2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fe9afd26fe79835b171003e19575a90518e14be6)


- 🧹 [chore] Clean up configuration files by removing bootstrap instructions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79d484b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/79d484b673d237e04d4d6a36eaa413162edec085)


- 🧹 [chore] migrate documentation URLs to GitHub Pages and bump dev dependencies

- update base docs URL from custom domain to GitHub Pages in internal helpers and rule metadata
  ensures generated rule links point at `nick2bad4u.github.io/...`
- adjust tests and URL construction to reflect new base and remove `.md` suffix
- bump various ESLint‑related dependencies (html‑eslint plugins, compat, jsonc, stylelint, etc.)
  to keep linting tooling up‑to‑date

The changes simplify hosting strategy for docs and keep development dependencies current.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(aeb72ee)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/aeb72eeeb9be48054bf96209b07ff62e9f777d33)


- 🗑️ [chore] Remove ESLint Config Inspector build and verification scripts

- Deleted `build-eslint-inspector.mjs` and `verify-eslint-inspector.mjs` scripts

- These scripts were responsible for building and verifying the ESLint Config Inspector integration

- Their removal simplifies the project structure and eliminates unused code

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(79dd244)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/79dd2444ee0729ab547a608945aca8f9097070fc)



### 👷 CI/CD

- 👷 [ci] Update Codecov action version for improved functionality

- Updated the Codecov test results action to a specific commit for better stability and features

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(232fe61)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/232fe61b01124fd8bf0113271cf6ff2eaba70c99)



### 🔧 Build System

- 📦️ [build] Upgrade dependencies in package.json

- Upgraded "@types/node" from "^25.4.0" to "^25.5.0" for improved type definitions.
- Updated "@vitest/coverage-v8", "@vitest/eslint-plugin", and "@vitest/ui" to "^4.1.0" and "^1.6.11" for better compatibility and features.
- [dependency] Updateed "commitlint" from "^20.4.3" to "^20.4.4" for minor improvements.
- Upgraded "eslint-plugin-jsonc" from "^3.1.1" to "^3.1.2" for enhanced JSONC linting.
- Updated "vite" from "^7.3.1" to "^8.0.0" for new features and performance improvements.
- [dependency] Updateed "vitest" from "^4.0.18" to "^4.1.0" for better testing capabilities.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fbc4753)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fbc47539a7a9af13b983e0061e147e1d100d83b2)


- 🔧 [build] Update package dependencies and configurations

- 🔧 Update packageManager to npm@11.11.1 in package.json

- 🔧 Upgrade eslint-plugin-import-x to version 4.16.2 in package.json and package-lock.json

- 🔧 Add @package-json/types as a dev dependency in package-lock.json

- 🎨 Adjust files entry in package.json to include docs/rules/**
🧪 [test] Clean up test file by removing unnecessary blank line in plugin-entry.test.ts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(c2cb0ea)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/c2cb0ea80a19d336113a4599c453eec35166ddb1)


- 🔧 [build] Update package configurations and dependencies

- 🛠️ [fix] Set main entry point in package.json to docusaurus.config.ts

- 🛠️ [fix] Add OS compatibility field in package.json and package-lock.json

- 🔧 [build] Upgrade eslint-plugin-package-json to version 0.90.0

- 🔧 [build] Upgrade eslint-plugin-sonarjs to version 4.0.2

- 📝 [docs] Add tests for rule catalog integrity and documentation URLs

- 🧪 [test] Implement tests for rule catalog entries and metadata validation

- 🧪 [test] Add tests for docusaurus site configuration integrity

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4d8023a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4d8023abd7080def62cafa17ec1128de75c17d7d)


- 🔧 [build] Update code for improved readability and safety

- 🛠️ Refactor rule access to use bracket notation for consistency

- 🛠️ Enhance ESLint plugin configuration handling with new utility functions

- 🛠️ Improve TypeScript configuration to ensure proper type checking

- 🛠️ Add type definitions for untyped third-party modules

- 🛠️ Adjust ESLint configuration to include additional paths for better module resolution

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6d7d427)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6d7d4277dbb4ab767076fce90a84934e4bfd04f9)


- 🔧 [build] Refactor vitest globals type definitions

- 🛠️ Update import statement for createTypedRule

- 🔧 Change CreateTypedRuleSelectorAwarePassThrough type to use createTypedRuleType

- 🛠️ Adjust doMock method signature for improved type safety

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db4aff6)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db4aff6ccb4a292eb3621a53cfa73f6379a17567)


- 🔧 [build] Update TypeScript ESLint dependencies and related packages

- Upgrade @typescript-eslint/parser, @typescript-eslint/type-utils, and @typescript-eslint/utils to version 8.57.0

- Update @types/node to version 25.4.0

- Upgrade @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester to version 8.57.0

- Update @vitest/eslint-plugin to version 1.6.10

- Upgrade eslint-plugin-regexp to version 3.1.0

- Update stylelint-plugin-use-baseline to version 1.2.7

- Upgrade typescript-eslint to version 8.57.0

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(124785e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/124785ed1892b86fedc8ad44509902dd39332a47)


- 🔧 [build] Update PowerShell script execution commands and error handling


- 🛠️ [fix] Modify Windows script execution commands in hooks.json to use PowerShell with appropriate flags for better compatibility.

- 🛠️ [fix] Change error handling in log-prompt.ps1 and remove-temp.ps1 from "Stop" to "Continue" to allow scripts to proceed even if an error occurs.

- 🚜 [refactor] Update log directory path in log-prompt.ps1 for consistency and clarity.

- 🚜 [refactor] Refactor multiple rules in the TypeScript codebase to replace hardcoded "type-fest" strings with a centralized constant, TYPE_FEST_MODULE_SOURCE, improving maintainability and reducing potential errors.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(8bee5b3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/8bee5b36f4ba4bc67ec6010bc65a73e60d83a9c7)


- 🔧 [build] Refactor module source imports for consistency across rules

- 🛠️ [fix] Update all rules to use `TS_EXTRAS_MODULE_SOURCE` instead of hardcoded string "ts-extras" for improved maintainability and consistency.
- 📝 [docs] Add a new test file for bounded cache functionality to ensure proper behavior of caching mechanisms.
- ⚡ [perf] Implement bounded cache logic to handle nullable values correctly and optimize eviction of least-recently-used entries.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0ec1cf7)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0ec1cf79284b6bda8b6c4bc68d32972cc7f7c80b)


- 🔧 [build] Update package-lock.json to remove unnecessary dev flags


- Removed "dev": true from multiple dependencies in package-lock.json to clean up the lock file and ensure only necessary dev dependencies are marked as such.

- Added new dependency "postcss-syntax" with "dev": true and "peer": true, requiring "postcss" version >=5.0.0.

- Introduced "tailwindcss" as a new dependency with "dev": true and "peer": true.

✨ [feat] Enhance type name resolution in prefer-ts-extras-set-has rule


- Integrated `getTypeName` function to improve type name retrieval for candidate types.

- Updated logic to check both the resolved type name and the symbol name for "ReadonlySet" and "Set" to enhance type detection accuracy.

✨ [feat] Improve type name handling in prefer-ts-extras-string-split rule


- Implemented `getTypeName` function to retrieve the type name of candidate types.

- Modified fallback logic to check the resolved type name for "String" when name-based fallback is necessary, ensuring more robust type resolution.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e2a2129)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e2a21297ba718c316f6e158605474e3b72384a0b)


- 🔧 [build] Update Stryker Vitest configuration

- Add setupFiles entry to specify custom setup script for Vitest

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a0f74f2)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a0f74f2c7e56fda2ae08bd98de7c3bbb1fda951c)


- 🔧 [build] Update dependencies and add autofix smoke test


- 🔧 [build] Upgrade `eslint-plugin-array-func` from `^5.1.0` to `^5.1.1`

- 🔧 [build] Upgrade `fast-check` from `^4.5.3` to `^4.6.0`

- 🔧 [build] Upgrade `pure-rand` from `^7.0.1` to `^8.0.0`

- ✨ [feat] Add `create-eslint-plugin-project.mjs` script for bootstrapping npm projects with production and dev dependencies

- 🧪 [test] Introduce `autofix-fixtures-all-rules-smoke.test.ts` to validate ESLint autofix functionality in memory

- 🧪 [test] Implement fixture file collection and linting for smoke tests

- 🧪 [test] Ensure fixture files remain unchanged after linting

- 🧹 [chore] Add `.gitkeep` to `test/fixtures/autofix-smoke` directory to maintain structure

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(fb71524)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/fb71524bea3708c7d8be18eec2bbbdd101eec1a4)


- 🔧 [build] Update dependencies for TypeDoc and ESLint plugins

- 📝 Update `typedoc-plugin-dt-links` from `^2.0.44` to `^2.0.45` in `package.json` and `package-lock.json`

- 📝 Update `eslint-plugin-tsdoc-require` to `eslint-plugin-tsdoc-require-2` from `^0.0.3` to `^1.0.1` in `package.json` and `package-lock.json`

✨ [feat] Enhance GitHub stats component with new badge styles

- 🎨 Change badge URLs in `GitHubStats.jsx` to use `flat.badgen.net` for improved styling

- 📝 Update alt text for badges to reflect new styles

✨ [feat] Add quick links section to homepage

- 📝 Introduce `heroQuickLinks` array in `index.jsx` for easy navigation to rules and API docs

- 🎨 Render quick links in the homepage layout with appropriate styling

🎨 [style] Improve CSS for inline links and quick links

- 📝 Add styles for `.heroInlineLink` and `.heroQuickLink` in `index.module.css` for better visual appearance

- 🎨 Adjust hover and focus states for improved accessibility

🛠️ [fix] Refactor import insertion logic to use new utility functions

- 📝 Replace `arrayAt` with `isDefined` in `import-insertion.ts` for better clarity

- 📝 Update logic to handle undefined values more gracefully

🧪 [test] Add tests for new functionality in rule listener selector convention

- 📝 Implement tests to validate the behavior of broad listener matches in `rule-listener-selector-convention.test.ts`

- 🎨 Ensure tests cover edge cases for parsing and matching listener methods

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a916f48)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a916f4835b426f01dc82ae38e14719a1953c3bed)


- 🔧 [build] Update package dependencies in package.json and package-lock.json

- 🔄 [dependency] Update eslint-plugin-package-json ^0.89.4

- 🔄 [dependency] Update knip ^5.86.0

- 🔄 [dependency] Update postcss-sort-media-queries ^6.1.0

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3231367)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3231367cb944df9345c0de8b7934346044e8ba68)


- 🔧 [build] Update TypeFest plugin and tests for improved rule documentation synchronization

- 🛠️ Refactor rule documentation synchronization logic to derive `docs.recommended` from preset references

- 🔧 Add `syncDerivedRuleDocsMetadata` function to ensure rule metadata reflects actual preset membership

- 📝 Enhance tests to verify that rule documentation correctly indicates recommended status based on configurations

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ee0edba)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ee0edbad0a9c287b0e05ce6f63410fa34ec1682b)


- 🔧 [build] Update TypeFest rule configurations for improved type inference

- 🛠️ [fix] Set `recommended` to `false` for `prefer-ts-extras-object-keys` and `prefer-ts-extras-object-values` rules
- 🛠️ [fix] Set `recommended` to `true` for `prefer-ts-extras-safe-cast-to`, `prefer-ts-extras-set-has`, and other TypeFest rules
- ⚡ [perf] Introduce `typefestConfigs` for all rules to specify recommended configurations
 
- 📜 [docs] Update documentation URLs for better reference
- 🧪 [test] Enhance rule metadata tests to validate `recommended` and `typefestConfigs` properties
 
- 🔍 [test] Ensure type checks for `recommended` are boolean
 
- 🔍 [test] Validate that `typefestConfigs` contains valid references

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(6a2586a)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/6a2586aa770cc53bf466a6b3b04e140dc3e62dc6)


- 🔧 [build] Optimize scope variable retrieval with cycle detection

- 🛠️ Refactor `getVariableInScopeChain` to use a two-pointer technique for cycle detection, improving performance and preventing infinite loops.

- 📝 Update logic to return variables in cyclic scope chains when encountered before cycle detection.

✨ [feat] Enhance TypeScript ESLint node autofix capabilities

- 🛠️ Introduce caching for namespace import names to improve performance in `getTypeScriptEslintNamespaceImportNames`.

- ⚡ Optimize type resolution checks in various rules, including `prefer-ts-extras-set-has`, `prefer-ts-extras-string-split`, and `prefer-ts-extras-safe-cast-to`, by implementing caching mechanisms.

🧪 [test] Add comprehensive tests for new features and optimizations

- 📝 Implement tests for cyclic scope variable retrieval in `scope-variable.test.ts`.

- 📝 Add tests for namespace import collection and caching behavior in `import-analysis.test.ts`.

- 📝 Create tests to ensure proper handling of parser service failures in `prefer-ts-extras-safe-cast-to.test.ts`, `prefer-ts-extras-set-has.test.ts`, and `prefer-ts-extras-string-split.test.ts`.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ccc8365)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ccc8365d2550d4881467b30ea50e86340277fdbd)


- 🔧 [build] Refactor TypeScript ESLint node autofix suppression logic

- 🛠️ Update import from `createTypeScriptEslintNodeAutofixSuppressionChecker` to `createTypeScriptEslintNodeExpressionSkipChecker` in multiple rule files for consistency

- 🔄 Modify logic in `preferTsExtrasIsDefined`, `preferTsExtrasIsEmpty`, `preferTsExtrasIsInfinite`, and `preferTsExtrasIsPresent` rules to utilize the new checker

- 🧪 Adjust test cases to reflect changes in autofix suppression behavior, ensuring proper reporting without applying autofixes for AST-node comparisons

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(7a1aa5f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/7a1aa5f593e42eda2c185e2c70b3c48a5c0cf39d)


- 🔧 [build] Refactor rule metadata test imports and remove deprecated tests


- 🛠️ Update import statements in multiple test files to replace `addTypeFestRuleMetadataAndFilenameFallbackTests` with `addTypeFestRuleMetadataSmokeTests` for consistency and clarity.

- 🧹 Remove `rules-test-file-guards.test.ts` and `typed-rule-internal.test.ts` as they are no longer needed, streamlining the test suite.

- 🔧 Adjust test cases across various files to ensure they utilize the new metadata test function, maintaining the integrity of the test coverage.

- 📝 Ensure all relevant test descriptions and structures are preserved during the refactor to maintain clarity in test intentions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4ae5381)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4ae53812112c8f33d658c3e6be6b3e82a5b42438)


- 🔧 [build] Remove unused import for remark-ignore from .remarkrc.mjs

- Clean up the configuration file by eliminating the import statement for remark-ignore, which is no longer needed.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(d3cc622)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/d3cc622c6e7bfcf17735a7bb5771ffbbea089e40)


- 🔧 [build] Update stylelint-plugin-use-baseline to version 1.2.6

- Updated dependency version in package.json and package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a37b73b)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a37b73bcb7b205c52c9cfe40dcc57ca2ce5cddec)


- 🔧 [build] Refactor type reference handling in tests


- 🛠️ Update type reference variable names from `typeReference` to `tsReference` for consistency across multiple test files.

- 🧪 Modify parsing functions to return `tsReference` instead of `typeReference` in:
  
- `prefer-type-fest-primitive.test.ts`
  
- `prefer-type-fest-readonly-deep.test.ts`
  
- `prefer-type-fest-require-all-or-none.test.ts`
  
- `prefer-type-fest-require-at-least-one.test.ts`
  
- `prefer-type-fest-require-exactly-one.test.ts`
  
- `prefer-type-fest-require-one-or-none.test.ts`
  
- `prefer-type-fest-required-deep.test.ts`
  
- `prefer-type-fest-schema.test.ts`
  
- `prefer-type-fest-set-non-nullable.test.ts`
  
- `prefer-type-fest-set-optional.test.ts`
  
- `prefer-type-fest-set-readonly.test.ts`
  
- `prefer-type-fest-set-required.test.ts`
  
- `prefer-type-fest-simplify.test.ts`
  
- `prefer-type-fest-tagged-brands.test.ts`
  
- `prefer-type-fest-tuple-of.test.ts`
  
- `prefer-type-fest-unknown-array.test.ts`
  
- `prefer-type-fest-unknown-map.test.ts`
  
- `prefer-type-fest-unknown-record.test.ts`
  
- `prefer-type-fest-unknown-set.test.ts`
  
- `prefer-type-fest-unwrap-tagged.test.ts`
  
- `prefer-type-fest-value-of.test.ts`
  
- `prefer-type-fest-writable-deep.test.ts`
  
- `prefer-type-fest-writable.test.ts`

- 🎨 Improve readability and maintainability of test code by ensuring consistent naming conventions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(bf40c75)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/bf40c75de70bb03d12426e9a6b4ca61121d95495)


- 🔧 [build] Update configuration and dependencies

- 🛠️ [fix] Update eslint-plugin-file-progress-2 to version 3.4.2

- 📝 [docs] Modify tsconfig files for improved declaration handling
  
- 🔧 Set "isolatedDeclarations" to true in tsconfig.build.json
  
- 🔧 Set "isolatedModules" to true in tsconfig.build.json
  
- 🔧 Enable "checkJs" and "erasableSyntaxOnly" in tsconfig.eslint.json and tsconfig.js.json

- 🚜 [refactor] Change exported types to internal types for better encapsulation
  
- 🔄 Change "export type UnionArrayLikeMatchMode" to "type UnionArrayLikeMatchMode" in array-like-expression.ts
  
- 🔄 Change "export type ImportedTypeAliasMatch" to "type ImportedTypeAliasMatch" in imported-type-aliases.ts
  
- 🔄 Change "export type ImportedValueAliasMap" to "type ImportedValueAliasMap" in imported-value-symbols.ts

- 🎨 [style] Update DEFAULT_RULE_DOCS_URL_BASE to a constant in rule-docs-url.ts

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(475a43e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/475a43e989567f2e4c57633edf650a928ef71925)


- 🔧 [build] Add defaultOptions to multiple TypeScript rules


- ✨ [feat] Introduced `defaultOptions: []` in `prefer-ts-extras-not.ts`, ensuring consistent default behavior across rules.

- ✨ [feat] Added `defaultOptions: []` to `prefer-ts-extras-object-entries.ts`, enhancing rule configurability.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-ts-extras-object-from-entries.ts`, standardizing rule options.

- ✨ [feat] Included `defaultOptions: []` in `prefer-ts-extras-object-has-in.ts`, improving rule consistency.

- ✨ [feat] Set `defaultOptions: []` in `prefer-ts-extras-object-has-own.ts`, aligning with other rules.

- ✨ [feat] Added `defaultOptions: []` to `prefer-ts-extras-object-keys.ts`, ensuring uniformity in rule definitions.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-ts-extras-object-values.ts`, enhancing rule behavior.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-ts-extras-safe-cast-to.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-ts-extras-set-has.ts`, improving rule configurability.

- ✨ [feat] Added `defaultOptions: []` to `prefer-ts-extras-string-split.ts`, ensuring consistent default behavior.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-arrayable.ts`, enhancing rule configurability.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-async-return-type.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-conditional-pick.ts`, aligning with other rules.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-constructor.ts`, ensuring uniformity in rule definitions.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-except.ts`, improving rule consistency.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-if.ts`, enhancing rule behavior.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-iterable-element.ts`, standardizing rule options.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-json-array.ts`, ensuring consistent default behavior.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-json-object.ts`, enhancing rule configurability.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-json-primitive.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-json-value.ts`, improving rule consistency.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-keys-of-union.ts`, ensuring uniformity in rule definitions.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-literal-union.ts`, enhancing rule behavior.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-merge-exclusive.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-non-empty-tuple.ts`, improving rule configurability.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-omit-index-signature.ts`, ensuring consistent default behavior.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-partial-deep.ts`, enhancing rule behavior.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-primitive.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-promisable.ts`, improving rule consistency.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-readonly-deep.ts`, ensuring uniformity in rule definitions.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-require-all-or-none.ts`, enhancing rule configurability.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-require-at-least-one.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-require-exactly-one.ts`, improving rule consistency.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-require-one-or-none.ts`, ensuring consistent default behavior.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-required-deep.ts`, enhancing rule behavior.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-schema.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-set-non-nullable.ts`, improving rule configurability.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-set-optional.ts`, ensuring uniformity in rule definitions.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-set-readonly.ts`, enhancing rule behavior.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-set-required.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-simplify.ts`, improving rule consistency.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-tagged-brands.ts`, ensuring consistent default behavior.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-tuple-of.ts`, enhancing rule configurability.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-unknown-array.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-unknown-map.ts`, improving rule consistency.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-unknown-record.ts`, ensuring uniformity in rule definitions.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-unknown-set.ts`, enhancing rule behavior.

- ✨ [feat] Introduced `defaultOptions: []` in `prefer-type-fest-unwrap-tagged.ts`, standardizing rule options.

- ✨ [feat] Set `defaultOptions: []` in `prefer-type-fest-value-of.ts`, improving rule configurability.

- ✨ [feat] Added `defaultOptions: []` to `prefer-type-fest-writable-deep.ts`, ensuring consistent default behavior.

- ✨ [feat] Implemented `defaultOptions: []` in `prefer-type-fest-writable.ts`, enhancing rule behavior.

🧪 [test] Update tests to reflect changes in rule configurations


- 🧪 [test] Modified `configs.test.ts` to utilize `UnknownRecord` from `type-fest`, improving type safety.

- 🧪 [test] Updated `prefer-type-fest-writable-deep.test.ts` to reflect changes in return types, ensuring consistency.

- 🧪 [test] Adjusted `typed-rule-internal.test.ts` to improve clarity in test descriptions and ensure accurate path recognition.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9082660)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/90826605cb10f2a9ca47e47f8aafaa621e972e9b)


- 🔧 [build] Refactor benchmark and test configurations

- 🛠️ Update benchmark directory path to use `import.meta.dirname`

- 🛠️ Replace `null` checks with `!= null` for candidate variables in stress tests

- 🛠️ Modify ESLint stats calculation to use `Math.sumPrecise`

- 🛠️ Remove deprecated `no-constructor-bind` plugin from configurations

- 🛠️ Add benchmarks to ESLint and TypeScript configurations

- 🛠️ Update type definitions to use `Readonly<UnknownArray>` in tests

- 🛠️ Adjust Vite configuration to include benchmark files

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(528c601)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/528c601c385c557e677649bbaa06af894e6e9f82)


- 🔧 [build] Update dependencies in package.json and package-lock.json

- 🛠️ Update `eslint-plugin-jsdoc` from `^62.7.0` to `^62.7.1` to incorporate the latest improvements and fixes.

- 🧹 Remove unused dependencies:
  
- `eslint-plugin-mdx` version `^3.6.2`
  
- `eslint-plugin-storybook` version `^10.2.11`
  
- `storybook` version `^10.2.11`

- 🔧 Clean up `package-lock.json` by removing entries for the removed dependencies and updating the lock file accordingly.

🧪 [test] Add unit tests for typed-rule internal helpers

- ✨ Introduce a new test file `typed-rule-internal.test.ts` to validate the behavior of the `isTestFilePath` function.

- 📝 Implement tests to ensure that various file paths do not get incorrectly identified as test files, covering a range of common file naming conventions.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(db80fb0)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/db80fb0425ed6198b5e3c426c2632208081053ad)


- 🔧 [build] Update aliasReplacementFix checks for consistency across rules

- 🛠️ [fix] Change condition from `!replacementFix` to `replacementFix === null` in multiple rules to ensure clarity in reporting

- 🛠️ [fix] Adjust handling of `aliasReplacementFix` to check for `null` instead of using a truthy check in various rules

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ba3b799)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ba3b799b909cd67fe3c334cfb9aec7da650e57a5)


- 🔧 [build] Mark rules as non-deprecated


- 📝 Update metadata for multiple rules in the TypeScript extras library to indicate they are not deprecated.

- 🔧 Set `deprecated: false` for the following rules:
  
- prefer-ts-extras-array-find-last-index
  
- prefer-ts-extras-array-find-last
  
- prefer-ts-extras-array-find
  
- prefer-ts-extras-array-first
  
- prefer-ts-extras-array-includes
  
- prefer-ts-extras-array-join
  
- prefer-ts-extras-array-last
  
- prefer-ts-extras-as-writable
  
- prefer-ts-extras-assert-defined
  
- prefer-ts-extras-assert-error
  
- prefer-ts-extras-assert-present
  
- prefer-ts-extras-is-defined-filter
  
- prefer-ts-extras-is-defined
  
- prefer-ts-extras-is-empty
  
- prefer-ts-extras-is-equal-type
  
- prefer-ts-extras-is-finite
  
- prefer-ts-extras-is-infinite
  
- prefer-ts-extras-is-integer
  
- prefer-ts-extras-is-present-filter
  
- prefer-ts-extras-is-present
  
- prefer-ts-extras-is-safe-integer
  
- prefer-ts-extras-key-in
  
- prefer-ts-extras-not
  
- prefer-ts-extras-object-entries
  
- prefer-ts-extras-object-from-entries
  
- prefer-ts-extras-object-has-in
  
- prefer-ts-extras-object-has-own
  
- prefer-ts-extras-object-keys
  
- prefer-ts-extras-object-values
  
- prefer-ts-extras-safe-cast-to
  
- prefer-ts-extras-set-has
  
- prefer-ts-extras-string-split
  
- prefer-type-fest-arrayable
  
- prefer-type-fest-async-return-type
  
- prefer-type-fest-conditional-pick
  
- prefer-type-fest-constructor
  
- prefer-type-fest-except
  
- prefer-type-fest-if
  
- prefer-type-fest-iterable-element
  
- prefer-type-fest-json-array
  
- prefer-type-fest-json-object
  
- prefer-type-fest-json-primitive
  
- prefer-type-fest-json-value
  
- prefer-type-fest-keys-of-union
  
- prefer-type-fest-literal-union
  
- prefer-type-fest-merge-exclusive
  
- prefer-type-fest-non-empty-tuple
  
- prefer-type-fest-omit-index-signature
  
- prefer-type-fest-partial-deep
  
- prefer-type-fest-primitive
  
- prefer-type-fest-promisable
  
- prefer-type-fest-readonly-deep
  
- prefer-type-fest-require-all-or-none
  
- prefer-type-fest-require-at-least-one
  
- prefer-type-fest-require-exactly-one
  
- prefer-type-fest-require-one-or-none
  
- prefer-type-fest-required-deep
  
- prefer-type-fest-schema
  
- prefer-type-fest-set-non-nullable
  
- prefer-type-fest-set-optional
  
- prefer-type-fest-set-readonly
  
- prefer-type-fest-set-required
  
- prefer-type-fest-simplify
  
- prefer-type-fest-tagged-brands
  
- prefer-type-fest-tuple-of
  
- prefer-type-fest-unknown-array
  
- prefer-type-fest-unknown-map
  
- prefer-type-fest-unknown-record
  
- prefer-type-fest-unknown-set
  
- prefer-type-fest-unwrap-tagged
  
- prefer-type-fest-value-of
  
- prefer-type-fest-writable-deep
  
- prefer-type-fest-writable

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(46e0d73)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/46e0d732d26617586d5b1533da10fd9d729bec56)


- 🔧 [build] Raises lint baseline and hardens rules

🔧 [build] Converts multiple previously disabled lint checks to warnings and adds extra markup/config warnings to catch quality issues earlier without blocking development.

- Improves incremental enforcement by surfacing problems sooner while avoiding abrupt error-level breakage.

🚜 [refactor] Reworks primitive-union detection to use parser-provided node-type constants and a set-backed type guard instead of string-switch matching.

- Improves type safety, reduces branching complexity, and keeps matching logic easier to maintain.

🎨 [style] Normalizes internal listener and helper formatting across authored rule implementations for consistency with stricter lint/style expectations.

🧪 [test] Refactors suites to a consistent structure, strengthens AST-node assertions with shared constants, and hardens metadata/import/assertion checks.

- Aligns edge-case expectations for suggestion behavior and escaped template placeholders to reduce brittle test outcomes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(3ad591e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/3ad591e4f8be1ffade32bc896ec0af34673ef703)


- 🔧 [build] Update dependencies in package.json


- 📦 Upgrade @typescript-eslint/parser and @typescript-eslint/utils to version 8.56.1 for improved TypeScript support.

- 📦 Upgrade @typescript-eslint/eslint-plugin and @typescript-eslint/rule-tester to version 8.56.1 for better linting capabilities.

- 📦 Upgrade eslint to version 10.0.2 for bug fixes and performance improvements.

- 📦 Upgrade eslint-plugin-storybook to version 10.2.11 for enhanced Storybook integration.

- 📦 Upgrade storybook to version 10.2.11 for the latest features and fixes.

- 📦 Upgrade typescript-eslint to version 8.56.1 for consistency with other TypeScript ESLint packages.

- 📦 Update peerDependencies to require eslint version 10.0.2 for compatibility.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(4f1aede)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/4f1aede544912eba9af43a5078b774ede5845435)


- 🔧 [build] Update Stryker configuration for improved testing

- Adjust `test:stryker` scripts to use `--ignoreStatic` flag for better performance

- Change `ignoreStatic` option in Stryker config to `false` for comprehensive mutant testing

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(28104ce)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/28104ce26257b19d12fb03c117832bb62fab0a26)


- 🔧 [build] Update Stryker configuration and package.json scripts

- 🛠️ Remove outdated mutation testing scripts from package.json

- ✨ Add new Stryker testing scripts for improved mutation testing

- ⚡ Enhance Stryker configuration with ignoreStatic and disableTypeChecks options

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5f83e37)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5f83e378a295fcba40c50841f08b8e13223fba6a)


- 🔧 [build] Update package.json and package-lock.json

- ✨ Add overrides for jsonc-eslint-parser to use version ^3.1.0

- 🔧 Remove unused dependencies from package-lock.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b934c2e)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b934c2e401cac9ef0889f3d606107b6ee6e0716e)


- 🔧 [build] Update dependencies in package.json

- 🛠️ Update `eslint-plugin-jsonc` from `^3.0.0` to `^2.21.1`

- 🛠️ Update `jsonc-eslint-parser` from `^3.1.0` to `^3.0.0`

🚜 [refactor] Improve type definitions and utility functions in imported-value-symbols.ts

- 🎨 Refactor type definitions for `MemberToFunctionCallFixParams` and `MethodToFunctionCallFixParams`

- 🛠️ Consolidate and rename parameters for clarity in function signatures

- 🎨 Improve documentation comments for better understanding

- 🛠️ Optimize logic in `collectDirectNamedValueImportsFromSource` for clarity

✨ [feat] Enhance ESLint rules for TypeScript extras

- 🎨 Refactor imports in multiple rule files to use consistent import statements

- ✨ Implement autofix capabilities for `isDefined`, `isEmpty`, `isPresent` in respective rules

- 📝 Add inline fixable test cases for `isDefined`, `isEmpty`, and `isPresent` rules

🧪 [test] Add tests for new autofix functionality

- 🧪 Add test cases for autofixing `isDefined` and `isEmpty` checks

- 🧪 Add test cases for autofixing `isPresent` checks

- 🧪 Ensure all tests cover both defined and negated scenarios for comprehensive coverage

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(63355ae)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/63355ae568aabe9d928faa0d575643f48768d5fa)


- 🔧 [build] Update dependencies in package.json


- 🔄 Upgrade "@html-eslint/eslint-plugin" and "@html-eslint/parser" to version 0.56.0 for improved HTML linting capabilities.

- 🔄 Update "eslint" to version 10.0.1 to incorporate the latest fixes and features.

- 🔄 Upgrade "eslint-plugin-jsdoc" to version 62.7.0 for enhanced JSDoc support.

- 🔄 Update "eslint-plugin-jsonc" to version 3.0.0 for better JSONC linting.

- 🔄 Upgrade "jsonc-eslint-parser" to version 3.1.0 for improved JSONC parsing.

- 🔄 Update peer dependency "eslint" to version 10.0.1 to ensure compatibility with the latest changes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(e06b605)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/e06b605ec157e48bdef1667bd9b7d29c594ee17a)


- 🔧 [build] Update Stryker dependencies and package manager version

- Upgrade Stryker packages to version 9.5.1 for improved functionality

- Update package manager version to 11.10.1 for better compatibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(1dde506)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/1dde506c1d63afe0a9d0ffc1ea7fb8d4722e1844)


- 🔧 [build] Update Knip configuration to remove unnecessary dependencies

- Removed several unused dependencies from the Knip configuration to streamline the analysis process

- This change helps in reducing false positives and improving the accuracy of dependency tracking

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(5d2f382)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/5d2f382a0e7cdbc2463d18c6f322c29f0d697ace)


- 🔧 [build] Update TypeScript configuration for ESLint


- ✨ [feat] Include `knip.config.ts` in the TypeScript ESLint configuration

- 📂 This addition allows ESLint to recognize and lint the `knip.config.ts` file, ensuring consistent code quality and adherence to coding standards across the project.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a4ac857)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a4ac8576e18b4a30ef54662a3857951dca1ac277)


- 🔧 [build] Force install dependencies in Docusaurus deployment workflow

- Updated npm install command to use --force for consistent dependency installation

📝 [docs] Clarify documentation for modern enhancements

- Revised package documentation to reflect subtle client-side interaction enhancements

🧹 [chore] Update lint-actionlint script configuration path

- Changed path for ActionLintConfig.yaml to use the repository root for better accessibility

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(b1b30c3)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/b1b30c3c1fb58329c11e49acbe4e84acae2d46c4)


- 🔧 [build] Update npm-check-updates to version 19.4.0

- Upgraded the "npm-check-updates" package in both package.json and package-lock.json to ensure compatibility with the latest features and fixes.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(0d1b867)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/0d1b867c174310b07659a43fbd41694ab4579337)


- 🔧 [build] Update Docusaurus configuration and add manifest file

- 🛠️ [fix] Implement ignoreKnownWebpackWarningsPlugin to suppress known webpack warnings

- 📝 [docs] Add manifest.json for PWA support with background color and icons

- 🔧 [build] Modify build:local script to include NODE_OPTIONS for deprecation warnings

- 🔧 [build] Update TypeDoc output path in typedoc.local.config.json

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(9327651)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/93276515f3fef321f4fea54d762fdf9d63ac07b5)


- 🔧 [build] Refactor TypeFest plugin types and configurations

- 🆕 Export `TypefestConfigName` and `TypefestPresetConfig` types for better clarity

- 🔄 Update `TypefestPlugin` and `TypefestConfigs` types to enhance type safety

- 🔧 Modify function signatures to use new types for improved consistency

- 📦 Adjust `typefestPlugin` structure to align with updated type definitions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(a0fdbab)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/a0fdbabd4429095440c4efd43d07829ace5b2afc)


- 🔧 [build] Update eslint-plugin-testing-library to version 7.16.0

- [dependency] Update version 7.16.0 in package.json and package-lock.json

- Update dependencies for compatibility with the latest ESLint versions

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(25224f5)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/25224f59273e80a3b6231b8eaf954f164f3565f2)


- 🔧 [build] Refactor TypeFest ESLint rules for consistency and clarity

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-all-or-none`
  
- Moved `name`, `meta`, and `defaultOptions` to the end of the rule definition for consistency.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-at-least-one`
  
- Adjusted the structure to match the new format.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-exactly-one`
  
- Ensured consistent ordering of properties.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-one-or-none`
  
- Updated to follow the new structure.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-schema`
  
- Aligned with the new metadata format.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-non-nullable`
  
- Adjusted to maintain consistency across rules.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-optional`
  
- Updated to follow the new structure.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-readonly`
  
- Ensured consistent ordering of properties.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-set-required`
  
- Aligned with the new metadata format.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-simplify`
  
- Updated to follow the new structure.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-tagged-brands`
  
- Adjusted to maintain consistency across rules.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-tuple-of`
  
- Ensured consistent ordering of properties.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-array`
  
- Aligned with the new metadata format.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-map`
  
- Updated to follow the new structure.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-record`
  
- Ensured consistent ordering of properties.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unknown-set`
  
- Aligned with the new metadata format.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-unwrap-tagged`
  
- Updated to follow the new structure.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-value-of`
  
- Ensured consistent ordering of properties.

- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-writable`
  
- Aligned with the new metadata format.

- 🧪 [test] Update docs integrity test to use expectTypeOf for description validation
  
- Changed `expect(typeof description).toBe("string")` to `expectTypeOf(description).toBeString()`

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ce485eb)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ce485eb271acb65d12753e772cdcd320572bdeab)


- 🔧 [build] Refactor TypeFest ESLint rules for consistency and clarity


- 🛠️ [fix] Reorganize rule metadata for `prefer-type-fest-require-all-or-none`:
  
- Moved `name`, `meta`, and `defaultOptions` to the correct positions.
  
- Ensured the `create` function remains intact while maintaining functionality.


- 🛠️ [fix] Update `prefer-type-fest-require-at-least-one` rule structure:
  
- Adjusted metadata organization for clarity.
  
- Preserved the core logic within the `create` function.


- 🛠️ [fix] Refactor `prefer-type-fest-require-exactly-one` rule:
  
- Streamlined metadata for better readability.
  
- Kept the reporting logic unchanged.


- 🛠️ [fix] Revise `prefer-type-fest-require-one-or-none` rule:
  
- Enhanced metadata structure for consistency.
  
- Maintained existing functionality in the `create` method.


- 🛠️ [fix] Modify `prefer-type-fest-schema` rule:
  
- Reorganized metadata for improved clarity.
  
- Ensured the reporting logic remains functional.


- 🛠️ [fix] Adjust `prefer-type-fest-set-non-nullable` rule:
  
- Updated metadata layout for consistency.
  
- Preserved the core logic in the `create` function.


- 🛠️ [fix] Refactor `prefer-type-fest-set-optional` rule:
  
- Improved metadata organization for clarity.
  
- Maintained existing functionality.


- 🛠️ [fix] Revise `prefer-type-fest-set-readonly` rule:
  
- Streamlined metadata for better readability.
  
- Ensured the reporting logic remains intact.


- 🛠️ [fix] Update `prefer-type-fest-set-required` rule:
  
- Enhanced metadata structure for consistency.
  
- Preserved the core logic within the `create` function.


- 🛠️ [fix] Refactor `prefer-type-fest-simplify` rule:
  
- Reorganized metadata for improved clarity.
  
- Kept the reporting logic unchanged.


- 🛠️ [fix] Modify `prefer-type-fest-tagged-brands` rule:
  
- Adjusted metadata organization for clarity.
  
- Maintained existing functionality in the `create` method.


- 🛠️ [fix] Revise `prefer-type-fest-tuple-of` rule:
  
- Improved metadata layout for consistency.
  
- Preserved the core logic in the `create` function.


- 🛠️ [fix] Adjust `prefer-type-fest-unknown-array` rule:
  
- Updated metadata structure for clarity.
  
- Ensured the reporting logic remains functional.


- 🛠️ [fix] Refactor `prefer-type-fest-unknown-map` rule:
  
- Streamlined metadata for better readability.
  
- Maintained existing functionality.


- 🛠️ [fix] Modify `prefer-type-fest-unknown-record` rule:
  
- Enhanced metadata organization for consistency.
  
- Preserved the core logic within the `create` function.


- 🛠️ [fix] Revise `prefer-type-fest-unknown-set` rule:
  
- Reorganized metadata for improved clarity.
  
- Kept the reporting logic unchanged.


- 🛠️ [fix] Update `prefer-type-fest-unwrap-tagged` rule:
  
- Adjusted metadata layout for consistency.
  
- Maintained existing functionality in the `create` method.


- 🛠️ [fix] Refactor `prefer-type-fest-value-of` rule:
  
- Improved metadata structure for clarity.
  
- Preserved the core logic in the `create` function.


- 🛠️ [fix] Modify `prefer-type-fest-writable` rule:
  
- Streamlined metadata for better readability.
  
- Ensured the reporting logic remains intact.

📝 [docs] Update documentation integrity tests

- 🛠️ [fix] Adjusted tests to ensure documentation URLs and descriptions are validated correctly.

- 🛠️ [fix] Enhanced type checks for rule descriptions to ensure they are strings.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(df2ae2f)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/df2ae2f38b3f8c5d03b1737f5bf328a8132adc77)


- 🔧 [build] Update dependencies for improved compatibility and features


- 📦 Upgrade "@typescript-eslint/utils" from "^8.55.0" to "^8.56.0" for enhanced TypeScript support.

- 📦 Upgrade "@eslint/js" from "^9.39.2" to "^10.0.1" to leverage the latest ESLint features and fixes.

- 📦 Upgrade "@typescript-eslint/eslint-plugin", "@typescript-eslint/parser", and "@typescript-eslint/rule-tester" from "^8.55.0" to "^8.56.0" for better linting capabilities.

- 📦 Upgrade "typescript-eslint" from "^8.55.0" to "^8.56.0" to ensure compatibility with the latest TypeScript features.

- 📦 Update peer dependency "eslint" from "^9.0.0" to "^10.0.0" to align with the latest ESLint version requirements.

Signed-off-by: Nick2bad4u <20943337+Nick2bad4u@users.noreply.github.com> [`(ff78dc7)`](https://github.com/Nick2bad4u/eslint-plugin-typefest/commit/ff78dc7d23858611fe280055f82504009732e61c)






## Contributors
Thanks to all the [contributors](https://github.com/Nick2bad4u/eslint-plugin-typefest/graphs/contributors) for their hard work!
## License
This project is licensed under the [UnLicense](https://github.com/Nick2bad4u/eslint-plugin-typefest/blob/main/LICENSE)
*This changelog was automatically generated with [git-cliff](https://github.com/orhun/git-cliff).*
