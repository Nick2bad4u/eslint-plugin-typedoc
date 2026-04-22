import {
    AST_NODE_TYPES,
    type TSESLint,
    type TSESTree,
} from "@typescript-eslint/utils";
import { arrayJoin, isEmpty } from "ts-extras";

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

type MessageIds = "missingTypeParamTagDescription";
type Options = readonly [];

const findFirstWhitespaceIndex = (text: string): number => text.search(/\s/u);

const parseTypeParamTagPayload = (
    tagText: string
): null | Readonly<{
    inlineDescription: string;
    rawName: string;
}> => {
    const trimmedTagText = tagText.trimStart();

    if (trimmedTagText.length === 0) {
        return null;
    }

    const firstWhitespaceIndex = findFirstWhitespaceIndex(trimmedTagText);
    const rawName =
        firstWhitespaceIndex === -1
            ? trimmedTagText
            : trimmedTagText.slice(0, firstWhitespaceIndex);

    if (rawName.length === 0) {
        return null;
    }

    return {
        inlineDescription:
            firstWhitespaceIndex === -1
                ? ""
                : trimmedTagText.slice(firstWhitespaceIndex),
        rawName,
    };
};

const normalizeTypeParamTagName = (rawName: string): string => {
    const bracketTrimmed = rawName.replace(/^\[/u, "").replace(/\]$/u, "");
    const equalsSignOffset = bracketTrimmed.indexOf("=");

    return equalsSignOffset === -1
        ? bracketTrimmed
        : bracketTrimmed.slice(0, equalsSignOffset);
};

/** Rule implementation for requiring generic-tag descriptions. */
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
                if (
                    block.tagName !== "typeParam" &&
                    block.tagName !== "template"
                ) {
                    continue;
                }

                const payload = parseTypeParamTagPayload(block.tagText);

                if (payload === null) {
                    continue;
                }

                const { inlineDescription, rawName } = payload;

                const normalizedName = normalizeTypeParamTagName(rawName);
                const descriptionText =
                    block.continuationText.length === 0
                        ? inlineDescription
                        : `${inlineDescription}\n${block.continuationText}`;

                if (!hasMeaningfulTagDescription(descriptionText)) {
                    missingDescriptions.push(normalizedName);
                }
            }

            if (isEmpty(missingDescriptions)) {
                return;
            }

            context.report({
                data: {
                    params: arrayJoin(
                        createLocaleSortedStringCopy(
                            new Set(missingDescriptions)
                        ),
                        ", "
                    ),
                },
                messageId: "missingTypeParamTagDescription",
                node: reportNode,
            });
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkNode(node, node);
            },
            ClassDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
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
            TSInterfaceDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            TSTypeAliasDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require each `@typeParam`/`@template` tag to include a human-readable description.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-type-param-tag-description",
        },
        messages: {
            missingTypeParamTagDescription:
                "Generic tags must include descriptions. Missing description for: {{params}}.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-type-param-tag-description",
});

export default rule;
