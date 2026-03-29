/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-set-return-type`.
 */
import {
    getParametersFunctionArgumentFromFunctionType,
    isPromiseAwaitedReturnTypeReferenceForFunction,
    isReturnTypeReferenceForFunction,
} from "../_internal/function-type-reference-patterns.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * ESLint rule definition for `prefer-type-fest-set-return-type`.
 */
const preferTypeFestSetReturnTypeRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            return {
                TSFunctionType(node) {
                    const functionType =
                        getParametersFunctionArgumentFromFunctionType(node);
                    const returnType = node.returnType?.typeAnnotation;

                    if (functionType === null || returnType === undefined) {
                        return;
                    }

                    if (
                        isReturnTypeReferenceForFunction(
                            returnType,
                            functionType
                        ) ||
                        isPromiseAwaitedReturnTypeReferenceForFunction(
                            returnType,
                            functionType
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferSetReturnType",
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
                    "require TypeFest SetReturnType over direct function-type wrappers of the form (...args: Parameters<F>) => R.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-set-return-type",
            },
            messages: {
                preferSetReturnType:
                    "Prefer `SetReturnType<Function, TypeToReturn>` from type-fest over direct function-type wrappers like `(...args: Parameters<Function>) => TypeToReturn`.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-set-return-type",
    });

export default preferTypeFestSetReturnTypeRule;
