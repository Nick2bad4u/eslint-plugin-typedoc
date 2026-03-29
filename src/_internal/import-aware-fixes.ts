/**
 * @packageDocumentation
 * Shared composition helpers for import-aware report fix callbacks.
 */
import type { TSESLint } from "@typescript-eslint/utils";

import type {
    ImportFixIntent,
    ImportInsertionDecision,
} from "./import-fix-coordinator.js";

/**
 * Controls whether an autofix that must insert an import should also emit its
 * replacement in the same report callback.
 */
export type AutofixImportInsertionStrategy = "combined" | "separate-pass";

/**
 * Build replacement/import fixer arrays according to an import-insertion
 * coordination decision.
 *
 * @param options - Replacement and optional import-fix factories with the
 *   import-insertion decision for this report callback.
 *
 * @returns Ordered fix array (`import`, then `replacement`) when applicable;
 *   otherwise `null` when the fix must be suppressed.
 */
export const createImportAwareFixes = ({
    autofixImportInsertionStrategy = "combined",
    createImportFix,
    createReplacementFix,
    fixer,
    importInsertionDecision,
    reportFixIntent = "autofix",
    requiresImportInsertion,
}: Readonly<{
    autofixImportInsertionStrategy?: AutofixImportInsertionStrategy | undefined;
    createImportFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => null | TSESLint.RuleFix;
    createReplacementFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => TSESLint.RuleFix;
    fixer: Readonly<TSESLint.RuleFixer>;
    importInsertionDecision: ImportInsertionDecision;
    reportFixIntent?: ImportFixIntent | undefined;
    requiresImportInsertion: boolean;
}>): null | readonly TSESLint.RuleFix[] => {
    if (
        requiresImportInsertion &&
        reportFixIntent === "autofix" &&
        autofixImportInsertionStrategy === "separate-pass"
    ) {
        if (!importInsertionDecision.shouldIncludeImportInsertionFix) {
            return null;
        }

        const importFix = createImportFix(fixer);
        if (importFix === null) {
            return null;
        }

        return [importFix];
    }

    if (!requiresImportInsertion) {
        return [createReplacementFix(fixer)];
    }

    if (!importInsertionDecision.shouldIncludeImportInsertionFix) {
        return importInsertionDecision.allowReplacementWithoutImportInsertion
            ? [createReplacementFix(fixer)]
            : null;
    }

    const importFix = createImportFix(fixer);
    if (importFix === null) {
        return null;
    }

    return [importFix, createReplacementFix(fixer)];
};
