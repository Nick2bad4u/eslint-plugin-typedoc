/**
 * @packageDocumentation
 * Internal shared utilities used by eslint-plugin-typefest rule modules and plugin wiring.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { keyIn } from "ts-extras";

import { getParentNode } from "./ast-node.js";
import { isAnyLinkedStructureNodeMatching } from "./cycle-safe-linked-search.js";
import {
    collectNamedImportLocalNamesByImportedNameFromSource,
    collectNamedImportSpecifierBindingsFromSource,
    collectNamespaceImportLocalNamesFromSourceModule,
} from "./import-analysis.js";
import { createImportAwareFixes } from "./import-aware-fixes.js";
import {
    type ImportFixIntent,
    resolveImportInsertionDecisionForReportFix,
} from "./import-fix-coordinator.js";
import { createImportInsertionFix } from "./import-insertion.js";
import { TYPE_FEST_MODULE_SOURCE } from "./module-source.js";
import { setContainsValue } from "./set-membership.js";

/** Utility wrapper used to preserve explicit readonly semantics in fixes. */
const READONLY_UTILITY_TYPE_NAME = "Readonly";

/**
 * Container type references that semantically encode readonly wrappers.
 */
const READONLY_CONTAINER_TYPE_NAMES = new Set([
    "ReadonlyArray",
    "ReadonlyMap",
    "ReadonlySet",
]);

/**
 * AST node shape that may carry optional generic type parameters.
 */
type NodeWithOptionalTypeParameters = Readonly<TSESTree.Node> & {
    typeParameters?: Readonly<TSESTree.TSTypeParameterDeclaration>;
};

/**
 * Determine whether a node exposes an optional `typeParameters` property.
 */
const hasOptionalTypeParametersProperty = (
    node: Readonly<TSESTree.Node>
): node is NodeWithOptionalTypeParameters => keyIn(node, "typeParameters");

/**
 * Matched imported type alias that can be replaced with a canonical name.
 */
type ImportedTypeAliasMatch = {
    importedName: string;
    replacementName: string;
    sourceValue: string;
};

/**
 * Collects imported canonical type alias names that should be replaced by
 * preferred type-fest utility names.
 *
 * @param sourceCode - Source code object for the current file.
 * @param replacementsByImportedName - Mapping from imported symbol names to
 *   preferred replacement names.
 *
 * @returns Map keyed by canonical imported alias name with replacement
 *   metadata.
 */
export const collectImportedTypeAliasMatches = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    replacementsByImportedName: Readonly<Record<string, string>>
): ReadonlyMap<string, ImportedTypeAliasMatch> => {
    const aliasMatches = new Map<string, ImportedTypeAliasMatch>();

    for (const binding of collectNamedImportSpecifierBindingsFromSource({
        sourceCode,
    })) {
        if (binding.localName !== binding.importedName) {
            continue;
        }

        const replacementName =
            replacementsByImportedName[binding.importedName];
        if (
            typeof replacementName !== "string" ||
            replacementName.length === 0
        ) {
            continue;
        }

        const sourceValue =
            typeof binding.declaration.source.value === "string"
                ? binding.declaration.source.value
                : "";

        aliasMatches.set(binding.importedName, {
            importedName: binding.importedName,
            replacementName,
            sourceValue,
        });
    }

    return aliasMatches;
};

/**
 * Collect direct (non-renamed) named imports for a specific source module.
 *
 * @param sourceCode - Source code object for the current file.
 * @param expectedSourceValue - Module source string to match.
 *
 * @returns Set of imported identifier names.
 */
export const collectDirectNamedImportsFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    expectedSourceValue: string
): ReadonlySet<string> => {
    const localNamesByImportedName =
        collectNamedImportLocalNamesByImportedNameFromSource({
            sourceCode,
            sourceModuleName: expectedSourceValue,
        });

    const namedImports = new Set<string>();

    for (const [importedName, localNames] of localNamesByImportedName) {
        if (!setContainsValue(localNames, importedName)) {
            continue;
        }

        namedImports.add(importedName);
    }

    return namedImports;
};

/**
 * Collect local identifier names for a specific named import from a selected
 * module source.
 *
 * @param sourceCode - Source code object for the current file.
 * @param expectedSourceValue - Module source string to match.
 * @param expectedImportedName - Imported symbol name to match.
 *
 * @returns Set of local identifier names (including aliased locals).
 */
export const collectNamedImportLocalNamesFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    expectedSourceValue: string,
    expectedImportedName: string
): ReadonlySet<string> =>
    new Set(
        collectNamedImportLocalNamesByImportedNameFromSource({
            sourceCode,
            sourceModuleName: expectedSourceValue,
        }).get(expectedImportedName)
    );

/**
 * Collect local identifier names for namespace imports from a selected module
 * source.
 *
 * @param sourceCode - Source code object for the current file.
 * @param expectedSourceValue - Module source string to match.
 *
 * @returns Set of namespace import local names.
 */
export const collectNamespaceImportLocalNamesFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    expectedSourceValue: string
): ReadonlySet<string> =>
    collectNamespaceImportLocalNamesFromSourceModule(
        sourceCode,
        expectedSourceValue
    );

/**
 * Builds an import-insertion fix for missing named type replacements.
 *
 * @param options - Fixer context and replacement import metadata.
 *
 * @returns Import insertion fix when a safe insertion point is found; otherwise
 *   `null`.
 */
const getInsertionFixForMissingNamedTypeImport = ({
    fixer,
    node,
    replacementName,
    sourceModuleName,
}: Readonly<{
    fixer: TSESLint.RuleFixer;
    node: Readonly<TSESTree.Node>;
    replacementName: string;
    sourceModuleName: string;
}>): null | TSESLint.RuleFix => {
    const importDeclarationText = `import type { ${replacementName} } from "${sourceModuleName}";`;

    return createImportInsertionFix({
        fixer,
        importDeclarationText,
        moduleSpecifierHint: sourceModuleName,
        referenceNode: node,
    });
};

/**
 * Checks whether an ancestor node declares a type parameter with a specific
 * name.
 *
 * @param ancestor - Ancestor node to inspect.
 * @param parameterName - Type parameter name to detect.
 *
 * @returns `true` when the ancestor declares a matching type parameter.
 */
const ancestorDefinesTypeParameterNamed = (
    ancestor: Readonly<TSESTree.Node>,
    parameterName: string
): boolean => {
    if (!hasOptionalTypeParametersProperty(ancestor)) {
        return false;
    }

    const typeParameterDeclaration = ancestor.typeParameters;
    if (!typeParameterDeclaration) {
        return false;
    }

    return typeParameterDeclaration.params.some(
        (parameter) => parameter.name.name === parameterName
    );
};

/**
 * Determine whether a type parameter name is shadowed by any enclosing generic
 * declaration.
 *
 * @param node - Node used as the starting point for ancestor traversal.
 * @param parameterName - Type parameter name to detect.
 *
 * @returns `true` when an ancestor declares a matching type parameter.
 */
export function isTypeParameterNameShadowed(
    node: Readonly<TSESTree.Node>,
    parameterName: string
): boolean {
    return isAnyLinkedStructureNodeMatching<Readonly<TSESTree.Node>>({
        getNextNode: (
            currentNode: Readonly<TSESTree.Node>
        ): null | Readonly<TSESTree.Node> => getParentNode(currentNode) ?? null,
        isMatch: (currentNode: Readonly<TSESTree.Node>) =>
            ancestorDefinesTypeParameterNamed(currentNode, parameterName),
        startNode: node,
    });
}

/**
 * Build a replacement fixer that optionally inserts a missing named type import
 * before applying the replacement.
 *
 * @param options - Replacement strategy plus import/scope safety inputs.
 *
 * @returns Report fixer when replacement is scope-safe; otherwise `null`.
 */
const createTypeReplacementFix = ({
    applyReplacement,
    availableReplacementNames,
    node,
    replacementName,
    reportFixIntent,
    sourceModuleName,
}: Readonly<{
    applyReplacement: (fixer: Readonly<TSESLint.RuleFixer>) => TSESLint.RuleFix;
    availableReplacementNames: ReadonlySet<string>;
    node: Readonly<TSESTree.Node>;
    replacementName: string;
    reportFixIntent: ImportFixIntent;
    sourceModuleName: string;
}>): null | TSESLint.ReportFixFunction => {
    if (isTypeParameterNameShadowed(node, replacementName)) {
        return null;
    }

    const requiresImportInsertion = !setContainsValue(
        availableReplacementNames,
        replacementName
    );
    if (!requiresImportInsertion) {
        return (fixer) => applyReplacement(fixer);
    }

    const importInsertionDecision = resolveImportInsertionDecisionForReportFix({
        importBindingKind: "type",
        importedName: replacementName,
        referenceNode: node,
        reportFixIntent,
        sourceModuleName,
    });

    return (fixer) =>
        createImportAwareFixes({
            createImportFix: (importFixer) =>
                getInsertionFixForMissingNamedTypeImport({
                    fixer: importFixer,
                    node,
                    replacementName,
                    sourceModuleName,
                }),
            createReplacementFix: applyReplacement,
            fixer,
            importInsertionDecision,
            requiresImportInsertion,
        });
};

/**
 * Build a safe type-reference replacement fixer.
 *
 * @param node - Type reference node to potentially fix.
 * @param replacementName - Replacement identifier text.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 * @param sourceModuleName - Module source used when validating/adding imports.
 *
 * @returns Fix function when replacement/import insertion is scope-safe;
 *   otherwise `null`.
 */
export const createSafeTypeReferenceReplacementFix = (
    node: Readonly<TSESTree.TSTypeReference>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_SOURCE,
    reportFixIntent: ImportFixIntent = "autofix"
): null | TSESLint.ReportFixFunction => {
    if (node.typeName.type !== "Identifier") {
        return null;
    }

    return createTypeReplacementFix({
        applyReplacement: (fixer) =>
            fixer.replaceText(node.typeName, replacementName),
        availableReplacementNames,
        node,
        replacementName,
        reportFixIntent,
        sourceModuleName,
    });
};

/**
 * Build a safe whole-type-node replacement fixer with custom replacement text.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement symbol name used for import/scope safety
 *   checks.
 * @param replacementText - Final replacement text to emit.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 * @param sourceModuleName - Module source used when validating/adding imports.
 *
 * @returns Fix function when replacement/import insertion is scope-safe;
 *   otherwise `null`.
 */
export const createSafeTypeNodeTextReplacementFix = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_SOURCE,
    reportFixIntent: ImportFixIntent = "autofix"
): null | TSESLint.ReportFixFunction =>
    createTypeReplacementFix({
        applyReplacement: (fixer) => fixer.replaceText(node, replacementText),
        availableReplacementNames,
        node,
        replacementName,
        reportFixIntent,
        sourceModuleName,
    });

/**
 * Build a safe whole-type-node replacement fixer.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement identifier text.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 * @param sourceModuleName - Module source used when validating/adding imports.
 *
 * @returns Fix function when replacement/import insertion is scope-safe;
 *   otherwise `null`.
 */
export const createSafeTypeNodeReplacementFix = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_SOURCE,
    reportFixIntent: ImportFixIntent = "autofix"
): null | TSESLint.ReportFixFunction =>
    createSafeTypeNodeTextReplacementFix(
        node,
        replacementName,
        replacementName,
        availableReplacementNames,
        sourceModuleName,
        reportFixIntent
    );

/**
 * Detects type nodes that explicitly encode readonly semantics.
 *
 * @param node - Type node to inspect.
 *
 * @returns `true` for `readonly` type operators and known readonly container
 *   references.
 */
const isExplicitReadonlyTypeNode = (node: Readonly<TSESTree.Node>): boolean => {
    if (node.type === "TSTypeOperator") {
        return node.operator === "readonly";
    }

    if (
        node.type !== "TSTypeReference" ||
        node.typeName.type !== "Identifier"
    ) {
        return false;
    }

    return setContainsValue(READONLY_CONTAINER_TYPE_NAMES, node.typeName.name);
};

/**
 * Checks whether replacement text is already wrapped with `Readonly<...>`.
 */
const isReadonlyUtilityWrappedText = (replacementText: string): boolean =>
    replacementText.trimStart().startsWith(`${READONLY_UTILITY_TYPE_NAME}<`);

/**
 * Wraps replacement text in `Readonly<...>`.
 */
const toReadonlyUtilityWrappedText = (replacementText: string): string =>
    `${READONLY_UTILITY_TYPE_NAME}<${replacementText}>`;

/**
 * Build a safe whole-type-node replacement fixer that preserves explicit
 * readonly wrappers/operators from the original node.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement symbol name used for import/scope safety
 *   checks.
 * @param replacementText - Final replacement text before readonly-preservation
 *   adjustment.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 * @param sourceModuleName - Module source used when validating/adding imports.
 *
 * @returns Fix function when replacement/import insertion is scope-safe;
 *   otherwise `null`.
 */
export const createSafeTypeNodeTextReplacementFixPreservingReadonly = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    replacementText: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_SOURCE,
    reportFixIntent: ImportFixIntent = "autofix"
): null | TSESLint.ReportFixFunction => {
    const replacementTextWithReadonlyPreservation =
        isExplicitReadonlyTypeNode(node) &&
        !isReadonlyUtilityWrappedText(replacementText)
            ? toReadonlyUtilityWrappedText(replacementText)
            : replacementText;

    return createSafeTypeNodeTextReplacementFix(
        node,
        replacementName,
        replacementTextWithReadonlyPreservation,
        availableReplacementNames,
        sourceModuleName,
        reportFixIntent
    );
};

/**
 * Build a safe whole-type-node replacement fixer that preserves explicit
 * readonly wrappers/operators from the original node.
 *
 * @param node - Type node to potentially replace.
 * @param replacementName - Replacement identifier text.
 * @param availableReplacementNames - Available direct imported replacement
 *   names.
 * @param sourceModuleName - Module source used when validating/adding imports.
 *
 * @returns Fix function when replacement/import insertion is scope-safe;
 *   otherwise `null`.
 */
export const createSafeTypeNodeReplacementFixPreservingReadonly = (
    node: Readonly<TSESTree.Node>,
    replacementName: string,
    availableReplacementNames: Readonly<ReadonlySet<string>>,
    sourceModuleName: string = TYPE_FEST_MODULE_SOURCE,
    reportFixIntent: ImportFixIntent = "autofix"
): null | TSESLint.ReportFixFunction =>
    createSafeTypeNodeTextReplacementFixPreservingReadonly(
        node,
        replacementName,
        replacementName,
        availableReplacementNames,
        sourceModuleName,
        reportFixIntent
    );
