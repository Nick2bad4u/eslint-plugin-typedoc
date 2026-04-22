import type { TSESLint } from "@typescript-eslint/utils";

import { arrayFirst, setHas } from "ts-extras";

import {
    buildDocCommentTagInsertion,
    getDocCommentAnchorNode,
    getDocCommentClosingLineStartIndex,
    getDocCommentTagNames,
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

type MessageIds = "addExampleTagSuggestion" | "missingExampleTag";
type Options = readonly [RequireCommentFileOptions?];

/** Rule implementation for requiring example-tag coverage on exported APIs. */
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

        const reportIfMissingExampleTag = (
            declaration: Readonly<DocumentableExportDeclaration>
        ): void => {
            const docAnchorNode = getDocCommentAnchorNode(declaration);
            const docComment = getLeadingDocComment(sourceCode, docAnchorNode);

            if (docComment === null) {
                return;
            }

            const tagNames = getDocCommentTagNames(sourceCode, docComment);

            if (setHas(tagNames, "example")) {
                return;
            }

            const declarationName = getDeclarationName(declaration);

            context.report({
                data: {
                    declarationName,
                },
                messageId: "missingExampleTag",
                node: declaration,
                suggest: [
                    {
                        fix: (fixer) => {
                            const insertionIndex =
                                getDocCommentClosingLineStartIndex(
                                    sourceCode,
                                    docComment
                                );

                            return fixer.insertTextBeforeRange(
                                [insertionIndex, insertionIndex],
                                buildDocCommentTagInsertion(
                                    docComment,
                                    [
                                        `@example Example usage for ${declarationName}.`,
                                    ],
                                    lineEnding
                                )
                            );
                        },
                        messageId: "addExampleTagSuggestion",
                    },
                ],
            });
        };

        return {
            ExportDefaultDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingExampleTag(declaration);
            },
            ExportNamedDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingExampleTag(declaration);
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require `@example` tags on documented exported declarations.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.markdown",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-example-tag",
        },
        hasSuggestions: true,
        messages: {
            addExampleTagSuggestion:
                "Add an `@example` tag with starter example text.",
            missingExampleTag:
                "Documented exported declaration '{{declarationName}}' should include an `@example` tag.",
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
        type: "suggestion",
    },
    name: "require-example-tag",
});

export default rule;
