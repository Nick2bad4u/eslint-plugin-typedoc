/**
 * @packageDocumentation
 * Require core options in TypeDoc JSON configuration files.
 */

import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

import * as path from "node:path";

import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import { escapeForRegExp, getLineBreak } from "../_internal/text-utils.js";

type MessageIds = "addOption" | "missingOption";
type Options = [
    Readonly<{
        requiredOptions?: readonly string[];
    }>,
];

const defaultOptions = [
    {
        requiredOptions: ["entryPoints", "tsconfig"],
    },
] satisfies Options;

const defaultOptionValuesByName: Readonly<Record<string, string>> = {
    entryPoints: '["./src/plugin.ts"]',
    tsconfig: '"./tsconfig.json"',
};

const detectObjectIndentation = (sourceText: string): string => {
    const indentationMatch = /\r?\n([ \t]+)"[^\n]+"\s*:/u.exec(sourceText);

    return indentationMatch?.[1] ?? "    ";
};

const hasJsonProperty = (sourceText: string, propertyName: string): boolean =>
    new RegExp(`"${escapeForRegExp(propertyName)}"\\s*:`, "u").test(sourceText);

const isTypedocConfigFile = (filePath: string): boolean => {
    const lowerCaseBaseName = path.basename(filePath).toLowerCase();

    if (!lowerCaseBaseName.includes("typedoc")) {
        return false;
    }

    return (
        lowerCaseBaseName.endsWith(".json") ||
        lowerCaseBaseName.endsWith(".jsonc")
    );
};

const createOptionInsertion = (
    sourceText: string,
    propertyText: string
):
    | Readonly<{
          range: readonly [number, number];
          text: string;
      }>
    | undefined => {
    const openingBraceIndex = sourceText.indexOf("{");
    const closingBraceIndex = sourceText.lastIndexOf("}");

    if (openingBraceIndex === -1 || closingBraceIndex <= openingBraceIndex) {
        return undefined;
    }

    const objectBodyText = sourceText.slice(
        openingBraceIndex + 1,
        closingBraceIndex
    );
    const lineBreak = getLineBreak(sourceText);
    const indentation = detectObjectIndentation(sourceText);
    const trailingWhitespaceMatch = /[ \t\r\n]*$/u.exec(objectBodyText);
    const trailingWhitespace = trailingWhitespaceMatch?.[0] ?? "";
    const insertionStart = closingBraceIndex - trailingWhitespace.length;
    const bodyWithoutTrailingWhitespace = objectBodyText.slice(
        0,
        objectBodyText.length - trailingWhitespace.length
    );
    const trimmedBody = bodyWithoutTrailingWhitespace.trim();
    const normalizedTrailingWhitespace =
        trailingWhitespace.includes("\n") || trailingWhitespace.includes("\r")
            ? lineBreak
            : trailingWhitespace;

    if (trimmedBody.length === 0) {
        return {
            range: [closingBraceIndex, closingBraceIndex],
            text: `${lineBreak}${indentation}${propertyText}${lineBreak}`,
        };
    }

    const commaPrefix = trimmedBody.endsWith(",") ? "" : ",";

    return {
        range: [insertionStart, closingBraceIndex],
        text: `${commaPrefix}${lineBreak}${indentation}${propertyText}${normalizedTrailingWhitespace}`,
    };
};

const getDefaultOptionValue = (optionName: string): string =>
    defaultOptionValuesByName[optionName] ?? "null";

const requireTypedocConfigOptionsRule: TSESLint.RuleModule<
    MessageIds,
    Options
> = {
    create(context) {
        const [options = defaultOptions[0]] = context.options;
        const requiredOptions = options.requiredOptions ?? [
            "entryPoints",
            "tsconfig",
        ];

        if (requiredOptions.length === 0) {
            return {};
        }

        const sourceCode = context.sourceCode;

        return {
            Program(programNode: Readonly<TSESTree.Program>) {
                if (!isTypedocConfigFile(context.filename)) {
                    return;
                }

                for (const optionName of requiredOptions) {
                    if (hasJsonProperty(sourceCode.text, optionName)) {
                        continue;
                    }

                    const optionPropertyText = `"${optionName}": ${getDefaultOptionValue(optionName)}`;
                    const insertion = createOptionInsertion(
                        sourceCode.text,
                        optionPropertyText
                    );

                    context.report({
                        data: {
                            optionName,
                        },
                        messageId: "missingOption",
                        node: programNode,
                        suggest:
                            insertion === undefined
                                ? []
                                : [
                                      {
                                          data: {
                                              optionName,
                                          },
                                          fix: (fixer) =>
                                              fixer.insertTextBeforeRange(
                                                  insertion.range,
                                                  insertion.text
                                              ),
                                          messageId: "addOption",
                                      },
                                  ],
                    });
                }
            },
        };
    },
    defaultOptions,
    meta: {
        docs: {
            description:
                "Require critical TypeDoc config options such as entryPoints and tsconfig.",
            url: createRuleDocsUrl("require-typedoc-config-options"),
        },
        hasSuggestions: true,
        messages: {
            addOption: "Add '{{optionName}}' to this TypeDoc config.",
            missingOption:
                "TypeDoc config is missing required option '{{optionName}}'.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    requiredOptions: {
                        items: {
                            type: "string",
                        },
                        type: "array",
                    },
                },
                type: "object",
            },
        ],
        type: "problem",
    },
};

export default requireTypedocConfigOptionsRule;
