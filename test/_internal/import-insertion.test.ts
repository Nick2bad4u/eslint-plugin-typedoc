import parser from "@typescript-eslint/parser";
import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import { createImportInsertionFix } from "../../src/_internal/import-insertion";
import { fastCheckRunConfig } from "./fast-check";

type InsertionEdit = Readonly<{
    end: number;
    start: number;
    text: string;
}>;

const isInsertionEdit = (value: unknown): value is InsertionEdit =>
    typeof value === "object" &&
    value !== null &&
    "end" in value &&
    typeof (value as { end: unknown }).end === "number" &&
    "start" in value &&
    typeof (value as { start: unknown }).start === "number" &&
    "text" in value &&
    typeof (value as { text: unknown }).text === "string";

const parserOptions = {
    ecmaVersion: "latest",
    loc: true,
    range: true,
    sourceType: "module",
} as const;

type InsertionScenario = Readonly<{
    expectedMode:
        | "after-directive"
        | "after-import"
        | "at-program-end"
        | "before-first-statement";
    sourceText: string;
}>;

const insertionScenarios: readonly InsertionScenario[] = [
    {
        expectedMode: "after-import",
        sourceText: [
            'import { existingA } from "existing-a";',
            'import type { ExistingB } from "existing-b";',
            "const value = 1;",
        ].join("\n"),
    },
    {
        expectedMode: "after-directive",
        sourceText: [
            '"use client";',
            '"use strict";',
            "const value = 1;",
        ].join("\n"),
    },
    {
        expectedMode: "after-directive",
        sourceText: ['"use server";'].join("\n"),
    },
    {
        expectedMode: "before-first-statement",
        sourceText: ["const value = 1;", "void value;"].join("\n"),
    },
    {
        expectedMode: "at-program-end",
        sourceText: "",
    },
];

const insertionScenarioArbitrary = fc.constantFrom(...insertionScenarios);

const importInsertionTextArbitrary = fc.constantFrom(
    'import type { InsertedAlias } from "type-fest";',
    '  import type { InsertedAlias } from "type-fest";  ',
    '\nimport type { InsertedAlias } from "type-fest";\n',
    'import "ts-extras";',
    '  import "ts-extras";  '
);

const applyInsertionEdit = ({
    edit,
    sourceText,
}: Readonly<{
    edit: Readonly<InsertionEdit>;
    sourceText: string;
}>): string =>
    `${sourceText.slice(0, edit.start)}${edit.text}${sourceText.slice(edit.end)}`;

const getNodeRange = (
    node: Readonly<TSESTree.Node>
): null | readonly [number, number] => {
    if (!Array.isArray(node.range)) {
        return null;
    }

    const [start, end] = node.range;

    if (typeof start !== "number" || typeof end !== "number") {
        return null;
    }

    return [start, end];
};

const getLastImportDeclaration = (
    program: Readonly<TSESTree.Program>
): null | Readonly<TSESTree.ImportDeclaration> => {
    let lastImportDeclaration: null | Readonly<TSESTree.ImportDeclaration> =
        null;

    for (const statement of program.body) {
        if (statement.type === AST_NODE_TYPES.ImportDeclaration) {
            lastImportDeclaration = statement;
        }
    }

    return lastImportDeclaration;
};

const getLastDirectiveStatement = (
    program: Readonly<TSESTree.Program>
): null | Readonly<TSESTree.ExpressionStatement> => {
    let lastDirectiveStatement: null | Readonly<TSESTree.ExpressionStatement> =
        null;

    for (const statement of program.body) {
        if (
            statement.type === AST_NODE_TYPES.ExpressionStatement &&
            typeof statement.directive === "string"
        ) {
            lastDirectiveStatement = statement;
        }
    }

    return lastDirectiveStatement;
};

const assertEditAfterImportStart = ({
    edit,
    program,
}: Readonly<{
    edit: Readonly<InsertionEdit>;
    program: Readonly<TSESTree.Program>;
}>): void => {
    const lastImportDeclaration = getLastImportDeclaration(program);

    expect(lastImportDeclaration).toBeTruthy();

    if (lastImportDeclaration !== null) {
        const lastImportRange = getNodeRange(lastImportDeclaration);

        expect(lastImportRange).toBeTruthy();

        if (lastImportRange !== null) {
            expect(edit.start).toBe(lastImportRange[1]);
        }
    }
};

const assertEditAfterDirectiveStart = ({
    edit,
    program,
}: Readonly<{
    edit: Readonly<InsertionEdit>;
    program: Readonly<TSESTree.Program>;
}>): void => {
    const lastDirectiveStatement = getLastDirectiveStatement(program);

    expect(lastDirectiveStatement).toBeTruthy();

    if (lastDirectiveStatement !== null) {
        const lastDirectiveRange = getNodeRange(lastDirectiveStatement);

        expect(lastDirectiveRange).toBeTruthy();

        if (lastDirectiveRange !== null) {
            expect(edit.start).toBe(lastDirectiveRange[1]);
        }
    }
};

const assertEditBeforeFirstStatementStart = ({
    edit,
    program,
}: Readonly<{
    edit: Readonly<InsertionEdit>;
    program: Readonly<TSESTree.Program>;
}>): void => {
    const firstStatement = program.body[0];

    expect(firstStatement).toBeTruthy();

    if (firstStatement !== undefined) {
        const firstStatementRange = getNodeRange(firstStatement);

        expect(firstStatementRange).toBeTruthy();

        if (firstStatementRange !== null) {
            expect(edit.start).toBe(firstStatementRange[0]);
        }
    }
};

const assertEditAtProgramEndStart = ({
    edit,
    program,
}: Readonly<{
    edit: Readonly<InsertionEdit>;
    program: Readonly<TSESTree.Program>;
}>): void => {
    const programRange = getNodeRange(program);

    expect(programRange).toBeTruthy();

    if (programRange !== null) {
        expect(edit.start).toBe(programRange[1]);
    }
};

const assertEditStartMatchesScenario = ({
    edit,
    program,
    scenario,
}: Readonly<{
    edit: Readonly<InsertionEdit>;
    program: Readonly<TSESTree.Program>;
    scenario: Readonly<InsertionScenario>;
}>): void => {
    switch (scenario.expectedMode) {
        case "after-directive": {
            assertEditAfterDirectiveStart({
                edit,
                program,
            });
            break;
        }

        case "after-import": {
            assertEditAfterImportStart({
                edit,
                program,
            });
            break;
        }

        case "at-program-end": {
            assertEditAtProgramEndStart({
                edit,
                program,
            });
            break;
        }

        case "before-first-statement": {
            assertEditBeforeFirstStatementStart({
                edit,
                program,
            });
            break;
        }
    }
};

/** Build a minimal ESTree Program node with a caller-defined statement list. */
const createProgram = (
    body: readonly Readonly<TSESTree.ProgramStatement>[]
): TSESTree.Program =>
    ({
        body,
        comments: [],
        range: [0, 100],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

describe(createImportInsertionFix, () => {
    it("returns null for blank import text", () => {
        const program = createProgram([]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfter = vi.fn();
        const insertBeforeRange = vi.fn();

        const fixer = {
            insertTextAfter: insertAfter,
            insertTextBeforeRange: insertBeforeRange,
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: "   \n\t ",
            referenceNode,
        });

        expect(fix).toBeNull();
        expect(insertAfter).not.toHaveBeenCalled();
        expect(insertBeforeRange).not.toHaveBeenCalled();
    });

    it("trims import text before insertion", () => {
        const importDeclaration = {
            range: [0, 20],
            source: {
                value: "existing",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([importDeclaration]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: { target: unknown; text: string }[] = [];

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange: () => "",
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: '  import { arrayAt } from "ts-extras";  ',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            {
                target: importDeclaration,
                text: '\nimport { arrayAt } from "ts-extras";',
            },
        ]);
    });

    it("inserts bare-module imports after the last non-relative import", () => {
        const externalImport = {
            range: [0, 44],
            source: {
                value: "type-fest",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const relativeImport = {
            range: [46, 96],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([externalImport, relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: { target: unknown; text: string }[] = [];

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { isDefined } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            {
                target: externalImport,
                text: '\nimport { isDefined } from "ts-extras";',
            },
        ]);
    });

    it("inserts bare-module imports before relative imports when none are non-relative", () => {
        const relativeImport = {
            range: [20, 60],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { isDefined } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [20, 20],
                text: 'import { isDefined } from "ts-extras";\n',
            },
        ]);
    });

    it("inserts side-effect bare-module imports before relative imports when none are non-relative", () => {
        const relativeImport = {
            range: [20, 60],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [20, 20],
                text: 'import "ts-extras";\n',
            },
        ]);
    });

    it("accepts empty-string side-effect module specifiers when positioning before relative imports", () => {
        const relativeImport = {
            range: [20, 60],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import "";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [20, 20],
                text: 'import "";\n',
            },
        ]);
    });

    it("accepts empty-string from-clause module specifiers when positioning before relative imports", () => {
        const relativeImport = {
            range: [20, 60],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { isDefined } from "";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [20, 20],
                text: 'import { isDefined } from "";\n',
            },
        ]);
    });

    it("uses moduleSpecifierHint for placement when import text parsing cannot infer a specifier", () => {
        const externalImport = {
            range: [0, 44],
            source: {
                value: "type-fest",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const relativeImport = {
            range: [46, 96],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([externalImport, relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: { target: unknown; text: string }[] = [];

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText:
                'import { isDefined } from "ts-extras" with { type: "js" };',
            moduleSpecifierHint: "ts-extras",
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            {
                target: externalImport,
                text: '\nimport { isDefined } from "ts-extras" with { type: "js" };',
            },
        ]);
    });

    it("inserts named imports whose local bindings include `from` before relative imports", () => {
        const relativeImport = {
            range: [20, 60],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText:
                'import { fromClauseValue as localFromClauseValue } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [20, 20],
                text: 'import { fromClauseValue as localFromClauseValue } from "ts-extras";\n',
            },
        ]);
    });

    it("treats escaped quote characters inside from-clause module specifiers as valid module text", () => {
        const relativeImport = {
            range: [20, 60],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: String.raw`import { parse } from "pkg\"with-quote";`,
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [20, 20],
                text: 'import { parse } from "pkg\\"with-quote";\n',
            },
        ]);
    });

    it("inserts side-effect bare-module imports after the last non-relative import", () => {
        const externalImport = {
            range: [0, 44],
            source: {
                value: "type-fest",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const relativeImport = {
            range: [46, 96],
            source: {
                value: "./local-utils.js",
            },
            specifiers: [],
            type: "ImportDeclaration",
        } as unknown as TSESTree.ImportDeclaration;
        const program = createProgram([externalImport, relativeImport]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: { target: unknown; text: string }[] = [];

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push({ target, text });

                return text;
            },
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            {
                target: externalImport,
                text: '\nimport "ts-extras";',
            },
        ]);
    });

    it("does not treat non-directive string literals as directive prologue", () => {
        const nonDirectiveStringStatement = {
            expression: {
                type: "Literal",
                value: "just-a-string-expression",
            },
            range: [10, 40],
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const program = createProgram([nonDirectiveStringStatement]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfter = vi.fn();
        const insertBeforeRangeCalls: (readonly [
            readonly [number, number],
            string,
        ])[] = [];

        const fixer = {
            insertTextAfter: insertAfter,
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push([range, text]);

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfter).not.toHaveBeenCalled();
        expect(insertBeforeRangeCalls).toStrictEqual([
            [[10, 10], 'import { arrayAt } from "ts-extras";\n'],
        ]);
    });

    it("inserts after real directive prologue statements", () => {
        const directiveStatement = {
            directive: "use client",
            expression: {
                type: "Literal",
                value: "use client",
            },
            range: [0, 12],
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const firstStatement = {
            range: [20, 30],
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const program = createProgram([directiveStatement, firstStatement]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertAfterCalls: (readonly [unknown, string])[] = [];
        const insertBeforeRange = vi.fn();

        const fixer = {
            insertTextAfter: (target: unknown, text: string) => {
                insertAfterCalls.push([target, text]);

                return text;
            },
            insertTextBeforeRange: insertBeforeRange,
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertAfterCalls).toStrictEqual([
            [directiveStatement, '\nimport { arrayAt } from "ts-extras";'],
        ]);
        expect(insertBeforeRange).not.toHaveBeenCalled();
    });

    it("returns null when reference node is not attached to a Program", () => {
        const detachedReferenceNode = {
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode: detachedReferenceNode,
        });

        expect(fix).toBeNull();
    });

    it("does not read plugin settings directly when creating insertion edits", () => {
        const program = createProgram([]);
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBe('\nimport { arrayAt } from "ts-extras";\n');
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [100, 100],
                text: '\nimport { arrayAt } from "ts-extras";\n',
            },
        ]);
    });

    it("falls back to inserting at file end when first statement range is malformed", () => {
        const firstStatementWithoutRange = {
            type: "ExpressionStatement",
        } as unknown as TSESTree.ProgramStatement;
        const program = {
            ...createProgram([firstStatementWithoutRange]),
            range: [0, 90],
        } as TSESTree.Program;
        const referenceNode = {
            parent: program,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [90, 90],
                text: '\nimport { arrayAt } from "ts-extras";\n',
            },
        ]);
    });

    it("inserts without a leading newline when inserting into an empty file", () => {
        const emptyProgramAtZero = {
            ...createProgram([]),
            range: [0, 0],
        } as TSESTree.Program;
        const referenceNode = {
            parent: emptyProgramAtZero,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const insertBeforeRangeCalls: {
            range: readonly [number, number];
            text: string;
        }[] = [];

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: (
                range: readonly [number, number],
                text: string
            ) => {
                insertBeforeRangeCalls.push({ range, text });

                return text;
            },
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeTypeOf("string");
        expect(insertBeforeRangeCalls).toStrictEqual([
            {
                range: [0, 0],
                text: 'import { arrayAt } from "ts-extras";\n',
            },
        ]);
    });

    it("returns null when program range end cannot be derived", () => {
        const programWithInvalidRange = {
            ...createProgram([]),
            range: [0, -1],
        } as unknown as TSESTree.Program;
        const referenceNode = {
            parent: programWithInvalidRange,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeNull();
    });

    it("returns null when program range is not an array", () => {
        const programWithNonArrayRange = {
            ...createProgram([]),
            range: "invalid",
        } as unknown as TSESTree.Program;
        const referenceNode = {
            parent: programWithNonArrayRange,
            type: "Identifier",
        } as unknown as TSESTree.Node;

        const fixer = {
            insertTextAfter: vi.fn(),
            insertTextBeforeRange: vi.fn(),
        } as unknown as TSESLint.RuleFixer;

        const fix = createImportInsertionFix({
            fixer,
            importDeclarationText: 'import { arrayAt } from "ts-extras";',
            referenceNode,
        });

        expect(fix).toBeNull();
    });

    it("fast-check: import insertion edits preserve parseability across prologue/import scenarios", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                insertionScenarioArbitrary,
                importInsertionTextArbitrary,
                (scenario: InsertionScenario, importInsertionText) => {
                    const parsed = parser.parseForESLint(
                        scenario.sourceText,
                        parserOptions
                    );
                    const program = parsed.ast as TSESTree.Program;

                    const referenceNode = {
                        parent: program,
                        type: "Identifier",
                    } as unknown as TSESTree.Node;

                    const fakeFixer = {
                        insertTextAfter(target: unknown, text: string) {
                            if (
                                typeof target !== "object" ||
                                target === null ||
                                !("range" in target)
                            ) {
                                throw new TypeError(
                                    "insertTextAfter target is missing range"
                                );
                            }

                            const targetRange = (
                                target as Readonly<{
                                    range?: readonly [number, number];
                                }>
                            ).range;
                            if (targetRange === undefined) {
                                throw new TypeError(
                                    "insertTextAfter target range is undefined"
                                );
                            }

                            return {
                                end: targetRange[1],
                                start: targetRange[1],
                                text,
                            } as const;
                        },
                        insertTextBeforeRange(
                            range: readonly [number, number],
                            text: string
                        ) {
                            return {
                                end: range[1],
                                start: range[0],
                                text,
                            } as const;
                        },
                    } as unknown as TSESLint.RuleFixer;

                    const fix = createImportInsertionFix({
                        fixer: fakeFixer,
                        importDeclarationText: importInsertionText,
                        referenceNode,
                    });

                    expect(fix).not.toBeNull();

                    if (!isInsertionEdit(fix)) {
                        throw new TypeError(
                            "Expected createImportInsertionFix to emit a single text edit"
                        );
                    }

                    const edit = fix;
                    const trimmedImportInsertionText =
                        importInsertionText.trim();

                    expect(edit.text).toContain(trimmedImportInsertionText);

                    assertEditStartMatchesScenario({
                        edit,
                        program,
                        scenario,
                    });

                    const fixedSourceText = applyInsertionEdit({
                        edit,
                        sourceText: scenario.sourceText,
                    });

                    expect(() => {
                        parser.parseForESLint(fixedSourceText, parserOptions);
                    }).not.toThrow();
                }
            ),
            fastCheckRunConfig.default
        );
    });
});
