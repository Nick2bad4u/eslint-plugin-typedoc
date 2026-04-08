import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("require-throws-tag", getPluginRule("require-throws-tag"), {
    invalid: [
        {
            name: "reports missingThrowsTag and suggests adding bare @throws",
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
        },
    ],
    valid: [
        {
            name: "is valid when throwing function has a @throws tag",
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
        },
        {
            name: "is valid by default in test/ paths",
            filename: "test/require-throws-tag.ts",
            code: [
                "/**",
                " * Parse JSON content.",
                " */",
                "export function parseJson(input: string): unknown {",
                "    throw new Error(input);",
                "}",
            ].join("\n"),
        },
        {
            name: "is valid when declaration files are ignored via option",
            filename: "types/public-api.d.ts",
            options: [{ ignoreDeclarationFiles: true }],
            code: [
                "/**",
                " * Parse JSON content.",
                " */",
                "export declare function parseJson(input: string): unknown;",
            ].join("\n"),
        },
    ],
});
