/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-json-object`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { isIdentifierTypeReference } from "../_internal/type-reference-node.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/** TypeFest JSON value alias used in equivalent object shapes. */
const JSON_VALUE_TYPE_NAME = "JsonValue";

/** Built-in object utility type used by explicit JSON object aliases. */
const RECORD_TYPE_NAME = "Record";

/**
 * Checks whether a type node represents a string index key.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` for `string` keyword nodes and literal `'string'` aliases.
 */

const isStringKeyType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSStringKeyword" ||
    (node.type === "TSLiteralType" &&
        node.literal.type === "Literal" &&
        node.literal.value === "string");

/**
 * Checks whether a node references `JsonValue`.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` when the node is the identifier type reference `JsonValue`.
 */

const isJsonValueType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    isIdentifierTypeReference(node, JSON_VALUE_TYPE_NAME);

/**
 * Detects `Record<string, JsonValue>` style aliases.
 *
 * @param node - Type reference to inspect.
 *
 * @returns `true` when the node is a two-argument `Record` whose key type is
 *   string and value type is `JsonValue`.
 */

const isRecordJsonValueReference = (
    node: Readonly<TSESTree.TSTypeReference>
): boolean => {
    if (!isIdentifierTypeReference(node, RECORD_TYPE_NAME)) {
        return false;
    }

    const typeArguments = node.typeArguments?.params;
    if (typeArguments?.length !== 2) {
        return false;
    }

    const [keyType, valueType] = typeArguments as [
        TSESTree.TypeNode,
        TSESTree.TypeNode,
    ];

    return isStringKeyType(keyType) && isJsonValueType(valueType);
};

/**
 * ESLint rule definition for `prefer-type-fest-json-object`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestJsonObjectRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (!isRecordJsonValueReference(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "JsonObject",
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferJsonObject",
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
                    "require TypeFest JsonObject over equivalent Record<string, JsonValue> object aliases.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-json-object",
            },
            fixable: "code",
            messages: {
                preferJsonObject:
                    "Prefer `JsonObject` from type-fest over equivalent explicit JSON-object type shapes.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-json-object",
    });

/**
 * Default export for the `prefer-type-fest-json-object` rule module.
 */
export default preferTypeFestJsonObjectRule;
