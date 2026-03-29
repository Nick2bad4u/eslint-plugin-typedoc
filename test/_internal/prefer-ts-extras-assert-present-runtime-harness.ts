/**
 * @packageDocumentation
 * Runtime/parser helper utilities for `prefer-ts-extras-assert-present` tests.
 */

import type { TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import fc from "fast-check";

import { getSourceTextForNode as getSourceTextForRangeNode } from "./source-text-for-node";

export type ReplaceTextOnlyFixer = Readonly<{
    replaceText: (node: unknown, text: string) => unknown;
}>;

export type ReportDescriptor = Readonly<{
    fix?: unknown;
    messageId?: string;
    suggest?: readonly Readonly<
        Readonly<{
            fix?: unknown;
            messageId?: string;
        }>
    >[];
}>;

type CanonicalGuardTemplateId =
    | "eqNull"
    | "logicalReversedStrict"
    | "logicalStrict"
    | "nullEq";

type NonCanonicalThrowTemplateId =
    | "spreadArgument"
    | "stringLiteral"
    | "suffixMismatch";

export const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

export const canonicalGuardTemplateIdArbitrary: fc.Arbitrary<CanonicalGuardTemplateId> =
    fc.constantFrom(
        "eqNull",
        "nullEq",
        "logicalStrict",
        "logicalReversedStrict"
    );

export const nonCanonicalThrowTemplateIdArbitrary: fc.Arbitrary<NonCanonicalThrowTemplateId> =
    fc.constantFrom("stringLiteral", "suffixMismatch", "spreadArgument");

export const variableNameArbitrary: fc.Arbitrary<string> = fc.constantFrom(
    "value",
    "input",
    "候補値"
);

const buildPresentGuardText = ({
    guardTemplateId,
    variableName,
}: Readonly<{
    guardTemplateId: CanonicalGuardTemplateId;
    variableName: string;
}>): string => {
    if (guardTemplateId === "eqNull") {
        return `${variableName} == null`;
    }

    if (guardTemplateId === "nullEq") {
        return `null == ${variableName}`;
    }

    if (guardTemplateId === "logicalStrict") {
        return `${variableName} === null || ${variableName} === undefined`;
    }

    return `undefined === ${variableName} || null === ${variableName}`;
};

export const buildCanonicalThrowText = (variableName: string): string =>
    `throw new TypeError(\`Expected a present value, got $` +
    `{${variableName}}\`);`;

export const buildNonCanonicalThrowText = ({
    throwTemplateId,
    variableName,
}: Readonly<{
    throwTemplateId: NonCanonicalThrowTemplateId;
    variableName: string;
}>): string => {
    if (throwTemplateId === "stringLiteral") {
        return 'throw new TypeError("Missing value");';
    }

    if (throwTemplateId === "suffixMismatch") {
        return (
            `throw new TypeError(\`Expected a present value, got $` +
            `{${variableName}}!\`);`
        );
    }

    return "throw new TypeError(...messageParts);";
};

export const buildAssertPresentGuardCode = ({
    guardTemplateId,
    includeUnicodeBanner,
    throwText,
    variableName,
    withSpreadMessageParts,
}: Readonly<{
    guardTemplateId: CanonicalGuardTemplateId;
    includeUnicodeBanner: boolean;
    throwText: string;
    variableName: string;
    withSpreadMessageParts: boolean;
}>): string => {
    const lines = [
        includeUnicodeBanner
            ? 'const banner = "emoji 🧪 café 你好 مرحبا 👩🏽‍💻";'
            : "",
        `function ensureValue(${variableName}: string | null | undefined): string {`,
        withSpreadMessageParts
            ? '    const messageParts = ["Missing value"];'
            : "",
        `    if (${buildPresentGuardText({ guardTemplateId, variableName })}) {`,
        `        ${throwText}`,
        "    }",
        "",
        `    return ${variableName};`,
        "}",
        includeUnicodeBanner ? "String(banner);" : "",
    ];

    return lines.filter((line) => line.length > 0).join("\n");
};

export const getSourceTextForNode = ({
    code,
    node,
}: Readonly<{
    code: string;
    node: unknown;
}>): string => getSourceTextForRangeNode({ code, node });

export const parseEnsureValueIfStatementFromCode = (
    code: string
): Readonly<{
    ast: ReturnType<typeof parser.parseForESLint>["ast"];
    ifNode: TSESTree.IfStatement;
}> => {
    const parsed = parser.parseForESLint(code, parserOptions);

    for (const statement of parsed.ast.body) {
        if (
            statement.type === AST_NODE_TYPES.FunctionDeclaration &&
            statement.id?.name === "ensureValue"
        ) {
            for (const bodyStatement of statement.body.body) {
                if (bodyStatement.type === AST_NODE_TYPES.IfStatement) {
                    return {
                        ast: parsed.ast,
                        ifNode: bodyStatement,
                    };
                }
            }
        }
    }

    throw new Error("Expected ensureValue function with an IfStatement guard");
};

export const assertIsFixFunction: (
    value: unknown
) => asserts value is (fixer: ReplaceTextOnlyFixer) => unknown = (value) => {
    if (typeof value !== "function") {
        throw new TypeError("Expected a fixer function");
    }
};
