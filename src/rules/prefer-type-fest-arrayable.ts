/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-arrayable`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const ARRAY_TYPE_NAME = "Array";

/**
 * Extract the element type from `Array<T>` type references.
 *
 * @param node - Type node to inspect.
 *
 * @returns Element type when the node is `Array<T>`; otherwise `null`.
 */
const getArrayTypeReferenceElementType = (
    node: Readonly<TSESTree.TypeNode>
): null | TSESTree.TypeNode => {
    if (!isIdentifierTypeReference(node, ARRAY_TYPE_NAME)) {
        return null;
    }

    const typeArguments = node.typeArguments?.params ?? [];
    if (typeArguments.length !== 1) {
        return null;
    }

    const [firstTypeArgument] = typeArguments;
    return firstTypeArgument ?? null;
};

/**
 * Extract the scalar element type from `T | T[]` or `T | Array<T>` unions.
 *
 * @param node - Union type node to inspect.
 *
 * @returns The scalar `T` when the union matches an Arrayable pattern;
 *   otherwise `null`.
 */
const getArrayableElementType = (
    node: Readonly<TSESTree.TSUnionType>
): null | TSESTree.TypeNode => {
    const unionTypes = node.types;
    if (unionTypes.length !== 2) {
        return null;
    }

    const [firstUnionType, secondUnionType] = unionTypes;
    if (!firstUnionType || !secondUnionType) {
        return null;
    }

    if (firstUnionType.type === "TSArrayType") {
        return areEquivalentTypeNodes(
            firstUnionType.elementType,
            secondUnionType
        )
            ? secondUnionType
            : null;
    }

    if (secondUnionType.type === "TSArrayType") {
        return areEquivalentTypeNodes(
            secondUnionType.elementType,
            firstUnionType
        )
            ? firstUnionType
            : null;
    }

    const firstArrayElementType =
        getArrayTypeReferenceElementType(firstUnionType);
    if (firstArrayElementType) {
        return areEquivalentTypeNodes(firstArrayElementType, secondUnionType)
            ? secondUnionType
            : null;
    }

    const secondArrayElementType =
        getArrayTypeReferenceElementType(secondUnionType);
    if (secondArrayElementType) {
        return areEquivalentTypeNodes(secondArrayElementType, firstUnionType)
            ? firstUnionType
            : null;
    }

    return null;
};

/**
 * ESLint rule definition for `prefer-type-fest-arrayable`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestArrayableRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const { sourceCode } = context;
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSUnionType(node) {
                    const arrayableElementType = getArrayableElementType(node);

                    if (!arrayableElementType) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeTextReplacementFix(
                        node,
                        "Arrayable",
                        `Arrayable<${sourceCode.getText(arrayableElementType)}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferArrayable",
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
                    "require TypeFest Arrayable over T | T[] and T | Array<T> unions.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-arrayable",
            },
            fixable: "code",
            messages: {
                preferArrayable:
                    "Prefer `Arrayable<T>` from type-fest over `T | T[]` or `T | Array<T>` unions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-arrayable",
    });

/**
 * Default export for the `prefer-type-fest-arrayable` rule module.
 */
export default preferTypeFestArrayableRule;
