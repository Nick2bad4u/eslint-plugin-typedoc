/**
 * @packageDocumentation
 * Shared utilities for safely inserting import declarations in fixer output.
 */
import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import parser from "@typescript-eslint/parser";
import { arrayAt, isInteger } from "ts-extras";

import { getProgramNode } from "./ast-node.js";
import { getBoundedCacheValue, setBoundedCacheValue } from "./bounded-cache.js";
import { safeTypeOperation } from "./safe-type-operation.js";
import { isKnownWhitespaceCharacter } from "./text-character.js";

/**
 * Cached insertion-layout metadata for one Program node.
 */
type ProgramInsertionLayout = Readonly<{
    firstRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration>;
    firstStatementStart: null | number;
    importDeclarations: readonly Readonly<TSESTree.ImportDeclaration>[];
    lastDirectiveStatement: null | Readonly<TSESTree.ExpressionStatement>;
    lastImportDeclaration: null | Readonly<TSESTree.ImportDeclaration>;
    lastNonRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration>;
    programEnd: null | number;
}>;

/**
 * Program-scoped insertion-layout cache reused across repeated fixer planning.
 */
const programInsertionLayoutCache = new WeakMap<
    Readonly<TSESTree.Program>,
    ProgramInsertionLayout
>();

const IMPORT_KEYWORD = "import" as const;

/**
 * Upper bound for import-text snippets parsed to recover module specifiers.
 *
 * @remarks
 * Fix suggestions can include large synthetic text. Capping parser input keeps
 * this helper predictable on pathological inputs.
 */
const MAX_IMPORT_DECLARATION_TEXT_PARSE_LENGTH = 2048 as const;

const skipLeadingWhitespace = ({
    startIndex,
    text,
}: Readonly<{
    startIndex: number;
    text: string;
}>): number => {
    let index = startIndex;

    while (
        index < text.length &&
        isKnownWhitespaceCharacter(text[index] ?? "")
    ) {
        index += 1;
    }

    return index;
};

const MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES = 256 as const;

const parsedModuleSpecifierByImportText = new Map<string, null | string>();

const isTrailingImportText = (text: string): boolean => {
    const trailingText = text.trim();

    return trailingText === "" || trailingText === ";";
};

const parseModuleSpecifierFromImportDeclarationText = (
    importDeclarationText: string
): null | string => {
    const parsedResult = safeTypeOperation({
        operation: () =>
            parser.parseForESLint(importDeclarationText, {
                ecmaVersion: "latest",
                loc: false,
                range: false,
                sourceType: "module",
            }),
        reason: "import-insertion-module-specifier-parse-failed",
    });

    if (!parsedResult.ok) {
        return null;
    }

    const [firstStatement] = parsedResult.value.ast.body;

    if (
        parsedResult.value.ast.body.length !== 1 ||
        firstStatement?.type !== "ImportDeclaration"
    ) {
        return null;
    }

    const moduleSpecifier = firstStatement.source.value;

    return typeof moduleSpecifier === "string" ? moduleSpecifier : null;
};

/**
 * Extract the module specifier from an import declaration text snippet.
 */
const getModuleSpecifierFromImportDeclarationText = (
    importDeclarationText: string
): null | string => {
    const trimmedImportText = importDeclarationText.trim();

    if (trimmedImportText.length > MAX_IMPORT_DECLARATION_TEXT_PARSE_LENGTH) {
        setBoundedCacheValue({
            cache: parsedModuleSpecifierByImportText,
            key: trimmedImportText,
            maxEntries: MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES,
            value: null,
        });

        return null;
    }

    const cachedModuleSpecifierLookup = getBoundedCacheValue(
        parsedModuleSpecifierByImportText,
        trimmedImportText
    );

    if (cachedModuleSpecifierLookup.found) {
        return cachedModuleSpecifierLookup.value ?? null;
    }

    if (!trimmedImportText.startsWith(IMPORT_KEYWORD)) {
        setBoundedCacheValue({
            cache: parsedModuleSpecifierByImportText,
            key: trimmedImportText,
            maxEntries: MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES,
            value: null,
        });

        return null;
    }

    const importClauseStart = skipLeadingWhitespace({
        startIndex: IMPORT_KEYWORD.length,
        text: trimmedImportText,
    });

    if (importClauseStart >= trimmedImportText.length) {
        setBoundedCacheValue({
            cache: parsedModuleSpecifierByImportText,
            key: trimmedImportText,
            maxEntries: MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES,
            value: null,
        });

        return null;
    }

    const moduleSpecifier =
        parseModuleSpecifierFromImportDeclarationText(trimmedImportText);

    if (moduleSpecifier !== null) {
        setBoundedCacheValue({
            cache: parsedModuleSpecifierByImportText,
            key: trimmedImportText,
            maxEntries: MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES,
            value: moduleSpecifier,
        });

        return moduleSpecifier;
    }

    const semicolonIndex = trimmedImportText.lastIndexOf(";");
    const trailingImportText =
        semicolonIndex === -1
            ? ""
            : trimmedImportText.slice(semicolonIndex + 1);

    if (!isTrailingImportText(trailingImportText)) {
        setBoundedCacheValue({
            cache: parsedModuleSpecifierByImportText,
            key: trimmedImportText,
            maxEntries: MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES,
            value: null,
        });

        return null;
    }

    setBoundedCacheValue({
        cache: parsedModuleSpecifierByImportText,
        key: trimmedImportText,
        maxEntries: MAX_PARSED_MODULE_SPECIFIER_CACHE_ENTRIES,
        value: null,
    });

    return null;
};

/**
 * Determine whether a module specifier is relative (`./` or `../`) or rooted.
 */
const isRelativeModuleSpecifier = (moduleSpecifier: string): boolean =>
    moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("/");

/**
 * Read a string-valued module specifier from an import declaration node.
 */
const getImportDeclarationModuleSpecifier = (
    importDeclaration: Readonly<TSESTree.ImportDeclaration>
): null | string => {
    const sourceValue = importDeclaration.source.value;

    return typeof sourceValue === "string" ? sourceValue : null;
};

/**
 * Check whether a Program statement is part of the directive prologue (for
 * example, `"use strict"`).
 */
const isDirectiveExpressionStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): statement is TSESTree.ExpressionStatement & { directive: string } =>
    statement.type === "ExpressionStatement" &&
    typeof statement.directive === "string";

/**
 * Read and validate a node range tuple.
 *
 * @param node - Node whose range should be extracted.
 *
 * @returns `[start, end]` tuple when available and valid; otherwise `null`.
 */
const getNodeRange = (
    node: Readonly<TSESTree.Node>
): null | readonly [number, number] => {
    const nodeRange = node.range;

    if (!Array.isArray(nodeRange)) {
        return null;
    }

    const [start, end] = nodeRange;

    if (!isInteger(start) || !isInteger(end)) {
        return null;
    }

    if (start < 0 || end < start) {
        return null;
    }

    return [start, end];
};

/**
 * Read the numeric start offset from an ESTree node range tuple.
 *
 * @param node - Node whose start offset should be extracted.
 *
 * @returns Numeric start offset when available; otherwise `null`.
 */
const getNodeRangeStart = (node: Readonly<TSESTree.Node>): null | number => {
    const nodeRange = getNodeRange(node);
    if (nodeRange === null) {
        return null;
    }

    return arrayAt(nodeRange, 0) ?? null;
};

/**
 * Read and validate the Program end offset from its range tuple.
 *
 * @param programNode - Program node whose range end should be read.
 *
 * @returns Valid end offset when available; otherwise `null`.
 */
const getProgramRangeEnd = (
    programNode: Readonly<TSESTree.Program>
): null | number => {
    const programRange = getNodeRange(programNode);

    return programRange?.[1] ?? null;
};

/**
 * Build and cache insertion-layout metadata for one Program.
 */
const getProgramInsertionLayout = (
    programNode: Readonly<TSESTree.Program>
): ProgramInsertionLayout => {
    const existingLayout = programInsertionLayoutCache.get(programNode);
    if (existingLayout) {
        return existingLayout;
    }

    const importDeclarations: TSESTree.ImportDeclaration[] = [];
    let firstRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration> =
        null;
    let lastNonRelativeImportDeclaration: null | Readonly<TSESTree.ImportDeclaration> =
        null;
    let lastDirectiveStatement: null | Readonly<TSESTree.ExpressionStatement> =
        null;
    let inDirectivePrologue = true;

    for (const statement of programNode.body) {
        if (inDirectivePrologue && isDirectiveExpressionStatement(statement)) {
            lastDirectiveStatement = statement;
        } else {
            inDirectivePrologue = false;
        }

        if (statement.type !== "ImportDeclaration") {
            continue;
        }

        importDeclarations.push(statement);

        const existingModuleSpecifier =
            getImportDeclarationModuleSpecifier(statement);

        if (
            typeof existingModuleSpecifier === "string" &&
            isRelativeModuleSpecifier(existingModuleSpecifier)
        ) {
            firstRelativeImportDeclaration ??= statement;

            continue;
        }

        lastNonRelativeImportDeclaration = statement;
    }

    const [firstStatement] = programNode.body;

    const layout: ProgramInsertionLayout = Object.freeze({
        firstRelativeImportDeclaration,
        firstStatementStart:
            firstStatement === undefined
                ? null
                : getNodeRangeStart(firstStatement),
        importDeclarations: Object.freeze(importDeclarations),
        lastDirectiveStatement,
        lastImportDeclaration: arrayAt(importDeclarations, -1) ?? null,
        lastNonRelativeImportDeclaration,
        programEnd: getProgramRangeEnd(programNode),
    });

    programInsertionLayoutCache.set(programNode, layout);

    return layout;
};

/**
 * Create a fixer that inserts an import declaration in a safe location: after
 * existing imports, after directive prologue, before first statement, or at
 * file end for empty programs.
 *
 * @param options - Fix-planning options.
 *
 *   - `fixer`: Rule fixer from ESLint.
 *   - `referenceNode`: Node used to discover the enclosing Program.
 *   - `importDeclarationText`: Full import declaration text to insert.
 *   - `moduleSpecifierHint`: Optional known module specifier that skips import-text
 *       parsing when provided.
 *
 * @returns Rule fix when insertion is possible; otherwise `null`.
 */
export const createImportInsertionFix = (
    options: Readonly<{
        fixer: TSESLint.RuleFixer;
        importDeclarationText: string;
        moduleSpecifierHint?: string;
        referenceNode: Readonly<TSESTree.Node>;
    }>
): null | TSESLint.RuleFix => {
    const { fixer, importDeclarationText, moduleSpecifierHint, referenceNode } =
        options;

    const normalizedImportDeclarationText = importDeclarationText.trim();
    if (normalizedImportDeclarationText.length === 0) {
        return null;
    }

    const programNode = getProgramNode(referenceNode);
    if (!programNode) {
        return null;
    }

    const insertionLayout = getProgramInsertionLayout(programNode);

    if (insertionLayout.importDeclarations.length > 0) {
        const moduleSpecifier =
            moduleSpecifierHint ??
            getModuleSpecifierFromImportDeclarationText(
                normalizedImportDeclarationText
            );

        if (
            typeof moduleSpecifier === "string" &&
            !isRelativeModuleSpecifier(moduleSpecifier)
        ) {
            if (insertionLayout.lastNonRelativeImportDeclaration !== null) {
                return fixer.insertTextAfter(
                    insertionLayout.lastNonRelativeImportDeclaration,
                    `\n${normalizedImportDeclarationText}`
                );
            }

            if (insertionLayout.firstRelativeImportDeclaration !== null) {
                const firstRelativeImportStart = getNodeRangeStart(
                    insertionLayout.firstRelativeImportDeclaration
                );

                if (firstRelativeImportStart !== null) {
                    return fixer.insertTextBeforeRange(
                        [firstRelativeImportStart, firstRelativeImportStart],
                        `${normalizedImportDeclarationText}\n`
                    );
                }
            }
        }
    }

    if (insertionLayout.lastImportDeclaration !== null) {
        return fixer.insertTextAfter(
            insertionLayout.lastImportDeclaration,
            `\n${normalizedImportDeclarationText}`
        );
    }

    if (insertionLayout.lastDirectiveStatement !== null) {
        return fixer.insertTextAfter(
            insertionLayout.lastDirectiveStatement,
            `\n${normalizedImportDeclarationText}`
        );
    }

    if (insertionLayout.firstStatementStart !== null) {
        return fixer.insertTextBeforeRange(
            [
                insertionLayout.firstStatementStart,
                insertionLayout.firstStatementStart,
            ],
            `${normalizedImportDeclarationText}\n`
        );
    }

    if (insertionLayout.programEnd === null) {
        return null;
    }

    return fixer.insertTextBeforeRange(
        [insertionLayout.programEnd, insertionLayout.programEnd],
        `${insertionLayout.programEnd === 0 ? "" : "\n"}${normalizedImportDeclarationText}\n`
    );
};
