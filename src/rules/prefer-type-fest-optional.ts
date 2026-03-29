import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayAt, arrayFirst } from "ts-extras";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-optional`.
 */
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const OPTIONAL_TYPE_NAME = "Optional" as const;
const EXCLUDE_TYPE_NAME = "Exclude" as const;
const NON_NULLABLE_TYPE_NAME = "NonNullable" as const;

const isNullKeywordType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSNullKeyword";

const isUndefinedKeywordType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSUndefinedKeyword";

const isNullishDeleteType = (node: Readonly<TSESTree.TypeNode>): boolean => {
    if (isNullKeywordType(node)) {
        return true;
    }

    if (node.type !== "TSUnionType" || node.types.length !== 2) {
        return false;
    }

    let hasNull = false;
    let hasUndefined = false;

    for (const member of node.types) {
        if (isNullKeywordType(member)) {
            hasNull = true;
            continue;
        }

        if (isUndefinedKeywordType(member)) {
            hasUndefined = true;
            continue;
        }

        return false;
    }

    return hasNull && hasUndefined;
};

const getOptionalInnerTypeText = ({
    sourceCode,
    typeNode,
}: Readonly<{
    sourceCode: Readonly<TSESLint.SourceCode>;
    typeNode: Readonly<TSESTree.TypeNode>;
}>): null | string => {
    if (
        typeNode.type !== "TSTypeReference" ||
        typeNode.typeName.type !== "Identifier"
    ) {
        return null;
    }

    const typeArguments = typeNode.typeArguments?.params ?? [];

    if (typeNode.typeName.name === NON_NULLABLE_TYPE_NAME) {
        const [innerType] = typeArguments;

        return innerType ? sourceCode.getText(innerType) : null;
    }

    if (typeNode.typeName.name !== EXCLUDE_TYPE_NAME) {
        return null;
    }

    const [innerType, deletedType] = typeArguments;

    if (!innerType || !deletedType || !isNullishDeleteType(deletedType)) {
        return null;
    }

    return sourceCode.getText(innerType);
};

/**
 * ESLint rule definition for `prefer-type-fest-optional`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestOptionalRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSUnionType(node) {
                    if (node.types.length !== 2) {
                        return;
                    }

                    const firstMember = arrayFirst(node.types);
                    const secondMember = arrayAt(node.types, 1);

                    if (!firstMember || !secondMember) {
                        return;
                    }

                    const optionalEquivalentMember = isUndefinedKeywordType(
                        firstMember
                    )
                        ? secondMember
                        : isUndefinedKeywordType(secondMember)
                          ? firstMember
                          : null;

                    if (!optionalEquivalentMember) {
                        return;
                    }

                    const innerTypeText = getOptionalInnerTypeText({
                        sourceCode: context.sourceCode,
                        typeNode: optionalEquivalentMember,
                    });

                    if (
                        innerTypeText === null ||
                        innerTypeText.trim().length === 0
                    ) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        OPTIONAL_TYPE_NAME,
                        `${OPTIONAL_TYPE_NAME}<${innerTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferOptional",
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
                    "require TypeFest Optional over `Exclude<T, null> | undefined` and `NonNullable<T> | undefined` patterns.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-optional",
            },
            fixable: "code",
            messages: {
                preferOptional:
                    "Prefer `Optional<T>` from type-fest over `Exclude<T, null> | undefined` and equivalent optional-value patterns.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-optional",
    });

/**
 * Default export for the `prefer-type-fest-optional` rule module.
 */
export default preferTypeFestOptionalRule;
