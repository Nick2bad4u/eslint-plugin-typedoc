/**
 * @packageDocumentation
 * Property-based runtime harness helpers for `prefer-ts-extras-is-infinite` tests.
 */

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES, type TSESTree } from "@typescript-eslint/utils";
import fc from "fast-check";

export type ComparedExpressionTemplateId =
    | "callExpression"
    | "computedMemberExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier"
    | "typeAssertion";

export type ComparisonOrientation = "expressionOnLeft" | "expressionOnRight";

export interface GeneratedFixableDisjunctionCase {
    readonly includeUnicodeLine: boolean;
    readonly negativeOrientation: ComparisonOrientation;
    readonly positiveInfinityReferenceKind: PositiveInfinityReferenceKind;
    readonly positiveOrientation: ComparisonOrientation;
    readonly reverseOrder: boolean;
    readonly templateId: ComparedExpressionTemplateId;
}

export interface GeneratedMismatchedDisjunctionCase {
    readonly firstOrientation: ComparisonOrientation;
    readonly includeUnicodeLine: boolean;
    readonly positiveInfinityReferenceKind: PositiveInfinityReferenceKind;
    readonly reverseOrder: boolean;
    readonly secondOrientation: ComparisonOrientation;
}

export type PositiveInfinityReferenceKind =
    | "globalInfinity"
    | "numberPositiveInfinity";

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

/* eslint-disable total-functions/no-hidden-type-assertions -- fast-check tuple composition depends on inferred literal generics to retain case-shape precision. */
export const generatedFixableDisjunctionCaseArbitrary: fc.Arbitrary<GeneratedFixableDisjunctionCase> =
    fc
        .tuple(
            fc.constantFrom(
                "callExpression",
                "computedMemberExpression",
                "identifier",
                "memberExpression",
                "parenthesizedIdentifier",
                "typeAssertion"
            ),
            fc.constantFrom("globalInfinity", "numberPositiveInfinity"),
            fc.constantFrom("expressionOnLeft", "expressionOnRight"),
            fc.constantFrom("expressionOnLeft", "expressionOnRight"),
            fc.boolean(),
            fc.boolean()
        )
        .map(
            ([
                templateId,
                positiveInfinityReferenceKind,
                positiveOrientation,
                negativeOrientation,
                reverseOrder,
                includeUnicodeLine,
            ]) => ({
                includeUnicodeLine,
                negativeOrientation,
                positiveInfinityReferenceKind,
                positiveOrientation,
                reverseOrder,
                templateId,
            })
        );

export const generatedMismatchedDisjunctionCaseArbitrary: fc.Arbitrary<GeneratedMismatchedDisjunctionCase> =
    fc
        .tuple(
            fc.constantFrom("globalInfinity", "numberPositiveInfinity"),
            fc.constantFrom("expressionOnLeft", "expressionOnRight"),
            fc.constantFrom("expressionOnLeft", "expressionOnRight"),
            fc.boolean(),
            fc.boolean()
        )
        .map(
            ([
                positiveInfinityReferenceKind,
                firstOrientation,
                secondOrientation,
                reverseOrder,
                includeUnicodeLine,
            ]) => ({
                firstOrientation,
                includeUnicodeLine,
                positiveInfinityReferenceKind,
                reverseOrder,
                secondOrientation,
            })
        );
/* eslint-enable total-functions/no-hidden-type-assertions -- restore default lint behavior after tuple-based arbitrary construction. */

const comparedExpressionTemplates: Readonly<
    Record<
        ComparedExpressionTemplateId,
        Readonly<{
            declarations: readonly string[];
            expressionText: string;
        }>
    >
> = {
    callExpression: {
        declarations: ["declare function readMetric(): number;"],
        expressionText: "readMetric()",
    },
    computedMemberExpression: {
        declarations: [
            "declare const metrics: readonly number[];",
            "declare const metricIndex: number;",
        ],
        expressionText: "metrics[metricIndex]",
    },
    identifier: {
        declarations: ["declare const metric: number;"],
        expressionText: "metric",
    },
    memberExpression: {
        declarations: [
            "declare const metricHolder: { readonly current: number };",
        ],
        expressionText: "metricHolder.current",
    },
    parenthesizedIdentifier: {
        declarations: ["declare const metric: number;"],
        expressionText: "(metric)",
    },
    typeAssertion: {
        declarations: ["declare const metricValue: unknown;"],
        expressionText: "(metricValue as number)",
    },
};

export const buildComparedExpressionTemplate = (
    templateId: ComparedExpressionTemplateId
): Readonly<{
    declarations: readonly string[];
    expressionText: string;
}> => comparedExpressionTemplates[templateId];

export const getPositiveInfinityReferenceText = (
    positiveInfinityReferenceKind: PositiveInfinityReferenceKind
): string =>
    positiveInfinityReferenceKind === "globalInfinity"
        ? "Infinity"
        : "Number.POSITIVE_INFINITY";

export const buildStrictInfinityComparisonText = ({
    comparedExpressionText,
    infinityReferenceText,
    orientation,
}: Readonly<{
    comparedExpressionText: string;
    infinityReferenceText: string;
    orientation: ComparisonOrientation;
}>): string =>
    orientation === "expressionOnLeft"
        ? `${comparedExpressionText} === ${infinityReferenceText}`
        : `${infinityReferenceText} === ${comparedExpressionText}`;

const isInfinityReferenceNode = (
    node: Readonly<TSESTree.Expression>
): boolean => {
    if (node.type === AST_NODE_TYPES.Identifier && node.name === "Infinity") {
        return true;
    }

    return (
        node.type === AST_NODE_TYPES.MemberExpression &&
        !node.computed &&
        node.object.type === AST_NODE_TYPES.Identifier &&
        node.object.name === "Number" &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        (node.property.name === "NEGATIVE_INFINITY" ||
            node.property.name === "POSITIVE_INFINITY")
    );
};

const isBinaryComparableExpression = (
    node: Readonly<TSESTree.BinaryExpression["left"]>
): node is TSESTree.Expression =>
    node.type !== AST_NODE_TYPES.PrivateIdentifier;

const getLogicalExpressionInitializerFromStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): null | TSESTree.LogicalExpression => {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
    }

    for (const declaration of statement.declarations) {
        if (declaration.init?.type === AST_NODE_TYPES.LogicalExpression) {
            return declaration.init;
        }
    }

    return null;
};

export const parseLogicalDisjunctionFromCode = (
    sourceText: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    comparedExpressionText: string;
    logicalExpression: TSESTree.LogicalExpression;
    logicalRange: readonly [number, number];
}> => {
    const parsedResult = parser.parseForESLint(sourceText, parserOptions);
    let logicalExpression: null | TSESTree.LogicalExpression = null;

    for (const statement of parsedResult.ast.body) {
        logicalExpression =
            getLogicalExpressionInitializerFromStatement(statement);

        if (logicalExpression !== null) {
            break;
        }
    }

    if (!logicalExpression) {
        throw new Error(
            "Expected generated code to include a logical disjunction initializer"
        );
    }

    if (
        logicalExpression.operator !== "||" ||
        logicalExpression.left.type !== AST_NODE_TYPES.BinaryExpression
    ) {
        throw new Error(
            "Expected generated logical expression to be a disjunction with binary left term"
        );
    }

    const leftBinary = logicalExpression.left;

    if (
        !isBinaryComparableExpression(leftBinary.left) ||
        !isBinaryComparableExpression(leftBinary.right)
    ) {
        throw new Error(
            "Expected generated binary comparisons to use expression operands"
        );
    }

    const comparedExpression = isInfinityReferenceNode(leftBinary.left)
        ? leftBinary.right
        : leftBinary.left;
    const comparedExpressionRange = comparedExpression.range;

    return {
        ast: parsedResult.ast,
        comparedExpressionText: sourceText
            .slice(comparedExpressionRange[0], comparedExpressionRange[1])
            .trim(),
        logicalExpression,
        logicalRange: logicalExpression.range,
    };
};
