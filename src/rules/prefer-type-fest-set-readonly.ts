import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-set-readonly`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const setReadonlyAliasReplacements = {
    ReadonlyBy: "SetReadonly",
} as const;

/**
 * ESLint rule definition for `prefer-type-fest-set-readonly`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestSetReadonlyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                setReadonlyAliasReplacements
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
                        messageId: "preferSetReadonly",
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
                    "require TypeFest SetReadonly over imported aliases such as ReadonlyBy.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-readonly",
            },
            fixable: "code",
            messages: {
                preferSetReadonly:
                    "Prefer `{{replacement}}` from type-fest to mark selected keys readonly instead of legacy alias `{{alias}}`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-set-readonly",
    });

/**
 * Default export for the `prefer-type-fest-set-readonly` rule module.
 */
export default preferTypeFestSetReadonlyRule;
