/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-asyncify`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    getParametersFunctionArgumentFromFunctionType,
    isPromiseAwaitedReturnTypeReferenceForFunction,
} from "../_internal/function-type-reference-patterns.js";
import { collectNamedImportLocalNamesFromSource } from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { setContainsValue } from "../_internal/set-membership.js";
import { unwrapParenthesizedTypeNode } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

const isAsyncifyEquivalentSetReturnTypeReference = (
    node: Readonly<TSESTree.TSTypeReference>,
    setReturnTypeLocalNames: ReadonlySet<string>
): boolean => {
    if (
        node.typeName.type !== "Identifier" ||
        !setContainsValue(setReturnTypeLocalNames, node.typeName.name)
    ) {
        return false;
    }

    const typeArguments = node.typeArguments?.params;

    if (typeArguments?.length !== 2) {
        return false;
    }

    const [functionType, returnType] = typeArguments;

    return (
        functionType !== undefined &&
        returnType !== undefined &&
        isPromiseAwaitedReturnTypeReferenceForFunction(returnType, functionType)
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-asyncify`.
 */
const preferTypeFestAsyncifyRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const setReturnTypeLocalNames =
                collectNamedImportLocalNamesFromSource(
                    context.sourceCode,
                    TYPE_FEST_MODULE_SOURCE,
                    "SetReturnType"
                );

            return {
                TSFunctionType(node) {
                    const functionType =
                        getParametersFunctionArgumentFromFunctionType(node);
                    const returnType = node.returnType?.typeAnnotation;

                    if (
                        functionType === null ||
                        returnType === undefined ||
                        !isPromiseAwaitedReturnTypeReferenceForFunction(
                            returnType,
                            functionType
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferAsyncify",
                        node,
                    });
                },
                'TSTypeReference[typeName.type="Identifier"]'(
                    node: TSESTree.TSTypeReference
                ) {
                    const normalizedNode = unwrapParenthesizedTypeNode(node);

                    if (
                        normalizedNode.type !== "TSTypeReference" ||
                        !isAsyncifyEquivalentSetReturnTypeReference(
                            normalizedNode,
                            setReturnTypeLocalNames
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferAsyncify",
                        node: normalizedNode,
                    });
                },
            };
        },
        defaultOptions: [],
        meta: {
            deprecated: false,
            docs: {
                description:
                    "require TypeFest Asyncify over async function-type wrappers built from Parameters + Promise<Awaited<ReturnType<...>>>.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-asyncify",
            },
            messages: {
                preferAsyncify:
                    "Prefer `Asyncify<Function>` from type-fest over manual async wrappers built from `Parameters<Function>` and `Promise<Awaited<ReturnType<Function>>>`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-asyncify",
    });

export default preferTypeFestAsyncifyRule;
