/**
 * @packageDocumentation
 * Unit tests for shared import-aware fix composition.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import { describe, expect, it, vi } from "vitest";

import type { ImportInsertionDecision } from "../../src/_internal/import-fix-coordinator";

import { createImportAwareFixes } from "../../src/_internal/import-aware-fixes";

const createRuleFix = (label: string): TSESLint.RuleFix =>
    ({
        label,
    }) as unknown as TSESLint.RuleFix;

const createFixer = (): Readonly<TSESLint.RuleFixer> =>
    ({
        insertTextAfter: () => createRuleFix("insertTextAfter"),
        insertTextBefore: () => createRuleFix("insertTextBefore"),
        insertTextBeforeRange: () => createRuleFix("insertTextBeforeRange"),
        remove: () => createRuleFix("remove"),
        removeRange: () => createRuleFix("removeRange"),
        replaceText: () => createRuleFix("replaceText"),
        replaceTextRange: () => createRuleFix("replaceTextRange"),
    }) as unknown as Readonly<TSESLint.RuleFixer>;

const INCLUDE_IMPORT_INSERTION: ImportInsertionDecision = {
    allowReplacementWithoutImportInsertion: true,
    shouldIncludeImportInsertionFix: true,
};

const SKIP_IMPORT_INSERTION_ALLOW_REPLACEMENT: ImportInsertionDecision = {
    allowReplacementWithoutImportInsertion: true,
    shouldIncludeImportInsertionFix: false,
};

const SKIP_IMPORT_INSERTION_BLOCK_REPLACEMENT: ImportInsertionDecision = {
    allowReplacementWithoutImportInsertion: false,
    shouldIncludeImportInsertionFix: false,
};

describe(createImportAwareFixes, () => {
    it("returns replacement only when import insertion is not required", () => {
        const fixes = createImportAwareFixes({
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: INCLUDE_IMPORT_INSERTION,
            requiresImportInsertion: false,
        });

        expect(fixes).toHaveLength(1);
    });

    it("returns import and replacement when insertion is required and included", () => {
        const fixes = createImportAwareFixes({
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: INCLUDE_IMPORT_INSERTION,
            requiresImportInsertion: true,
        });

        expect(fixes).toHaveLength(2);
    });

    it("returns import only when separate-pass strategy is selected for autofix", () => {
        const fixes = createImportAwareFixes({
            autofixImportInsertionStrategy: "separate-pass",
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: INCLUDE_IMPORT_INSERTION,
            reportFixIntent: "autofix",
            requiresImportInsertion: true,
        });

        expect(fixes).toHaveLength(1);
    });

    it("keeps import plus replacement for suggestions even with separate-pass strategy", () => {
        const fixes = createImportAwareFixes({
            autofixImportInsertionStrategy: "separate-pass",
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: INCLUDE_IMPORT_INSERTION,
            reportFixIntent: "suggestion",
            requiresImportInsertion: true,
        });

        expect(fixes).toHaveLength(2);
    });

    it("returns replacement only when insertion is skipped but replacement allowed", () => {
        const fixes = createImportAwareFixes({
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: SKIP_IMPORT_INSERTION_ALLOW_REPLACEMENT,
            reportFixIntent: "autofix",
            requiresImportInsertion: true,
        });

        expect(fixes).toHaveLength(1);
    });

    it("returns replacement when non-autofix paths skip insertion but allow replacement", () => {
        const fixes = createImportAwareFixes({
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: SKIP_IMPORT_INSERTION_ALLOW_REPLACEMENT,
            reportFixIntent: "suggestion",
            requiresImportInsertion: true,
        });

        expect(fixes).toHaveLength(1);
    });

    it("returns null when separate-pass autofix skips import insertion on duplicate claims", () => {
        const fixes = createImportAwareFixes({
            autofixImportInsertionStrategy: "separate-pass",
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: SKIP_IMPORT_INSERTION_ALLOW_REPLACEMENT,
            reportFixIntent: "autofix",
            requiresImportInsertion: true,
        });

        expect(fixes).toBeNull();
    });

    it("returns null when insertion is skipped and replacement blocked", () => {
        const fixes = createImportAwareFixes({
            createImportFix: () => createRuleFix("import"),
            createReplacementFix: () => createRuleFix("replacement"),
            fixer: createFixer(),
            importInsertionDecision: SKIP_IMPORT_INSERTION_BLOCK_REPLACEMENT,
            requiresImportInsertion: true,
        });

        expect(fixes).toBeNull();
    });

    it("returns null when required import insertion fix cannot be created", () => {
        const createReplacementFix = vi.fn(() => createRuleFix("replacement"));

        const fixes = createImportAwareFixes({
            createImportFix: () => null,
            createReplacementFix,
            fixer: createFixer(),
            importInsertionDecision: INCLUDE_IMPORT_INSERTION,
            requiresImportInsertion: true,
        });

        expect(fixes).toBeNull();
        expect(createReplacementFix).not.toHaveBeenCalled();
    });
});
