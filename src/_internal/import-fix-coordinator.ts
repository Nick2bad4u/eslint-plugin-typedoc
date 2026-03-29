/**
 * @packageDocumentation
 * Shared import-insertion coordination used by import-aware replacement fixers.
 */
import type { TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

import { getProgramNode } from "./ast-node.js";
import { isImportInsertionFixesDisabledForNode } from "./plugin-settings.js";

/** Classification for coordinated import insertion keys. */
export type ImportBindingKind = "type" | "value";

/**
 * Delivery channel for a report fix callback.
 *
 * @remarks
 * - `autofix`: fix supplied through `context.report({ fix })` and coordinated so
 *   only one report emits a specific import insertion per file/lint pass.
 * - `suggestion`: fix supplied through `context.report({ suggest })`; each
 *   suggestion remains self-contained and therefore keeps import insertion.
 */
export type ImportFixIntent = "autofix" | "suggestion";

/**
 * Import-insertion planning decision for one report fix callback.
 */
export type ImportInsertionDecision = Readonly<{
    allowReplacementWithoutImportInsertion: boolean;
    shouldIncludeImportInsertionFix: boolean;
}>;

/**
 * Input options used to resolve import-insertion coordination decisions.
 */
export type ImportInsertionDecisionOptions = Readonly<{
    importBindingKind: ImportBindingKind;
    importedName: string;
    referenceNode: Readonly<TSESTree.Node>;
    reportFixIntent: ImportFixIntent;
    sourceModuleName: string;
}>;

/** Claimed import-insertion keys for one Program node. */
type ProgramImportClaims = Set<string>;

/** Program-scoped claimed import keys cache. */
const claimedImportKeysByProgram = new WeakMap<
    Readonly<TSESTree.Program>,
    ProgramImportClaims
>();

/**
 * Build a deterministic coordination key for one import binding.
 */
const createImportCoordinationKey = ({
    importBindingKind,
    importedName,
    sourceModuleName,
}: Readonly<{
    importBindingKind: ImportBindingKind;
    importedName: string;
    sourceModuleName: string;
}>): string =>
    `${importBindingKind}\u0000${sourceModuleName}\u0000${importedName}`;

/**
 * Claim a coordination key for one program and return whether this call made
 * the first claim.
 */
const claimImportCoordinationKeyForProgram = ({
    coordinationKey,
    programNode,
}: Readonly<{
    coordinationKey: string;
    programNode: Readonly<TSESTree.Program>;
}>): boolean => {
    const existingClaims = claimedImportKeysByProgram.get(programNode);
    if (existingClaims?.has(coordinationKey) === true) {
        return false;
    }

    if (!isDefined(existingClaims)) {
        claimedImportKeysByProgram.set(programNode, new Set([coordinationKey]));

        return true;
    }

    existingClaims.add(coordinationKey);

    return true;
};

/**
 * Decision when import insertion should be emitted and replacement is allowed.
 */
const INCLUDE_IMPORT_INSERTION: ImportInsertionDecision = {
    allowReplacementWithoutImportInsertion: true,
    shouldIncludeImportInsertionFix: true,
};

/**
 * Decision when replacement depends on insertion and should be suppressed.
 */
const SKIP_IMPORT_INSERTION_BLOCK_REPLACEMENT: ImportInsertionDecision = {
    allowReplacementWithoutImportInsertion: false,
    shouldIncludeImportInsertionFix: false,
};

/**
 * Resolve import-insertion and replacement behavior for a report-fix callback.
 *
 * @remarks
 * This decision is made during fixer construction (AST traversal) to keep
 * behavior deterministic across repeated fix callback evaluation.
 */
export function resolveImportInsertionDecisionForReportFix({
    importBindingKind,
    importedName,
    referenceNode,
    reportFixIntent,
    sourceModuleName,
}: ImportInsertionDecisionOptions): ImportInsertionDecision {
    if (reportFixIntent === "suggestion") {
        return INCLUDE_IMPORT_INSERTION;
    }

    if (isImportInsertionFixesDisabledForNode(referenceNode)) {
        return SKIP_IMPORT_INSERTION_BLOCK_REPLACEMENT;
    }

    const programNode = getProgramNode(referenceNode);
    if (!programNode) {
        return INCLUDE_IMPORT_INSERTION;
    }

    const coordinationKey = createImportCoordinationKey({
        importBindingKind,
        importedName,
        sourceModuleName,
    });

    if (
        !claimImportCoordinationKeyForProgram({
            coordinationKey,
            programNode,
        })
    ) {
        return SKIP_IMPORT_INSERTION_BLOCK_REPLACEMENT;
    }

    return INCLUDE_IMPORT_INSERTION;
}
