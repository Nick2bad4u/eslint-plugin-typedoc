/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-conditional-except`.
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
 * Detect whether a type reference matches `ConditionalKeys<Base, Condition>`
 * using currently imported local names.
 *
 * @param node - Candidate type node.
 * @param conditionalKeysLocalNames - In-scope local names bound to
 *   `ConditionalKeys`.
 *
 * @returns Matched `ConditionalKeys` reference when supported; otherwise
 *   `null`.
 */
const getConditionalKeysReference = (
    node: Readonly<TSESTree.TypeNode>,
    conditionalKeysLocalNames: ReadonlySet<string>
): null | (TSESTree.TSTypeReference & { typeName: TSESTree.Identifier }) => {
    const normalizedNode = unwrapParenthesizedTypeNode(node);

    if (
        normalizedNode.type !== "TSTypeReference" ||
        normalizedNode.typeName.type !== "Identifier" ||
        !setContainsValue(
            conditionalKeysLocalNames,
            normalizedNode.typeName.name
        )
    ) {
        return null;
    }

    return normalizedNode as TSESTree.TSTypeReference & {
        typeName: TSESTree.Identifier;
    };
};

/**
 * ESLint rule definition for `prefer-type-fest-conditional-except`.
 */
const preferTypeFestConditionalExceptRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const exceptLocalNames = collectNamedImportLocalNamesFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE,
                "Except"
            );
            const conditionalKeysLocalNames =
                collectNamedImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE,
                    "ConditionalKeys"
                );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    if (
                        node.typeName.type !== "Identifier" ||
                        !setContainsValue(exceptLocalNames, node.typeName.name)
                    ) {
                        return;
                    }

                    const typeArguments = node.typeArguments?.params;
                    if (typeArguments?.length !== 2) {
                        return;
                    }

                    const [baseType, excludedKeysType] = typeArguments;

                    if (
                        baseType === undefined ||
                        excludedKeysType === undefined
                    ) {
                        return;
                    }

                    const conditionalKeysReference =
                        getConditionalKeysReference(
                            excludedKeysType,
                            conditionalKeysLocalNames
                        );

                    if (conditionalKeysReference === null) {
                        return;
                    }

                    const conditionalKeysArguments =
                        conditionalKeysReference.typeArguments?.params;

                    if (conditionalKeysArguments?.length !== 2) {
                        return;
                    }

                    const [conditionalBaseType] = conditionalKeysArguments;

                    if (conditionalBaseType === undefined) {
                        return;
                    }

                    if (
                        !areEquivalentTypeNodes(baseType, conditionalBaseType)
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferConditionalExcept",
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
                    "require TypeFest ConditionalExcept over Except<T, ConditionalKeys<T, Condition>> compositions.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-conditional-except",
            },
            messages: {
                preferConditionalExcept:
                    "Prefer `ConditionalExcept<Base, Condition>` from type-fest over `Except<Base, ConditionalKeys<Base, Condition>>` when excluding keys by value condition.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-conditional-except",
    });

export default preferTypeFestConditionalExceptRule;
