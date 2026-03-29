import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-conditional-pick-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const conditionalPickDeepAliasReplacements = {
    PickDeepByType: "ConditionalPickDeep",
    PickDeepByTypes: "ConditionalPickDeep",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-conditional-pick-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestConditionalPickDeepRule: ReturnType<
    typeof createTypedRule
> = createTypedRule({
    create(context) {
        const importedAliasMatches = collectImportedTypeAliasMatches(
            context.sourceCode,
            conditionalPickDeepAliasReplacements
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
                    messageId: "preferConditionalPickDeep",
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
                "require TypeFest ConditionalPickDeep over imported aliases such as PickDeepByTypes.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typefestConfigs: [
                "typefest.configs.recommended",
                "typefest.configs.strict",
                "typefest.configs.all",
                "typefest.configs.type-fest/types",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-pick-deep",
        },
        fixable: "code",
        messages: {
            preferConditionalPickDeep:
                "Prefer `{{replacement}}` from type-fest for deep conditional property filtering instead of legacy alias `{{alias}}`.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-conditional-pick-deep",
});

/**
 * Default export for the `prefer-type-fest-conditional-pick-deep` rule module.
 */
export default preferTypeFestConditionalPickDeepRule;
