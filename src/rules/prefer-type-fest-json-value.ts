/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-value`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import {
    reportWithOptionalFix,
    reportWithTypefestPolicy,
} from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Checks whether a key type is compatible with string-indexed JSON records.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` for `string` keyword and `'string'` literal key aliases.
 */
const isStringLikeKeyType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSStringKeyword" ||
    (node.type === "TSLiteralType" &&
        node.literal.type === "Literal" &&
        node.literal.value === "string");

/**
 * Detects `Record<string, unknown|any>` patterns targeted by this rule.
 *
 * @param typeNode - Type reference candidate.
 *
 * @returns `true` when the type reference matches a string-keyed record with
 *   `unknown` or `any` value type.
 */
const isRecordLikeUnknownOrAny = (
    typeNode: Readonly<TSESTree.TSTypeReference>
): boolean => {
    if (
        typeNode.typeName.type !== "Identifier" ||
        typeNode.typeName.name !== "Record" ||
        typeNode.typeArguments?.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = typeNode.typeArguments.params;

    return (
        isDefined(keyType) &&
        isDefined(valueType) &&
        isStringLikeKeyType(keyType) &&
        (valueType.type === "TSUnknownKeyword" ||
            valueType.type === "TSAnyKeyword")
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-json-value`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonValueRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (!isRecordLikeUnknownOrAny(node)) {
                        return;
                    }

                    const jsonObjectSuggestionFix =
                        createSafeTypeNodeReplacementFix(
                            node,
                            "JsonObject",
                            typeFestDirectImports,
                            TYPE_FEST_MODULE_SOURCE,
                            "suggestion"
                        );

                    if (jsonObjectSuggestionFix === null) {
                        reportWithOptionalFix({
                            context,
                            fix: null,
                            messageId: "preferJsonValue",
                            node,
                        });

                        return;
                    }

                    reportWithTypefestPolicy({
                        context,
                        descriptor: {
                            messageId: "preferJsonValue",
                            node,
                            suggest: [
                                {
                                    fix: jsonObjectSuggestionFix,
                                    messageId: "suggestJsonObject",
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
                    "require TypeFest JsonObject for string-keyed JSON record contract types in serialization boundaries.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-value",
            },
            hasSuggestions: true,
            messages: {
                preferJsonValue:
                    "Use `JsonObject` from type-fest for string-keyed JSON record contracts in serialization boundaries instead of Record<string, unknown|any>.",
                suggestJsonObject:
                    "Replace with `JsonObject` from type-fest (review value constraints, this may narrow accepted shapes).",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-value",
    });

/**
 * Default export for the `prefer-type-fest-json-value` rule module.
 */
export default preferTypeFestJsonValueRule;
