import { createRuleTester, getPluginRule } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "require-throws-description",
    getPluginRule("require-throws-description"),
    {
        invalid: [
            {
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
                name: "reports missingThrowsDescription when @throws tag has only an error type but no description",
            },
            {
                code: [
                    "/** @throws {Error & { code: string }} */",
                    "declare function parse(): void;",
                    "interface ParserConstructor {",
                    "    /** @throws {Error & { code: string }} */",
                    "    new (value: string): object;",
                    "}",
                ].join("\n"),
                errors: [
                    { messageId: "missingThrowsDescription" },
                    { messageId: "missingThrowsDescription" },
                ],
                name: "reports nested error types on declare functions and construct signatures exactly once",
            },
        ],
        valid: [
            {
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
                name: "is valid when @throws tag includes both an error type and a description",
            },
            {
                code: [
                    "/** @throws {Error & { code: string }} When parsing fails. */",
                    "declare function parse(): void;",
                ].join("\n"),
                name: "is valid when prose follows a nested JSDoc error type",
            },
        ],
    }
);
