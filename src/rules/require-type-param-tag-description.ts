import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayJoin, isEmpty } from "ts-extras";

import {
    getDocCommentAnchorNode,
    getFunctionDocCommentTarget,
    getLeadingDocComment,
} from "../_internal/doc-comments.js";
import {
    type DocTagBlock,
    getDocCommentTagBlocks,
    hasMeaningfulTagDescription,
    stripOptionalJSDocTypeAnnotation,
} from "../_internal/doc-tag-blocks.js";
import { createLocaleSortedStringCopy } from "../_internal/sorted-copy.js";
import { createTypedRule } from "../_internal/typed-rule.js";

type MessageIds = "missingTypeParamTagDescription";
type Options = readonly [];

const findFirstWhitespaceIndex = (text: string): number => text.search(/\s/v);

const parseTypeParamTagPayload = (
    tagText: string
): null | Readonly<{
    inlineDescription: string;
    rawName: string;
}> => {
    const trimmedTagText =
        stripOptionalJSDocTypeAnnotation(tagText).trimStart();

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
    const bracketTrimmed = rawName.replace(/^\[/v, "").replace(/\]$/v, "");
    const equalsSignOffset = bracketTrimmed.indexOf("=");

    return equalsSignOffset === -1
        ? bracketTrimmed
        : bracketTrimmed.slice(0, equalsSignOffset);
};

/** Return a type-parameter name when its tag lacks a description. */
const getTypeParamNameMissingDescription = (
    block: Readonly<DocTagBlock>
): null | string => {
    if (block.tagName !== "typeParam" && block.tagName !== "template") {
        return null;
    }

    const payload = parseTypeParamTagPayload(block.tagText);

    if (payload === null) {
        return null;
    }

    const { inlineDescription, rawName } = payload;
    const normalizedName = normalizeTypeParamTagName(rawName);
    const descriptionText =
        block.continuationText.length === 0
            ? inlineDescription
            : `${inlineDescription}\n${block.continuationText}`;

    return hasMeaningfulTagDescription(descriptionText) ? null : normalizedName;
};

/** Rule implementation for requiring generic-tag descriptions. */
const rule: TSESLint.RuleModule<MessageIds, Options> = createTypedRule<
    Options,
    MessageIds
>({
    create(context) {
        const checkedComments = new WeakSet<TSESTree.Comment>();
        const sourceCode = context.sourceCode;

        const checkNode = (
            reportNode: TSESTree.Node,
            docNode: TSESTree.Node
        ): void => {
            const docComment = getLeadingDocComment(sourceCode, docNode);

            if (docComment === null) {
                return;
            }

            if (checkedComments.has(docComment)) {
                return;
            }

            checkedComments.add(docComment);

            const missingDescriptions: string[] = [];

            for (const block of getDocCommentTagBlocks(docComment)) {
                const missingName = getTypeParamNameMissingDescription(block);

                if (missingName !== null) {
                    missingDescriptions.push(missingName);
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

        const checkFunctionNode = (node: TSESTree.Node): void => {
            const { docNode, reportNode } = getFunctionDocCommentTarget(node);

            checkNode(reportNode, docNode);
        };

        return {
            ArrowFunctionExpression: (node): void => {
                checkFunctionNode(node);
            },
            ClassDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            FunctionDeclaration: (node): void => {
                checkFunctionNode(node);
            },
            FunctionExpression: (node): void => {
                checkFunctionNode(node);
            },
            TSCallSignatureDeclaration: (node): void => {
                checkFunctionNode(node);
            },
            TSConstructSignatureDeclaration: (node): void => {
                checkFunctionNode(node);
            },
            TSDeclareFunction: (node): void => {
                checkFunctionNode(node);
            },
            TSEmptyBodyFunctionExpression: (node): void => {
                checkFunctionNode(node);
            },
            TSInterfaceDeclaration: (node): void => {
                checkNode(node, getDocCommentAnchorNode(node));
            },
            TSMethodSignature: (node): void => {
                checkFunctionNode(node);
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
        languages: ["js/js"],
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
