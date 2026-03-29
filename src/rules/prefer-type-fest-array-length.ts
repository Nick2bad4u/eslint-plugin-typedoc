import type { TSESTree } from "@typescript-eslint/utils";

/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-type-fest-array-length`.
 */
import { isArrayLikeType } from "../_internal/array-like-expression.js";
import { getConstrainedTypeAtLocationWithFallback } from "../_internal/constrained-type-at-location.js";
import {
    collectDirectNamedImportsFromSource,
    createSafeTypeNodeTextReplacementFix,
} from "../_internal/imported-type-aliases.js";
import { TYPE_FEST_MODULE_SOURCE } from "../_internal/module-source.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServices,
} from "../_internal/typed-rule.js";

const ARRAY_LENGTH_TYPE_NAME = "ArrayLength" as const;

const isLengthIndexType = (node: Readonly<TSESTree.TypeNode>): boolean =>
    node.type === "TSLiteralType" &&
    node.literal.type === "Literal" &&
    node.literal.value === "length";

/**
 * ESLint rule definition for `prefer-type-fest-array-length`.
 *
 * @remarks
 * Defines metadata, diagnostics, and suggestions/fixes for this rule.
 */
const preferTypeFestArrayLengthRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const typeFestDirectImports = collectDirectNamedImportsFromSource(
                context.sourceCode,
                TYPE_FEST_MODULE_SOURCE
            );
            const { checker, parserServices } = getTypedRuleServices(context);

            return {
                TSIndexedAccessType(node) {
                    if (!isLengthIndexType(node.indexType)) {
                        return;
                    }

                    const objectType = getConstrainedTypeAtLocationWithFallback(
                        checker,
                        node.objectType,
                        parserServices,
                        "prefer-type-fest-array-length-type-resolution-failed"
                    );

                    if (
                        !objectType ||
                        !isArrayLikeType(checker, objectType, "every")
                    ) {
                        return;
                    }

                    const objectTypeText = context.sourceCode.getText(
                        node.objectType
                    );

                    if (objectTypeText.trim().length === 0) {
                        return;
                    }

                    const fix = createSafeTypeNodeTextReplacementFix(
                        node,
                        ARRAY_LENGTH_TYPE_NAME,
                        `${ARRAY_LENGTH_TYPE_NAME}<${objectTypeText}>`,
                        typeFestDirectImports
                    );

                    reportWithOptionalFix({
                        context,
                        fix,
                        messageId: "preferArrayLength",
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
                    'require TypeFest ArrayLength over array and tuple `T["length"]` type queries.',
                frozen: false,
                recommended: false,
                requiresTypeChecking: true,
                typefestConfigs: [
                    "typefest.configs.recommended-type-checked",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-type-fest-array-length",
            },
            fixable: "code",
            messages: {
                preferArrayLength:
                    'Prefer `ArrayLength<T>` from type-fest over array and tuple `T["length"]` type queries.',
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-type-fest-array-length",
    });

/**
 * Default export for the `prefer-type-fest-array-length` rule module.
 */
export default preferTypeFestArrayLengthRule;
