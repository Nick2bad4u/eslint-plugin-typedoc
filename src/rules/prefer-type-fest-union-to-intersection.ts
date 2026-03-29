/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-union-to-intersection`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { unwrapParenthesizedTypeNode } from "../_internal/type-reference-node.js";
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

const getSingleFunctionParameterType = (
    node: Readonly<TSESTree.TSFunctionType>
): null | Readonly<TSESTree.TypeNode> => {
    if (node.params.length !== 1) {
        return null;
    }

    const [onlyParameter] = node.params;

    if (
        onlyParameter?.type !== "Identifier" ||
        onlyParameter.typeAnnotation === undefined
    ) {
        return null;
    }

    return unwrapParenthesizedTypeNode(
        onlyParameter.typeAnnotation.typeAnnotation
    );
};

const matchesUnionToIntersectionTrueType = (
    node: Readonly<TSESTree.TypeNode>,
    inferredTypeParameterName: string,
    unionType: Readonly<TSESTree.TypeNode>
): boolean => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type === "TSTypeReference" &&
        normalizedNode.typeName.type === "Identifier" &&
        normalizedNode.typeName.name === inferredTypeParameterName
    ) {
        return true;
    }

    if (
        normalizedNode.type !== "TSIntersectionType" ||
        normalizedNode.types.length !== 2
    ) {
        return false;
    }

    const [leftType, rightType] = normalizedNode.types;

    if (leftType === undefined || rightType === undefined) {
        return false;
    }

    const isInferredIdentifier = (typeNode: Readonly<TSESTree.TypeNode>) =>
        typeNode.type === "TSTypeReference" &&
        typeNode.typeName.type === "Identifier" &&
        typeNode.typeName.name === inferredTypeParameterName;

    return (
        (isInferredIdentifier(leftType) &&
            areEquivalentTypeNodes(
                unwrapParenthesizedTypeNode(rightType),
                unwrapParenthesizedTypeNode(unionType)
            )) ||
        (isInferredIdentifier(rightType) &&
            areEquivalentTypeNodes(
                unwrapParenthesizedTypeNode(leftType),
                unwrapParenthesizedTypeNode(unionType)
            ))
    );
};

const isUnionToIntersectionEquivalent = (
    node: Readonly<TSESTree.TSConditionalType>
): boolean => {
    if (node.falseType.type !== "TSNeverKeyword") {
        return false;
    }

    const distributedWrapper = unwrapParenthesizedTypeNode(node.checkType);

    if (distributedWrapper.type !== "TSConditionalType") {
        return false;
    }

    if (
        distributedWrapper.falseType.type !== "TSNeverKeyword" ||
        !isDistributiveConditionalExtendsType(distributedWrapper.extendsType)
    ) {
        return false;
    }

    const distributedTrueType = unwrapParenthesizedTypeNode(
        distributedWrapper.trueType
    );

    if (distributedTrueType.type !== "TSFunctionType") {
        return false;
    }

    const distributedParameterType =
        getSingleFunctionParameterType(distributedTrueType);

    if (
        distributedParameterType === null ||
        !areEquivalentTypeNodes(
            distributedParameterType,
            unwrapParenthesizedTypeNode(distributedWrapper.checkType)
        )
    ) {
        return false;
    }

    const extractorFunctionType = unwrapParenthesizedTypeNode(node.extendsType);

    if (extractorFunctionType.type !== "TSFunctionType") {
        return false;
    }

    const extractorParameterType = getSingleFunctionParameterType(
        extractorFunctionType
    );

    if (extractorParameterType?.type !== "TSInferType") {
        return false;
    }

    return matchesUnionToIntersectionTrueType(
        node.trueType,
        extractorParameterType.typeParameter.name.name,
        distributedWrapper.checkType
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-union-to-intersection`.
 */
const preferTypeFestUnionToIntersectionRule: ReturnType<
    typeof createTypedRule
> = createTypedRule({
    create(context) {
        return {
            TSConditionalType(node) {
                if (!isUnionToIntersectionEquivalent(node)) {
                    return;
                }

                reportWithOptionalFix({
                    context,
                    fix: null,
                    messageId: "preferUnionToIntersection",
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
                "require TypeFest UnionToIntersection over custom distributive conditional helpers that turn unions into intersections.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typefestConfigs: ["typefest.configs.experimental"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-to-intersection",
        },
        messages: {
            preferUnionToIntersection:
                "Prefer `UnionToIntersection<Union>` from type-fest over custom distributive conditional helpers that convert a union into an intersection.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-type-fest-union-to-intersection",
});

export default preferTypeFestUnionToIntersectionRule;
