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
import { createLocaleSortedStringCopy } from "../_internal/sorted-copy.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingParamTagDescription";
type Options = readonly [];

const defaultOptions = [] as const satisfies Options;

const findFirstWhitespaceIndex = (text: string): number => text.search(/\s/u);

const parseParamTagPayload = (
    tagText: string
): null | Readonly<{
    inlineDescription: string;
    isRestParam: boolean;
    rawName: string;
}> => {
    const trimmedTagText = tagText.trimStart();

    if (trimmedTagText.length === 0) {
        return null;
    }

    const isRestParam = trimmedTagText.startsWith("...");
    const nameAndDescription = isRestParam
        ? trimmedTagText.slice(3)
        : trimmedTagText;

    if (nameAndDescription.length === 0) {
        return null;
    }

    const firstWhitespaceIndex = findFirstWhitespaceIndex(nameAndDescription);
    const rawName =
        firstWhitespaceIndex === -1
            ? nameAndDescription
            : nameAndDescription.slice(0, firstWhitespaceIndex);

    if (rawName.length === 0) {
        return null;
    }

    return {
        inlineDescription:
            firstWhitespaceIndex === -1
                ? ""
                : nameAndDescription.slice(firstWhitespaceIndex),
        isRestParam,
        rawName,
    };
};

const normalizeParamTagName = (rawName: string): string => {
    const bracketTrimmed = rawName.replace(/^\[/u, "").replace(/\]$/u, "");
    const equalsSignOffset = bracketTrimmed.indexOf("=");

    return equalsSignOffset === -1
        ? bracketTrimmed
        : bracketTrimmed.slice(0, equalsSignOffset);
};

/** Rule implementation for requiring parameter-tag descriptions. */
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

                const payload = parseParamTagPayload(block.tagText);

                if (payload === null) {
                    continue;
                }

                const { inlineDescription, isRestParam, rawName } = payload;

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
                    params: createLocaleSortedStringCopy(
                        new Set(missingDescriptions)
                    ).join(", "),
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
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-param-tag-description",
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
