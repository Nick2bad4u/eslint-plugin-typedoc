/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-safe-cast-to`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    containsAllTypesByName,
    isTypeAnyType,
    isTypeNeverType,
    isTypeUnknownType,
} from "@typescript-eslint/type-utils";
import { isDefined } from "ts-extras";
import ts from "typescript";

import { getConstrainedTypeAtLocationWithFallback } from "../_internal/constrained-type-at-location.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
    getFunctionCallArgumentText,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { safeTypeOperation } from "../_internal/safe-type-operation.js";
import {
    createTypedRule,
    getTypedRuleServices,
    isTypeAssignableTo,
} from "../_internal/typed-rule.js";

/**
 * Checks whether a type assertion target should be excluded from `safeCastTo`
 * suggestions.
 *
 * @param typeAnnotation - Asserted type annotation to inspect.
 *
 * @returns `true` for broad or intentionally unsafe targets (`any`, `unknown`,
 *   `never`, and `const` assertions) where replacement is not desirable.
 */

const isIgnoredTypeAnnotation = (
    typeAnnotation: Readonly<TSESTree.TypeNode>
): boolean =>
    typeAnnotation.type === "TSAnyKeyword" ||
    typeAnnotation.type === "TSNeverKeyword" ||
    typeAnnotation.type === "TSUnknownKeyword" ||
    (typeAnnotation.type === "TSTypeReference" &&
        typeAnnotation.typeName.type === "Identifier" &&
        typeAnnotation.typeName.name === "const");

const IGNORED_TARGET_TYPE_NAMES = new Set([
    "any",
    "never",
    "unknown",
]);

const resolvesToIgnoredTargetTypeName = (
    targetType: Readonly<ts.Type>
): boolean => {
    const containsIgnoredTypeNameResult = safeTypeOperation({
        operation: () =>
            containsAllTypesByName(targetType, true, IGNORED_TARGET_TYPE_NAMES),
        reason: "safe-cast-to-ignored-target-name-check-failed",
    });

    return (
        containsIgnoredTypeNameResult.ok && containsIgnoredTypeNameResult.value
    );
};

/**
 * Checks whether a resolved target type should be excluded from `safeCastTo`
 * suggestions.
 *
 * @param targetType - Resolved target type.
 *
 * @returns `true` for broad or intentionally unsafe targets (`any`, `unknown`,
 *   and `never`) including aliased forms.
 */
const isIgnoredTargetType = (targetType: Readonly<ts.Type>): boolean =>
    isTypeAnyType(targetType) ||
    isTypeNeverType(targetType) ||
    isTypeUnknownType(targetType) ||
    resolvesToIgnoredTargetTypeName(targetType);

/**
 * ESLint rule definition for `prefer-ts-extras-safe-cast-to`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasSafeCastToRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            const { checker, parserServices } = getTypedRuleServices(context);

            /**
             * Report assertions that can be replaced by `safeCastTo<T>(value)`
             * without changing assignability behavior.
             */
            const reportIfSafeCastCandidate = ({
                expression,
                node,
                typeAnnotation,
            }: Readonly<{
                expression: TSESTree.Expression;
                node: TSESTree.Node;
                typeAnnotation: TSESTree.TypeNode;
            }>): void => {
                if (isIgnoredTypeAnnotation(typeAnnotation)) {
                    return;
                }

                const result = safeTypeOperation({
                    operation: () => {
                        const annotationTsNode =
                            parserServices.esTreeNodeToTSNodeMap.get(
                                typeAnnotation
                            );

                        if (!ts.isTypeNode(annotationTsNode)) {
                            return null;
                        }

                        const sourceType =
                            getConstrainedTypeAtLocationWithFallback(
                                checker,
                                expression,
                                parserServices,
                                "safe-cast-to-source-type-resolution-failed"
                            );

                        if (!isDefined(sourceType)) {
                            return null;
                        }

                        const targetType =
                            checker.getTypeFromTypeNode(annotationTsNode);

                        if (isIgnoredTargetType(targetType)) {
                            return null;
                        }

                        if (
                            !isTypeAssignableTo(checker, sourceType, targetType)
                        ) {
                            return null;
                        }

                        const expressionArgumentText =
                            getFunctionCallArgumentText({
                                argumentNode: expression,
                                sourceCode: context.sourceCode,
                            });

                        if (expressionArgumentText === null) {
                            return null;
                        }

                        return createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: "safeCastTo",
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) =>
                                `${replacementName}<${context.sourceCode.getText(typeAnnotation)}>(${expressionArgumentText})`,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        });
                    },
                    reason: "safe-cast-to-candidate-analysis-failed",
                });

                if (!result.ok || result.value === null) {
                    return;
                }

                reportWithOptionalFix({
                    context,
                    fix: result.value,
                    messageId: "preferTsExtrasSafeCastTo",
                    node,
                });
            };

            return {
                TSAsExpression(node) {
                    reportIfSafeCastCandidate({
                        expression: node.expression,
                        node,
                        typeAnnotation: node.typeAnnotation,
                    });
                },
                TSTypeAssertion(node) {
                    reportIfSafeCastCandidate({
                        expression: node.expression,
                        node,
                        typeAnnotation: node.typeAnnotation,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras safeCastTo for assignable type assertions instead of direct `as` casts.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-safe-cast-to",
            },
            fixable: "code",
            messages: {
                preferTsExtrasSafeCastTo:
                    "Prefer `safeCastTo<T>(value)` from `ts-extras` over direct `as` assertions when the cast is already type-safe.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-safe-cast-to",
    });

/**
 * Default export for the `prefer-ts-extras-safe-cast-to` rule module.
 */
export default preferTsExtrasSafeCastToRule;
