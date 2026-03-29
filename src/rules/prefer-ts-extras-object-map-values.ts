/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-object-map-values`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    getSafeLocalNameForImportedValue,
} from "../_internal/imported-value-symbols.js";
import { getIdentifierPropertyMemberCall } from "../_internal/member-call.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Extract the sole expression argument from a call expression.
 *
 * @param callExpression - Candidate call expression.
 *
 * @returns The single argument expression when present and non-spread;
 *   otherwise `null`.
 */
const getSingleExpressionArgument = (
    callExpression: Readonly<TSESTree.CallExpression>
): null | Readonly<TSESTree.Expression> => {
    if (callExpression.arguments.length !== 1) {
        return null;
    }

    const [argument] = callExpression.arguments;

    if (!argument || argument.type === "SpreadElement") {
        return null;
    }

    return argument;
};

/**
 * Unwrap transparent TypeScript expression wrappers around an expression.
 *
 * @param expression - Candidate expression.
 *
 * @returns The innermost wrapped expression.
 */
const unwrapTransparentExpression = (
    expression: Readonly<TSESTree.Expression>
): Readonly<TSESTree.Expression> => {
    let currentExpression = expression;

    while (true) {
        if (currentExpression.type === "TSAsExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSNonNullExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSSatisfiesExpression") {
            currentExpression = currentExpression.expression;
            continue;
        }

        if (currentExpression.type === "TSTypeAssertion") {
            currentExpression = currentExpression.expression;
            continue;
        }

        return currentExpression;
    }
};

/**
 * Extract the returned expression from a supported arrow callback body.
 *
 * @param callback - Candidate arrow callback.
 *
 * @returns The returned expression when the callback body is an expression or a
 *   single `return` statement; otherwise `null`.
 */
const getReturnedExpression = (
    callback: Readonly<TSESTree.ArrowFunctionExpression>
): null | Readonly<TSESTree.Expression> => {
    if (callback.body.type !== "BlockStatement") {
        return callback.body;
    }

    if (callback.body.body.length !== 1) {
        return null;
    }

    const [statement] = callback.body.body;

    if (statement?.type !== "ReturnStatement") {
        return null;
    }

    return statement.argument;
};

/**
 * Extract the first identifier from a strict `[key, value]` tuple parameter.
 *
 * @param parameter - Candidate callback parameter.
 *
 * @returns The key identifier when the parameter is a strict two-item array
 *   pattern of identifiers; otherwise `null`.
 */
const getKeyIdentifierFromEntriesTupleParameter = (
    parameter: Readonly<TSESTree.Parameter>
): null | Readonly<TSESTree.Identifier> => {
    if (parameter.type !== "ArrayPattern" || parameter.elements.length !== 2) {
        return null;
    }

    const [firstElement, secondElement] = parameter.elements;

    if (
        firstElement?.type !== "Identifier" ||
        secondElement?.type !== "Identifier"
    ) {
        return null;
    }

    return firstElement;
};

/**
 * Check whether a callback returns a tuple that preserves the original key.
 *
 * @param returnedExpression - Returned callback expression.
 * @param keyIdentifier - Key identifier captured from `[key, value]`.
 *
 * @returns `true` when the callback returns `[key, mappedValue]`.
 */
const isKeyPreservingMappedTupleReturn = (
    returnedExpression: Readonly<TSESTree.Expression>,
    keyIdentifier: Readonly<TSESTree.Identifier>
): boolean => {
    const unwrappedExpression = unwrapTransparentExpression(returnedExpression);

    if (
        unwrappedExpression.type !== "ArrayExpression" ||
        unwrappedExpression.elements.length !== 2
    ) {
        return false;
    }

    const [firstElement, secondElement] = unwrappedExpression.elements;

    if (
        !firstElement ||
        !secondElement ||
        firstElement.type === "SpreadElement" ||
        secondElement.type === "SpreadElement"
    ) {
        return false;
    }

    return areEquivalentExpressions(firstElement, keyIdentifier);
};

/**
 * ESLint rule definition for `prefer-ts-extras-object-map-values`.
 *
 * @remarks
 * Defines metadata and diagnostics for the experimental `objectMapValues`
 * candidate migration.
 */
const preferTsExtrasObjectMapValuesRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );

            return {
                'CallExpression[callee.type="Identifier"]'(
                    node: Readonly<TSESTree.CallExpression>
                ) {
                    if (node.optional || node.callee.type !== "Identifier") {
                        return;
                    }

                    const objectFromEntriesLocalName =
                        getSafeLocalNameForImportedValue({
                            context,
                            importedName: "objectFromEntries",
                            imports: tsExtrasImports,
                            referenceNode: node,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                        });

                    if (
                        objectFromEntriesLocalName === null ||
                        node.callee.name !== objectFromEntriesLocalName
                    ) {
                        return;
                    }

                    const mapCallExpression = getSingleExpressionArgument(node);

                    if (mapCallExpression?.type !== "CallExpression") {
                        return;
                    }

                    const mapMemberCall = getIdentifierPropertyMemberCall({
                        memberName: "map",
                        node: mapCallExpression,
                    });

                    if (mapMemberCall === null) {
                        return;
                    }

                    const mapCallback =
                        getSingleExpressionArgument(mapMemberCall);

                    if (mapCallback?.type !== "ArrowFunctionExpression") {
                        return;
                    }

                    const objectEntriesLocalName =
                        getSafeLocalNameForImportedValue({
                            context,
                            importedName: "objectEntries",
                            imports: tsExtrasImports,
                            referenceNode: mapMemberCall,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                        });

                    if (objectEntriesLocalName === null) {
                        return;
                    }

                    const entriesCallExpression = mapMemberCall.callee.object;

                    if (
                        entriesCallExpression.type !== "CallExpression" ||
                        entriesCallExpression.callee.type !== "Identifier" ||
                        entriesCallExpression.callee.name !==
                            objectEntriesLocalName ||
                        getSingleExpressionArgument(entriesCallExpression) ===
                            null
                    ) {
                        return;
                    }

                    if (mapCallback.params.length !== 1) {
                        return;
                    }

                    const [tupleParameter] = mapCallback.params;

                    if (tupleParameter === undefined) {
                        return;
                    }

                    const keyIdentifier =
                        getKeyIdentifierFromEntriesTupleParameter(
                            tupleParameter
                        );

                    if (keyIdentifier === null) {
                        return;
                    }

                    const returnedExpression =
                        getReturnedExpression(mapCallback);

                    if (returnedExpression === null) {
                        return;
                    }

                    if (
                        !isKeyPreservingMappedTupleReturn(
                            returnedExpression,
                            keyIdentifier
                        )
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferTsExtrasObjectMapValues",
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
                    "require ts-extras objectMapValues over objectFromEntries(objectEntries(...).map(...)) chains that only remap values.",
                frozen: false,
                recommended: false,
                requiresTypeChecking: false,
                typefestConfigs: ["typefest.configs.experimental"],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-object-map-values",
            },
            messages: {
                preferTsExtrasObjectMapValues:
                    "Prefer `objectMapValues` from `ts-extras` over `objectFromEntries(objectEntries(...).map(...))` when the map callback preserves keys and only remaps values.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-object-map-values",
    });

/**
 * Default export for the `prefer-ts-extras-object-map-values` rule module.
 */
export default preferTsExtrasObjectMapValuesRule;
