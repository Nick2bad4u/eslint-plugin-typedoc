import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-conditional-pick`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const conditionalPickAliasReplacements = {
    PickByTypes: "ConditionalPick",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-conditional-pick`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestConditionalPickRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                conditionalPickAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (node.typeName.type !== "Identifier") {
                        return;
                    }

                    const importedAliasMatch = importedAliasMatches.get(
                        node.typeName.name
                    );
                    if (!importedAliasMatch) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            importedAliasMatch.replacementName,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        data: {
                            alias: importedAliasMatch.importedName,
                            replacement: importedAliasMatch.replacementName,
                        },
                        fix: aliasReplacementFix,
                        messageId: "preferConditionalPick",
                        node,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest ConditionalPick over imported aliases such as PickByTypes.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-pick",
            },
            fixable: "code",
            messages: {
                preferConditionalPick:
                    "Prefer `{{replacement}}` from type-fest to pick keys whose values match a condition instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-conditional-pick",
    });

/**
 * Default export for the `prefer-type-fest-conditional-pick` rule module.
 */
export default preferTypeFestConditionalPickRule;
