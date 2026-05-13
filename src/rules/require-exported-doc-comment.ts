import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayFirst, arrayJoin } from "ts-extras";

import {
    getDocCommentAnchorNode,
    getLeadingDocComment,
    getPreferredLineEnding,
} from "../_internal/doc-comments.js";
import {
    type DocumentableExportDeclaration,
    getDeclarationName,
    isDocumentableExportDeclaration,
} from "../_internal/exported-declarations.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "addDocCommentSuggestion" | "missingDocComment";
type Options = readonly [RequireCommentFileOptions?];

const createDocCommentText = (
    declarationName: string,
    indentation: string,
    lineEnding: "\n" | "\r\n"
): string =>
    arrayJoin(
        [
            `${indentation}/**`,
            `${indentation} * ${declarationName} API documentation.`,
            `${indentation} */`,
            "",
        ],
        lineEnding
    );

/** Rule implementation for exported declaration documentation coverage. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        if (
            shouldIgnoreRequireCommentFile(
                context.filename,
                arrayFirst(context.options)
            )
        ) {
            return {};
        }

        const sourceCode = context.sourceCode;
        const lineEnding = getPreferredLineEnding(sourceCode);

        const reportIfMissingDocComment = (
            declaration: Readonly<DocumentableExportDeclaration>
        ): void => {
            const docAnchorNode = getDocCommentAnchorNode(declaration);

            if (getLeadingDocComment(sourceCode, docAnchorNode) !== null) {
                return;
            }

            const declarationName = getDeclarationName(declaration);

            context.report({
                data: {
                    declarationName,
                },
                messageId: "missingDocComment",
                node: declaration,
                suggest: [
                    {
                        fix: (fixer) => {
                            const indentation = " ".repeat(
                                docAnchorNode.loc.start.column
                            );
                            const docComment = createDocCommentText(
                                declarationName,
                                indentation,
                                lineEnding
                            );

                            return fixer.insertTextBefore(
                                docAnchorNode,
                                docComment
                            );
                        },
                        messageId: "addDocCommentSuggestion",
                    },
                ],
            });
        };

        return {
            ExportDefaultDeclaration(
                node: Readonly<TSESTree.ExportDefaultDeclaration>
            ): void {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDocComment(declaration);
            },
            ExportNamedDeclaration(
                node: Readonly<TSESTree.ExportNamedDeclaration>
            ): void {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDocComment(declaration);
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require a leading TypeDoc block comment for exported declarations.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.markdown",
                "typedoc.configs.minimal",
                "typedoc.configs.recommended",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment",
        },
        hasSuggestions: true,
        messages: {
            addDocCommentSuggestion:
                "Add a documentation comment stub for this export.",
            missingDocComment:
                "Exported declaration '{{declarationName}}' must have a leading TypeDoc comment.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    ...requireCommentFileOptionsSchemaProperties,
                },
                type: "object",
            },
        ],
        type: "problem",
    },
    name: "require-exported-doc-comment",
});

export default rule;
