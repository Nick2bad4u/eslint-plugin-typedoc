/**
 * @packageDocumentation
 * Require TypeDoc blocks for exported API declarations.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import { getLineBreak } from "../_internal/text-utils.js";

type MessageIds = "addDocTemplate" | "missingDocs";
type Options = [
    Readonly<{
        allowDefaultExportWithoutDocs?: boolean;
        ignorePrivateUnderscore?: boolean;
        includeTypes?: boolean;
        includeVariables?: boolean;
        summaryTemplate?: string;
    }>,
];

type SupportedDeclaration =
    | TSESTree.ClassDeclaration
    | TSESTree.FunctionDeclaration
    | TSESTree.TSEnumDeclaration
    | TSESTree.TSInterfaceDeclaration
    | TSESTree.TSTypeAliasDeclaration
    | TSESTree.VariableDeclaration;

const defaultOptions = [
    {
        allowDefaultExportWithoutDocs: false,
        ignorePrivateUnderscore: true,
        includeTypes: true,
        includeVariables: true,
        summaryTemplate: "TODO: Document {{name}}.",
    },
] satisfies Options;

const isDocComment = (comment: TSESTree.Comment): boolean =>
    comment.type === "Block" && comment.value.startsWith("*");

const getLeadingDocComment = (
    sourceCode: Readonly<TSESLint.SourceCode>,
    node: Readonly<TSESTree.Node>
): TSESTree.Comment | undefined => {
    const comments = sourceCode.getCommentsBefore(node);

    for (let index = comments.length - 1; index >= 0; index -= 1) {
        const comment = comments[index];

        if (comment === undefined) {
            continue;
        }

        if (isDocComment(comment)) {
            return comment;
        }
    }

    return undefined;
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

const getDeclarationName = (
    declaration: Readonly<SupportedDeclaration>
): string => {
    switch (declaration.type) {
        case "ClassDeclaration":
        case "FunctionDeclaration": {
            return declaration.id?.name ?? "default export";
        }

        case "TSEnumDeclaration":
        case "TSInterfaceDeclaration":
        case "TSTypeAliasDeclaration": {
            return declaration.id.name;
        }

        case "VariableDeclaration": {
            const firstDeclarator = declaration.declarations[0];

            if (firstDeclarator?.id.type === "Identifier") {
                return firstDeclarator.id.name;
            }

            return "exported value";
        }

        default: {
            return "exported API";
        }
    }
};

const shouldCheckDeclaration = (
    declaration: Readonly<SupportedDeclaration>,
    options: Readonly<{
        ignorePrivateUnderscore: boolean;
        includeTypes: boolean;
        includeVariables: boolean;
    }>
): boolean => {
    if (
        declaration.type === "VariableDeclaration" &&
        !options.includeVariables
    ) {
        return false;
    }

    if (
        (declaration.type === "TSInterfaceDeclaration" ||
            declaration.type === "TSTypeAliasDeclaration") &&
        !options.includeTypes
    ) {
        return false;
    }

    if (!options.ignorePrivateUnderscore) {
        return true;
    }

    return !getDeclarationName(declaration).startsWith("_");
};

const createTemplateDocComment = (
    sourceText: string,
    summaryLine: string
): string => {
    const lineBreak = getLineBreak(sourceText);

    return [
        "/**",
        ` * ${summaryLine}`,
        " */",
        "",
    ].join(lineBreak);
};

const requireExportDocsRule: TSESLint.RuleModule<MessageIds, Options> = {
    create(context) {
        const [options = defaultOptions[0]] = context.options;
        const sourceCode = context.sourceCode;

        const includeVariables = options.includeVariables ?? true;
        const includeTypes = options.includeTypes ?? true;
        const ignorePrivateUnderscore = options.ignorePrivateUnderscore ?? true;
        const allowDefaultExportWithoutDocs =
            options.allowDefaultExportWithoutDocs ?? false;
        const summaryTemplate =
            options.summaryTemplate ?? "TODO: Document {{name}}.";

        const inspectExportDeclaration = (
            exportNode: Readonly<
                | TSESTree.ExportDefaultDeclaration
                | TSESTree.ExportNamedDeclaration
            >
        ): void => {
            const declaration = exportNode.declaration;

            if (declaration === null || !isSupportedDeclaration(declaration)) {
                return;
            }

            if (
                exportNode.type === "ExportDefaultDeclaration" &&
                allowDefaultExportWithoutDocs
            ) {
                return;
            }

            if (
                !shouldCheckDeclaration(declaration, {
                    ignorePrivateUnderscore,
                    includeTypes,
                    includeVariables,
                })
            ) {
                return;
            }

            const docComment = getLeadingDocComment(sourceCode, exportNode);

            if (docComment !== undefined) {
                return;
            }

            const declarationName = getDeclarationName(declaration);
            const summaryLine = summaryTemplate.replaceAll(
                "{{name}}",
                declarationName
            );

            context.report({
                data: {
                    declarationName,
                },
                messageId: "missingDocs",
                node: declaration,
                suggest: [
                    {
                        data: {
                            declarationName,
                        },
                        fix: (fixer) =>
                            fixer.insertTextBeforeRange(
                                [exportNode.range[0], exportNode.range[0]],
                                createTemplateDocComment(
                                    sourceCode.text,
                                    summaryLine
                                )
                            ),
                        messageId: "addDocTemplate",
                    },
                ],
            });
        };

        return {
            ExportDefaultDeclaration: inspectExportDeclaration,
            ExportNamedDeclaration: inspectExportDeclaration,
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "Require TypeDoc comments on exported declarations to prevent undocumented public APIs.",
            url: createRuleDocsUrl("require-export-docs"),
        },
        hasSuggestions: true,
        messages: {
            addDocTemplate:
                "Insert a starter TypeDoc block above '{{declarationName}}'.",
            missingDocs:
                "Exported declaration '{{declarationName}}' is missing a TypeDoc comment.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    allowDefaultExportWithoutDocs: {
                        type: "boolean",
                    },
                    ignorePrivateUnderscore: {
                        type: "boolean",
                    },
                    includeTypes: {
                        type: "boolean",
                    },
                    includeVariables: {
                        type: "boolean",
                    },
                    summaryTemplate: {
                        type: "string",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
};

export default requireExportDocsRule;
