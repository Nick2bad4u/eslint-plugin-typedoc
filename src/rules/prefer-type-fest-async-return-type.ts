/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-async-return-type`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Built-in utility type used in verbose async return patterns. */
const AWAITED_TYPE_NAME = "Awaited";

/** Built-in utility type nested inside awaited return compositions. */
const RETURN_TYPE_NAME = "ReturnType";

/**
 * Extracts a single generic type argument from a type reference.
 *
 * @param node - Type reference node to inspect.
 *
 * @returns The only type argument when exactly one is present; otherwise
 *   `null`.
 */

const getSingleTypeArgument = (
    node: Readonly<TSESTree.TSTypeReference>
): null | TSESTree.TypeNode => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 1) {
        return null;
    }

    const [onlyTypeArgument] = typeArguments;
    /* v8 ignore next -- defensive fallback for malformed synthetic AST arrays containing holes. */
    return onlyTypeArgument ?? null;
};

/**
 * ESLint rule definition for `prefer-type-fest-async-return-type`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestAsyncReturnTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const { sourceCode } = context;

            return {
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (!isIdentifierTypeReference(node, AWAITED_TYPE_NAME)) {
                        return;
                    }

                    const awaitedInnerType = getSingleTypeArgument(node);
                    if (awaitedInnerType?.type !== "TSTypeReference") {
                        return;
                    }

                    if (
                        !isIdentifierTypeReference(
                            awaitedInnerType,
                            RETURN_TYPE_NAME
                        )
                    ) {
                        return;
                    }

                    const returnTypeArgument =
                        getSingleTypeArgument(awaitedInnerType);

                    if (returnTypeArgument === null) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeTextReplacementFix(
                        node,
                        "AsyncReturnType",
                        `AsyncReturnType<${sourceCode.getText(returnTypeArgument)}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferAsyncReturnType",
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
                    "require TypeFest AsyncReturnType over Awaited<ReturnType<T>> compositions for async return extraction.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-async-return-type",
            },
            fixable: "code",
            messages: {
                preferAsyncReturnType:
                    "Prefer `AsyncReturnType<T>` from type-fest over `Awaited<ReturnType<T>>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-async-return-type",
    });

/**
 * Default export for the `prefer-type-fest-async-return-type` rule module.
 */
export default preferTypeFestAsyncReturnTypeRule;
