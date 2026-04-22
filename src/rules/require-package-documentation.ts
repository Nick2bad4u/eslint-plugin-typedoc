import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayFirst, arrayJoin } from "ts-extras";

import { getPreferredLineEnding } from "../_internal/doc-comments.js";
import {
    type RequireCommentFileOptions,
    requireCommentFileOptionsSchemaProperties,
    shouldIgnoreRequireCommentFile,
} from "../_internal/require-comment-file-options.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds =
    | "addPackageDocumentationSuggestion"
    | "missingPackageDocumentation";
type Options = readonly [RequireCommentFileOptions?];

const packageDocumentationTagPattern = /@(?:module|packageDocumentation)\b/u;
const isExportStatement = (
    statement: Readonly<TSESTree.ProgramStatement>
): boolean =>
    statement.type === AST_NODE_TYPES.ExportAllDeclaration ||
    statement.type === AST_NODE_TYPES.ExportDefaultDeclaration ||
    statement.type === AST_NODE_TYPES.ExportNamedDeclaration ||
    statement.type === AST_NODE_TYPES.TSExportAssignment ||
    statement.type === AST_NODE_TYPES.TSNamespaceExportDeclaration;

const hasPackageDocumentationComment = (
    sourceCode: TSESLint.SourceCode,
    program: TSESTree.Program
): boolean => {
    const firstStatement = arrayFirst(program.body);
    const candidateComments =
        firstStatement === undefined
            ? sourceCode.getAllComments()
            : sourceCode.getCommentsBefore(firstStatement);

    return candidateComments.some(
        (comment) =>
            comment.type === "Block" &&
            comment.value.startsWith("*") &&
            packageDocumentationTagPattern.test(comment.value)
    );
};

/**
 * Rule implementation for requiring package-documentation coverage on exporting
 * modules.
 */
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

        return {
            Program(program): void {
                if (
                    !program.body.some((statement) =>
                        isExportStatement(statement)
                    )
                ) {
                    return;
                }

                if (hasPackageDocumentationComment(sourceCode, program)) {
                    return;
                }

                context.report({
                    messageId: "missingPackageDocumentation",
                    node: program,
                    suggest: [
                        {
                            fix: (fixer) => {
                                const [insertionIndex = 0] =
                                    arrayFirst(program.body)?.range ?? [];
                                const packageDocumentationComment = arrayJoin(
                                    [
                                        "/**",
                                        " * @packageDocumentation",
                                        " */",
                                        "",
                                    ],
                                    lineEnding
                                );

                                return fixer.insertTextBeforeRange(
                                    [insertionIndex, insertionIndex],
                                    packageDocumentationComment
                                );
                            },
                            messageId: "addPackageDocumentationSuggestion",
                        },
                    ],
                });
            },
        };
    },
    meta: {
        defaultOptions: [{}],
        deprecated: false,
        docs: {
            description:
                "require top-level `@packageDocumentation` comments in modules that export API.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: [
                "typedoc.configs.all",
                "typedoc.configs.markdown",
                "typedoc.configs.strict",
            ],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-package-documentation",
        },
        hasSuggestions: true,
        messages: {
            addPackageDocumentationSuggestion:
                "Add a top-level `@packageDocumentation` comment block.",
            missingPackageDocumentation:
                "Modules that export API should include a top-level `@packageDocumentation` comment.",
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
    name: "require-package-documentation",
});

export default rule;
