import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst } from "ts-extras";

import { normalizeDocCommentLines } from "../_internal/doc-comments.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingPackageDocumentationDescription";
type Options = readonly [RequireCommentFileOptions?];

const packageDocumentationSearchPattern = /@(?:module|packageDocumentation)\b/u;
const isExportStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): boolean =>
    statement.type === AST_NODE_TYPES.ExportAllDeclaration ||
    statement.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    statement.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    statement.type === AST_NODE_TYPES.TSExportAssignment ||
    statement.type === AST_NODE_TYPES.TSNamespaceExportDeclaration;

const getPackageDocumentationComment = (
    sourceCode: TSESLint.SourceCode,
    program: TSESTree.Program
): null | TSESTree.Comment => {
    const firstStatement = arrayFirst(program.body);
    const candidateComments =
        firstStatement === undefined
            ? sourceCode.getAllComments()
            : sourceCode.getCommentsBefore(firstStatement);

    for (const comment of candidateComments) {
        if (
            comment.type === "Block" &&
            comment.value.startsWith("*") &&
            packageDocumentationSearchPattern.test(comment.value)
        ) {
            return comment;
        }
    }

    return null;
};

const hasMeaningfulPackageDocumentationDescription = (
    comment: Readonly<TSESTree.Comment>
): boolean => {
    const remainingLines = normalizeDocCommentLines(comment)
        .map((line) => line.trim())
        .filter(
            (line) =>
                line.length > 0 && !packageDocumentationSearchPattern.test(line)
        );

    return remainingLines.length > 0;
};

/** Rule implementation for package-documentation description requirements. */
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

        return {
            Program(program): void {
                if (
                    !program.body.some((statement) =>
                        isExportStatement(statement)
                    )
                ) {
                    return;
                }

                const packageDocumentationComment =
                    getPackageDocumentationComment(sourceCode, program);

                if (packageDocumentationComment === null) {
                    return;
                }

                if (
                    hasMeaningfulPackageDocumentationDescription(
                        packageDocumentationComment
                    )
                ) {
                    return;
                }

                context.report({
                    messageId: "missingPackageDocumentationDescription",
                    node: program,
                });
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require top-level `@packageDocumentation` comments to include descriptive prose.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.markdown",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation-description",
        },
        messages: {
            missingPackageDocumentationDescription:
                "`@packageDocumentation` comments must include a module-level description.",
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
    name: "require-package-documentation-description",
});

export default rule;
