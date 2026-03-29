import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { describe, expect, it } from "vitest";

import {
    isImportInsertionFixesDisabledForNode,
    registerProgramSettingsForContext,
} from "../../src/_internal/plugin-settings";

/** Create an empty Program node used as a stable cache-key fixture. */
const createProgramNode = (): TSESTree.Program =>
    ({
        body: [],
        comments: [],
        range: [0, 0],
        sourceType: "module",
        tokens: [],
        type: "Program",
    }) as unknown as TSESTree.Program;

/** Build a minimal RuleContext fixture with caller-controlled settings. */
const createContext = ({
    program,
    settings,
}: Readonly<{
    program: TSESTree.Program;
    settings: unknown;
}>): TSESLint.RuleContext<string, UnknownArray> =>
    ({
        filename: "test-file.ts",
        id: "plugin-settings-test-rule",
        languageOptions: {
            parser: {
                meta: {
                    name: "@typescript-eslint/parser",
                },
            },
        },
        options: [],
        report: () => undefined,
        settings,
        sourceCode: {
            ast: program,
        },
    }) as unknown as TSESLint.RuleContext<string, UnknownArray>;

/** Create a generic AST node anchored to a specific program root. */
const createNodeInProgram = (program: TSESTree.Program): TSESTree.Node =>
    ({
        parent: program,
        type: "Identifier",
    }) as unknown as TSESTree.Node;

describe(registerProgramSettingsForContext, () => {
    it("reads disableImportInsertionFixes from settings", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: {
                    disableImportInsertionFixes: true,
                },
            },
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeFalsy();
        expect(parsedSettings.disableImportInsertionFixes).toBeTruthy();
        expect(Object.isFrozen(parsedSettings)).toBeTruthy();
    });

    it("reads disableAllAutofixes from settings", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeTruthy();
        expect(parsedSettings.disableImportInsertionFixes).toBeTruthy();
    });

    it("reuses cached settings for the same program", () => {
        const program = createProgramNode();

        const firstContext = createContext({
            program,
            settings: {
                typefest: {
                    disableImportInsertionFixes: true,
                },
            },
        });

        const secondContext = createContext({
            program,
            settings: {
                typefest: {
                    disableImportInsertionFixes: false,
                },
            },
        });

        const firstSettings = registerProgramSettingsForContext(firstContext);
        const secondSettings = registerProgramSettingsForContext(secondContext);

        expect(secondSettings).toBe(firstSettings);
        expect(secondSettings.disableImportInsertionFixes).toBeTruthy();
    });

    it("does not share cached settings across different programs", () => {
        const firstProgram = createProgramNode();
        const secondProgram = createProgramNode();

        const firstContext = createContext({
            program: firstProgram,
            settings: {
                typefest: {
                    disableImportInsertionFixes: true,
                },
            },
        });

        const secondContext = createContext({
            program: secondProgram,
            settings: {
                typefest: {
                    disableImportInsertionFixes: false,
                },
            },
        });

        const firstSettings = registerProgramSettingsForContext(firstContext);
        const secondSettings = registerProgramSettingsForContext(secondContext);

        expect(secondSettings).not.toBe(firstSettings);
        expect(firstSettings.disableImportInsertionFixes).toBeTruthy();
        expect(secondSettings.disableImportInsertionFixes).toBeFalsy();
    });

    it("treats non-object settings as disabled", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: [],
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeFalsy();
        expect(parsedSettings.disableImportInsertionFixes).toBeFalsy();
    });

    it("treats non-object typefest settings as disabled", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: ["invalid"],
            },
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeFalsy();
        expect(parsedSettings.disableImportInsertionFixes).toBeFalsy();
    });

    it("treats non-boolean settings values as disabled", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: {
                    disableAllAutofixes: "true",
                    disableImportInsertionFixes: 1,
                },
            },
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeFalsy();
        expect(parsedSettings.disableImportInsertionFixes).toBeFalsy();
    });

    it("treats inherited non-boolean settings values as disabled", () => {
        const inheritedSettings = {
            disableAllAutofixes: "true",
            disableImportInsertionFixes: 1,
        };
        const settings = {
            typefest: Object.create(inheritedSettings),
        };
        const program = createProgramNode();

        const context = createContext({
            program,
            settings,
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeFalsy();
        expect(parsedSettings.disableImportInsertionFixes).toBeFalsy();
    });

    it("ignores inherited disableImportInsertionFixes property", () => {
        const inheritedTypefestSettings = Object.create({
            disableImportInsertionFixes: true,
        });

        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: inheritedTypefestSettings,
            },
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableImportInsertionFixes).toBeFalsy();
    });

    it("ignores inherited disableAllAutofixes property", () => {
        const inheritedTypefestSettings = Object.create({
            disableAllAutofixes: true,
        });

        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: inheritedTypefestSettings,
            },
        });

        const parsedSettings = registerProgramSettingsForContext(context);

        expect(parsedSettings.disableAllAutofixes).toBeFalsy();
    });
});

describe(isImportInsertionFixesDisabledForNode, () => {
    it("returns true when disableImportInsertionFixes is enabled", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: {
                    disableImportInsertionFixes: true,
                },
            },
        });

        registerProgramSettingsForContext(context);

        expect(
            isImportInsertionFixesDisabledForNode(createNodeInProgram(program))
        ).toBeTruthy();
    });

    it("returns true when only disableAllAutofixes is enabled", () => {
        const program = createProgramNode();
        const context = createContext({
            program,
            settings: {
                typefest: {
                    disableAllAutofixes: true,
                },
            },
        });

        registerProgramSettingsForContext(context);

        expect(
            isImportInsertionFixesDisabledForNode(createNodeInProgram(program))
        ).toBeTruthy();
    });
});
