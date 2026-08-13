import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-throws-tag", getPluginRule("require-throws-tag"), {
    invalid: [
        {
            code: [
                "/**",
                " * Parse JSON content.",
                " * @param input JSON source.",
                " * @returns Parsed object.",
                " */",
                "export function parseJson(input: string): unknown {",
                "    if (input.length === 0) {",
                '        throw new TypeError("Input must not be empty.");',
                "    }",
                "",
                "    return JSON.parse(input);",
                "}",
            ].join("\n"),
            errors: [
                {
                    messageId: "missingThrowsTag",
                    suggestions: [
                        {
                            messageId: "addThrowsTagSuggestion",
                            output: [
                                "/**",
                                " * Parse JSON content.",
                                " * @param input JSON source.",
                                " * @returns Parsed object.",
                                " * @throws",
                                " */",
                                "export function parseJson(input: string): unknown {",
                                "    if (input.length === 0) {",
                                '        throw new TypeError("Input must not be empty.");',
                                "    }",
                                "",
                                "    return JSON.parse(input);",
                                "}",
                            ].join("\n"),
                        },
                    ],
                },
            ],
            name: "reports missingThrowsTag and suggests adding bare @throws",
        },
        {
            code: [
                "/**",
                " * Parse with an arrow.",
                " */",
                "export const parseArrow = (input: string): string => {",
                '    while (input.length === 0) { throw new Error("empty"); }',
                "    return input;",
                "};",
            ].join("\n"),
            errors: [
                {
                    messageId: "missingThrowsTag",
                    suggestions: [
                        {
                            messageId: "addThrowsTagSuggestion",
                            output: [
                                "/**",
                                " * Parse with an arrow.",
                                " * @throws",
                                " */",
                                "export const parseArrow = (input: string): string => {",
                                '    while (input.length === 0) { throw new Error("empty"); }',
                                "    return input;",
                                "};",
                            ].join("\n"),
                        },
                    ],
                },
            ],
            name: "reports nested throws in documented arrow functions",
        },
    ],
    valid: [
        {
            code: [
                "/**",
                " * Parse JSON content.",
                " * @param input JSON source.",
                " * @returns Parsed object.",
                " * @throws {TypeError} When the input is empty.",
                " */",
                "export function parseJson(input: string): unknown {",
                "    if (input.length === 0) {",
                '        throw new TypeError("Input must not be empty.");',
                "    }",
                "",
                "    return JSON.parse(input);",
                "}",
            ].join("\n"),
            name: "is valid when throwing function has a @throws tag",
        },
        {
            code: [
                "/**",
                " * @throws When parsing fails.",
                " */",
                "export const parseExpression = function (input: string): string {",
                '    switch (input) { case "": throw new Error("empty"); default: return input; }',
                "};",
                "export class Parser {",
                "    /**",
                "     * @throws When parsing fails.",
                "     */",
                "    parse(input: string): string {",
                '        try { return input; } catch { throw new Error("invalid"); }',
                "    }",
                "}",
            ].join("\n"),
            name: "accepts nested throws in tagged function expressions and methods",
        },
        {
            code: [
                "/**",
                " * Parse JSON content.",
                " */",
                "export function parseJson(input: string): unknown {",
                "    throw new Error(input);",
                "}",
            ].join("\n"),
            filename: "test/require-throws-tag.ts",
            name: "is valid by default in test/ paths",
        },
        {
            code: [
                "/**",
                " * Parse JSON content.",
                " */",
                "export declare function parseJson(input: string): unknown;",
            ].join("\n"),
            filename: "types/public-api.d.ts",
            name: "is valid when declaration files are ignored via option",
            options: [{ ignoreDeclarationFiles: true }],
        },
        {
            code: [
                "/** Parse JSON content. */",
                "export const parseJson = (input: string): string => input;",
                "export function undocumentedThrow(): never {",
                '    throw new Error("No documentation to enforce.");',
                "}",
            ].join("\n"),
            name: "ignores functions without throws and undocumented throwing functions",
        },
    ],
});
