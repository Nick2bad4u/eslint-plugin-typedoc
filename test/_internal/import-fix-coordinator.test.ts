/**
 * @packageDocumentation
 * Unit tests for import-fix coordination decisions.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import type {
    ImportInsertionDecision,
    ImportInsertionDecisionOptions,
} from "../../src/_internal/import-fix-coordinator";

import { resolveImportInsertionDecisionForReportFix } from "../../src/_internal/import-fix-coordinator";
import { registerProgramSettingsForContext } from "../../src/_internal/plugin-settings";

const resolveDecision: (
    options: ImportInsertionDecisionOptions
) => ImportInsertionDecision = resolveImportInsertionDecisionForReportFix;

/** Build a minimal Program node fixture. */
const createProgramNode = (): TSESTree.Program =>
    ({
        body: [],
        comments: [],
        range: [0, 0],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

/** Build a minimal node whose parent is the provided Program. */
const createNodeInProgram = (
    programNode: Readonly<TSESTree.Program>
): Readonly<TSESTree.Node> =>
    ({
        parent: programNode,
        type: "Identifier",
    }) as unknown as Readonly<TSESTree.Node>;

const createRuleContext = ({
    programNode,
    settings,
}: Readonly<{
    programNode: Readonly<TSESTree.Program>;
    settings: unknown;
}>): Readonly<TSESLint.RuleContext<string, UnknownArray>> =>
    ({
        filename: "test-file.ts",
        id: "internal-import-fix-coordinator-test",
        languageOptions: {},
        options: [],
        report: () => {},
        settings,
        sourceCode: {
            ast: programNode,
        },
    }) as unknown as Readonly<TSESLint.RuleContext<string, UnknownArray>>;

describe(resolveImportInsertionDecisionForReportFix, () => {
    it("always includes import insertion for suggestion fixes", () => {
        const programNode = createProgramNode();

        const decision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "suggestion",
            sourceModuleName: "ts-extras",
        });

        expect(decision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });
    });

    it("blocks replacement when import insertion fixes are disabled", () => {
        const programNode = createProgramNode();

        registerProgramSettingsForContext(
            createRuleContext({
                programNode,
                settings: {
                    typefest: {
                        disableImportInsertionFixes: true,
                    },
                },
            })
        );

        const decision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        expect(decision).toStrictEqual({
            allowReplacementWithoutImportInsertion: false,
            shouldIncludeImportInsertionFix: false,
        });
    });

    it("blocks duplicate autofix replacements by default after first claim", () => {
        const programNode = createProgramNode();

        const firstDecision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        const secondDecision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        expect(firstDecision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });

        expect(secondDecision).toStrictEqual({
            allowReplacementWithoutImportInsertion: false,
            shouldIncludeImportInsertionFix: false,
        });
    });

    it("treats distinct imports as separate coordination claims", () => {
        const programNode = createProgramNode();

        const firstDecision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        const secondDecision = resolveDecision({
            importBindingKind: "value",
            importedName: "assertPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        expect(firstDecision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });
        expect(secondDecision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });
    });

    it("treats value and type claims as distinct for same import name", () => {
        const programNode = createProgramNode();

        const valueDecision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        const typedImportDecision = resolveDecision({
            importBindingKind: "type",
            importedName: "isPresent",
            referenceNode: createNodeInProgram(programNode),
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        expect(valueDecision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });
        expect(typedImportDecision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });
    });

    it("falls back to inclusion when program cannot be resolved", () => {
        const orphanNode = {
            type: "Identifier",
        } as unknown as Readonly<TSESTree.Node>;

        const decision = resolveDecision({
            importBindingKind: "value",
            importedName: "isPresent",
            referenceNode: orphanNode,
            reportFixIntent: "autofix",
            sourceModuleName: "ts-extras",
        });

        expect(decision).toStrictEqual({
            allowReplacementWithoutImportInsertion: true,
            shouldIncludeImportInsertionFix: true,
        });
    });
});
