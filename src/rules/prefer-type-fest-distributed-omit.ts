/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-distributed-omit`.
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

const isDistributedOmitEquivalent = (
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
        !isIdentifierTypeReference(normalizedTrueType, "Omit")
    ) {
        return false;
    }

    const typeArguments = normalizedTrueType.typeArguments?.params;

    if (typeArguments?.length !== 2) {
        return false;
    }

    const [objectType] = typeArguments;

    return (
        objectType !== undefined &&
        areEquivalentTypeNodes(
            unwrapParenthesizedTypeNode(objectType),
            unwrapParenthesizedTypeNode(node.checkType)
        )
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-distributed-omit`.
 */
const preferTypeFestDistributedOmitRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSConditionalType(node) {
                    if (!isDistributedOmitEquivalent(node)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferDistributedOmit",
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
                    "require TypeFest DistributedOmit over distributive conditional helpers of the form T extends unknown ? Omit<T, K> : never.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-distributed-omit",
            },
            messages: {
                preferDistributedOmit:
                    "Prefer `DistributedOmit<ObjectType, KeyType>` from type-fest over distributive conditional helpers like `T extends unknown ? Omit<T, K> : never`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-distributed-omit",
    });

export default preferTypeFestDistributedOmitRule;
