import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";

import {
    getDocCommentAnchorNode,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import {
    getDocCommentTagBlocks,
    hasMeaningfulTagDescription,
} from "../_internal/doc-tag-blocks.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingParamTagDescription";
type Options = readonly [];

const paramTagPayloadPattern = /^\s+(\.\.\.)?(\S+)(.*)$/u;
const defaultOptions = [] as const satisfies Options;

const normalizeParamTagName = (rawName: string): string => {
    const bracketTrimmed = rawName.replace(/^\[/u, "").replace(/\]$/u, "");
    const equalsSignOffset = bracketTrimmed.indexOf("=");

    return equalsSignOffset === -1
        ? bracketTrimmed
        : bracketTrimmed.slice(0, equalsSignOffset);
};

/** Rule implementation for requiring @param tag descriptions. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const sourceCode = context.sourceCode;

        const checkNode = (
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node
        ): void => {
            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            const missingDescriptions: string[] = [];

            for (const block of getDocCommentTagBlocks(docComment)) {
                if (block.tagName !== "param") {
                    continue;
                }

                const payloadMatch = paramTagPayloadPattern.exec(block.tagText);

                if (payloadMatch === null) {
                    continue;
                }

                const isRestParam = payloadMatch[1] === "...";
                const rawName = payloadMatch[2];
                const inlineDescription = payloadMatch[3] ?? "";

                if (typeof rawName !== "string") {
                    continue;
                }

                const normalizedName = normalizeParamTagName(rawName);
                const descriptionText =
                    block.continuationText.length === 0
                        ? inlineDescription
                        : `${inlineDescription}\n${block.continuationText}`;

                if (!hasMeaningfulTagDescription(descriptionText)) {
                    missingDescriptions.push(
                        isRestParam ? `...${normalizedName}` : normalizedName
                    );
                }
            }

            if (missingDescriptions.length === 0) {
                return;
            }

            context.report({
                data: {
                    params: [...new Set(missingDescriptions)]
                        .toSorted((left, right) => left.localeCompare(right))
                        .join(", "),
                },
                messageId: "missingParamTagDescription",
                node: reportNode,
            });
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkNode(node, node);
            },
            FunctionDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            FunctionExpression: (node): void => {
                checkNode(node, node);
            },
            MethodDefinition: (node): void => {
                if (
                    node.value.type !== AST_NODE_TYPES.FunctionExpression &&
                    node.value.type !==
                        AST_NODE_TYPES.TSEmptyBodyFunctionExpression
                ) {
                    return;
                }

                checkNode(node, node);
            },
            TSDeclareFunction: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "require each `@param` tag to include a human-readable description.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
        },
        messages: {
            missingParamTagDescription:
                "`@param` tags must include descriptions. Missing description for: {{params}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-param-tag-description",
});

export default rule;
