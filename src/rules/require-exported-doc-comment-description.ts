import type { TSESLint } from "@typescript-eslint/utils";

import { hasMeaningfulDocCommentSummary } from "../_internal/doc-comment-summary.js";
import {
    getDocCommentAnchorNode,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import {
    type DocumentableExportDeclaration,
    getDeclarationName,
    isDocumentableExportDeclaration,
} from "../_internal/exported-declarations.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingExportedDocCommentDescription";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

/** Rule implementation for exported declaration summary requirements. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        const reportIfMissingDescription = (
            declaration: Readonly<DocumentableExportDeclaration>
        ): void => {
            const docAnchorNode = getDocCommentAnchorNode(declaration);
            const docComment = getLeadingDocComment(sourceCode, docAnchorNode);

            if (docComment === null) {
                return;
            }

            if (hasMeaningfulDocCommentSummary(docComment)) {
                return;
            }

            context.report({
                data: {
                    declarationName: getDeclarationName(declaration),
                },
                messageId: "missingExportedDocCommentDescription",
                node: declaration,
            });
        };

        return {
            ExportDefaultDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDescription(declaration);
            },
            ExportNamedDeclaration: (node): void => {
                const declaration = node.declaration;

                if (!isDocumentableExportDeclaration(declaration)) {
                    return;
                }

                reportIfMissingDescription(declaration);
            },
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "require documented exported declarations to start with a meaningful summary paragraph before block tags.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.recommended",
                "typedoc.configs.markdown",
                "typedoc.configs.strict",
                "typedoc.configs.all",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-exported-doc-comment-description",
        },
        messages: {
            missingExportedDocCommentDescription:
                "Documented exported declaration '{{declarationName}}' must include a summary paragraph before TypeDoc block tags.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-exported-doc-comment-description",
});

export default rule;
