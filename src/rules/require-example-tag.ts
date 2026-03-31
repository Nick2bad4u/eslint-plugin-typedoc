import type { TSESLint } from "@typescript-eslint/utils";

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
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingExampleTag";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for requiring example-tag coverage on exported APIs. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
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

            if (tagNames.has("example")) {
                return;
            }

            const declarationName = getDeclarationName(declaration);

            context.report({
                data: {
                    declarationName,
                },
                fix: (fixer) => {
                    const insertionIndex = getDocCommentClosingLineStartIndex(
                        sourceCode,
                        docComment
                    );

                    return fixer.insertTextBeforeRange(
                        [insertionIndex, insertionIndex],
                        buildDocCommentTagInsertion(
                            docComment,
                            [
                                `@example TODO add usage example for ${declarationName}.`,
                            ],
                            lineEnding
                        )
                    );
                },
                messageId: "missingExampleTag",
                node: declaration,
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
    defaultOptions,
    meta: {
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
        fixable: "code",
        messages: {
            missingExampleTag:
                "Documented exported declaration '{{declarationName}}' should include an `@example` tag.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "require-example-tag",
});

export default rule;
