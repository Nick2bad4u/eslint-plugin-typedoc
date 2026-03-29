import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-or-all`.
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

const SOME_EXTEND_TYPE_NAME = "SomeExtend" as const;
const OR_ALL_TYPE_NAME = "OrAll" as const;

const isTrueLiteralType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSLiteralType" &&
    node.literal.type === "Literal" &&
    node.literal.value === true;

/**
 * ESLint rule definition for `prefer-type-fest-or-all`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestOrAllRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const someExtendLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                SOME_EXTEND_TYPE_NAME
            );
            const typeFestNamespaceImportNames =
                collectNamespaceImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE
                );

            const getSomeExtendTupleArgumentText = (
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

            const reportIfSomeExtendEquivalent = (
                node: Readonly<TSESTree.TSTypeReference>
            ): void => {
                const tupleArgumentText = getSomeExtendTupleArgumentText(node);

                if (
                    tupleArgumentText === null ||
                    tupleArgumentText.trim().length === 0
                ) {
                    return;
                }

                const fix = createSafeTypeNodeTextReplacementFix(
                    node,
                    OR_ALL_TYPE_NAME,
                    `${OR_ALL_TYPE_NAME}<${tupleArgumentText}>`,
                    typeFestDirectImports
                );

                reportWithOptionalFix({
                    context,
                    fix,
                    messageId: "preferOrAll",
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
                            someExtendLocalNames,
                            typeReference.typeName.name
                        )
                    ) {
                        return;
                    }

                    reportIfSomeExtendEquivalent(typeReference);
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
                            SOME_EXTEND_TYPE_NAME
                    ) {
                        return;
                    }

                    reportIfSomeExtendEquivalent(typeReference);
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest OrAll over `SomeExtend<TTuple, true>` boolean-tuple checks.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.type-fest/types",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-or-all",
            },
            fixable: "code",
            messages: {
                preferOrAll:
                    "Prefer `OrAll<TTuple>` from type-fest over `SomeExtend<TTuple, true>` for boolean-tuple disjunction checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-or-all",
    });

/**
 * Default export for the `prefer-type-fest-or-all` rule module.
 */
export default preferTypeFestOrAllRule;
