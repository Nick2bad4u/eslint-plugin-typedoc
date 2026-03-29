/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-array`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFixPreservingReadonly,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Built-in readonly array type targeted by this rule. */
const READONLY_ARRAY_TYPE_NAME = "ReadonlyArray";

/** Preferred TypeFest alias for readonly arrays of unknown values. */
const UNKNOWN_ARRAY_TYPE_NAME = "UnknownArray";

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
 * Detects `readonly unknown[]` type-operator syntax.
 *
 * @param node - Type-operator node to inspect.
 *
 * @returns `true` when the node is a readonly operator around an array type
 *   whose element type is `unknown`.
 */

const isReadonlyUnknownArrayType = (
    node: Readonly<TSESTree.TSTypeOperator>
): boolean => {
    if (node.operator !== "readonly") {
        return false;
    }

    const { typeAnnotation } = node;
    if (typeAnnotation?.type !== "TSArrayType") {
        return false;
    }

    return typeAnnotation.elementType.type === "TSUnknownKeyword";
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-array`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSTypeOperator(node) {
                    if (!isReadonlyUnknownArrayType(node)) {
                        return;
                    }

                    const replacementFix =
                        createSafeTypeNodeReplacementFixPreservingReadonly(
                            node,
                            UNKNOWN_ARRAY_TYPE_NAME,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferUnknownArray",
                        node,
                    });
                },
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (
                        !isIdentifierTypeReference(
                            node,
                            READONLY_ARRAY_TYPE_NAME
                        )
                    ) {
                        return;
                    }

                    if (!hasSingleUnknownTypeArgument(node)) {
                        return;
                    }

                    const replacementFix =
                        createSafeTypeNodeReplacementFixPreservingReadonly(
                            node,
                            UNKNOWN_ARRAY_TYPE_NAME,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferUnknownArray",
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
                    "require TypeFest UnknownArray over readonly unknown[] and ReadonlyArray<unknown> aliases.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-array",
            },
            fixable: "code",
            messages: {
                preferUnknownArray:
                    "Prefer `Readonly<UnknownArray>` from type-fest over `readonly unknown[]` or `ReadonlyArray<unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-array",
    });

/**
 * Default export for the `prefer-type-fest-unknown-array` rule module.
 */
export default preferTypeFestUnknownArrayRule;
