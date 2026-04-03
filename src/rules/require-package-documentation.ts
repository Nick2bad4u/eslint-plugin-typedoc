import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import { getPreferredLineEnding } from "../_internal/doc-comments.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingPackageDocumentation";
type Options = readonly [];

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
    const firstStatement = program.body[0];
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
                    fix: (fixer) => {
                        const insertionIndex = program.body[0]?.range[0] ?? 0;
                        const packageDocumentationComment = [
                            "/**",
                            " * @packageDocumentation",
                            " */",
                            "",
                        ].join(lineEnding);

                        return fixer.insertTextBeforeRange(
                            [insertionIndex, insertionIndex],
                            packageDocumentationComment
                        );
                    },
                    messageId: "missingPackageDocumentation",
                    node: program,
                });
            },
        };
    },
    meta: {
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
        fixable: "code",
        messages: {
            missingPackageDocumentation:
                "Modules that export API should include a top-level `@packageDocumentation` comment.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "require-package-documentation",
});

export default rule;
