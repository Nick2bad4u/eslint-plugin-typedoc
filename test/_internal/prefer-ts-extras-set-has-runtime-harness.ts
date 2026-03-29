/**
 * @packageDocumentation
 * Runtime fast-check harness helpers for `prefer-ts-extras-set-has` tests.
 */

import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";

import { getSourceTextForNode as getSourceTextForRangeNode } from "./source-text-for-node";

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type ArgumentTemplateId =
    | "empty"
    | "identifier"
    | "literal"
    | "multiple"
    | "spread";

type ReceiverTemplateId =
    | "callExpression"
    | "identifier"
    | "memberExpression"
    | "parenthesizedIdentifier";

export const argumentTemplateIdArbitrary: fc.Arbitrary<ArgumentTemplateId> =
    fc.constantFrom("empty", "identifier", "literal", "multiple", "spread");

export const receiverTemplateIdArbitrary: fc.Arbitrary<ReceiverTemplateId> =
    fc.constantFrom(
        "identifier",
        "memberExpression",
        "callExpression",
        "parenthesizedIdentifier"
    );

export const buildArgumentTemplate = (
    templateId: ArgumentTemplateId
): Readonly<{
    argumentsText: string;
    declarations: readonly string[];
}> => {
    if (templateId === "identifier") {
        return {
            argumentsText: "candidate",
            declarations: ["declare const candidate: number;"],
        };
    }

    if (templateId === "literal") {
        return {
            argumentsText: "2",
            declarations: [],
        };
    }

    if (templateId === "multiple") {
        return {
            argumentsText: "candidate, 2",
            declarations: ["declare const candidate: number;"],
        };
    }

    if (templateId === "spread") {
        return {
            argumentsText: "...candidates",
            declarations: ["declare const candidates: number[];"],
        };
    }

    return {
        argumentsText: "",
        declarations: [],
    };
};

export const buildReceiverTemplate = (
    templateId: ReceiverTemplateId
): Readonly<{
    declarations: readonly string[];
    receiverText: string;
}> => {
    if (templateId === "identifier") {
        return {
            declarations: ["declare const values: Set<number>;"],
            receiverText: "values",
        };
    }

    if (templateId === "memberExpression") {
        return {
            declarations: [
                "declare const registry: { readonly current: Set<number> };",
            ],
            receiverText: "registry.current",
        };
    }

    if (templateId === "callExpression") {
        return {
            declarations: ["declare function readSet(): Set<number>;"],
            receiverText: "readSet()",
        };
    }

    return {
        declarations: ["declare const values: Set<number>;"],
        receiverText: "(values)",
    };
};

const getHasValueCallExpressionFromDeclarator = (
    declaration: Readonly<TSESTree.VariableDeclarator>
): null | TSESTree.CallExpression => {
    if (
        declaration.id.type === AST_NODE_TYPES.Identifier &&
        declaration.id.name === "hasValue" &&
        declaration.init?.type === AST_NODE_TYPES.CallExpression
    ) {
        return declaration.init;
    }

    return null;
};

const getHasValueCallExpressionFromStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): null | TSESTree.CallExpression => {
    if (statement.type !== AST_NODE_TYPES.VariableDeclaration) {
        return null;
    }

    for (const declaration of statement.declarations) {
        const callExpression =
            getHasValueCallExpressionFromDeclarator(declaration);

        if (callExpression) {
            return callExpression;
        }
    }

    return null;
};

export const parseCallExpressionFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    callExpression: TSESTree.CallExpression;
    callExpressionRange: readonly [number, number];
    receiverText: string;
}> => {
    const parsedResult = parser.parseForESLint(code, parserOptions);

    for (const statement of parsedResult.ast.body) {
        const callExpression =
            getHasValueCallExpressionFromStatement(statement);

        if (callExpression) {
            if (
                callExpression.callee.type !== AST_NODE_TYPES.MemberExpression
            ) {
                throw new Error(
                    "Expected generated hasValue initializer to use a member-expression callee"
                );
            }

            return {
                ast: parsedResult.ast,
                callExpression,
                callExpressionRange: callExpression.range,
                receiverText: code.slice(
                    callExpression.callee.object.range[0],
                    callExpression.callee.object.range[1]
                ),
            };
        }
    }

    throw new Error(
        "Expected generated code to include hasValue call expression"
    );
};

export const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => getSourceTextForRangeNode({ code, node });

type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

export const assertIsReplaceFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected report descriptor fix to be a function");
    }
};
