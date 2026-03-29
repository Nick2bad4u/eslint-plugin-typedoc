/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-pick-index-signature`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    isIdentifierTypeReference,
    unwrapParenthesizedTypeNode,
} from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const isEmptyObjectTypeLiteral = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSTypeLiteral" && node.members.length === 0;

const hasPickIndexSignatureMappedTypeShape = (
    node: Readonly<TSESTree.TSMappedType>
): boolean => {
    if (node.key.type !== "Identifier") {
        return false;
    }

    if (node.readonly !== false && isDefined(node.readonly)) {
        return false;
    }

    if (node.optional !== false && isDefined(node.optional)) {
        return false;
    }

    const constraint = node.constraint;

    if (
        constraint?.type !== "TSTypeOperator" ||
        constraint.operator !== "keyof" ||
        constraint.typeAnnotation === undefined
    ) {
        return false;
    }

    const baseType = unwrapParenthesizedTypeNode(constraint.typeAnnotation);
    const indexedValueType = node.typeAnnotation;

    if (
        indexedValueType?.type !== "TSIndexedAccessType" ||
        !areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(indexedValueType.objectType),
            baseType
        ) ||
        indexedValueType.indexType.type !== "TSTypeReference" ||
        indexedValueType.indexType.typeName.type !== "Identifier" ||
        indexedValueType.indexType.typeName.name !== node.key.name
    ) {
        return false;
    }

    const keyRemapType = node.nameType;

    if (keyRemapType?.type !== "TSConditionalType") {
        return false;
    }

    if (
        !isEmptyObjectTypeLiteral(
            unwrapParenthesizedTypeNode(keyRemapType.checkType)
        ) ||
        keyRemapType.falseType.type !== "TSNeverKeyword" ||
        keyRemapType.trueType.type !== "TSTypeReference" ||
        keyRemapType.trueType.typeName.type !== "Identifier" ||
        keyRemapType.trueType.typeName.name !== node.key.name
    ) {
        return false;
    }

    const normalizedExtendsType = unwrapParenthesizedTypeNode(
        keyRemapType.extendsType
    );

    if (
        normalizedExtendsType.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(normalizedExtendsType, "Record")
    ) {
        return false;
    }

    const recordTypeArguments = normalizedExtendsType.typeArguments?.params;

    if (recordTypeArguments?.length !== 2) {
        return false;
    }

    const [recordKeyType, recordValueType] = recordTypeArguments;

    return (
        recordKeyType !== undefined &&
        recordValueType?.type === "TSUnknownKeyword" &&
        recordKeyType.type === "TSTypeReference" &&
        recordKeyType.typeName.type === "Identifier" &&
        recordKeyType.typeName.name === node.key.name
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-pick-index-signature`.
 */
const preferTypeFestPickIndexSignatureRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSMappedType(node) {
                    if (!hasPickIndexSignatureMappedTypeShape(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferPickIndexSignature",
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
                    "require TypeFest PickIndexSignature over manual mapped types that keep only index signatures.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-pick-index-signature",
            },
            messages: {
                preferPickIndexSignature:
                    "Prefer `PickIndexSignature<ObjectType>` from type-fest over manual mapped types that keep only index signatures.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-pick-index-signature",
    });

export default preferTypeFestPickIndexSignatureRule;
