/**
 * @packageDocumentation
 * Shared import-declaration analysis utilities for rule internals.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { isDefined } from "ts-extras";

/**
 * Grouped mapping from imported symbol name to all local alias names.
 */
export type NamedImportLocalNamesByImportedName = ReadonlyMap<
    string,
    ReadonlySet<string>
>;

/**
 * Flattened named-import binding metadata.
 */
export type NamedImportSpecifierBinding = Readonly<{
    declaration: Readonly<TSESTree.ImportDeclaration>;
    importedName: string;
    localName: string;
    specifier: Readonly<TSESTree.ImportSpecifier>;
}>;

/**
 * Program-level import analysis cached per SourceCode instance.
 */
type SourceImportAnalysis = Readonly<{
    namedImportSpecifierBindings: readonly NamedImportSpecifierBinding[];
    namespaceImportLocalNamesBySourceModule: ReadonlyMap<
        string,
        ReadonlySet<string>
    >;
}>;

/**
 * SourceCode-scoped cache for parsed import declarations.
 */
const sourceImportAnalysisCache = new WeakMap<
    Readonly<TSESLint.SourceCode>,
    SourceImportAnalysis
>();

/**
 * Build and cache one import-analysis snapshot for the provided SourceCode.
 */
const getSourceImportAnalysis = (
    sourceCode: Readonly<TSESLint.SourceCode>
): SourceImportAnalysis => {
    const existingAnalysis = sourceImportAnalysisCache.get(sourceCode);
    if (isDefined(existingAnalysis)) {
        return existingAnalysis;
    }

    const namedImportSpecifierBindings: NamedImportSpecifierBinding[] = [];
    const mutableNamespaceLocalNamesBySourceModule = new Map<
        string,
        Set<string>
    >();

    for (const statement of sourceCode.ast.body) {
        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        const sourceModuleName =
            typeof statement.source.value === "string"
                ? statement.source.value
                : undefined;

        for (const specifier of statement.specifiers) {
            if (
                specifier.type === "ImportSpecifier" &&
                specifier.imported.type === "Identifier" &&
                specifier.local.type === "Identifier"
            ) {
                namedImportSpecifierBindings.push(
                    Object.freeze({
                        declaration: statement,
                        importedName: specifier.imported.name,
                        localName: specifier.local.name,
                        specifier,
                    })
                );

                continue;
            }

            if (
                specifier.type === "ImportNamespaceSpecifier" &&
                isDefined(sourceModuleName)
            ) {
                const existingLocalNames =
                    mutableNamespaceLocalNamesBySourceModule.get(
                        sourceModuleName
                    );

                if (!isDefined(existingLocalNames)) {
                    mutableNamespaceLocalNamesBySourceModule.set(
                        sourceModuleName,
                        new Set([specifier.local.name])
                    );

                    continue;
                }

                existingLocalNames.add(specifier.local.name);
            }
        }
    }

    const namespaceImportLocalNamesBySourceModule = new Map<
        string,
        ReadonlySet<string>
    >();

    for (const [
        sourceModuleName,
        localNames,
    ] of mutableNamespaceLocalNamesBySourceModule) {
        namespaceImportLocalNamesBySourceModule.set(
            sourceModuleName,
            Object.freeze(new Set(localNames))
        );
    }

    const analysis: SourceImportAnalysis = Object.freeze({
        namedImportSpecifierBindings: Object.freeze(
            namedImportSpecifierBindings
        ),
        namespaceImportLocalNamesBySourceModule,
    });

    sourceImportAnalysisCache.set(sourceCode, analysis);

    return analysis;
};

/**
 * Check whether an import declaration points at a specific source module.
 */
export const isImportDeclarationFromSource = (
    declaration: Readonly<TSESTree.ImportDeclaration>,
    sourceModuleName: string
): boolean => declaration.source.value === sourceModuleName;

/**
 * Collect named import-specifier bindings from one module source.
 */
export const collectNamedImportSpecifierBindingsFromSource = ({
    allowTypeImportDeclaration = true,
    allowTypeImportSpecifier = true,
    sourceCode,
    sourceModuleName,
}: Readonly<{
    allowTypeImportDeclaration?: boolean;
    allowTypeImportSpecifier?: boolean;
    sourceCode: Readonly<TSESLint.SourceCode>;
    sourceModuleName?: string;
}>): readonly NamedImportSpecifierBinding[] => {
    const sourceImportAnalysis = getSourceImportAnalysis(sourceCode);
    const bindings: NamedImportSpecifierBinding[] = [];

    for (const binding of sourceImportAnalysis.namedImportSpecifierBindings) {
        if (
            isDefined(sourceModuleName) &&
            !isImportDeclarationFromSource(
                binding.declaration,
                sourceModuleName
            )
        ) {
            continue;
        }

        if (
            !allowTypeImportDeclaration &&
            binding.declaration.importKind === "type"
        ) {
            continue;
        }

        if (
            !allowTypeImportSpecifier &&
            binding.specifier.importKind === "type"
        ) {
            continue;
        }

        bindings.push(binding);
    }

    return bindings;
};

/**
 * Collect named import local names grouped by imported symbol name.
 */
export const collectNamedImportLocalNamesByImportedNameFromSource = ({
    allowTypeImportDeclaration = true,
    allowTypeImportSpecifier = true,
    sourceCode,
    sourceModuleName,
}: Readonly<{
    allowTypeImportDeclaration?: boolean;
    allowTypeImportSpecifier?: boolean;
    sourceCode: Readonly<TSESLint.SourceCode>;
    sourceModuleName?: string;
}>): NamedImportLocalNamesByImportedName => {
    const localNamesByImportedName = new Map<string, Set<string>>();

    const bindingCollectionOptions: Parameters<
        typeof collectNamedImportSpecifierBindingsFromSource
    >[0] = {
        allowTypeImportDeclaration,
        allowTypeImportSpecifier,
        sourceCode,
        ...(isDefined(sourceModuleName) ? { sourceModuleName } : {}),
    };

    for (const binding of collectNamedImportSpecifierBindingsFromSource(
        bindingCollectionOptions
    )) {
        const existingLocalNames = localNamesByImportedName.get(
            binding.importedName
        );

        if (!isDefined(existingLocalNames)) {
            localNamesByImportedName.set(
                binding.importedName,
                new Set([binding.localName])
            );

            continue;
        }

        existingLocalNames.add(binding.localName);
    }

    return localNamesByImportedName;
};

/**
 * Collect namespace-import local names from one module source.
 */
export const collectNamespaceImportLocalNamesFromSourceModule = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    sourceModuleName: string
): ReadonlySet<string> => {
    const sourceImportAnalysis = getSourceImportAnalysis(sourceCode);
    const localNames =
        sourceImportAnalysis.namespaceImportLocalNamesBySourceModule.get(
            sourceModuleName
        );

    return isDefined(localNames) ? new Set(localNames) : new Set<string>();
};
