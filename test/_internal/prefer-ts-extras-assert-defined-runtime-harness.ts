/**
 * @packageDocumentation
 * Runtime/parser helper utilities for `prefer-ts-extras-assert-defined` tests.
 */

import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";

import { getSourceTextForNode as getSourceTextForRangeNode } from "./source-text-for-node";

type GuardComparisonOrientation =
    | "guardExpressionOnLeft"
    | "guardExpressionOnRight";

type GuardExpressionTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

type NonCanonicalThrowTemplateId =
    | "errorConstructor"
    | "extraArgument"
    | "wrongMessage";

type ParsedAst = ReturnType<typeof parser.parseForESLint>["ast"];

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

export const guardComparisonOrientationArbitrary: fc.Arbitrary<GuardComparisonOrientation> =
    fc.constantFrom("guardExpressionOnLeft", "guardExpressionOnRight");

export const guardExpressionTemplateIdArbitrary: fc.Arbitrary<GuardExpressionTemplateId> =
    fc.constantFrom(
        "identifier",
        "memberExpression",
        "callExpression",
        "parenthesizedIdentifier"
    );

export const nonCanonicalThrowTemplateIdArbitrary: fc.Arbitrary<NonCanonicalThrowTemplateId> =
    fc.constantFrom("wrongMessage", "errorConstructor", "extraArgument");

export const buildGuardExpressionTemplate = (
    templateId: GuardExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ["declare const maybeValue: string | undefined;"],
            expressionText: "maybeValue",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const holder: { readonly current: string | undefined };",
            ],
            expressionText: "holder.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: [
                "declare function readMaybeValue(): string | undefined;",
            ],
            expressionText: "readMaybeValue()",
        };
    }

    return {
        declarations: ["declare const maybeValue: string | undefined;"],
        expressionText: "(maybeValue)",
    };
};

export const buildNonCanonicalThrowText = (
    templateId: NonCanonicalThrowTemplateId
): string => {
    if (templateId === "errorConstructor") {
        return "throw new Error('Expected a defined value, got `undefined`');";
    }

    if (templateId === "extraArgument") {
        return "throw new TypeError('Expected a defined value, got `undefined`', maybeValue);";
    }

    return "throw new TypeError('Missing value');";
};

export const buildUndefinedComparisonText = ({
    expressionText,
    operator,
    orientation,
}: Readonly<{
    expressionText: string;
    operator: "==" | "===";
    orientation: GuardComparisonOrientation;
}>): string =>
    orientation === "guardExpressionOnLeft"
        ? `${expressionText} ${operator} undefined`
        : `undefined ${operator} ${expressionText}`;

const selectFirstFunctionDeclaration = (
    astBody: readonly Readonly<TSESTree.ProgramStatement>[]
): TSESTree.FunctionDeclarationWithName => {
    for (const statement of astBody) {
        if (statement.type === AST_NODE_TYPES.FunctionDeclaration) {
            return statement;
        }
    }

    throw new Error("Expected generated code to include a function");
};

const selectFirstIfStatement = (
    functionDeclaration: Readonly<TSESTree.FunctionDeclarationWithName>
): TSESTree.IfStatement => {
    for (const statement of functionDeclaration.body.body) {
        if (statement.type === AST_NODE_TYPES.IfStatement) {
            return statement;
        }
    }

    throw new Error("Expected generated code to include an IfStatement");
};

const selectGuardExpressionFromBinaryUndefinedComparison = (
    binaryExpression: Readonly<TSESTree.BinaryExpression>
): TSESTree.Expression => {
    const candidateGuardExpression =
        binaryExpression.left.type === AST_NODE_TYPES.Identifier &&
        binaryExpression.left.name === "undefined"
            ? binaryExpression.right
            : binaryExpression.left;

    if (candidateGuardExpression.type === AST_NODE_TYPES.PrivateIdentifier) {
        throw new Error(
            "Expected generated comparison guard expression to be an expression"
        );
    }

    return candidateGuardExpression;
};

export const parseIfStatementFromCode = (
    sourceText: string
): Readonly<{
    ast: ParsedAst;
    guardExpressionText: string;
    ifStatement: TSESTree.IfStatement;
    ifStatementRange: readonly [number, number];
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);
    const functionDeclaration = selectFirstFunctionDeclaration(
        parsedResult.ast.body
    );
    const ifStatement = selectFirstIfStatement(functionDeclaration);
    const ifTestExpression = ifStatement.test;

    if (ifTestExpression.type !== AST_NODE_TYPES.BinaryExpression) {
        throw new Error(
            "Expected generated if statement to use a binary undefined comparison"
        );
    }

    const guardExpression =
        selectGuardExpressionFromBinaryUndefinedComparison(ifTestExpression);

    return {
        ast: parsedResult.ast,
        guardExpressionText: sourceText.slice(
            guardExpression.range[0],
            guardExpression.range[1]
        ),
        ifStatement,
        ifStatementRange: ifStatement.range,
    };
};

export const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => getSourceTextForRangeNode({ code, node });
