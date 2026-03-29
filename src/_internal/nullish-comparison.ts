/**
 * @packageDocumentation
 * Shared helpers for parsing and flattening nullish comparison expressions.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { arrayIncludes, isDefined } from "ts-extras";

/**
 * Normalized representation of one binary comparison against null/undefined.
 */
export type NullishComparison = Readonly<{
    comparedExpression: TSESTree.Expression;
    kind: NullishComparisonKind;
    operator: NullishComparisonOperator;
}>;

/** Nullish literal kinds supported by comparison extraction. */
export type NullishComparisonKind = "null" | "undefined";

/** Operators supported by nullish comparison extraction. */
export type NullishComparisonOperator = "!=" | "!==" | "==" | "===";

/** Default accepted operators for nullish comparison parsing. */
const defaultNullishComparisonOperators = [
    "!=",
    "!==",
    "==",
    "===",
] as const satisfies readonly NullishComparisonOperator[];

/**
 * Flatten a logical-expression tree for one specific operator.
 *
 * @param options - Expression and logical operator to flatten.
 *
 * @returns Left-to-right list of terms participating in that operator chain.
 */
export const flattenLogicalTerms = ({
    expression,
    operator,
}: Readonly<{
    expression: Readonly<TSESTree.Expression>;
    operator: "&&" | "||";
}>): readonly TSESTree.Expression[] => {
    const flattenedTerms: TSESTree.Expression[] = [];
    const pendingTerms: TSESTree.Expression[] = [expression];

    while (pendingTerms.length > 0) {
        const currentTerm = pendingTerms.pop();

        if (!currentTerm) {
            continue;
        }

        if (
            currentTerm.type === "LogicalExpression" &&
            currentTerm.operator === operator
        ) {
            pendingTerms.push(currentTerm.right, currentTerm.left);
            continue;
        }

        flattenedTerms.push(currentTerm);
    }

    return flattenedTerms;
};

const STRICT_NULLISH_TERM_COUNT = 2 as const;

/**
 * Narrow a list of expressions to an exact two-term tuple.
 */
export const isExpressionPair = (
    terms: readonly Readonly<TSESTree.Expression>[]
): terms is readonly [TSESTree.Expression, TSESTree.Expression] =>
    terms.length === STRICT_NULLISH_TERM_COUNT;

/**
 * Check whether an expression is the literal `null`.
 */
const isNullLiteral = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Literal & { value: null } =>
    expression.type === "Literal" && expression.value === null;

/**
 * Check whether an expression is the string literal `"undefined"`.
 */
const isUndefinedStringLiteral = (
    expression: Readonly<TSESTree.Expression>
): expression is TSESTree.Literal & { value: "undefined" } =>
    expression.type === "Literal" && expression.value === "undefined";

/**
 * Check whether an expression is `typeof <identifierName>`.
 */
const isTypeofIdentifierExpression = (
    expression: Readonly<TSESTree.Expression>,
    identifierName: string
): expression is TSESTree.UnaryExpression & { argument: TSESTree.Identifier } =>
    expression.type === "UnaryExpression" &&
    expression.operator === "typeof" &&
    expression.argument.type === "Identifier" &&
    expression.argument.name === identifierName;

/**
 * Narrow a binary-operator string to supported nullish comparison operators.
 */
const isAllowedNullishComparisonOperator = (
    operator: TSESTree.BinaryExpression["operator"]
): operator is NullishComparisonOperator =>
    operator === "!=" ||
    operator === "!==" ||
    operator === "==" ||
    operator === "===";

/**
 * Narrow an ESTree expression-like union to regular expressions (excluding
 * private identifiers).
 */
const isExpressionNode = (
    expression: Readonly<TSESTree.Expression | TSESTree.PrivateIdentifier>
): expression is TSESTree.Expression => expression.type !== "PrivateIdentifier";

/**
 * Extract a normalized nullish comparison from an expression.
 */
export const getNullishComparison = ({
    allowedOperators = defaultNullishComparisonOperators,
    allowTypeofComparedIdentifierForUndefined = false,
    comparedIdentifierName,
    expression,
    isGlobalUndefinedIdentifier,
}: Readonly<{
    allowedOperators?: readonly NullishComparisonOperator[];
    allowTypeofComparedIdentifierForUndefined?: boolean;
    comparedIdentifierName?: string;
    expression: Readonly<TSESTree.Expression>;
    isGlobalUndefinedIdentifier: (
        expression: Readonly<TSESTree.Expression>
    ) => boolean;
}>): null | NullishComparison => {
    if (expression.type !== "BinaryExpression") {
        return null;
    }

    if (!isAllowedNullishComparisonOperator(expression.operator)) {
        return null;
    }

    if (
        allowedOperators !== defaultNullishComparisonOperators &&
        !arrayIncludes(allowedOperators, expression.operator)
    ) {
        return null;
    }

    const matchesComparedExpression = (
        candidateExpression: Readonly<TSESTree.Expression>
    ): boolean =>
        !isDefined(comparedIdentifierName) ||
        (candidateExpression.type === "Identifier" &&
            candidateExpression.name === comparedIdentifierName);

    if (
        isNullLiteral(expression.right) &&
        isExpressionNode(expression.left) &&
        matchesComparedExpression(expression.left)
    ) {
        return {
            comparedExpression: expression.left,
            kind: "null",
            operator: expression.operator,
        };
    }

    if (
        isExpressionNode(expression.left) &&
        isNullLiteral(expression.left) &&
        isExpressionNode(expression.right) &&
        matchesComparedExpression(expression.right)
    ) {
        return {
            comparedExpression: expression.right,
            kind: "null",
            operator: expression.operator,
        };
    }

    if (
        expression.right.type === "Identifier" &&
        isGlobalUndefinedIdentifier(expression.right) &&
        isExpressionNode(expression.left) &&
        matchesComparedExpression(expression.left)
    ) {
        return {
            comparedExpression: expression.left,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (
        expression.left.type === "Identifier" &&
        isGlobalUndefinedIdentifier(expression.left) &&
        isExpressionNode(expression.right) &&
        matchesComparedExpression(expression.right)
    ) {
        return {
            comparedExpression: expression.right,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (
        !isDefined(comparedIdentifierName) ||
        !allowTypeofComparedIdentifierForUndefined
    ) {
        return null;
    }

    if (
        isExpressionNode(expression.left) &&
        isExpressionNode(expression.right) &&
        isTypeofIdentifierExpression(expression.left, comparedIdentifierName) &&
        isUndefinedStringLiteral(expression.right)
    ) {
        return {
            comparedExpression: expression.left.argument,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    if (
        isExpressionNode(expression.right) &&
        isExpressionNode(expression.left) &&
        isTypeofIdentifierExpression(
            expression.right,
            comparedIdentifierName
        ) &&
        isUndefinedStringLiteral(expression.left)
    ) {
        return {
            comparedExpression: expression.right.argument,
            kind: "undefined",
            operator: expression.operator,
        };
    }

    return null;
};
