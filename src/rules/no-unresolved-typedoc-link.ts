/**
 * @packageDocumentation
 * Detect unresolved inline `{@link ...}` targets in TypeDoc comments.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

type MessageIds = "convertLinkToText" | "unresolvedLink";
type Options = [];

type SupportedDeclaration =
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.VariableDeclaration;

const linkTagPattern = /\{@link\s+([^}\s|]+)(?:\s*\|\s*([^}]+))?\s*\}/gu;

const isDocComment = (comment: TSESTree.Comment): boolean =>
    comment.type === "Block" && comment.value.startsWith("*");

const isExternalLinkTarget = (linkTarget: string): boolean =>
    /^(?:https?:|#|\.{1,2}\/|\/)/u.test(linkTarget) || linkTarget.includes(":");

const addNameToSet = (
    nameSet: Set<string>,
    node: Readonly<TSESTree.Identifier> | null | undefined
): void => {
    if (node === null || node === undefined) {
        return;
    }

    nameSet.add(node.name);
};

const isSupportedDeclaration = (
    node: Readonly<TSESTree.Node>
): node is SupportedDeclaration =>
    node.type === "ClassDeclaration" ||
    node.type === "FunctionDeclaration" ||
    node.type === "TSEnumDeclaration" ||
    node.type === "TSInterfaceDeclaration" ||
    node.type === "TSTypeAliasDeclaration" ||
    node.type === "VariableDeclaration";

const addVariableDeclarationNames = (
    nameSet: Set<string>,
    declaration: Readonly<TSESTree.VariableDeclaration>
): void => {
    for (const variableDeclarator of declaration.declarations) {
        if (variableDeclarator.id.type !== "Identifier") {
            continue;
        }

        nameSet.add(variableDeclarator.id.name);
    }
};

const addDeclaredNamesFromDeclaration = (
    nameSet: Set<string>,
    declaration: Readonly<SupportedDeclaration>
): void => {
    switch (declaration.type) {
        case "ClassDeclaration": {
            addNameToSet(nameSet, declaration.id);
            return;
        }

        case "FunctionDeclaration": {
            addNameToSet(nameSet, declaration.id);
            return;
        }

        case "TSEnumDeclaration":
        case "TSInterfaceDeclaration":
        case "TSTypeAliasDeclaration": {
            nameSet.add(declaration.id.name);
            return;
        }

        case "VariableDeclaration": {
            addVariableDeclarationNames(nameSet, declaration);
            return;
        }

        default: {
            return;
        }
    }
};

const collectDeclaredNames = (
    programNode: Readonly<TSESTree.Program>
): ReadonlySet<string> => {
    const declaredNames = new Set<string>();

    for (const statement of programNode.body) {
        switch (statement.type) {
            case "ClassDeclaration":
            case "FunctionDeclaration":
            case "TSEnumDeclaration":
            case "TSInterfaceDeclaration":
            case "TSTypeAliasDeclaration":
            case "VariableDeclaration": {
                addDeclaredNamesFromDeclaration(declaredNames, statement);
                break;
            }

            case "ExportDefaultDeclaration":
            case "ExportNamedDeclaration": {
                if (
                    statement.declaration !== null &&
                    isSupportedDeclaration(statement.declaration)
                ) {
                    addDeclaredNamesFromDeclaration(
                        declaredNames,
                        statement.declaration
                    );
                }

                if (statement.type === "ExportNamedDeclaration") {
                    for (const specifier of statement.specifiers) {
                        if (specifier.type !== "ExportSpecifier") {
                            continue;
                        }

                        if (specifier.local.type === "Identifier") {
                            declaredNames.add(specifier.local.name);
                        }

                        if (specifier.exported.type === "Identifier") {
                            declaredNames.add(specifier.exported.name);
                        }
                    }
                }

                break;
            }

            case "ImportDeclaration": {
                for (const specifier of statement.specifiers) {
                    declaredNames.add(specifier.local.name);
                }

                break;
            }

            default: {
                break;
            }
        }
    }

    return declaredNames;
};

const toPrimarySymbolName = (linkTarget: string): string =>
    linkTarget.split(/[.#]/u)[0] ?? "";

const noUnresolvedTypedocLinkRule: TSESLint.RuleModule<MessageIds, Options> = {
    create(context) {
        const sourceCode = context.sourceCode;

        return {
            Program(programNode) {
                const declaredNames = collectDeclaredNames(programNode);

                for (const comment of sourceCode.getAllComments()) {
                    if (!isDocComment(comment)) {
                        continue;
                    }

                    for (const match of comment.value.matchAll(
                        linkTagPattern
                    )) {
                        const fullLinkMarkup = match[0];
                        const linkTarget = match[1];

                        if (typeof linkTarget !== "string") {
                            continue;
                        }

                        const normalizedTarget = linkTarget.trim();

                        if (isExternalLinkTarget(normalizedTarget)) {
                            continue;
                        }

                        const primarySymbol =
                            toPrimarySymbolName(normalizedTarget);

                        if (
                            primarySymbol.length === 0 ||
                            declaredNames.has(primarySymbol)
                        ) {
                            continue;
                        }

                        const tagOffset = match.index;

                        if (tagOffset === undefined) {
                            continue;
                        }

                        const tagStart = comment.range[0] + 2 + tagOffset;
                        const tagEnd = tagStart + fullLinkMarkup.length;
                        const textReplacement =
                            typeof match[2] === "string" &&
                            match[2].trim().length > 0
                                ? match[2].trim()
                                : normalizedTarget;

                        context.report({
                            data: {
                                target: normalizedTarget,
                            },
                            loc: {
                                end: sourceCode.getLocFromIndex(tagEnd),
                                start: sourceCode.getLocFromIndex(tagStart),
                            },
                            messageId: "unresolvedLink",
                            suggest: [
                                {
                                    data: {
                                        replacement: textReplacement,
                                    },
                                    fix: (fixer) =>
                                        fixer.replaceTextRange(
                                            [tagStart, tagEnd],
                                            textReplacement
                                        ),
                                    messageId: "convertLinkToText",
                                },
                            ],
                        });
                    }
                }
            },
        };
    },
    defaultOptions: [],
    meta: {
        docs: {
            description:
                "Disallow unresolved inline TypeDoc {@link ...} references in source comments.",
            url: createRuleDocsUrl("no-unresolved-typedoc-link"),
        },
        hasSuggestions: true,
        messages: {
            convertLinkToText:
                "Replace unresolved link with plain text '{{replacement}}'.",
            unresolvedLink:
                "Cannot resolve TypeDoc link target '{{target}}' in this module.",
        },
        schema: [],
        type: "problem",
    },
};

export default noUnresolvedTypedocLinkRule;
