import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-required-deep`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-required-deep`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestRequiredDeepRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        node.typeName.name !== "DeepRequired"
                    ) {
                        return;
                    }

                    const aliasReplacementFix =
                        createSafeTypeReferenceReplacementFix(
                            node,
                            "RequiredDeep",
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        fix: aliasReplacementFix,
                        messageId: "preferRequiredDeep",
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
                    "require TypeFest RequiredDeep over `DeepRequired` aliases.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-required-deep",
            },
            fixable: "code",
            messages: {
                preferRequiredDeep:
                    "Prefer `RequiredDeep` from type-fest over `DeepRequired`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-required-deep",
    });

/**
 * Default export for the `prefer-type-fest-required-deep` rule module.
 */
export default preferTypeFestRequiredDeepRule;
