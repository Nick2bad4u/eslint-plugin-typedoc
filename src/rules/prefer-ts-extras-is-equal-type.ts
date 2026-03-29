/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-equal-type`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import {
    collectNamedImportLocalNamesFromSource,
    collectNamespaceImportLocalNamesFromSource,
} from "../_internal/imported-type-aliases.js";
import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueNodeTextReplacementFix,
} from "../_internal/imported-value-symbols.js";
import {
    TS_EXTRAS_MODULE_SOURCE,
    TYPE_FEST_MODULE_SOURCE,
} from "../_internal/module-source.js";
import {
    reportWithOptionalFix,
    reportWithTypefestPolicy,
} from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const IS_EQUAL_TYPE_NAME = "IsEqual";
const IS_EQUAL_TYPE_FUNCTION_NAME = "isEqualType";

/**
 * ESLint rule definition for `prefer-ts-extras-is-equal-type`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTsExtrasIsEqualTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const isEqualLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                IS_EQUAL_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            /**
             * Resolve `IsEqual<...>` type references from direct or namespace
             * imports.
             */
            const getIsEqualTypeReference = (
                node: Readonly<TSESTree.TypeNode>
            ): null | TSESTree.TSTypeReference => {
                if (node.type !== "TSTypeReference") {
                    return null;
                }

                if (node.typeName.type === "Identifier") {
                    return setContainsValue(
                        isEqualLocalNames,
                        node.typeName.name
                    )
                        ? node
                        : null;
                }

                if (node.typeName.type !== "TSQualifiedName") {
                    return null;
                }

                if (
                    node.typeName.left.type === "Identifier" &&
                    setContainsValue(
                        typeFestNamespaceImportNames,
                        node.typeName.left.name
                    ) &&
                    node.typeName.right.type === "Identifier" &&
                    node.typeName.right.name === IS_EQUAL_TYPE_NAME
                ) {
                    return node;
                }

                return null;
            };

            return {
                VariableDeclarator(node) {
                    if (
                        node.id.type !== "Identifier" ||
                        !isDefined(node.id.typeAnnotation?.typeAnnotation) ||
                        node.init?.type !== "Literal" ||
                        typeof node.init.value !== "boolean"
                    ) {
                        return;
                    }

                    const isEqualTypeReference = getIsEqualTypeReference(
                        node.id.typeAnnotation.typeAnnotation
                    );

                    if (!isEqualTypeReference) {
                        return;
                    }

                    const typeArguments =
                        isEqualTypeReference.typeArguments?.params ?? [];
                    const identifierName = node.id.name;
                    const initializerValue = node.init.value;
                    const [leftType, rightType] = typeArguments;

                    if (leftType === undefined || rightType === undefined) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasIsEqualType",
                            node,
                        });

                        return;
                    }

                    const leftTypeText = context.sourceCode.getText(leftType);
                    const rightTypeText = context.sourceCode.getText(rightType);
                    const isEqualTypeSuggestionFix =
                        createSafeValueNodeTextReplacementFix({
                            context,
                            importedName: IS_EQUAL_TYPE_FUNCTION_NAME,
                            imports: tsExtrasImports,
                            replacementTextFactory: (replacementName) => {
                                const callText = `${replacementName}<${leftTypeText}, ${rightTypeText}>()`;
                                const runtimePreservingExpression =
                                    initializerValue
                                        ? `${callText} || true`
                                        : `${callText} && false`;

                                return `${identifierName} = ${runtimePreservingExpression}`;
                            },
                            reportFixIntent: "suggestion",
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        });

                    if (
                        typeArguments.length !== 2 ||
                        isEqualTypeSuggestionFix === null
                    ) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferTsExtrasIsEqualType",
                            node,
                        });

                        return;
                    }

                    reportWithTypefestPolicy({
                        context,
                        descriptor: {
                            messageId: "preferTsExtrasIsEqualType",
                            node,
                            suggest: [
                                {
                                    fix: isEqualTypeSuggestionFix,
                                    messageId: "suggestTsExtrasIsEqualType",
                                },
                            ],
                        },
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require ts-extras isEqualType over IsEqual<T, U> boolean assertion variables.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: "typefest.configs.all",
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-equal-type",
            },
            hasSuggestions: true,
            messages: {
                preferTsExtrasIsEqualType:
                    "Prefer `isEqualType<T, U>()` from `ts-extras` over `IsEqual<T, U>` boolean assertion variables.",
                suggestTsExtrasIsEqualType:
                    "Replace this boolean `IsEqual<...>` assertion variable with `isEqualType<...>()`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-equal-type",
    });

/**
 * Default export for the `prefer-ts-extras-is-equal-type` rule module.
 */
export default preferTsExtrasIsEqualTypeRule;
