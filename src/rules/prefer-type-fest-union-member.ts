import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayFirst } from "ts-extras";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-union-member`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const UNION_MEMBER_TYPE_NAME = "UnionMember" as const;
const UNION_TO_INTERSECTION_TYPE_NAME = "UnionToIntersection" as const;
const IS_NEVER_TYPE_NAME = "IsNever" as const;

const isIdentifierTypeReferenceNamed = (
    node: Readonly<TSESTree.TypeNode>,
    name: string
): node is TSESTree.TSTypeReference & { typeName: TSESTree.Identifier } =>
    node.type === "TSTypeReference" &&
    node.typeName.type === "Identifier" &&
    node.typeName.name === name;

const isBooleanLiteralType = (
    node: Readonly<TSESTree.TypeNode>,
    expectedValue: boolean
): boolean =>
    node.type === "TSLiteralType" &&
    node.literal.type === "Literal" &&
    node.literal.value === expectedValue;

const getUnionArgumentTextFromDistributiveFunctionWrapper = ({
    node,
    sourceCode,
}: Readonly<{
    node: Readonly<TSESTree.TypeNode>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    if (node.type !== "TSConditionalType") {
        return null;
    }

    if (
        node.extendsType.type !== "TSAnyKeyword" ||
        node.falseType.type !== "TSNeverKeyword"
    ) {
        return null;
    }

    if (node.trueType.type !== "TSFunctionType") {
        return null;
    }

    const returnType = node.trueType.returnType?.typeAnnotation;

    if (!returnType) {
        return null;
    }

    const checkTypeText = sourceCode.getText(node.checkType);
    const returnTypeText = sourceCode.getText(returnType);

    return checkTypeText === returnTypeText ? checkTypeText : null;
};

const getUnionArgumentTextFromExtractor = ({
    node,
    sourceCode,
}: Readonly<{
    node: Readonly<TSESTree.TSConditionalType>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    if (node.falseType.type !== "TSNeverKeyword") {
        return null;
    }

    if (
        !isIdentifierTypeReferenceNamed(
            node.checkType,
            UNION_TO_INTERSECTION_TYPE_NAME
        )
    ) {
        return null;
    }

    const extractorArgument = arrayFirst(
        node.checkType.typeArguments?.params ?? []
    );

    if (!extractorArgument) {
        return null;
    }

    const unionArgumentText =
        getUnionArgumentTextFromDistributiveFunctionWrapper({
            node: extractorArgument,
            sourceCode,
        });

    if (unionArgumentText === null) {
        return null;
    }

    if (node.extendsType.type !== "TSFunctionType") {
        return null;
    }

    const inferredReturnType = node.extendsType.returnType?.typeAnnotation;

    const inferredTypeParameterName =
        inferredReturnType?.type === "TSInferType"
            ? inferredReturnType.typeParameter.name.name
            : null;

    if (
        inferredTypeParameterName === null ||
        node.trueType.type !== "TSTypeReference" ||
        node.trueType.typeName.type !== "Identifier" ||
        node.trueType.typeName.name !== inferredTypeParameterName
    ) {
        return null;
    }

    return unionArgumentText;
};

const getUnionMemberEquivalentArgumentText = ({
    node,
    sourceCode,
}: Readonly<{
    node: Readonly<TSESTree.TypeNode>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    if (node.type !== "TSConditionalType") {
        return null;
    }

    const directExtractorText = getUnionArgumentTextFromExtractor({
        node,
        sourceCode,
    });

    if (directExtractorText !== null) {
        return directExtractorText;
    }

    if (
        !isIdentifierTypeReferenceNamed(node.checkType, IS_NEVER_TYPE_NAME) ||
        !isBooleanLiteralType(node.extendsType, true) ||
        node.trueType.type !== "TSNeverKeyword"
    ) {
        return null;
    }

    const guardedArgument = arrayFirst(
        node.checkType.typeArguments?.params ?? []
    );

    if (!guardedArgument) {
        return null;
    }

    const guardedArgumentText = sourceCode.getText(guardedArgument);
    if (node.falseType.type !== "TSConditionalType") {
        return null;
    }

    const extractorText = getUnionArgumentTextFromExtractor({
        node: node.falseType,
        sourceCode,
    });

    return extractorText === guardedArgumentText ? extractorText : null;
};

/**
 * ESLint rule definition for `prefer-type-fest-union-member`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnionMemberRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSTypeAliasDeclaration(node) {
                    const unionArgumentText =
                        getUnionMemberEquivalentArgumentText({
                            node: node.typeAnnotation,
                            sourceCode: context.sourceCode,
                        });

                    if (
                        unionArgumentText === null ||
                        unionArgumentText.trim().length === 0
                    ) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node.typeAnnotation,
                        UNION_MEMBER_TYPE_NAME,
                        `${UNION_MEMBER_TYPE_NAME}<${unionArgumentText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferUnionMember",
                        node: node.typeAnnotation,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest UnionMember over custom union-member extraction helpers based on `UnionToIntersection`.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-union-member",
            },
            fixable: "code",
            messages: {
                preferUnionMember:
                    "Prefer `UnionMember<T>` from type-fest over custom union-member extraction helpers based on `UnionToIntersection`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-union-member",
    });

/**
 * Default export for the `prefer-type-fest-union-member` rule module.
 */
export default preferTypeFestUnionMemberRule;
