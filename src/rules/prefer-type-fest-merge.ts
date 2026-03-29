/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-merge`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { collectNamedImportLocalNamesFromSource } from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { unwrapParenthesizedTypeNode } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Detect whether an `Except<Destination, keyof Source>` reference is the left
 * side of a merge-style intersection.
 *
 * @param node - Candidate type reference.
 * @param siblingType - Sibling type from the same intersection.
 * @param exceptLocalNames - In-scope local names bound to `Except`.
 *
 * @returns `true` when the reference encodes the `Merge<Destination, Source>`
 *   pattern; otherwise `false`.
 */
const isMergeIntersectionExceptReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    siblingType: Readonly<TSESTree.TypeNode>,
    exceptLocalNames: ReadonlySet<string>
): boolean => {
    if (
        node.typeName.type !== "Identifier" ||
        !setContainsValue(exceptLocalNames, node.typeName.name)
    ) {
        return false;
    }

    const typeArguments = node.typeArguments?.params;

    if (typeArguments?.length !== 2) {
        return false;
    }

    const [, omittedKeysType] = typeArguments;

    if (omittedKeysType === undefined) {
        return false;
    }

    const normalizedOmittedKeysType =
        unwrapParenthesizedTypeNode(omittedKeysType);

    if (
        normalizedOmittedKeysType.type !== "TSTypeOperator" ||
        normalizedOmittedKeysType.operator !== "keyof"
    ) {
        return false;
    }

    const keyedSourceType = normalizedOmittedKeysType.typeAnnotation;

    if (keyedSourceType === undefined) {
        return false;
    }

    return areEquivalentTypeNodes(
        unwrapParenthesizedTypeNode(siblingType),
        keyedSourceType
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-merge`.
 */
const preferTypeFestMergeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const exceptLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                "Except"
            );

            return {
                'TSIntersectionType > TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    const intersectionNode = node.parent;

                    if (
                        intersectionNode?.type !== "TSIntersectionType" ||
                        intersectionNode.types.length !== 2
                    ) {
                        return;
                    }

                    const [leftType, rightType] = intersectionNode.types;

                    if (leftType === undefined || rightType === undefined) {
                        return;
                    }

                    const siblingType =
                        leftType === node ? rightType : leftType;

                    if (
                        !isMergeIntersectionExceptReference(
                            node,
                            siblingType,
                            exceptLocalNames
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferMerge",
                        node: intersectionNode,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Merge over Except<Destination, keyof Source> & Source intersections.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-merge",
            },
            messages: {
                preferMerge:
                    "Prefer `Merge<Destination, Source>` from type-fest over `Except<Destination, keyof Source> & Source` when the second object cleanly overrides the first.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-merge",
    });

export default preferTypeFestMergeRule;
