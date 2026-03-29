/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-primitive`.
 */
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Canonical primitive keyword node types required by `Primitive`. */
const primitiveKeywordTypes = [
    AST_NODE_TYPES.TSBigIntKeyword,
    AST_NODE_TYPES.TSBooleanKeyword,
    AST_NODE_TYPES.TSNullKeyword,
    AST_NODE_TYPES.TSNumberKeyword,
    AST_NODE_TYPES.TSStringKeyword,
    AST_NODE_TYPES.TSSymbolKeyword,
    AST_NODE_TYPES.TSUndefinedKeyword,
] as const;

/** Union of primitive keyword node type literals. */
type PrimitiveKeywordType = (typeof primitiveKeywordTypes)[number];

/** Lookup set used to validate primitive-keyword union members quickly. */
const primitiveKeywordTypeSet = new Set<string>(primitiveKeywordTypes);

/**
 * Check whether a node type string is one of the primitive keyword literals.
 */
const isPrimitiveKeywordType = (
    candidate: string
): candidate is PrimitiveKeywordType =>
    setContainsValue(primitiveKeywordTypeSet, candidate);

/**
 * Detects explicit unions equivalent to the TypeFest `Primitive` alias.
 *
 * @param node - Union node to inspect.
 *
 * @returns `true` when the union contains each primitive keyword type exactly
 *   once, independent of order.
 */

const hasPrimitiveUnionShape = (
    node: Readonly<TSESTree.TSUnionType>
): boolean => {
    if (node.types.length !== primitiveKeywordTypes.length) {
        return false;
    }

    const presentPrimitiveTypes = new Set<PrimitiveKeywordType>();

    for (const typeNode of node.types) {
        if (!isPrimitiveKeywordType(typeNode.type)) {
            return false;
        }

        presentPrimitiveTypes.add(typeNode.type);
    }

    return presentPrimitiveTypes.size === primitiveKeywordTypes.length;
};

/**
 * ESLint rule definition for `prefer-type-fest-primitive`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestPrimitiveRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSUnionType(node) {
                    if (!hasPrimitiveUnionShape(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "Primitive",
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferPrimitive",
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
                    "require TypeFest Primitive over explicit primitive keyword unions.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-primitive",
            },
            fixable: "code",
            messages: {
                preferPrimitive:
                    "Prefer `Primitive` from type-fest over explicit primitive keyword unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-primitive",
    });

/**
 * Default export for the `prefer-type-fest-primitive` rule module.
 */
export default preferTypeFestPrimitiveRule;
