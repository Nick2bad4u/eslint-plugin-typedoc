import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import { arrayJoin, isEmpty } from "ts-extras";

import {
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

type MessageIds = "missingParamTagDescription";
type Options = readonly [];

const findFirstWhitespaceIndex = (text: string): number => text.search(/\s/v);

const parseParamTagPayload = (
    tagText: string
): null | Readonly<{
    inlineDescription: string;
    isRestParam: boolean;
    rawName: string;
}> => {
    const trimmedTagText =
        stripOptionalJSDocTypeAnnotation(tagText).trimStart();

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
    const bracketTrimmed = rawName.replace(/^\[/v, "").replace(/\]$/v, "");
    const equalsSignOffset = bracketTrimmed.indexOf("=");

    return equalsSignOffset === -1
        ? bracketTrimmed
        : bracketTrimmed.slice(0, equalsSignOffset);
};

/** Return a parameter name when its tag has no meaningful description. */
const getParamNameMissingDescription = (
    block: Readonly<DocTagBlock>
): null | string => {
    if (block.tagName !== "param") {
        return null;
    }

    const payload = parseParamTagPayload(block.tagText);

    if (payload === null) {
        return null;
    }

    const { inlineDescription, isRestParam, rawName } = payload;
    const normalizedName = normalizeParamTagName(rawName);
    const descriptionText =
        block.continuationText.length === 0
            ? inlineDescription
            : `${inlineDescription}\n${block.continuationText}`;

    if (hasMeaningfulTagDescription(descriptionText)) {
        return null;
    }

    return isRestParam ? `...${normalizedName}` : normalizedName;
};

/** Rule implementation for requiring parameter-tag descriptions. */
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
                const missingName = getParamNameMissingDescription(block);

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
                messageId: "missingParamTagDescription",
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
            TSMethodSignature: (node): void => {
                checkFunctionNode(node);
            },
        };
    },
    meta: {
        deprecated: false,
        docs: {
            description:
                "require each `@param` tag to include a human-readable description.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            typedocConfigs: ["typedoc.configs.all", "typedoc.configs.strict"],
            url: "https://nick2bad4u.github.io/eslint-plugin-typedoc/docs/rules/require-param-tag-description",
        },
        languages: ["js/js"],
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
