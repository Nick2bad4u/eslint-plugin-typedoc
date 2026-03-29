import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-less-than`.
 */
import {
    collectDirectNamedImportsFromSource,
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const GREATER_THAN_OR_EQUAL_TYPE_NAME = "GreaterThanOrEqual" as const;
const LESS_THAN_TYPE_NAME = "LessThan" as const;

const isLiteralBooleanType = (
    node: Readonly<TSESTree.TypeNode>,
    expectedBooleanValue: boolean
): boolean =>
    node.type === "TSLiteralType" &&
    node.literal.type === "Literal" &&
    node.literal.value === expectedBooleanValue;

const isFalseLiteralType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    isLiteralBooleanType(node, false);

const isTrueLiteralType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    isLiteralBooleanType(node, true);

type ComparatorTypeArgumentTexts = Readonly<{
    leftTypeText: string;
    rightTypeText: string;
}>;

/**
 * ESLint rule definition for `prefer-type-fest-less-than`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestLessThanRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const greaterThanOrEqualLocalNames =
                collectNamedImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE,
                    GREATER_THAN_OR_EQUAL_TYPE_NAME
                );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            const getComparatorTypeArgumentTexts = (
                typeReference: Readonly<TSESTree.TSTypeReference>
            ): ComparatorTypeArgumentTexts | null => {
                const typeArguments = typeReference.typeArguments?.params ?? [];
                const [leftType, rightType] = typeArguments;

                if (!leftType || !rightType || typeArguments.length !== 2) {
                    return null;
                }

                return {
                    leftTypeText: context.sourceCode.getText(leftType),
                    rightTypeText: context.sourceCode.getText(rightType),
                };
            };

            const isGreaterThanOrEqualTypeReference = (
                typeReference: Readonly<TSESTree.TSTypeReference>
            ): boolean => {
                if (typeReference.typeName.type === "Identifier") {
                    return setContainsValue(
                        greaterThanOrEqualLocalNames,
                        typeReference.typeName.name
                    );
                }

                if (typeReference.typeName.type !== "TSQualifiedName") {
                    return false;
                }

                return (
                    typeReference.typeName.left.type === "Identifier" &&
                    setContainsValue(
                        typeFestNamespaceImportNames,
                        typeReference.typeName.left.name
                    ) &&
                    typeReference.typeName.right.type === "Identifier" &&
                    typeReference.typeName.right.name ===
                        GREATER_THAN_OR_EQUAL_TYPE_NAME
                );
            };

            const getComparatorTypeArgumentTextsFromTypeNode = (
                typeNode: Readonly<TSESTree.TypeNode>
            ): ComparatorTypeArgumentTexts | null => {
                if (typeNode.type !== "TSTypeReference") {
                    return null;
                }

                if (!isGreaterThanOrEqualTypeReference(typeNode)) {
                    return null;
                }

                return getComparatorTypeArgumentTexts(typeNode);
            };

            const getDirectLessThanReplacement = (
                conditionalTypeNode: Readonly<TSESTree.TSConditionalType>
            ): ComparatorTypeArgumentTexts | null => {
                const comparatorTypeArgumentTexts =
                    getComparatorTypeArgumentTextsFromTypeNode(
                        conditionalTypeNode.checkType
                    );

                if (!comparatorTypeArgumentTexts) {
                    return null;
                }

                if (
                    !isTrueLiteralType(conditionalTypeNode.extendsType) ||
                    !isFalseLiteralType(conditionalTypeNode.trueType) ||
                    !isTrueLiteralType(conditionalTypeNode.falseType)
                ) {
                    return null;
                }

                return comparatorTypeArgumentTexts;
            };

            const getInferWrappedLessThanReplacement = (
                conditionalTypeNode: Readonly<TSESTree.TSConditionalType>
            ): ComparatorTypeArgumentTexts | null => {
                const comparatorTypeArgumentTexts =
                    getComparatorTypeArgumentTextsFromTypeNode(
                        conditionalTypeNode.checkType
                    );

                if (!comparatorTypeArgumentTexts) {
                    return null;
                }

                if (
                    conditionalTypeNode.extendsType.type !== "TSInferType" ||
                    conditionalTypeNode.falseType.type !== "TSNeverKeyword" ||
                    conditionalTypeNode.trueType.type !== "TSConditionalType"
                ) {
                    return null;
                }

                const inferIdentifierName =
                    conditionalTypeNode.extendsType.typeParameter.name.name;
                const innerConditionalTypeNode = conditionalTypeNode.trueType;

                if (
                    innerConditionalTypeNode.checkType.type !==
                        "TSTypeReference" ||
                    innerConditionalTypeNode.checkType.typeName.type !==
                        "Identifier" ||
                    innerConditionalTypeNode.checkType.typeName.name !==
                        inferIdentifierName ||
                    innerConditionalTypeNode.checkType.typeArguments !==
                        undefined ||
                    !isTrueLiteralType(innerConditionalTypeNode.extendsType) ||
                    !isFalseLiteralType(innerConditionalTypeNode.trueType) ||
                    !isTrueLiteralType(innerConditionalTypeNode.falseType)
                ) {
                    return null;
                }

                return comparatorTypeArgumentTexts;
            };

            const getLessThanReplacementText = (
                conditionalTypeNode: Readonly<TSESTree.TSConditionalType>
            ): null | string => {
                const comparatorTypeArgumentTexts =
                    getDirectLessThanReplacement(conditionalTypeNode) ??
                    getInferWrappedLessThanReplacement(conditionalTypeNode);

                if (!comparatorTypeArgumentTexts) {
                    return null;
                }

                return `${LESS_THAN_TYPE_NAME}<${comparatorTypeArgumentTexts.leftTypeText}, ${comparatorTypeArgumentTexts.rightTypeText}>`;
            };

            return {
                TSConditionalType(node: Readonly<TSESTree.TSConditionalType>) {
                    const replacementText = getLessThanReplacementText(node);

                    if (
                        replacementText === null ||
                        replacementText.length === 0
                    ) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        LESS_THAN_TYPE_NAME,
                        replacementText,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferLessThan",
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
                    "require TypeFest LessThan over `GreaterThanOrEqual<A, B> extends true ? false : true` wrappers.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-less-than",
            },
            fixable: "code",
            messages: {
                preferLessThan:
                    "Prefer `LessThan<A, B>` from type-fest over wrappers built from `GreaterThanOrEqual<A, B>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-less-than",
    });

/**
 * Default export for the `prefer-type-fest-less-than` rule module.
 */
export default preferTypeFestLessThanRule;
