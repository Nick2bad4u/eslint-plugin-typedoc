/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-except`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    collectImportedTypeAliasMatches,
    createSafeTypeReferenceReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type PreferTypeFestExceptOption = Readonly<{
    enforceBuiltinOmit?: boolean;
}>;

const OMIT_TYPE_NAME = "Omit";
const exceptAliasReplacements = {
    HomomorphicOmit: "Except",
} as const;

const defaultOption = {
    enforceBuiltinOmit: true,
} as const;

const defaultOptions = [defaultOption] as const;

/**
 * ESLint rule definition for `prefer-type-fest-except`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestExceptRule: ReturnType<typeof createTypedRule> =
    createTypedRule<readonly [PreferTypeFestExceptOption], "preferExcept">({
        create(context, [options] = defaultOptions) {
            const enforceBuiltinOmit = options.enforceBuiltinOmit ?? true;

            const importedAliasMatches = collectImportedTypeAliasMatches(
                context.sourceCode,
                exceptAliasReplacements
            );
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    const isBuiltinOmitReference = isIdentifierTypeReference(
                        node,
                        OMIT_TYPE_NAME
                    );

                    if (isBuiltinOmitReference) {
                        if (!enforceBuiltinOmit) {
                            return;
                        }

                        const typeArgumentCount =
                            node.typeArguments?.params.length ?? 0;
                        if (typeArgumentCount < 2) {
                            return;
                        }

                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferExcept",
                            node,
                        });
                        return;
                    }

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
                        fix: aliasReplacementFix,
                        messageId: "preferExcept",
                        node,
                    });
                },
            };
        },
        defaultOptions,
        meta: {
            defaultOptions: [defaultOption],
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Except over Omit when removing properties from object types.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.minimal",
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-except",
            },
            fixable: "code",
            messages: {
                preferExcept:
                    "Prefer `Except<T, K>` from type-fest over `Omit<T, K>` for stricter omitted-key modeling.",
            },
            schema: [
                {
                    additionalProperties: false,
                    description:
                        "Configuration for builtin Omit enforcement in prefer-type-fest-except.",
                    minProperties: 1,
                    properties: {
                        enforceBuiltinOmit: {
                            description:
                                "Whether to report builtin Omit<T, K> references in addition to imported legacy aliases.",
                            type: "boolean",
                        },
                    },
                    type: "object",
                },
            ],
            type: "suggestion",
        },
        name: "prefer-type-fest-except",
    });

/**
 * Default export for the `prefer-type-fest-except` rule module.
 */
export default preferTypeFestExceptRule;
