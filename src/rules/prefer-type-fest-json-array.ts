/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-array`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Built-in generic array type name. */
const ARRAY_TYPE_NAME = "Array";

/** TypeFest JSON value alias used by supported union patterns. */
const JSON_VALUE_TYPE_NAME = "JsonValue";

/** Built-in readonly generic array type name. */
const READONLY_ARRAY_TYPE_NAME = "ReadonlyArray";

/**
 * Checks whether a node references `JsonValue`.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is the identifier type reference `JsonValue`.
 */

const isJsonValueType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    isIdentifierTypeReference(node, JSON_VALUE_TYPE_NAME);

/**
 * Checks whether a node is `JsonValue[]`.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is an array type whose element type is
 *   `JsonValue`.
 */

const isJsonValueArrayType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSArrayType" && isJsonValueType(node.elementType);

/**
 * Checks whether a node is `readonly JsonValue[]`.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is a readonly type operator wrapping a
 *   `JsonValue[]` array.
 */

const isReadonlyJsonValueArrayType = (
    node: Readonly<TSESTree.TypeNode>
): boolean => {
    if (node.type !== "TSTypeOperator" || node.operator !== "readonly") {
        return false;
    }

    const { typeAnnotation } = node;
    if (typeAnnotation?.type !== "TSArrayType") {
        return false;
    }

    return isJsonValueType(typeAnnotation.elementType);
};

/**
 * Checks whether a node is `Array<JsonValue>`.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is the generic `Array` reference with
 *   `JsonValue` as its single type argument.
 */

const isGenericJsonValueArrayType = (
    node: Readonly<TSESTree.TypeNode>
): boolean => {
    if (!isIdentifierTypeReference(node, ARRAY_TYPE_NAME)) {
        return false;
    }

    const typeArguments = node.typeArguments?.params;
    if (typeArguments?.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments as [TSESTree.TypeNode];

    return isJsonValueType(firstTypeArgument);
};

/**
 * Checks whether a node is `ReadonlyArray<JsonValue>`.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is the generic `ReadonlyArray` reference with
 *   `JsonValue` as its single type argument.
 */

const isGenericReadonlyJsonValueArrayType = (
    node: Readonly<TSESTree.TypeNode>
): boolean => {
    if (!isIdentifierTypeReference(node, READONLY_ARRAY_TYPE_NAME)) {
        return false;
    }

    const typeArguments = node.typeArguments?.params;
    if (typeArguments?.length !== 1) {
        return false;
    }

    const [firstTypeArgument] = typeArguments as [TSESTree.TypeNode];

    return isJsonValueType(firstTypeArgument);
};

/**
 * Determines whether a union matches one of the explicit JSON array forms this
 * rule can replace.
 *
 * @param node - Union node to inspect.
 *
 * @returns `true` for two-member unions equivalent to either JsonValue[] |
 *   readonly JsonValue[]`or`Array<JsonValue> | ReadonlyArray<JsonValue>.
 */

const hasJsonArrayUnionShape = (
    node: Readonly<TSESTree.TSUnionType>
): boolean => {
    if (node.types.length !== 2) {
        return false;
    }

    const [firstType, secondType] = node.types as [
        TSESTree.TypeNode,
        TSESTree.TypeNode,
    ];

    const isNativePair = (
        leftType: Readonly<TSESTree.TypeNode>,
        rightType: Readonly<TSESTree.TypeNode>
    ): boolean =>
        isJsonValueArrayType(leftType) &&
        isReadonlyJsonValueArrayType(rightType);
    const isGenericPair = (
        leftType: Readonly<TSESTree.TypeNode>,
        rightType: Readonly<TSESTree.TypeNode>
    ): boolean =>
        isGenericJsonValueArrayType(leftType) &&
        isGenericReadonlyJsonValueArrayType(rightType);

    if (
        isNativePair(firstType, secondType) ||
        isNativePair(secondType, firstType)
    ) {
        return true;
    }

    return (
        isGenericPair(firstType, secondType) ||
        isGenericPair(secondType, firstType)
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-json-array`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonArrayRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSUnionType(node) {
                    if (!hasJsonArrayUnionShape(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "JsonArray",
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferJsonArray",
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
                    "require TypeFest JsonArray over explicit JsonValue[] | readonly JsonValue[] style unions.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-array",
            },
            fixable: "code",
            messages: {
                preferJsonArray:
                    "Prefer `JsonArray` from type-fest over explicit JsonValue array unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-array",
    });

/**
 * Default export for the `prefer-type-fest-json-array` rule module.
 */
export default preferTypeFestJsonArrayRule;
