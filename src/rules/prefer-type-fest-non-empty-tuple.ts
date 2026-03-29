/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-non-empty-tuple`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFixPreservingReadonly,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentTypeNodes } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** Tuple rest annotation node variants accepted by the parser. */
type RestAnnotation = TSESTree.TSRestType["typeAnnotation"];

/** Individual tuple element node variants used in readonly tuple checks. */
type TupleElement = TSESTree.TSTupleType["elementTypes"][number];

/**
 * Extracts the required head element type from a tuple member.
 *
 * @param element - Tuple element candidate.
 *
 * @returns The non-optional, non-rest head type node when present; otherwise
 *   `null`.
 */

const getRequiredTupleElementType = (
    element: Readonly<TupleElement>
): null | TSESTree.TypeNode => {
    if (element.type === "TSNamedTupleMember") {
        if (element.optional) {
            return null;
        }

        return element.elementType;
    }

    if (element.type === "TSOptionalType" || element.type === "TSRestType") {
        return null;
    }

    return element;
};

/**
 * Normalizes rest annotations by unwrapping named tuple members.
 *
 * @param annotation - Rest annotation to normalize.
 *
 * @returns The underlying type node represented by the annotation.
 */

const unwrapRestAnnotation = (
    annotation: Readonly<RestAnnotation>
): null | TSESTree.TypeNode => {
    if (annotation.type === "TSNamedTupleMember") {
        return annotation.elementType;
    }

    return annotation;
};

/**
 * Extracts `T` from rest elements shaped like `...T[]`.
 *
 * @param element - Tuple element candidate.
 *
 * @returns The array element type used by a rest tuple element; otherwise
 *   `null`.
 */

const getRestArrayElementType = (
    element: Readonly<TupleElement>
): null | TSESTree.TypeNode => {
    if (element.type !== "TSRestType") {
        return null;
    }

    const restType = unwrapRestAnnotation(element.typeAnnotation);
    if (restType?.type !== "TSArrayType") {
        return null;
    }

    return restType.elementType;
};

/**
 * ESLint rule definition for `prefer-type-fest-non-empty-tuple`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestNonEmptyTupleRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const { sourceCode } = context;
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                TSTypeOperator(node) {
                    if (node.operator !== "readonly") {
                        return;
                    }

                    const tupleType = node.typeAnnotation;
                    if (tupleType?.type !== "TSTupleType") {
                        return;
                    }

                    if (tupleType.elementTypes.length !== 2) {
                        return;
                    }

                    const [firstElement, restElement] = tupleType.elementTypes;

                    if (!firstElement || !restElement) {
                        return;
                    }

                    const firstType = getRequiredTupleElementType(firstElement);
                    if (!firstType) {
                        return;
                    }

                    const restArrayElementType =
                        getRestArrayElementType(restElement);
                    if (!restArrayElementType) {
                        return;
                    }

                    if (
                        !areEquivalentTypeNodes(firstType, restArrayElementType)
                    ) {
                        return;
                    }

                    const replacementFix =
                        createSafeTypeNodeTextReplacementFixPreservingReadonly(
                            node,
                            "NonEmptyTuple",
                            `NonEmptyTuple<${sourceCode.getText(firstType)}>`,
                            typeFestDirectImports
                        );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferNonEmptyTuple",
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
                    "require TypeFest NonEmptyTuple over readonly [T, ...T[]] tuple patterns.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-non-empty-tuple",
            },
            fixable: "code",
            messages: {
                preferNonEmptyTuple:
                    "Prefer `Readonly<NonEmptyTuple<T>>` from type-fest over `readonly [T, ...T[]]`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-non-empty-tuple",
    });

/**
 * Default export for the `prefer-type-fest-non-empty-tuple` rule module.
 */
export default preferTypeFestNonEmptyTupleRule;
