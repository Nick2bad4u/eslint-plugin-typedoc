/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-map`.
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

/** Built-in map alias targeted by this rule. */
const READONLY_MAP_TYPE_NAME = "ReadonlyMap";

/** Preferred TypeFest alias for readonly unknown-key/unknown-value maps. */
const UNKNOWN_MAP_TYPE_NAME = "UnknownMap";

/**
 * Checks whether a map type reference is parameterized as `<unknown, unknown>`.
 *
 * @param node - Type reference candidate.
 *
 * @returns `true` when both map type arguments are `unknown`.
 */
const hasUnknownMapTypeArguments = (
    node: Readonly<TSESTree.TSTypeReference>
): boolean => {
    const typeArguments = node.typeArguments?.params ?? [];

    if (typeArguments.length !== 2) {
        return false;
    }

    const [firstTypeArgument, secondTypeArgument] = typeArguments;

    return (
        firstTypeArgument?.type === "TSUnknownKeyword" &&
        secondTypeArgument?.type === "TSUnknownKeyword"
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-map`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownMapRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (
                        !isIdentifierTypeReference(node, READONLY_MAP_TYPE_NAME)
                    ) {
                        return;
                    }

                    if (!hasUnknownMapTypeArguments(node)) {
                        return;
                    }

                    const replacementFix =
                        createSafeTypeNodeTextReplacementFixPreservingReadonly(
                            node,
                            UNKNOWN_MAP_TYPE_NAME,
                            UNKNOWN_MAP_TYPE_NAME,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferUnknownMap",
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
                    "require TypeFest UnknownMap over ReadonlyMap<unknown, unknown> aliases.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-map",
            },
            fixable: "code",
            messages: {
                preferUnknownMap:
                    "Prefer `Readonly<UnknownMap>` from type-fest over `ReadonlyMap<unknown, unknown>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-map",
    });

/**
 * Default export for the `prefer-type-fest-unknown-map` rule module.
 */
export default preferTypeFestUnknownMapRule;
