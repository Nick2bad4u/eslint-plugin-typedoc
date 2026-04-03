import type { TSESLint } from "@typescript-eslint/utils";

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
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingDocComment";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

const createDocCommentText = (
    declarationName: string,
    indentation: string,
    lineEnding: "\n" | "\r\n"
): string =>
    [
        `${indentation}/**`,
        `${indentation} * TODO: Document ${declarationName}.`,
        `${indentation} */`,
        "",
    ].join(lineEnding);

/** Rule implementation for exported declaration documentation coverage. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
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
                fix: (fixer) => {
                    const indentation = " ".repeat(
                        docAnchorNode.loc?.start.column ?? 0
                    );
                    const docComment = createDocCommentText(
                        declarationName,
                        indentation,
                        lineEnding
                    );

                    return fixer.insertTextBefore(docAnchorNode, docComment);
                },
                messageId: "missingDocComment",
                node: declaration,
            });
        };

        return {
            ExportDefaultDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDocComment(declaration);
            },
            ExportNamedDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDocComment(declaration);
            },
        };
    },
    defaultOptions,
    meta: {
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
        fixable: "code",
        messages: {
            missingDocComment:
                "Exported declaration '{{declarationName}}' must have a leading TypeDoc comment.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-exported-doc-comment",
});

export default rule;
