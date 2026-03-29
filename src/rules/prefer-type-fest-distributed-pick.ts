/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-distributed-pick`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    isIdentifierTypeReference,
    unwrapParenthesizedTypeNode,
} from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const isDistributiveConditionalExtendsType = (
    node: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    return (
        normalizedNode.type === "TSAnyKeyword" ||
        normalizedNode.type === "TSUnknownKeyword"
    );
};

const isKeyofBaseType = (
    node: Readonly<TSESTree.TypeNode>,
    baseType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== "TSTypeOperator" ||
        normalizedNode.operator !== "keyof" ||
        normalizedNode.typeAnnotation === undefined
    ) {
        return false;
    }

    return areEquivalentTypeNodes(
        unwrapParenthesizedTypeNode(normalizedNode.typeAnnotation),
        unwrapParenthesizedTypeNode(baseType)
    );
};

const isExtractOverKeyofBaseType = (
    node: Readonly<TSESTree.TypeNode>,
    baseType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(normalizedNode, "Extract")
    ) {
        return false;
    }

    const typeArguments = normalizedNode.typeArguments?.params;

    if (typeArguments?.length !== 2) {
        return false;
    }

    const [, extractedFromType] = typeArguments;

    return (
        extractedFromType !== undefined &&
        isKeyofBaseType(extractedFromType, baseType)
    );
};

const isDistributedPickEquivalent = (
    node: Readonly<TSESTree.TSConditionalType>
): boolean => {
    if (
        node.falseType.type !== "TSNeverKeyword" ||
        !isDistributiveConditionalExtendsType(node.extendsType)
    ) {
        return false;
    }

    const normalizedTrueType = unwrapParenthesizedTypeNode(node.trueType);

    if (
        normalizedTrueType.type !== "TSTypeReference" ||
        !isIdentifierTypeReference(normalizedTrueType, "Pick")
    ) {
        return false;
    }

    const typeArguments = normalizedTrueType.typeArguments?.params;

    if (typeArguments?.length !== 2) {
        return false;
    }

    const [objectType, selectedKeysType] = typeArguments;

    if (objectType === undefined || selectedKeysType === undefined) {
        return false;
    }

    if (
        !areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(objectType),
            unwrapParenthesizedTypeNode(node.checkType)
        )
    ) {
        return false;
    }

    return (
        !isIdentifierTypeReference(
            unwrapParenthesizedTypeNode(selectedKeysType),
            "Extract"
        ) || isExtractOverKeyofBaseType(selectedKeysType, node.checkType)
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-distributed-pick`.
 */
const preferTypeFestDistributedPickRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSConditionalType(node) {
                    if (!isDistributedPickEquivalent(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferDistributedPick",
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
                    "require TypeFest DistributedPick over distributive conditional helpers of the form T extends unknown ? Pick<T, K> : never.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-distributed-pick",
            },
            messages: {
                preferDistributedPick:
                    "Prefer `DistributedPick<ObjectType, KeyType>` from type-fest over distributive conditional helpers like `T extends unknown ? Pick<T, K> : never`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-distributed-pick",
    });

export default preferTypeFestDistributedPickRule;
