/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-ts-extras-is-infinite`.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import {
    collectDirectNamedValueImportsFromSource,
    createSafeValueArgumentFunctionCallFix,
} from "../_internal/imported-value-symbols.js";
import { TS_EXTRAS_MODULE_SOURCE } from "../_internal/module-source.js";
import { areEquivalentExpressions } from "../_internal/normalize-expression-text.js";
import { reportWithOptionalFix } from "../_internal/rule-reporting.js";
import {
    createTypedRule,
    getTypedRuleServicesOrUndefined,
    isGlobalIdentifierNamed,
} from "../_internal/typed-rule.js";
import { createTypeScriptEslintNodeExpressionSkipChecker } from "../_internal/typescript-eslint-node-autofix.js";

/**
 * Parsed infinity comparison extracted from a binary expression.
 */
type InfinityComparison = Readonly<{
    comparedExpression: TSESTree.Expression;
    kind: InfinityKind;
    operator: "==" | "===";
}>;

/**
 * Infinity polarity represented by a reference expression.
 */
type InfinityKind = "negative" | "positive";

/**
 * Concrete rule context type derived from `createTypedRule`.
 */
type RuleContext = Readonly<
    Parameters<ReturnType<typeof createTypedRule>["create"]>[0]
>;

/**
 * Classifies an expression as positive or negative infinity.
 *
 * @param context - Rule context used to validate global `Infinity`/`Number`
 *   bindings.
 * @param node - Expression to inspect.
 *
 * @returns The infinity kind when the expression is a supported infinity
 *   reference; otherwise `null`.
 */
const extractInfinityKind = (
    context: RuleContext,
    node: Readonly<TSESTree.Expression>
): InfinityKind | null => {
    if (isGlobalIdentifierNamed(context, node, "Infinity")) {
        return "positive";
    }

    if (
        node.type !== "MemberExpression" ||
        node.computed ||
        node.object.type !== "Identifier" ||
        node.object.name !== "Number" ||
        !isGlobalIdentifierNamed(context, node.object, "Number") ||
        node.property.type !== "Identifier"
    ) {
        return null;
    }

    if (node.property.name === "POSITIVE_INFINITY") {
        return "positive";
    }

    if (node.property.name === "NEGATIVE_INFINITY") {
        return "negative";
    }

    return null;
};

/**
 * Extracts a comparison where exactly one side references infinity.
 *
 * @param context - Rule context used to resolve global identifiers.
 * @param expression - Expression candidate.
 *
 * @returns Normalized comparison data when the expression matches value ===
 *   Infinity style checks; otherwise null.
 */
const extractInfinityComparison = (
    context: RuleContext,
    expression: Readonly<TSESTree.Expression>
): InfinityComparison | null => {
    if (
        expression.type !== "BinaryExpression" ||
        (expression.operator !== "==" && expression.operator !== "===")
    ) {
        return null;
    }

    const leftKind = extractInfinityKind(context, expression.left);
    const rightKind = extractInfinityKind(context, expression.right);

    if (leftKind && !rightKind) {
        return {
            comparedExpression: expression.right,
            kind: leftKind,
            operator: expression.operator,
        };
    }

    if (!leftKind && rightKind) {
        return {
            comparedExpression: expression.left,
            kind: rightKind,
            operator: expression.operator,
        };
    }

    return null;
};

/**
 * Extracts the shared target from strict disjunction checks against both
 * positive and negative infinity.
 *
 * @param context - Rule context used during infinity comparison extraction.
 * @param node - Logical expression candidate.
 *
 * @returns The compared expression from value === Infinity || value ===
 *   Number.NEGATIVE_INFINITY style patterns; otherwise null.
 */
const extractSafeInfinityDisjunctionTarget = (
    context: RuleContext,
    node: Readonly<TSESTree.LogicalExpression>
): null | TSESTree.Expression => {
    if (node.operator !== "||") {
        return null;
    }

    const left = extractInfinityComparison(context, node.left);
    const right = extractInfinityComparison(context, node.right);

    if (!left || !right) {
        return null;
    }

    if (left.operator !== "===" || right.operator !== "===") {
        return null;
    }

    if (left.kind === right.kind) {
        return null;
    }

    return areEquivalentExpressions(
        left.comparedExpression,
        right.comparedExpression
    )
        ? left.comparedExpression
        : null;
};

/** Rule module definition for `prefer-ts-extras-is-infinite`. */
const preferTsExtrasIsInfiniteRule: ReturnType<typeof createTypedRule> =
    createTypedRule({
        create(context) {
            const tsExtrasImports = collectDirectNamedValueImportsFromSource(
                context.sourceCode,
                TS_EXTRAS_MODULE_SOURCE
            );
            const typedServices = getTypedRuleServicesOrUndefined(context);
            const shouldSkipComparedExpression =
                createTypeScriptEslintNodeExpressionSkipChecker(
                    context,
                    typedServices
                );

            return {
                BinaryExpression(node) {
                    const parent = node.parent;
                    if (
                        parent?.type === "LogicalExpression" &&
                        extractSafeInfinityDisjunctionTarget(context, parent)
                    ) {
                        return;
                    }

                    if (node.operator !== "==" && node.operator !== "===") {
                        return;
                    }

                    if (
                        extractInfinityKind(context, node.left) === null &&
                        extractInfinityKind(context, node.right) === null
                    ) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: null,
                        messageId: "preferTsExtrasIsInfinite",
                        node,
                    });
                },
                LogicalExpression(node) {
                    const comparedExpression =
                        extractSafeInfinityDisjunctionTarget(context, node);

                    if (!comparedExpression) {
                        return;
                    }

                    if (shouldSkipComparedExpression(comparedExpression)) {
                        return;
                    }

                    reportWithOptionalFix({
                        context,
                        fix: createSafeValueArgumentFunctionCallFix({
                            argumentNode: comparedExpression,
                            context,
                            importedName: "isInfinite",
                            imports: tsExtrasImports,
                            sourceModuleName: TS_EXTRAS_MODULE_SOURCE,
                            targetNode: node,
                        }),
                        messageId: "preferTsExtrasIsInfinite",
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
                    "require ts-extras isInfinite over direct Infinity equality checks for consistent predicate helper usage.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                typefestConfigs: [
                    "typefest.configs.recommended",
                    "typefest.configs.strict",
                    "typefest.configs.all",
                    "typefest.configs.ts-extras/type-guards",
                ],
                url: "https://nick2bad4u.github.io/eslint-plugin-typefest/docs/rules/prefer-ts-extras-is-infinite",
            },
            fixable: "code",
            messages: {
                preferTsExtrasIsInfinite:
                    "Prefer `isInfinite` from `ts-extras` over direct Infinity equality checks.",
            },
            schema: [],
            type: "suggestion",
        },
        name: "prefer-ts-extras-is-infinite",
    });

/**
 * Default export for the `prefer-ts-extras-is-infinite` rule module.
 */
export default preferTsExtrasIsInfiniteRule;
