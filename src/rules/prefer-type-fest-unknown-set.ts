/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-set`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFixPreservingReadonly,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Built-in set alias targeted by this rule. */
const READONLY_SET_TYPE_NAME = "ReadonlySet";

/** Preferred TypeFest alias for readonly sets of unknown values. */
const UNKNOWN_SET_TYPE_NAME = "UnknownSet";

/**
 * Checks whether a generic type reference has exactly one `unknown` argument.
 *
 * @param node - Type reference candidate.
 *
 * @returns `true` when the reference shape is `<unknown>`.
 */

const hasSingleUnknownTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): boolean => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument?.type === "TSUnknownKeyword";
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-set`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownSetRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (
                        !isIdentifierTypeReference(node, READONLY_SET_TYPE_NAME)
                    ) {
                        return;
                    }

                    if (!hasSingleUnknownTypeArgument(node)) {
                        return;
                    }

                    const replacementFix =
                        createSafeTypeNodeTextReplacementFixPreservingReadonly(
                            node,
                            UNKNOWN_SET_TYPE_NAME,
                            UNKNOWN_SET_TYPE_NAME,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferUnknownSet",
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
                    "require TypeFest UnknownSet over ReadonlySet<unknown> aliases.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-set",
            },
            fixable: "code",
            messages: {
                preferUnknownSet:
                    "Prefer `Readonly<UnknownSet>` from type-fest over `ReadonlySet<unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-set",
    });

/**
 * Default export for the `prefer-type-fest-unknown-set` rule module.
 */
export default preferTypeFestUnknownSetRule;
