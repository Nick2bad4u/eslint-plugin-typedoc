import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-throws-description",
    getPluginRule("require-throws-description"),
    {
        invalid: [
            {
                name: "reports missingThrowsDescription when @throws tag has only an error type but no description",
                code: [
                    "/**",
                    " * Parse value.",
                    " * @param input Input value.",
                    " * @throws {TypeError}",
                    " */",
                    "export function parseValue(input: string): number {",
                    "    if (input.length === 0) {",
                    '        throw new TypeError("Input must not be empty.");',
                    "    }",
                    "",
                    "    return Number.parseInt(input, 10);",
                    "}",
                ].join("\n"),
                errors: [{ messageId: "missingThrowsDescription" }],
            },
        ],
        valid: [
            {
                name: "is valid when @throws tag includes both an error type and a description",
                code: [
                    "/**",
                    " * Parse value.",
                    " * @param input Input value.",
                    " * @throws {TypeError} When input is empty.",
                    " */",
                    "export function parseValue(input: string): number {",
                    "    if (input.length === 0) {",
                    '        throw new TypeError("Input must not be empty.");',
                    "    }",
                    "",
                    "    return Number.parseInt(input, 10);",
                    "}",
                ].join("\n"),
            },
        ],
    }
);
