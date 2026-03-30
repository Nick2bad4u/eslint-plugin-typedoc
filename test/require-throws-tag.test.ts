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
            errors: [{ messageId: "missingThrowsTag" }],
            output: [
                "/**",
                " * Parse JSON content.",
                " * @param input JSON source.",
                " * @returns Parsed object.",
                " * @throws TODO describe thrown errors.",
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
        },
    ],
});
