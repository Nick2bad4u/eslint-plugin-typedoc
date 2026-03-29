/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-unknown-record`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import { createTypedRule } from "../_internal/typed-rule.js";

/**
 * Detects `Record<string, unknown>` references.
 *
 * @param node - Type reference candidate.
 *
 * @returns `true` when the node is a two-argument `Record` with `string` keys
 *   and `unknown` values.
 */

const isRecordStringUnknown = (
    node: Readonly<TSESTree.TSTypeReference>
): boolean => {
    if (
        node.typeName.type !== "Identifier" ||
        node.typeName.name !== "Record" ||
        node.typeArguments?.params.length !== 2
    ) {
        return false;
    }

    const [keyType, valueType] = node.typeArguments.params;
    return (
        keyType?.type === "TSStringKeyword" &&
        valueType?.type === "TSUnknownKeyword"
    );
};

/**
 * ESLint rule definition for `prefer-type-fest-unknown-record`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestUnknownRecordRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );

            return {
                'TSTypeReference[typeName.type="Identifier"]'(node) {
                    if (!isRecordStringUnknown(node)) {
                        return;
                    }

                    const replacementFix = createSafeTypeNodeReplacementFix(
                        node,
                        "UnknownRecord",
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix: replacementFix,
                        messageId: "preferUnknownRecord",
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
                    "require TypeFest UnknownRecord over Record<string, unknown> in architecture-critical layers.",
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
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-unknown-record",
            },
            fixable: "code",
            messages: {
                preferUnknownRecord:
                    "Prefer `UnknownRecord` from type-fest over `Record<string, unknown>` for clearer intent and stronger shared typing conventions.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-unknown-record",
    });

/**
 * Default export for the `prefer-type-fest-unknown-record` rule module.
 */
export default preferTypeFestUnknownRecordRule;
