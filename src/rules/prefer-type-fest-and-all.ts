import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-and-all`.
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

const ALL_EXTEND_TYPE_NAME = "AllExtend" as const;
const AND_ALL_TYPE_NAME = "AndAll" as const;

const isTrueLiteralType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSLiteralType" &&
    node.literal.type === "Literal" &&
    node.literal.value === true;

/**
 * ESLint rule definition for `prefer-type-fest-and-all`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestAndAllRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const allExtendLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                ALL_EXTEND_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            const getAllExtendTupleArgumentText = (
                typeReference: Readonly<TSESTree.TSTypeReference>
            ): null | string => {
                const typeArguments = typeReference.typeArguments?.params ?? [];
                const [tupleArgument, comparedType] = typeArguments;

                if (
                    !tupleArgument ||
                    !comparedType ||
                    !isTrueLiteralType(comparedType)
                ) {
                    return null;
                }

                if (typeArguments.length !== 2) {
                    return null;
                }

                return context.sourceCode.getText(tupleArgument);
            };

            const reportIfAllExtendEquivalent = (
                node: Readonly<TSESTree.TSTypeReference>
            ): void => {
                const tupleArgumentText = getAllExtendTupleArgumentText(node);

                if (
                    tupleArgumentText === null ||
                    tupleArgumentText.trim().length === 0
                ) {
                    return;
                }

                const fix = createSafeTypeNodeTextReplacementFix(
                    node,
                    AND_ALL_TYPE_NAME,
                    `${AND_ALL_TYPE_NAME}<${tupleArgumentText}>`,
                    typeFestDirectImports
                );

                reportWithOptionalFix({
                    context,
                    fix,
                    messageId: "preferAndAll",
                    node,
                });
            };

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    typeReference: Readonly<TSESTree.TSTypeReference>
                ) {
                    if (
                        typeReference.typeName.type !== "Identifier" ||
                        !setContainsValue(
                            allExtendLocalNames,
                            typeReference.typeName.name
                        )
                    ) {
                        return;
                    }

                    reportIfAllExtendEquivalent(typeReference);
                },
                'TSTypeReference[typeName.type="TSQualifiedName"]'(
                    typeReference: Readonly<TSESTree.TSTypeReference>
                ) {
                    if (typeReference.typeName.type !== "TSQualifiedName") {
                        return;
                    }

                    if (
                        typeReference.typeName.left.type !== "Identifier" ||
                        !setContainsValue(
                            typeFestNamespaceImportNames,
                            typeReference.typeName.left.name
                        ) ||
                        typeReference.typeName.right.type !== "Identifier" ||
                        typeReference.typeName.right.name !==
                            ALL_EXTEND_TYPE_NAME
                    ) {
                        return;
                    }

                    reportIfAllExtendEquivalent(typeReference);
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest AndAll over `AllExtend<TTuple, true>` boolean-tuple checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-and-all",
            },
            fixable: "code",
            messages: {
                preferAndAll:
                    "Prefer `AndAll<TTuple>` from type-fest over `AllExtend<TTuple, true>` for boolean-tuple conjunction checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-and-all",
    });

/**
 * Default export for the `prefer-type-fest-and-all` rule module.
 */
export default preferTypeFestAndAllRule;
