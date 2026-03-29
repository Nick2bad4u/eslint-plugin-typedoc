/**
 * @packageDocumentation
 * Utilities for collecting and safely resolving direct named value imports.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { arrayJoin, setHas } from "ts-extras";

import {
    collectNamedImportLocalNamesByImportedNameFromSource,
    isImportDeclarationFromSource,
} from "./import-analysis.js";
import {
    type AutofixImportInsertionStrategy,
    createImportAwareFixes,
} from "./import-aware-fixes.js";
import {
    type ImportFixIntent,
    type ImportInsertionDecision,
    resolveImportInsertionDecisionForReportFix,
} from "./import-fix-coordinator.js";
import { createImportInsertionFix } from "./import-insertion.js";
import { getScopeFromContextSourceCode } from "./scope-resolution.js";
import { getVariableInScopeChain } from "./scope-variable.js";

/**
 * Immutable mapping of imported symbol names to directly imported local
 * aliases.
 */
export type ImportedValueAliasMap = ReadonlyMap<string, ReadonlySet<string>>;

/**
 * Parameters for creating a safe member-expression to function-call fixer.
 */
type MemberToFunctionCallFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    memberNode: TSESTree.MemberExpression;
    reportFixIntent?: ImportFixIntent;
    sourceModuleName: string;
}>;

/**
 * Parameters for creating a safe method-call to function-call fixer.
 */
type MethodToFunctionCallFixParams = Readonly<{
    callNode: TSESTree.CallExpression;
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    reportFixIntent?: ImportFixIntent;
    sourceModuleName: string;
}>;

/**
 * Parameters for resolving a safe local alias for an imported value symbol.
 */
type SafeImportedValueNameParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    referenceNode: TSESTree.Node;
    sourceModuleName: string;
}>;

/**
 * Parameters for creating a safe replacement fixer with custom replacement text
 * derived from the resolved helper local name.
 */
type SafeValueNodeTextReplacementFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    replacementTextFactory: (replacementName: string) => string;
    reportFixIntent?: ImportFixIntent;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Parameters for creating a safe replacement fixer for a value reference.
 */
type SafeValueReplacementFixParams = Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    reportFixIntent?: ImportFixIntent;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/** Scope-chain root used for local-variable resolution helpers. */
type ScopeChainRoot = Readonly<null | Readonly<TSESLint.Scope.Scope>>;

/**
 * Parameters for creating a safe function-call replacement fixer.
 */
type ValueArgumentFunctionCallFixParams = Readonly<{
    argumentNode: TSESTree.Node;
    autofixImportInsertionStrategy?: AutofixImportInsertionStrategy;
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    negated?: boolean;
    reportFixIntent?: ImportFixIntent;
    sourceModuleName: string;
    targetNode: TSESTree.Node;
}>;

/**
 * Resolved import-planning metadata reused across value-fixer factories.
 */
type ValueReplacementPlan = Readonly<{
    importInsertionDecision: ImportInsertionDecision;
    replacementNameAndImportFixFactory: Readonly<{
        createImportFix: (
            fixer: Readonly<TSESLint.RuleFixer>
        ) => null | TSESLint.RuleFix;
        replacementName: string;
        requiresImportInsertion: boolean;
    }>;
    reportFixIntent: ImportFixIntent;
}>;

const getImportDeclarationParent = (
    node: Readonly<TSESTree.Node>
): null | Readonly<TSESTree.ImportDeclaration> => {
    const nodeParent = node.parent;

    if (nodeParent?.type !== "ImportDeclaration") {
        return null;
    }

    return nodeParent;
};

const getFirstImportedAliasName = ({
    importedName,
    imports,
}: Readonly<{
    importedName: string;
    imports: ImportedValueAliasMap;
}>): null | string => {
    const candidateNames = imports.get(importedName);

    if (!candidateNames || candidateNames.size === 0) {
        return null;
    }

    if (setHas(candidateNames, importedName)) {
        return importedName;
    }

    const [firstCandidateName] = candidateNames;

    return firstCandidateName ?? null;
};

const resolveReferenceScope = ({
    context,
    referenceNode,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    referenceNode: Readonly<TSESTree.Node>;
}>): ScopeChainRoot => getScopeFromContextSourceCode(context, referenceNode);

/**
 * Coordination decision used when import insertion is not required.
 */
const NO_IMPORT_INSERTION_NEEDED_DECISION: ImportInsertionDecision = {
    allowReplacementWithoutImportInsertion: true,
    shouldIncludeImportInsertionFix: false,
};

/**
 * Collect direct named value imports from a specific module.
 *
 * @param sourceCode - Source code object for the current file.
 * @param sourceModuleName - Module source string to match.
 *
 * @returns Readonly map of imported symbol names to local aliases.
 */
export const collectDirectNamedValueImportsFromSource = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    sourceModuleName: string
): ImportedValueAliasMap =>
    collectNamedImportLocalNamesByImportedNameFromSource({
        allowTypeImportDeclaration: false,
        allowTypeImportSpecifier: false,
        sourceCode,
        sourceModuleName,
    });

/**
 * Verify that a local identifier resolves to an import binding from the
 * expected module at a specific reference location.
 *
 * @param sourceCode - SourceCode instance for scope resolution.
 * @param referenceNode - AST node where the identifier will be referenced.
 * @param localName - Candidate local alias name.
 * @param sourceModuleName - Expected source module for the import binding.
 *
 * @returns `true` when the resolved local name is a matching import binding
 *   from the expected module.
 */
function isLocalNameBoundToExpectedImport(
    sourceScope: ScopeChainRoot,
    localName: string,
    sourceModuleName: string
): boolean {
    const variable = getVariableInScopeChain(sourceScope, localName);

    if (!variable) {
        return false;
    }

    return variable.defs.some((definition) => {
        if (definition.type !== "ImportBinding") {
            return false;
        }

        const definitionNode = definition.node;
        if (definitionNode.type !== "ImportSpecifier") {
            return false;
        }

        const parentImportDeclaration =
            getImportDeclarationParent(definitionNode);

        return (
            parentImportDeclaration !== null &&
            isImportDeclarationFromSource(
                parentImportDeclaration,
                sourceModuleName
            )
        );
    });
}

/**
 * Determine whether using the direct imported symbol name is safe at a
 * reference node without colliding with non-import bindings.
 *
 * @param options - Resolution inputs used to test direct-name safety.
 *
 * @returns `true` when using the bare imported symbol name would resolve to the
 *   expected import binding at the reference location.
 */
const canUseDirectImportedNameSafely = ({
    importedName,
    sourceModuleName,
    sourceScope,
}: Readonly<{
    importedName: string;
    sourceModuleName: string;
    sourceScope: ScopeChainRoot;
}>): boolean => {
    const variable = getVariableInScopeChain(sourceScope, importedName);

    if (!variable) {
        return true;
    }

    return variable.defs.some((definition) => {
        if (definition.type !== "ImportBinding") {
            return false;
        }

        const definitionNode = definition.node;
        if (definitionNode.type !== "ImportSpecifier") {
            return false;
        }

        if (definitionNode.local.name !== importedName) {
            return false;
        }

        const parentImportDeclaration =
            getImportDeclarationParent(definitionNode);

        return (
            parentImportDeclaration !== null &&
            isImportDeclarationFromSource(
                parentImportDeclaration,
                sourceModuleName
            ) &&
            parentImportDeclaration.importKind !== "type" &&
            definitionNode.importKind !== "type"
        );
    });
};

/**
 * Create a fixer that inserts a missing named value import for the target
 * module.
 *
 * @param options - Fixer context and import metadata.
 *
 * @returns Import insertion fix when a safe insertion point is found; otherwise
 *   `null`.
 */
const createInsertNamedValueImportFix = ({
    fixer,
    importedName,
    referenceNode,
    sourceModuleName,
}: Readonly<{
    fixer: TSESLint.RuleFixer;
    importedName: string;
    referenceNode: TSESTree.Node;
    sourceModuleName: string;
}>): null | TSESLint.RuleFix => {
    const importDeclarationText = `import { ${importedName} } from "${sourceModuleName}";`;

    return createImportInsertionFix({
        fixer,
        importDeclarationText,
        moduleSpecifierHint: sourceModuleName,
        referenceNode,
    });
};

/**
 * Resolve a local alias that is safely bound to the expected import at a
 * reference node.
 *
 * @param options - Context and import metadata for local-name resolution.
 *
 * @returns Local alias when safely resolved; otherwise `null`.
 */
function getSafeLocalNameForImportedValueInScope({
    importedName,
    imports,
    sourceModuleName,
    sourceScope,
}: Readonly<{
    importedName: string;
    imports: ImportedValueAliasMap;
    sourceModuleName: string;
    sourceScope: ScopeChainRoot;
}>): null | string {
    const candidateNames = imports.get(importedName);
    if (!candidateNames || candidateNames.size === 0) {
        return null;
    }

    for (const candidateName of candidateNames) {
        if (
            isLocalNameBoundToExpectedImport(
                sourceScope,
                candidateName,
                sourceModuleName
            )
        ) {
            return candidateName;
        }
    }

    return null;
}

/**
 * Resolve a safe local alias for a required imported value at one reference.
 *
 * @param options - Rule context, import alias map, and target reference
 *   metadata.
 *
 * @returns Local alias when the current scope binds it to the expected module;
 *   otherwise `null`.
 */
export const getSafeLocalNameForImportedValue = ({
    context,
    importedName,
    imports,
    referenceNode,
    sourceModuleName,
}: Readonly<SafeImportedValueNameParams>): null | string => {
    const sourceScope = resolveReferenceScope({
        context,
        referenceNode,
    });

    if (sourceScope === null) {
        return getFirstImportedAliasName({
            importedName,
            imports,
        });
    }

    return getSafeLocalNameForImportedValueInScope({
        importedName,
        imports,
        sourceModuleName,
        sourceScope,
    });
};

/**
 * Resolve a safe replacement symbol and corresponding optional import-insert
 * factory for value replacements.
 *
 * @param options - Context and import metadata used to resolve a safe
 *   replacement name.
 *
 * @returns Replacement metadata with optional import-fix factory when safe;
 *   otherwise `null`.
 */
const getSafeReplacementNameAndImportFixFactory = ({
    context,
    importedName,
    imports,
    referenceNode,
    sourceModuleName,
}: Readonly<SafeImportedValueNameParams>): null | {
    createImportFix: (
        fixer: Readonly<TSESLint.RuleFixer>
    ) => null | TSESLint.RuleFix;
    replacementName: string;
    requiresImportInsertion: boolean;
} => {
    const sourceScope = resolveReferenceScope({
        context,
        referenceNode,
    });

    if (sourceScope === null) {
        const fallbackLocalName = getFirstImportedAliasName({
            importedName,
            imports,
        });

        if (fallbackLocalName === null) {
            return null;
        }

        return {
            createImportFix: () => null,
            replacementName: fallbackLocalName,
            requiresImportInsertion: false,
        };
    }

    const existingReplacementName = getSafeLocalNameForImportedValueInScope({
        importedName,
        imports,
        sourceModuleName,
        sourceScope,
    });

    if (
        typeof existingReplacementName === "string" &&
        existingReplacementName.length > 0
    ) {
        return {
            createImportFix: () => null,
            replacementName: existingReplacementName,
            requiresImportInsertion: false,
        };
    }

    if (
        !canUseDirectImportedNameSafely({
            importedName,
            sourceModuleName,
            sourceScope,
        })
    ) {
        return null;
    }

    return {
        createImportFix: (fixer) =>
            createInsertNamedValueImportFix({
                fixer,
                importedName,
                referenceNode,
                sourceModuleName,
            }),
        replacementName: importedName,
        requiresImportInsertion: true,
    };
};

/**
 * Resolve and coordinate import planning for value replacement fixers.
 */
const createValueReplacementPlan = ({
    context,
    importedName,
    imports,
    referenceNode,
    reportFixIntent,
    sourceModuleName,
}: Readonly<{
    context: Readonly<TSESLint.RuleContext<string, UnknownArray>>;
    importedName: string;
    imports: ImportedValueAliasMap;
    referenceNode: Readonly<TSESTree.Node>;
    reportFixIntent: ImportFixIntent;
    sourceModuleName: string;
}>): null | ValueReplacementPlan => {
    const replacementNameAndImportFixFactory =
        getSafeReplacementNameAndImportFixFactory({
            context,
            importedName,
            imports,
            referenceNode,
            sourceModuleName,
        });

    if (replacementNameAndImportFixFactory === null) {
        return null;
    }

    const importInsertionDecision =
        replacementNameAndImportFixFactory.requiresImportInsertion
            ? resolveImportInsertionDecisionForReportFix({
                  importBindingKind: "value",
                  importedName,
                  referenceNode,
                  reportFixIntent,
                  sourceModuleName,
              })
            : NO_IMPORT_INSERTION_NEEDED_DECISION;

    return {
        importInsertionDecision,
        replacementNameAndImportFixFactory,
        reportFixIntent,
    };
};

/**
 * Build a report-fix callback from a resolved value replacement plan.
 */
const createReportFixFromValueReplacementPlan =
    ({
        autofixImportInsertionStrategy,
        createReplacementFix,
        valueReplacementPlan,
    }: Readonly<{
        autofixImportInsertionStrategy?:
            | AutofixImportInsertionStrategy
            | undefined;
        createReplacementFix: (
            fixer: Readonly<TSESLint.RuleFixer>,
            replacementName: string
        ) => TSESLint.RuleFix;
        valueReplacementPlan: Readonly<ValueReplacementPlan>;
    }>): TSESLint.ReportFixFunction =>
    (fixer) =>
        createImportAwareFixes({
            autofixImportInsertionStrategy,
            createImportFix:
                valueReplacementPlan.replacementNameAndImportFixFactory
                    .createImportFix,
            createReplacementFix: (replacementFixer) =>
                createReplacementFix(
                    replacementFixer,
                    valueReplacementPlan.replacementNameAndImportFixFactory
                        .replacementName
                ),
            fixer,
            importInsertionDecision:
                valueReplacementPlan.importInsertionDecision,
            reportFixIntent: valueReplacementPlan.reportFixIntent,
            requiresImportInsertion:
                valueReplacementPlan.replacementNameAndImportFixFactory
                    .requiresImportInsertion,
        });

/**
 * Serialize a call argument node to text, preserving sequence-expression
 * semantics with parentheses when required.
 *
 * @param options - Argument node and source-code accessor.
 *
 * @returns Trimmed argument text suitable for function-call insertion, or
 *   `null` when no text can be produced.
 */
export const getFunctionCallArgumentText = ({
    argumentNode,
    sourceCode,
}: Readonly<{
    argumentNode: Readonly<TSESTree.Node>;
    sourceCode: Readonly<TSESLint.SourceCode>;
}>): null | string => {
    const argumentText = sourceCode.getText(argumentNode).trim();
    if (argumentText.length === 0) {
        return null;
    }

    if (argumentNode.type !== "SequenceExpression") {
        return argumentText;
    }

    if (argumentText.startsWith("(") && argumentText.endsWith(")")) {
        return argumentText;
    }

    return `(${argumentText})`;
};

/**
 * Create a fixer that safely replaces a target node with a resolved local
 * import alias.
 *
 * @param options - Inputs used to resolve replacement/import insertion safety.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueReferenceReplacementFix = ({
    context,
    importedName,
    imports,
    reportFixIntent = "autofix",
    sourceModuleName,
    targetNode,
}: Readonly<SafeValueReplacementFixParams>): null | TSESLint.ReportFixFunction => {
    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer, replacementName) =>
            replacementFixer.replaceText(targetNode, replacementName),
        valueReplacementPlan,
    });
};

/**
 * Create a fixer that safely rewrites a target node using custom replacement
 * text derived from a resolved helper local name.
 *
 * @param options - Inputs for safe helper-name resolution and replacement-text
 *   generation.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueNodeTextReplacementFix = ({
    context,
    importedName,
    imports,
    replacementTextFactory,
    reportFixIntent = "autofix",
    sourceModuleName,
    targetNode,
}: Readonly<SafeValueNodeTextReplacementFixParams>): null | TSESLint.ReportFixFunction => {
    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer, replacementName) =>
            replacementFixer.replaceText(
                targetNode,
                replacementTextFactory(replacementName)
            ),
        valueReplacementPlan,
    });
};

/**
 * Create a fixer that rewrites `receiver.method(args...)` to
 * `importedFn(receiver, args...)`.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createMethodToFunctionCallFix = ({
    callNode,
    context,
    importedName,
    imports,
    reportFixIntent = "autofix",
    sourceModuleName,
}: Readonly<MethodToFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    if (callNode.optional || callNode.callee.type !== "MemberExpression") {
        return null;
    }

    if (callNode.callee.optional) {
        return null;
    }

    if (callNode.callee.object.type === "Super") {
        return null;
    }

    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: callNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    const { sourceCode } = context;
    const receiverText = getFunctionCallArgumentText({
        argumentNode: callNode.callee.object,
        sourceCode,
    });
    if (receiverText === null) {
        return null;
    }

    const argumentTexts: string[] = [];

    for (const argument of callNode.arguments) {
        const argumentText = getFunctionCallArgumentText({
            argumentNode: argument,
            sourceCode,
        });

        if (argumentText === null) {
            return null;
        }

        argumentTexts.push(argumentText);
    }

    const argumentText = arrayJoin(argumentTexts, ", ");

    const replacementText =
        argumentText.length > 0
            ? `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${receiverText}, ${argumentText})`
            : `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer) =>
            replacementFixer.replaceText(callNode, replacementText),
        valueReplacementPlan,
    });
};

/**
 * Create a fixer that rewrites `receiver[member]` to `importedFn(receiver)`.
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createMemberToFunctionCallFix = ({
    context,
    importedName,
    imports,
    memberNode,
    reportFixIntent = "autofix",
    sourceModuleName,
}: Readonly<MemberToFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    if (memberNode.optional) {
        return null;
    }

    if (memberNode.object.type === "Super") {
        return null;
    }

    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: memberNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    const receiverText = getFunctionCallArgumentText({
        argumentNode: memberNode.object,
        sourceCode: context.sourceCode,
    });
    if (receiverText === null) {
        return null;
    }

    const replacementText = `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${receiverText})`;

    return createReportFixFromValueReplacementPlan({
        createReplacementFix: (replacementFixer) =>
            replacementFixer.replaceText(memberNode, replacementText),
        valueReplacementPlan,
    });
};

/**
 * Create a fixer that rewrites a target node to an imported helper invocation.
 *
 * @param options - Target/argument nodes and import metadata for call
 *
 * @returns A report fixer when safe; otherwise `null`.
 */
export const createSafeValueArgumentFunctionCallFix = ({
    argumentNode,
    autofixImportInsertionStrategy,
    context,
    importedName,
    imports,
    negated,
    reportFixIntent = "autofix",
    sourceModuleName,
    targetNode,
}: Readonly<ValueArgumentFunctionCallFixParams>): null | TSESLint.ReportFixFunction => {
    const valueReplacementPlan = createValueReplacementPlan({
        context,
        importedName,
        imports,
        referenceNode: targetNode,
        reportFixIntent,
        sourceModuleName,
    });

    if (valueReplacementPlan === null) {
        return null;
    }

    const argumentText = getFunctionCallArgumentText({
        argumentNode,
        sourceCode: context.sourceCode,
    });
    if (argumentText === null) {
        return null;
    }

    const callText = `${valueReplacementPlan.replacementNameAndImportFixFactory.replacementName}(${argumentText})`;
    const replacementText = negated === true ? `!${callText}` : callText;

    return createReportFixFromValueReplacementPlan({
        autofixImportInsertionStrategy,
        createReplacementFix: (replacementFixer) =>
            replacementFixer.replaceText(targetNode, replacementText),
        valueReplacementPlan,
    });
};
